"""
Ground-truth feature contract for electricity_bill_linear.pkl / electricity_bill_scaler.pkl

IMPORTANT: This file was derived by loading the actual .pkl files and reading
scaler.feature_names_in_ (58 features, in order) -- NOT by re-reading the
notebook source, because the notebook cells were executed out of order
(e.g. df_clean is built at cell 36 before MotorPump is dropped at cell 37,
train_test_split/X_train appear used before they're defined, get_dummies is
called once but bool->int casting and Season handling happen in later,
re-run cells). The .pkl objects are the single source of truth for what the
model actually learned on. Reproducing the *code path* from the notebook
would NOT guarantee the same column order the model was fit on -- reading it
off the fitted scaler does.

Do not reorder, rename, add, or drop anything below without re-checking
scaler.feature_names_in_ against the .pkl files -- the LinearRegression
model has no feature names of its own; it only trusts positional order.
"""

# The 10 numeric/engineered features, in the exact order the scaler expects.
NUMERIC_FEATURES = [
    "Fan",
    "Refrigerator",
    "AirConditioner",
    "Television",
    "Monitor",
    "Month",
    "MonthlyHours",
    "TariffRate",
    "HeavyAppliances",        # engineered: Refrigerator + AirConditioner
    "TotalAppliances_Usage",  # engineered: Fan+Refrigerator+AirConditioner+Television+Monitor+MotorPump
]

# All 16 cities seen during training. pd.get_dummies(..., drop_first=True)
# drops the alphabetically-first category as the implicit baseline.
ALL_CITIES = [
    "Ahmedabad", "Chennai", "Dahej", "Faridabad", "Gurgaon", "Hyderabad",
    "Kolkata", "Mumbai", "Nagpur", "Navi Mumbai", "New Delhi", "Noida",
    "Pune", "Ratnagiri", "Shimla", "Vadodara",
]
CITY_BASELINE = "Ahmedabad"  # dropped column -> all-zero City_* row means this

# All 32 companies seen during training. Same drop_first rule applies.
ALL_COMPANIES = [
    "Adani Power Ltd.", "Bonfiglioli Transmission Pvt. Ltd.", "CESC",
    "GE T&D India Limited", "Guj Ind Power", "Indowind Energy",
    "JSW Energy Ltd.", "Jaiprakash Power", "Jyoti Structure",
    "KEC International", "Kalpataru Power",
    "L&T Transmission & Distribution",
    "Maha Transco – Maharashtra State Electricity Transmission Co, Ltd.",
    "NHPC", "NLC India", "NTPC Pvt. Ltd.",
    "Neueon Towers / Sujana Towers Ltd.",
    "Optibelt Power Transmission India Private Limited", "Orient Green",
    "Power Grid Corp", "Ratnagiri Gas and Power Pvt. Ltd. (RGPPL)",
    "Reliance Energy", "Reliance Power",
    "Ringfeder Power Transmission India Pvt. Ltd.", "SJVN Ltd.",
    "Sterlite Power Transmission Ltd", "Sunil Hitech Eng",
    "Tata Power Company Ltd.", "Torrent Power Ltd.",
    "Toshiba Transmission & Distribution Systems (India) Pvt. Ltd.",
    "TransRail Lighting", "Unitech Power Transmission Ltd.",
]
COMPANY_BASELINE = "Adani Power Ltd."  # dropped column

# Season is derived from Month by the notebook's extract_season(), which has
# three logical buckets even though "Winter" is assigned twice:
#   {12,1,2} -> Winter, {3,4,5} -> Summer, {6,7,8,9} -> Winter, else -> "Post Winter"
# drop_first drops "Post Winter" (alphabetically first of the 3 labels).
SEASONS = ["Post Winter", "Summer", "Winter"]
SEASON_BASELINE = "Post Winter"


def derive_season(month: int) -> str:
    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Summer"
    if month in (6, 7, 8, 9):
        return "Winter"
    return "Post Winter"  # months 10, 11


# The exact 58-column order the scaler/model were fit on. Built here
# programmatically (from the same alphabetical drop_first logic pandas
# uses) and it must match scaler.feature_names_in_ exactly -- this is
# asserted at import time in preprocessing.py so the app fails loudly at
# startup, not silently at inference time, if the two ever diverge.
ORDERED_FEATURES = (
    NUMERIC_FEATURES
    + [f"City_{c}" for c in ALL_CITIES if c != CITY_BASELINE]
    + [f"Company_{c}" for c in ALL_COMPANIES if c != COMPANY_BASELINE]
    + [f"Season_{s}" for s in SEASONS if s != SEASON_BASELINE]
)
