# ⚡ Electricity Bill Predictor - Machine Learning Web App

A full-stack, production-ready Machine Learning web application that predicts domestic monthly electricity bills based on household appliance usage, operational hours, tariff rates, season, and geography across India.

Backed by a **Linear Regression model** + **StandardScaler** trained on 58 engineered features (appliances, seasonal one-hot encoding, 16 cities, and 32 electricity discoms).

---

## 🌟 Key Features

- **Accurate ML Prediction**: Utilizes Scikit-learn Linear Regression fitted on actual Indian domestic power consumption patterns.
- **⚡ 1-Click Household Presets**: Instantly populate realistic values with:
  - 🏠 **1 BHK Apartment**
  - 🏢 **2 BHK Family Home**
  - 🏡 **3 BHK Luxury Residence**
  - 💼 **Small Office / Commercial**
- **📊 Smart Energy Insights**: Automatic calculation of Heavy Appliance Index, Seasonal impact, and personalized electricity-saving recommendations.
- **📋 Copy Summary**: Easily copy the forecast breakdown directly to your clipboard.
- **🛡️ Production Safeguards**: Clamped against negative linear intercepts, cross-origin resource sharing (CORS) enabled, and automated startup schema verification.
- **🚀 Unified Full-Stack Architecture**: FastAPI automatically serves the pre-built React production frontend — meaning the entire application runs as a **single, unified service** on any cloud provider!

---

## 🏗️ Architecture & Layout

```
electricity-app/
├── backend/
│   ├── app/
│   │   ├── main.py                  FastAPI server (serves API & static frontend)
│   │   ├── schemas.py               Pydantic validation schemas
│   │   └── model/
│   │       ├── feature_schema.py    Ground-truth 58-column layout & discom mapping
│   │       ├── preprocessing.py     Feature engineering & one-hot vectorization
│   │       ├── model_loader.py      Loads .pkl models and verifies integrity
│   │       ├── electricity_bill_linear.pkl
│   │       └── electricity_bill_scaler.pkl
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  Modern React UI with Presets & Insights
│   │   ├── index.css                Glassmorphic responsive styles
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── dist/                        Pre-built production assets
├── Dockerfile                       Multi-stage container for 1-click cloud deployment
├── render.yaml                      Configuration for Render.com
└── README.md
```

---

## 🚀 How to Run Locally

### Option 1: Unified Full-Stack (Single Command)
Since the React frontend is pre-built into `frontend/dist`, you can run the entire web application with just Python:

```bash
# From electricity-app directory
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```
Open **`http://localhost:8000`** in your browser — both the React UI and API will run together!
Interactive API Docs: `http://localhost:8000/docs`

---

### Option 2: Full Development Mode (React HMR + FastAPI)

1. **Start Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open **`http://localhost:5173`** for hot-reloading development.

---

## 🌐 How to Convert into a Free Live URL

You can host this project completely free using any of the following platforms:

### Method 1: Render.com (Recommended - 100% Free)
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your repository: `Electricity-Bill-Prediction---Linear-Regression`.
4. Configure:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Within 2-3 minutes, Render will assign you a live HTTPS URL (e.g. `https://electricity-bill-predictor.onrender.com`).

---

### Method 2: Hugging Face Spaces (Instant Free ML Hosting)
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Select **Docker** as the SDK.
3. Link your GitHub repo or push this repository.
4. Hugging Face will automatically use the included `Dockerfile` to build and give you an instant live URL.

---

## 🧪 Automated Testing

To run the verification test suite:
```bash
python -c "from fastapi.testclient import TestClient; from backend.app.main import app; client = TestClient(app); assert client.get('/health').status_code == 200; print('All tests passed!')"
```
