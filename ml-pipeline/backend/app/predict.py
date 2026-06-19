import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any

MODEL_DIR = Path("./models")


def load_model():
    model_path = MODEL_DIR / "best_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(
            "No trained model found. Please train first via POST /train"
        )
    return joblib.load(model_path)


def load_meta() -> Dict[str, Any]:
    meta_path = MODEL_DIR / "best_model_meta.json"
    if not meta_path.exists():
        return {}
    with open(meta_path) as f:
        return json.load(f)


def predict(input_data: dict) -> dict:
    model = load_model()
    meta = load_meta()

    feature_path = MODEL_DIR / "feature_names.json"
    with open(feature_path) as f:
        feature_names = json.load(f)

    # Build DataFrame in exact training column order
    row = {col: input_data.get(col, 0) for col in feature_names}
    X = pd.DataFrame([row])

    proba = model.predict_proba(X)[0][1]
    prediction = "churn" if proba >= 0.5 else "no_churn"

    if proba < 0.3:
        risk_level = "low"
        confidence = "high"
    elif proba < 0.6:
        risk_level = "medium"
        confidence = "medium"
    else:
        risk_level = "high"
        confidence = "high"

    return {
        "churn_probability": round(float(proba), 4),
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "model_used": meta.get("model_name", "unknown"),
        "run_id": meta.get("run_id"),
    }