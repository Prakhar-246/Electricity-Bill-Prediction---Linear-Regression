import { useEffect, useState } from 'react'

// Smart API base: uses env var if set; during local vite dev (port 5173) defaults to 8000;
// in production unified deployment uses relative paths (same origin)
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://127.0.0.1:8000'
    : ''
)

const PRESETS = [
  {
    name: '1 BHK Apartment',
    icon: '🏠',
    values: {
      fan: 2,
      refrigerator: 1,
      air_conditioner: 0,
      television: 1,
      monitor: 1,
      month: 4,
      monthly_hours: 180,
      tariff_rate: 6.5,
    },
  },
  {
    name: '2 BHK Family',
    icon: '🏢',
    values: {
      fan: 4,
      refrigerator: 1,
      air_conditioner: 1,
      television: 2,
      monitor: 1,
      month: 6,
      monthly_hours: 280,
      tariff_rate: 7.8,
    },
  },
  {
    name: '3 BHK Luxury',
    icon: '🏡',
    values: {
      fan: 6,
      refrigerator: 2,
      air_conditioner: 2,
      television: 2,
      monitor: 2,
      month: 7,
      monthly_hours: 380,
      tariff_rate: 8.5,
    },
  },
  {
    name: 'Commercial / Office',
    icon: '💼',
    values: {
      fan: 10,
      refrigerator: 1,
      air_conditioner: 3,
      television: 1,
      monitor: 8,
      month: 5,
      monthly_hours: 450,
      tariff_rate: 9.8,
    },
  },
]

const initialForm = {
  fan: 4,
  refrigerator: 1,
  air_conditioner: 1,
  television: 2,
  monitor: 1,
  month: 6,
  monthly_hours: 300,
  tariff_rate: 7.5,
  city: '',
  company: '',
}

