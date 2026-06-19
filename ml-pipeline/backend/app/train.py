import os
import mlflow
import mlflow.sklearn
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib
import json
from pathlib import Path

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
MODEL_DIR = Path("./models")
MODEL_DIR.mkdir(exist_ok=True)
DATA_PATH = Path("./data/telco_churn.csv")


def load_and_preprocess():
    """Download and preprocess Telco Churn dataset."""
    if not DATA_PATH.exists():
        import urllib.request
        DATA_PATH.parent.mkdir(exist_ok=True)
        url = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"
        urllib.request.urlretrieve(url, DATA_PATH)
        print(f"[train] Dataset downloaded to {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Drop customer ID
    df.drop("customerID", axis=1, inplace=True)

    # Fix TotalCharges (some are empty strings)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df.dropna(inplace=True)

    # Encode binary columns
    binary_cols = ["gender", "Partner", "Dependents", "PhoneService",
                   "PaperlessBilling", "Churn"]
    for col in binary_cols:
        df[col] = (df[col] == "Yes").astype(int)
        if col == "gender":
            df[col] = (df[col] == 1).astype(int)  # Male=1

    # Encode multi-class columns
    multi_cols = ["MultipleLines", "InternetService", "OnlineSecurity",
                  "OnlineBackup", "DeviceProtection", "TechSupport",
                  "StreamingTV", "StreamingMovies", "Contract", "PaymentMethod"]
    df = pd.get_dummies(df, columns=multi_cols, drop_first=True)

    X = df.drop("Churn", axis=1)
    y = df["Churn"]

    # Save feature names for inference
    feature_names = list(X.columns)
    with open(MODEL_DIR / "feature_names.json", "w") as f:
        json.dump(feature_names, f)

    return X, y, feature_names


def train_all_models():
    """Train multiple models, track with MLflow, save best."""
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("churn-prediction")

    X, y, feature_names = load_and_preprocess()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Handle class imbalance
    smote = SMOTE(random_state=42)
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)

    models = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
        "random_forest": RandomForestClassifier(
            n_estimators=150, max_depth=10, random_state=42, n_jobs=-1
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=150, learning_rate=0.1, max_depth=5, random_state=42
        ),
    }

    best_run_id = None
    best_f1 = -1
    results = []

    for model_name, model in models.items():
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", model)
        ])

        with mlflow.start_run(run_name=model_name) as run:
            # Log params
            mlflow.log_param("model_type", model_name)
            mlflow.log_param("train_samples", len(X_train_bal))
            mlflow.log_param("test_samples", len(X_test))
            mlflow.log_param("features", len(feature_names))
            mlflow.log_param("smote_applied", True)

            # Log model-specific params
            model_params = model.get_params()
            for k, v in model_params.items():
                if isinstance(v, (int, float, str, bool)):
                    mlflow.log_param(k, v)

            # Train
            pipeline.fit(X_train_bal, y_train_bal)

            # Evaluate
            y_pred = pipeline.predict(X_test)
            y_proba = pipeline.predict_proba(X_test)[:, 1]

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred)
            rec = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            auc = roc_auc_score(y_test, y_proba)
            cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="f1")

            # Log metrics
            mlflow.log_metric("accuracy", round(acc, 4))
            mlflow.log_metric("precision", round(prec, 4))
            mlflow.log_metric("recall", round(rec, 4))
            mlflow.log_metric("f1_score", round(f1, 4))
            mlflow.log_metric("roc_auc", round(auc, 4))
            mlflow.log_metric("cv_f1_mean", round(cv_scores.mean(), 4))
            mlflow.log_metric("cv_f1_std", round(cv_scores.std(), 4))

            # Log model
            mlflow.sklearn.log_model(pipeline, artifact_path="model")

            result = {
                "run_id": run.info.run_id,
                "model_name": model_name,
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4),
                "cv_f1_mean": round(cv_scores.mean(), 4),
                "status": run.info.status,
            }
            results.append(result)
            print(f"[train] {model_name} | F1={f1:.4f} | AUC={auc:.4f}")

            if f1 > best_f1:
                best_f1 = f1
                best_run_id = run.info.run_id
                best_pipeline = pipeline
                best_model_name = model_name

    # Save the best model locally for fast inference
    joblib.dump(best_pipeline, MODEL_DIR / "best_model.pkl")
    with open(MODEL_DIR / "best_model_meta.json", "w") as f:
        json.dump({
            "run_id": best_run_id,
            "model_name": best_model_name,
            "f1_score": best_f1,
            "feature_names": feature_names,
        }, f)

    print(f"\n[train] Best model: {best_model_name} (F1={best_f1:.4f})")
    return results, best_run_id
    