# 🤖 End-to-End ML Pipeline with MLOps
### Customer Churn Prediction · Experiment Tracking · Model Serving · CI/CD

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MLflow](https://img.shields.io/badge/MLflow-2.13-0194E2?style=flat&logo=mlflow&logoColor=white)](https://mlflow.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=flat&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)

> A production-style machine learning system — not just a notebook. Trains multiple ML models on real data, tracks every experiment with MLflow, serves predictions through a REST API, and visualizes results on a React dashboard. Fully containerized with Docker and automated with GitHub Actions CI/CD.

**Live Repo:** [github.com/shatakshi-1404/end-to-end-ml-pipeline](https://github.com/shatakshi-1404/end-to-end-ml-pipeline)

---

## 📸 What It Does

| Feature | Details |
|---|---|
| **Dataset** | IBM Telco Customer Churn (~7,000 rows, 21 features) |
| **Models Trained** | Logistic Regression, Random Forest, Gradient Boosting |
| **Class Imbalance Fix** | SMOTE oversampling (26% churn → balanced 50/50 for training) |
| **Experiment Tracking** | MLflow logs every run — params, metrics, model artifacts |
| **Best Model Selection** | Automatic — highest F1 score wins, saved to disk |
| **API** | FastAPI with 4 endpoints, Pydantic validation, background tasks |
| **Dashboard** | React + Recharts — live predictions, radar chart, metric comparison |
| **Tests** | pytest — API endpoint tests + ML logic smoke tests |
| **CI/CD** | GitHub Actions — test → lint → Docker build → smoke test on every push |
| **Containerization** | Docker + docker-compose (backend + frontend + MLflow UI in one command) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Dashboard                      │
│         Predict  │  Experiments Table  │  Metrics Charts    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (REST)
┌──────────────────────────▼──────────────────────────────────┐
│                       FastAPI Server                        │
│   /health   /train   /predict   /experiments                │
└──────┬─────────────────────────────────────┬────────────────┘
       │                                     │
┌──────▼──────────┐                 ┌────────▼────────────────┐
│   train.py      │                 │      predict.py         │
│                 │                 │                         │
│ 1. Load CSV     │                 │ 1. Load best_model.pkl  │
│ 2. Preprocess   │                 │ 2. Build DataFrame      │
│ 3. SMOTE        │   MLflow logs   │ 3. predict_proba()      │
│ 4. Train 3 models──────────────▶ │ 4. Risk scoring         │
│ 5. Save best    │                 └─────────────────────────┘
└─────────────────┘
       │
┌──────▼──────────┐
│   MLflow UI     │   localhost:5001
│   (mlruns/)     │   All runs, metrics, artifacts
└─────────────────┘
```

---

## 📁 Project Structure

```
ml-pipeline/
│
├── backend/
│   ├── app/
│   │   ├── train.py          # ML training — preprocessing, SMOTE, 3 models, MLflow logging
│   │   ├── predict.py        # Inference — loads saved model, returns churn probability
│   │   ├── models.py         # Pydantic schemas — request/response validation
│   │   └── main.py           # FastAPI app — 4 endpoints, background tasks, CORS
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── App.jsx                    # Root — sidebar, tab navigation, train button
│       ├── components/
│       │   ├── PredictForm.jsx        # Customer input form + risk meter + result display
│       │   ├── ExperimentsTable.jsx   # MLflow runs table, ranked by F1
│       │   ├── MetricsPanel.jsx       # Bar + radar charts (Recharts)
│       │   └── ModelStatus.jsx        # Live model health indicator in header
│
├── tests/
│   ├── test_api.py           # FastAPI endpoint tests (health, predict, experiments)
│   └── test_model.py         # ML logic tests (training, probability output)
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions — pytest → ruff → docker build → smoke test
│
├── mlruns/                   # Auto-created by MLflow — all experiment history
├── models/                   # Auto-created — best_model.pkl + metadata JSON
├── data/                     # Auto-downloaded — Telco churn CSV
└── docker-compose.yml        # One command to run everything
```

---

## 🚀 Getting Started

### Option 1 — Local (Recommended)

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

**MLflow UI** (new terminal)
```bash
cd backend
venv\Scripts\activate
mlflow ui --port 5001 --backend-store-uri file:./mlruns
# → http://localhost:5001
```

### Option 2 — Docker (One Command)

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| React Dashboard | http://localhost:5173 |
| FastAPI Docs | http://localhost:8000/docs |
| MLflow UI | http://localhost:5001 |

---

## 🔁 Usage Flow

1. Open the dashboard at `http://localhost:5173`
2. Click **"Train Models"** in the sidebar — trains 3 models in the background (~60s)
3. Watch the status update — when done, go to **Experiments** tab to see all MLflow runs
4. Go to **Metrics** tab to compare models via bar chart and radar chart
5. Go to **Predict** tab — fill in customer data and click **Run Prediction**
6. Get back: churn probability, risk level (low/medium/high), and which model made the call

Or use the API directly:
```bash
# Check model status
curl http://localhost:8000/health

# Start training
curl -X POST http://localhost:8000/train

# Get a prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"tenure": 2, "MonthlyCharges": 90.0, "TotalCharges": 180.0, "Contract_Two_year": 0}'
```

---

## 🧠 ML Details

### Dataset
IBM Telco Customer Churn dataset — 7,043 customers, 20 features including contract type, monthly charges, internet service, tenure, and whether the customer churned.

### Preprocessing Pipeline
- Drop `customerID` (no predictive value)
- Fix `TotalCharges` — convert empty strings to NaN, drop rows
- Encode binary columns (`Yes/No` → `1/0`)
- One-hot encode multi-class columns (`Contract`, `PaymentMethod`, etc.)
- `StandardScaler` inside sklearn Pipeline to prevent data leakage

### Class Imbalance
Only ~26% of customers churn. Without fixing this, a model that always predicts "no churn" gets 74% accuracy — useless. **SMOTE** (Synthetic Minority Oversampling Technique) generates synthetic churn examples to balance training data to 50/50. Applied only to training data, never test data.

### Models Compared

| Model | Strength |
|---|---|
| Logistic Regression | Fast, interpretable baseline |
| Random Forest | Handles non-linear patterns, robust to noise |
| Gradient Boosting | Highest accuracy, sequential error correction |

### Evaluation Metrics

| Metric | Why it matters |
|---|---|
| **F1 Score** | Best single metric for imbalanced classification |
| **ROC-AUC** | How well the model separates churners from non-churners |
| **Precision** | Of predicted churners, how many actually churn |
| **Recall** | Of actual churners, how many did the model catch |

### MLflow Tracking
Every training run logs:
- Parameters: model type, train/test sample counts, SMOTE applied, hyperparameters
- Metrics: accuracy, precision, recall, F1, ROC-AUC, cross-validation F1 mean/std
- Artifacts: full sklearn Pipeline (scaler + model) saved per run

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Model status, name, and best F1 score |
| `/train` | POST | Start background training of all 3 models |
| `/train/status` | GET | Poll training progress and results |
| `/predict` | POST | Predict churn for a customer |
| `/experiments` | GET | All MLflow runs ranked by F1 |
| `/model/info` | GET | Best model metadata |
| `/docs` | GET | Auto-generated interactive API docs (Swagger UI) |

---

## 🧪 Running Tests

```bash
# From project root
python -m pytest tests/ -v

# Expected output:
# tests/test_api.py::test_health PASSED
# tests/test_api.py::test_experiments_endpoint PASSED
# tests/test_api.py::test_train_status PASSED
# tests/test_model.py::test_model_trains_and_predicts PASSED
# tests/test_model.py::test_probability_output PASSED
```

---

## ⚙️ CI/CD Pipeline

Every push to `main` or `develop` triggers GitHub Actions:

```
Push to GitHub
      ↓
1. Install Python deps
2. Run pytest (all tests must pass)
      ↓
3. Run Ruff linter (code quality check)
      ↓
4. Build Docker image
5. Start container → curl /health → must return 200
      ↓
✅ All green = safe to merge
```

---

## 🛠️ Tech Stack

**Machine Learning**
- `scikit-learn` — model training, pipelines, preprocessing, evaluation
- `imbalanced-learn` — SMOTE for class imbalance
- `pandas` + `numpy` — data manipulation and feature engineering
- `joblib` — model serialization

**MLOps**
- `MLflow` — experiment tracking, metric logging, artifact storage, model registry

**Backend**
- `FastAPI` — REST API with automatic docs, async support, background tasks
- `Pydantic` — request/response validation and serialization
- `uvicorn` — ASGI server

**Frontend**
- `React 18` + `Vite` — UI framework and build tool
- `Recharts` — bar charts and radar charts for metric visualization
- `lucide-react` — icons

**DevOps**
- `Docker` + `docker-compose` — containerization and multi-service orchestration
- `GitHub Actions` — CI/CD automation (test → lint → build → smoke test)
- `pytest` — unit and integration testing
- `Ruff` — Python linter

---

## 📊 What This Project Demonstrates

| Skill Area | Evidence |
|---|---|
| Classical ML | Feature engineering, encoding, train/test split, 3 algorithms, cross-validation |
| MLOps | MLflow experiment tracking, artifact logging, best model auto-selection |
| Model Serving | REST API, background training, health checks, model versioning |
| Software Engineering | Modular code, Docker, CI/CD, pytest, Pydantic validation |
| Frontend Integration | React dashboard consuming a live ML API with real-time charts |
| Production Thinking | SMOTE for imbalance, data leakage prevention, error handling, 503 on no model |

---

## 👩‍💻 Author

**Shatakshi** · B.Tech CSE (AI/ML) · VIT Bhopal  
[GitHub](https://github.com/shatakshi-1404) · Google Summer of Code 2024 Contributor

---

> Built from scratch as part of a portfolio of production-grade AI/ML projects.
> Every component — from data preprocessing to CI/CD — is implemented without boilerplate templates.
