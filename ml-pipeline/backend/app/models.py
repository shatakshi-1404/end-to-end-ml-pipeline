from pydantic import BaseModel, Field
from typing import Optional, Literal


class CustomerData(BaseModel):
    # Demographics
    gender: Literal[0, 1] = Field(default=0, description="0=Female, 1=Male")
    SeniorCitizen: Literal[0, 1] = Field(default=0)
    Partner: Literal[0, 1] = Field(default=0)
    Dependents: Literal[0, 1] = Field(default=0)

    # Account info
    tenure: int = Field(default=12, ge=0, le=72)
    PhoneService: Literal[0, 1] = Field(default=1)
    PaperlessBilling: Literal[0, 1] = Field(default=1)
    MonthlyCharges: float = Field(default=65.0, ge=0)
    TotalCharges: float = Field(default=780.0, ge=0)

    # Services (one-hot encoded match to training)
    MultipleLines_No_phone_service: Literal[0, 1] = Field(default=0)
    MultipleLines_Yes: Literal[0, 1] = Field(default=0)
    InternetService_Fiber_optic: Literal[0, 1] = Field(default=0)
    InternetService_No: Literal[0, 1] = Field(default=0)
    OnlineSecurity_No_internet_service: Literal[0, 1] = Field(default=0)
    OnlineSecurity_Yes: Literal[0, 1] = Field(default=0)
    OnlineBackup_No_internet_service: Literal[0, 1] = Field(default=0)
    OnlineBackup_Yes: Literal[0, 1] = Field(default=0)
    DeviceProtection_No_internet_service: Literal[0, 1] = Field(default=0)
    DeviceProtection_Yes: Literal[0, 1] = Field(default=0)
    TechSupport_No_internet_service: Literal[0, 1] = Field(default=0)
    TechSupport_Yes: Literal[0, 1] = Field(default=0)
    StreamingTV_No_internet_service: Literal[0, 1] = Field(default=0)
    StreamingTV_Yes: Literal[0, 1] = Field(default=0)
    StreamingMovies_No_internet_service: Literal[0, 1] = Field(default=0)
    StreamingMovies_Yes: Literal[0, 1] = Field(default=0)
    Contract_One_year: Literal[0, 1] = Field(default=0)
    Contract_Two_year: Literal[0, 1] = Field(default=0)
    PaymentMethod_Credit_card_automatic: Literal[0, 1] = Field(default=0)
    PaymentMethod_Electronic_check: Literal[0, 1] = Field(default=0)
    PaymentMethod_Mailed_check: Literal[0, 1] = Field(default=0)


class PredictionResponse(BaseModel):
    churn_probability: float
    prediction: Literal["churn", "no_churn"]
    confidence: str
    risk_level: Literal["low", "medium", "high"]
    model_used: str
    run_id: Optional[str] = None


class TrainResponse(BaseModel):
    status: str
    results: list
    best_run_id: str
    message: str


class ExperimentRun(BaseModel):
    run_id: str
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    status: str