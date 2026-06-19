import pytest
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score


def test_model_trains_and_predicts():
    """Basic smoke test: model trains and produces binary predictions."""
    np.random.seed(42)
    n = 200
    X = pd.DataFrame({
        "tenure": np.random.randint(0, 72, n),
        "MonthlyCharges": np.random.uniform(20, 120, n),
        "TotalCharges": np.random.uniform(100, 8000, n),
    })
    y = (X["tenure"] < 12).astype(int)  # simple rule: short tenure = churn

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=10, random_state=42)),
    ])
    pipeline.fit(X[:160], y[:160])
    preds = pipeline.predict(X[160:])
    assert set(preds).issubset({0, 1})
    score = f1_score(y[160:], preds)
    assert score > 0.0, "F1 score should be above zero"


def test_probability_output():
    """Model should output valid probability between 0 and 1."""
    np.random.seed(0)
    X = pd.DataFrame({
        "tenure": [5, 60],
        "MonthlyCharges": [90.0, 30.0],
        "TotalCharges": [450.0, 1800.0],
    })
    y = [1, 0]
    clf = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=5, random_state=0)),
    ])
    clf.fit(X, y)
    proba = clf.predict_proba(X[:1])[0][1]
    assert 0.0 <= proba <= 1.0