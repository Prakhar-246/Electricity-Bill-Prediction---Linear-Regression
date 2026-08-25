import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const initialForm = {
  fan: 10,
  refrigerator: 1,
  air_conditioner: 1,
  television: 2,
  monitor: 1,
  month: 1,
  monthly_hours: 300,
  tariff_rate: 8.0,
  city: '',
  company: '',
}

const NUMERIC_FIELDS = [
  { key: 'fan', label: 'Fans' },
  { key: 'refrigerator', label: 'Refrigerators' },
  { key: 'air_conditioner', label: 'Air Conditioners' },
  { key: 'television', label: 'Televisions' },
  { key: 'monitor', label: 'Monitors' },
  { key: 'monthly_hours', label: 'Monthly Usage (hours)' },
  { key: 'tariff_rate', label: 'Tariff Rate (₹/unit)' },
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
          city: data.cities?.[0] ?? '',
          company: data.companies?.[0] ?? '',
        }))
      })
      .catch((err) =>
        setOptionsError(
          `Could not reach the backend at ${API_BASE} (${err.message}). Is it running?`
        )
      )
  }, [])

  function handleChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
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

  return (
    <div className="page">
      <div className="card">
        <h1>Electricity Bill Predictor</h1>
        <p className="subtitle">
          Backed by the trained Linear Regression model from Electricity.ipynb
        </p>

        {optionsError && <div className="banner error">{optionsError}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="grid">
            {NUMERIC_FIELDS.map(({ key, label }) => (
              <label key={key} className="field">
                <span>{label}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  required
                />
              </label>
            ))}

            <label className="field">
              <span>Month</span>
              <select
                value={form.month}
                onChange={(e) => handleChange('month', e.target.value)}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>City</span>
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
            </label>

            <label className="field field-wide">
              <span>Electricity Company</span>
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
            </label>
          </div>

          <button type="submit" disabled={loading || !!optionsError}>
            {loading ? 'Predicting…' : 'Predict Bill'}
          </button>
        </form>

        {error && <div className="banner error">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-main">
              <span className="result-label">Predicted Bill</span>
              <span className="result-value">₹{result.predicted_bill.toLocaleString()}</span>
            </div>
            <div className="result-meta">
              <span>Derived season: {result.derived_season}</span>
              <span>Heavy appliances score: {result.derived_heavy_appliances}</span>
              <span>Total appliance usage: {result.derived_total_appliances_usage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