const APPLIANCE_FIELDS = [
  { key: 'fan', label: 'Fans', icon: '🌀', desc: 'Ceiling / table fans' },
  { key: 'refrigerator', label: 'Refrigerators', icon: '🧊', desc: 'Single / double door' },
  { key: 'air_conditioner', label: 'Air Conditioners', icon: '❄️', desc: 'Split / window ACs' },
  { key: 'television', label: 'Televisions', icon: '📺', desc: 'LED / smart TVs' },
  { key: 'monitor', label: 'Monitors / PCs', icon: '💻', desc: 'Desktop screens' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function App() {
  const [options, setOptions] = useState({ cities: [], companies: [] })
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [optionsError, setOptionsError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/options`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setOptions(data)
        setForm((f) => ({
          ...f,
          city: f.city || data.cities?.[0] || '',
          company: f.company || data.companies?.[0] || '',
        }))
      })
      .catch((err) =>
        setOptionsError(
          `Could not reach API at ${API_BASE || 'origin'} (${err.message}). Is the backend running?`
        )
      )
  }, [])

  function handleChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function applyPreset(preset) {
    setForm((f) => ({
      ...f,
      ...preset.values,
    }))
    setResult(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        fan: Number(form.fan),
        refrigerator: Number(form.refrigerator),
        air_conditioner: Number(form.air_conditioner),
        television: Number(form.television),
        monitor: Number(form.monitor),
        month: Number(form.month),
        monthly_hours: Number(form.monthly_hours),
        tariff_rate: Number(form.tariff_rate),
      }
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || `Server responded ${res.status}`)
      }
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copySummary() {
    if (!result) return
    const summary = `⚡ Electricity Bill Forecast:
• Estimated Bill: ₹${result.predicted_bill.toLocaleString()}
• Season: ${result.derived_season}
• Monthly Usage: ${form.monthly_hours} hrs @ ₹${form.tariff_rate}/unit
• City: ${form.city} (${form.company})
• Heavy Appliances Score: ${result.derived_heavy_appliances}`
    
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="badge-row">
            <span className="badge badge-glow">⚡ Machine Learning Model</span>
            <span className="badge badge-neutral">Linear Regression • 58 Features</span>
          </div>
          <h1>Electricity Bill Predictor</h1>
          <p className="subtitle">
            Accurate monthly electricity bill estimation powered by scikit-learn trained on Indian domestic consumption patterns.
          </p>
        </header>

        {/* Quick Presets */}
        <section className="preset-section">
          <span className="preset-label">⚡ Quick Presets:</span>
          <div className="preset-buttons">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset-btn"
                onClick={() => applyPreset(p)}
              >
                <span>{p.icon}</span> {p.name}
              </button>
            ))}
          </div>
        </section>

        {optionsError && (
          <div className="banner error">
            ⚠️ {optionsError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          {/* Section 1: Appliances */}
          <div className="form-section">
            <div className="section-title">
              <h3>1. Household Appliances</h3>
              <span className="section-hint">Number of active units</span>
            </div>
            <div className="appliance-grid">
              {APPLIANCE_FIELDS.map(({ key, label, icon, desc }) => (
                <div key={key} className="appliance-card">
                  <div className="appliance-info">
                    <span className="appliance-icon">{icon}</span>
                    <div>
                      <div className="appliance-name">{label}</div>
                      <div className="appliance-desc">{desc}</div>
                    </div>
                  </div>
                  <div className="counter-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form[key]}
                      onChange={(e) => handleChange(key, Math.max(0, Number(e.target.value)))}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Usage & Tariff */}
          <div className="form-section">
            <div className="section-title">
              <h3>2. Usage & Tariff Details</h3>
              <span className="section-hint">Monthly parameters</span>
            </div>
            <div className="grid-fields">
              <label className="field">
                <span className="field-label">⏱️ Total Usage (Hours/Month)</span>
                <input
                  type="number"
                  min="0"
                  max="744"
                  step="1"
                  value={form.monthly_hours}
                  onChange={(e) => handleChange('monthly_hours', e.target.value)}
                  placeholder="e.g. 300"
                  required
                />
                <span className="field-hint">Max 744 hrs in a 31-day month</span>
              </label>

              <label className="field">
                <span className="field-label">⚡ Tariff Rate (₹ per Unit/kWh)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.tariff_rate}
                  onChange={(e) => handleChange('tariff_rate', e.target.value)}
                  placeholder="e.g. 7.5"
                  required
                />
                <span className="field-hint">State discom standard tariff rate</span>
              </label>

              <label className="field">
                <span className="field-label">📅 Billing Month</span>
                <select
                  value={form.month}
                  onChange={(e) => handleChange('month', Number(e.target.value))}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Used for seasonal consumption modeling</span>
              </label>

              <label className="field">
                <span className="field-label">📍 City / Region</span>
                <select
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                >
                  {options.cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Model-trained geographical area</span>
              </label>

              <label className="field field-wide">
                <span className="field-label">🏢 Electricity Distribution Company</span>
                <select
                  value={form.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  required
                >
                  {options.companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Trained utility provider</span>
              </label>
            </div>
          </div>

          <div className="action-row">
            <button type="submit" className="submit-btn" disabled={loading || !!optionsError}>
              {loading ? (
                <>
                  <span className="spinner"></span> Calculating Prediction...
                </>
              ) : (
                '⚡ Predict Electricity Bill'
              )}
            </button>
          </div>
        </form>

        {error && <div className="banner error">❌ Error: {error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <div>
                <span className="result-eyebrow">Estimated Monthly Bill</span>
                <div className="result-amount">₹{result.predicted_bill.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <button type="button" className="copy-btn" onClick={copySummary}>
                {copied ? '✅ Copied' : '📋 Copy Summary'}
              </button>
            </div>

            <div className="result-metrics">
              <div className="metric-box">
                <span className="metric-label">Derived Season</span>
                <span className="metric-value season-pill">{result.derived_season}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Heavy Appliance Index</span>
                <span className="metric-value">{result.derived_heavy_appliances}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Total Appliance Units</span>
                <span className="metric-value">{result.derived_total_appliances_usage}</span>
              </div>
            </div>

            <div className="saving-tips">
              <div className="tip-title">💡 Smart Energy Insights:</div>
              <ul>
                {Number(form.air_conditioner) > 0 && (
                  <li>Setting AC thermostats to 24°C instead of 18°C can reduce energy consumption by up to 24%.</li>
                )}
                {Number(form.fan) > 4 && (
                  <li>Switching to BLDC 5-star energy rated ceiling fans can save up to ₹1,500 annually per fan.</li>
                )}
                <li>Estimated based on {form.monthly_hours} operational hours and ₹{form.tariff_rate}/kWh tariff rate in {form.city}.</li>
              </ul>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>
            Developed with React + FastAPI + Scikit-Learn | Built for fast & precise bill predictions
          </p>
        </footer>
      </div>
    </div>
  )
}
