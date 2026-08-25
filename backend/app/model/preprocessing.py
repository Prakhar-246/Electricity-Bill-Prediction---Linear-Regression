"""
Reproduces, at inference time, the same feature engineering + encoding the
notebook applied before fitting StandardScaler / LinearRegression:

  1. HeavyAppliances        = Refrigerator + AirConditioner
  2. TotalAppliances_Usage  = Fan + Refrigerator + AirConditioner + Television
                               + Monitor + MotorPump
  3. Season                 = derive_season(Month)   (Winter/Summer/Post Winter)
  4. One-hot encode City, Company, Season with drop_first=True (baseline
     category = all-zeros row), matching pandas' alphabetical category order.
  5. Assemble the 58 columns in ORDERED_FEATURES order, then scaler.transform().

NOTE on MotorPump: the trained model has no MotorPump feature (it was
dropped from the dataframe before the final encode/fit in the notebook), but
TotalAppliances_Usage was computed *while MotorPump was still a column*, and
every row in the training data had MotorPump == 0. We therefore don't expose
MotorPump as a user input (there's nothing in the trained model that would
respond to it) and compute TotalAppliances_Usage as if MotorPump == 0, which
exactly reproduces the values the model was trained on. If you have a reason
to believe MotorPump is meaningfully non-zero in real usage, that's a
retraining question, not a preprocessing bug -- flagging rather than
silently guessing.
"""
from __future__ import annotations

import pandas as pd

from .feature_schema import (
    ALL_CITIES,
    ALL_COMPANIES,
    CITY_BASELINE,
    COMPANY_BASELINE,
    ORDERED_FEATURES,
    SEASON_BASELINE,
    derive_season,
)


class UnknownCategoryError(ValueError):
    """Raised when City/Company isn't one of the categories seen in training."""


def build_feature_row(
    fan: float,
    refrigerator: float,
    air_conditioner: float,
    television: float,
    monitor: float,
    month: int,
    monthly_hours: float,
    tariff_rate: float,
    city: str,
    company: str,
) -> dict[str, float]:
    """Build the 58-feature dict, in ORDERED_FEATURES order, for one input row."""

    if city not in ALL_CITIES:
        raise UnknownCategoryError(
            f"Unknown City '{city}'. Must be one of the {len(ALL_CITIES)} "
            "cities seen during training."
        )
    if company not in ALL_COMPANIES:
        raise UnknownCategoryError(
            f"Unknown Company '{company}'. Must be one of the "
            f"{len(ALL_COMPANIES)} companies seen during training."
        )

    motor_pump = 0  # see module docstring: not modeled, always 0 in training data
    heavy_appliances = refrigerator + air_conditioner
    total_appliances_usage = (
        fan + refrigerator + air_conditioner + television + monitor + motor_pump
    )
    season = derive_season(month)

    row = {
        "Fan": fan,
        "Refrigerator": refrigerator,
        "AirConditioner": air_conditioner,
        "Television": television,
        "Monitor": monitor,
        "Month": month,
        "MonthlyHours": monthly_hours,
        "TariffRate": tariff_rate,
        "HeavyAppliances": heavy_appliances,
        "TotalAppliances_Usage": total_appliances_usage,
    }

    for c in ALL_CITIES:
        if c == CITY_BASELINE:
            continue
        row[f"City_{c}"] = 1.0 if city == c else 0.0

    for co in ALL_COMPANIES:
        if co == COMPANY_BASELINE:
            continue
        row[f"Company_{co}"] = 1.0 if company == co else 0.0

    for s in ("Summer", "Winter"):  # SEASONS minus SEASON_BASELINE, in order
        if s == SEASON_BASELINE:
            continue
        row[f"Season_{s}"] = 1.0 if season == s else 0.0

    return row


def row_to_vector(row: dict[str, float]) -> pd.DataFrame:
    """
    Flatten a feature dict into a 1-row DataFrame with the exact column
    order/names the scaler was fit on. Using a named DataFrame (rather than
    a bare ndarray) avoids sklearn's "X does not have valid feature names"
    warning and, more importantly, makes column misalignment impossible.
    """
    return pd.DataFrame([[row[f] for f in ORDERED_FEATURES]], columns=ORDERED_FEATURES)
