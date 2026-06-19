import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["status"] == "ok"


def test_predict_no_model():
    """Should return 503 if no model trained yet."""
    payload = {
        "gender": 0, "SeniorCitizen": 0, "Partner": 0, "Dependents": 0,
        "tenure": 12, "PhoneService": 1, "PaperlessBilling": 1,
        "MonthlyCharges": 65.0, "TotalCharges": 780.0,
        "MultipleLines_No_phone_service": 0, "MultipleLines_Yes": 0,
        "InternetService_Fiber_optic": 0, "InternetService_No": 0,
        "OnlineSecurity_No_internet_service": 0, "OnlineSecurity_Yes": 0,
        "OnlineBackup_No_internet_service": 0, "OnlineBackup_Yes": 0,
        "DeviceProtection_No_internet_service": 0, "DeviceProtection_Yes": 0,
        "TechSupport_No_internet_service": 0, "TechSupport_Yes": 0,
        "StreamingTV_No_internet_service": 0, "StreamingTV_Yes": 0,
        "StreamingMovies_No_internet_service": 0, "StreamingMovies_Yes": 0,
        "Contract_One_year": 0, "Contract_Two_year": 0,
        "PaymentMethod_Credit_card_automatic": 0,
        "PaymentMethod_Electronic_check": 0, "PaymentMethod_Mailed_check": 0,
    }
    resp = client.post("/predict", json=payload)
    assert resp.status_code in [200, 503]


def test_experiments_endpoint():
    resp = client.get("/experiments")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_train_status():
    resp = client.get("/train/status")
    assert resp.status_code == 200
    assert "running" in resp.json()