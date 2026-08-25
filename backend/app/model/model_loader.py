from __future__ import annotations

import functools
from pathlib import Path

import joblib

from .feature_schema import ORDERED_FEATURES

MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "electricity_bill_linear.pkl"
SCALER_PATH = MODEL_DIR / "electricity_bill_scaler.pkl"


@functools.lru_cache(maxsize=1)
def get_model():
    return joblib.load(MODEL_PATH)


@functools.lru_cache(maxsize=1)
def get_scaler():
    return joblib.load(SCALER_PATH)


def validate_schema() -> None:
    """
    Fail fast at startup if feature_schema.py ever drifts from what the
    pickled scaler was actually fit on, instead of silently mis-predicting.
    """
    scaler = get_scaler()
    fitted_names = getattr(scaler, "feature_names_in_", None)
    if fitted_names is not None and list(fitted_names) != ORDERED_FEATURES:
        raise RuntimeError(
            "feature_schema.ORDERED_FEATURES does not match "
            "scaler.feature_names_in_ -- the model/scaler pkl files were "
            "likely retrained/replaced. Regenerate feature_schema.py before "
            "serving predictions."
        )

    model = get_model()
    n_expected = getattr(model, "n_features_in_", None)
    if n_expected is not None and n_expected != len(ORDERED_FEATURES):
        raise RuntimeError(
            f"Model expects {n_expected} features but ORDERED_FEATURES has "
            f"{len(ORDERED_FEATURES)}."
        )
