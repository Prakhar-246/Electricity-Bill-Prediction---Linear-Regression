# ⚡ Electricity Bill Predictor

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An end-to-end Machine Learning web application designed to forecast monthly domestic electricity bills based on household appliance usage, operational hours, tariff slabs, seasonal factors, and regional distribution companies across India.

---

## 📌 Project Overview

Electricity consumption varies significantly across households depending on the quantity of heavy appliances (such as air conditioners and refrigerators), daily operating hours, seasonal weather conditions, and state electricity tariffs.

This project bridges data science and interactive software by training a **Linear Regression** model on domestic power consumption patterns and serving it through an intuitive, real-time web application.

---

## 🎯 Key Highlights

- **Linear Regression Pipeline**: Trained using Scikit-Learn with feature standardization via `StandardScaler`.
- **58 Feature Encoding**: Incorporates continuous appliance variables, engineered interaction features, seasonal one-hot encoding, 16 Indian cities, and 32 electricity discoms.
- **Smart Preprocessing**: Strictly replicates the training feature alignment directly from the serialized scaler schema (`scaler.feature_names_in_`).
- **Interactive UI with Quick Presets**: Built with React and Vite, featuring one-click household presets (1 BHK, 2 BHK, 3 BHK, Office) for quick scenario analysis.
- **Energy Efficiency Recommendations**: Generates actionable insights based on heavy appliance ownership to help users reduce their monthly consumption.
- **Production-Ready API**: High-performance FastAPI backend with automatic schema validation and interactive Swagger documentation.

---

## 🧠 Machine Learning Details

### 1. Features & Engineering
The model operates on **58 input features**:
- **Appliance Counts**: Fans, Refrigerators, Air Conditioners, Televisions, Monitors.
- **Usage & Economics**: Monthly operational hours, Tariff rate (₹/kWh).
- **Engineered Features**:
  - `HeavyAppliances` = $Refrigerator + AirConditioner$
  - `TotalAppliances_Usage` = $\sum(Appliances) \times MonthlyHours$
- **Seasonal Categorization**: Derived from billing month (Summer, Winter, Post-Winter) with one-hot dummy encoding.
- **Geographic & Discom Encoding**: One-hot encoded across 16 major Indian cities and 32 electricity distribution companies (e.g., Tata Power, Adani Power, BSES, BESCOM, etc.).

### 2. Model & Preprocessing Pipeline
- **Scaler**: `StandardScaler` fitted on continuous and one-hot features.
- **Estimator**: `LinearRegression` with fitted intercept and coefficients.
- **Artifacts**: Serialized using Joblib (`electricity_bill_linear.pkl`, `electricity_bill_scaler.pkl`).

---

## 🛠️ Tech Stack

- **Machine Learning**: Scikit-learn, Pandas, NumPy, Joblib
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: React, Vite, Modern CSS (Glassmorphism & Responsive Design)
- **Tooling**: Git, Python 3.12, Node.js

---

## 📂 Project Architecture

```
electricity-app/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & route handlers
│   │   ├── schemas.py               # Pydantic data validation models
│   │   └── model/
│   │       ├── feature_schema.py    # 58-feature schema & discom mappings
│   │       ├── preprocessing.py     # Feature engineering & vectorization
│   │       ├── model_loader.py      # Artifact loading & startup verification
│   │       ├── electricity_bill_linear.pkl
│   │       └── electricity_bill_scaler.pkl
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main application component & presets
│   │   ├── index.css                # Custom responsive design system
│   │   └── main.jsx                 # React root
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 💻 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/Prakhar-246/Electricity-Bill-Prediction---Linear-Regression.git
cd Electricity-Bill-Prediction---Linear-Regression
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔌 API Reference

### 1. Health Check
```http
GET /health
```
**Response**:
```json
{
  "status": "ok",
  "message": "Electricity Bill Prediction API is healthy"
}
```

### 2. Available Options
```http
GET /options
```
Returns lists of cities and distribution companies recognized by the trained model.

### 3. Predict Electricity Bill
```http
POST /predict
Content-Type: application/json
```
**Request Body**:
```json
{
  "fan": 4,
  "refrigerator": 1,
  "air_conditioner": 1,
  "television": 2,
  "monitor": 1,
  "month": 6,
  "monthly_hours": 300,
  "tariff_rate": 7.5,
  "city": "Mumbai",
  "company": "Tata Power Company Ltd."
}
```

**Response**:
```json
{
  "predicted_bill": 2485.50,
  "derived_season": "Summer",
  "derived_heavy_appliances": 2.0,
  "derived_total_appliances_usage": 2700.0
}
```

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
