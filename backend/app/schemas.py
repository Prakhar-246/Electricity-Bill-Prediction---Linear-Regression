from pydantic import BaseModel, Field

from .model.feature_schema import ALL_CITIES, ALL_COMPANIES


class PredictionRequest(BaseModel):
    fan: float = Field(..., ge=0, description="Number of fans")
    refrigerator: float = Field(..., ge=0, description="Number of refrigerators")
    air_conditioner: float = Field(..., ge=0, description="Number of ACs")
    television: float = Field(..., ge=0, description="Number of TVs")
    monitor: float = Field(..., ge=0, description="Number of monitors")
    month: int = Field(..., ge=1, le=12, description="Billing month, 1-12")
    monthly_hours: float = Field(..., ge=0, description="Total monthly usage hours")
    tariff_rate: float = Field(..., gt=0, description="Tariff rate (currency/unit)")
    city: str = Field(..., description="Must be one of the trained cities")
    company: str = Field(..., description="Must be one of the trained companies")

    class Config:
        json_schema_extra = {
            "example": {
                "fan": 16,
                "refrigerator": 23,
                "air_conditioner": 2,
                "television": 6,
                "monitor": 1,
                "month": 10,
                "monthly_hours": 384,
                "tariff_rate": 8.4,
                "city": "Hyderabad",
                "company": "Tata Power Company Ltd.",
            }
        }


class PredictionResponse(BaseModel):
    predicted_bill: float
    derived_season: str
    derived_heavy_appliances: float
    derived_total_appliances_usage: float


class OptionsResponse(BaseModel):
    cities: list[str] = ALL_CITIES
    companies: list[str] = ALL_COMPANIES
