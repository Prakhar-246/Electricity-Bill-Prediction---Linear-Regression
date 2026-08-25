from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model.model_loader import get_model, get_scaler, validate_schema
from .model.preprocessing import (
    UnknownCategoryError,
    build_feature_row,
    row_to_vector,
)
from .model.feature_schema import ALL_CITIES, ALL_COMPANIES, derive_season
from .schemas import OptionsResponse, PredictionRequest, PredictionResponse

app = FastAPI(
    title="Electricity Bill Prediction API",
    description=(
        "Serves the existing (unmodified) Linear Regression model + "
        "StandardScaler trained in Electricity.ipynb."
    ),
    version="1.0.0",
)

# Dev-friendly CORS for a locally-run Vite React app. Tighten this to your
# real frontend origin(s) before deploying anywhere public.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Loads pkl files and asserts feature_schema.py still matches them.
    # Crashes the server on startup (not mid-request) if that's ever untrue.
    validate_schema()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/options", response_model=OptionsResponse)
def options():
    """Cities/companies the model was actually trained on, for populating
    the frontend's dropdowns so users can't submit an unseen category."""
    return OptionsResponse(cities=ALL_CITIES, companies=ALL_COMPANIES)


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    try:
        row = build_feature_row(
            fan=req.fan,
            refrigerator=req.refrigerator,
            air_conditioner=req.air_conditioner,
            television=req.television,
            monitor=req.monitor,
            month=req.month,
            monthly_hours=req.monthly_hours,
            tariff_rate=req.tariff_rate,
            city=req.city,
            company=req.company,
        )
    except UnknownCategoryError as e:
        raise HTTPException(status_code=422, detail=str(e))

    vector = row_to_vector(row)
    scaler = get_scaler()
    model = get_model()

    scaled = scaler.transform(vector)
    prediction = float(model.predict(scaled)[0])

    return PredictionResponse(
        predicted_bill=round(prediction, 2),
        derived_season=derive_season(req.month),
        derived_heavy_appliances=row["HeavyAppliances"],
        derived_total_appliances_usage=row["TotalAppliances_Usage"],
    )
