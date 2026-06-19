import os
import json
import mlflow
from pathlib import Path
from typing import List
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import CustomerData, PredictionResponse, TrainResponse, ExperimentRun
from app.predict import predict, load_meta
from app.train import train_all_models

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")

app = FastAPI(
    title="Churn Prediction API",
    description="End-to-end ML pipeline with MLflow experiment tracking",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

training_status = {"running": False, "last_results": None}


@app.get("/health")
def health():
    meta = load_meta()
    model_ready = bool(meta)
    return {
        "status": "ok",
        "model_ready": model_ready,
        "model_name": meta.get("model_name"),
        "best_f1": meta.get("f1_score"),
    }


@app.post("/train", response_model=TrainResponse)
def train(background_tasks: BackgroundTasks):
    if training_status["running"]:
        raise HTTPException(status_code=409, detail="Training already in progress")

    def run_training():
        training_status["running"] = True
        try:
            results, best_run_id = train_all_models()
            training_status["last_results"] = {
                "results": results,
                "best_run_id": best_run_id,
            }
        finally:
            training_status["running"] = False

    background_tasks.add_task(run_training)
    return TrainResponse(
        status="started",
        results=[],
        best_run_id="",
        message="Training started in background. Poll /train/status for results.",
    )


@app.get("/train/status")
def train_status():
    return {
        "running": training_status["running"],
        "results": training_status.get("last_results"),
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_churn(data: CustomerData):
    try:
        result = predict(data.model_dump())
        return PredictionResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/experiments", response_model=List[ExperimentRun])
def get_experiments():
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    try:
        client = mlflow.tracking.MlflowClient()
        experiments = client.search_experiments()
        runs = []
        for exp in experiments:
            for run in client.search_runs(exp.experiment_id):
                m = run.data.metrics
                p = run.data.params
                runs.append(ExperimentRun(
                    run_id=run.info.run_id,
                    model_name=p.get("model_type", "unknown"),
                    accuracy=m.get("accuracy", 0.0),
                    precision=m.get("precision", 0.0),
                    recall=m.get("recall", 0.0),
                    f1_score=m.get("f1_score", 0.0),
                    roc_auc=m.get("roc_auc", 0.0),
                    status=run.info.status,
                ))
        return sorted(runs, key=lambda x: x.f1_score, reverse=True)
    except Exception as e:
        return []


@app.get("/model/info")
def model_info():
    meta = load_meta()
    if not meta:
        raise HTTPException(status_code=404, detail="No model trained yet")
    return meta