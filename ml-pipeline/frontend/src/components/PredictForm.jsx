import { useState } from "react";
import { AlertTriangle, CheckCircle, TrendingUp, User } from "lucide-react";

const defaultValues = {
  gender: 0, SeniorCitizen: 0, Partner: 0, Dependents: 0,
  tenure: 12, PhoneService: 1, PaperlessBilling: 1,
  MonthlyCharges: 65.0, TotalCharges: 780.0,
  MultipleLines_No_phone_service: 0, MultipleLines_Yes: 0,
  InternetService_Fiber_optic: 0, InternetService_No: 0,
  OnlineSecurity_No_internet_service: 0, OnlineSecurity_Yes: 0,
  OnlineBackup_No_internet_service: 0, OnlineBackup_Yes: 0,
  DeviceProtection_No_internet_service: 0, DeviceProtection_Yes: 0,
  TechSupport_No_internet_service: 0, TechSupport_Yes: 0,
  StreamingTV_No_internet_service: 0, StreamingTV_Yes: 0,
  StreamingMovies_No_internet_service: 0, StreamingMovies_Yes: 0,
  Contract_One_year: 0, Contract_Two_year: 0,
  PaymentMethod_Credit_card_automatic: 0,
  PaymentMethod_Electronic_check: 0, PaymentMethod_Mailed_check: 0,
};

const card = {
  background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 20,
};

function Field({ label, name, value, onChange, type = "select", options, min, max, step = 1 }) {
  const inputStyle = {
    width: "100%", padding: "7px 10px", borderRadius: 6,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", fontSize: 13, outline: "none",
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {type === "select" ? (
        <select name={name} value={value} onChange={onChange} style={inputStyle}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type="number" name={name} value={value} onChange={onChange}
          min={min} max={max} step={step} style={inputStyle} />
      )}
    </div>
  );
}

function RiskMeter({ probability }) {
  const pct = (probability * 100).toFixed(1);
  const color = probability < 0.3 ? "var(--success)" : probability < 0.6 ? "var(--warning)" : "var(--danger)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Churn probability</span>
        <span style={{ fontSize: 20, fontWeight: 600, color, fontFamily: "var(--mono)" }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, var(--success), ${color})`,
          borderRadius: 3, transition: "width 0.6s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "var(--muted)" }}>
        <span>Low risk</span><span>High risk</span>
      </div>
    </div>
  );
}

export default function PredictForm({ api }) {
  const [form, setForm] = useState(defaultValues);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: Number(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${api}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.detail || "Prediction failed");
      }
      setResult(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const yn = [{ value: 0, label: "No" }, { value: 1, label: "Yes" }];
  const isChurn = result?.prediction === "churn";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 960 }}>
      {/* Left — form inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Demographics */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <User size={14} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Demographics</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Gender" name="gender" value={form.gender} onChange={handleChange}
              options={[{ value: 0, label: "Female" }, { value: 1, label: "Male" }]} />
            <Field label="Senior Citizen" name="SeniorCitizen" value={form.SeniorCitizen} onChange={handleChange} options={yn} />
            <Field label="Partner" name="Partner" value={form.Partner} onChange={handleChange} options={yn} />
            <Field label="Dependents" name="Dependents" value={form.Dependents} onChange={handleChange} options={yn} />
          </div>
        </div>

        {/* Account */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: "var(--text)" }}>Account Info</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tenure (months)" name="tenure" value={form.tenure} onChange={handleChange}
              type="number" min={0} max={72} />
            <Field label="Monthly Charges ($)" name="MonthlyCharges" value={form.MonthlyCharges} onChange={handleChange}
              type="number" min={0} max={200} step={0.01} />
            <Field label="Total Charges ($)" name="TotalCharges" value={form.TotalCharges} onChange={handleChange}
              type="number" min={0} step={0.01} />
            <Field label="Phone Service" name="PhoneService" value={form.PhoneService} onChange={handleChange} options={yn} />
          </div>
        </div>

        {/* Contract */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: "var(--text)" }}>Contract & Billing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Contract type"
              name="Contract_Two_year"
              value={form.Contract_Two_year === 1 ? 2 : form.Contract_One_year === 1 ? 1 : 0}
              onChange={e => {
                const v = Number(e.target.value);
                setForm(f => ({
                  ...f,
                  Contract_One_year: v === 1 ? 1 : 0,
                  Contract_Two_year: v === 2 ? 1 : 0,
                }));
              }}
              options={[
                { value: 0, label: "Month-to-month" },
                { value: 1, label: "One year" },
                { value: 2, label: "Two year" },
              ]}
            />
            <Field label="Paperless Billing" name="PaperlessBilling" value={form.PaperlessBilling} onChange={handleChange} options={yn} />
            <Field label="Internet Service"
              name="_internet"
              value={form.InternetService_No === 1 ? "no" : form.InternetService_Fiber_optic === 1 ? "fiber" : "dsl"}
              onChange={e => {
                const v = e.target.value;
                setForm(f => ({
                  ...f,
                  InternetService_Fiber_optic: v === "fiber" ? 1 : 0,
                  InternetService_No: v === "no" ? 1 : 0,
                }));
              }}
              options={[
                { value: "dsl", label: "DSL" },
                { value: "fiber", label: "Fiber optic" },
                { value: "no", label: "No internet" },
              ]}
            />
            <Field label="Online Security" name="OnlineSecurity_Yes" value={form.OnlineSecurity_Yes} onChange={handleChange} options={yn} />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "12px", borderRadius: "var(--radius)",
            border: "none", background: "var(--primary)",
            color: "#0D1117", fontSize: 14, fontWeight: 600,
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
          }}
        >
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </div>

      {/* Right — results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{
            ...card, borderColor: "var(--danger)",
            background: "rgba(248,81,73,0.08)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <span style={{ fontSize: 13, color: "var(--danger)" }}>{error}</span>
          </div>
        )}

        {result && (
          <>
            {/* Main verdict */}
            <div style={{
              ...card,
              borderColor: isChurn ? "var(--danger)" : "var(--success)",
              background: isChurn ? "rgba(248,81,73,0.06)" : "rgba(63,185,80,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                {isChurn
                  ? <AlertTriangle size={18} color="var(--danger)" />
                  : <CheckCircle size={18} color="var(--success)" />}
                <span style={{
                  fontSize: 16, fontWeight: 600,
                  color: isChurn ? "var(--danger)" : "var(--success)",
                }}>
                  {isChurn ? "Likely to Churn" : "Will Stay"}
                </span>
                <span style={{
                  marginLeft: "auto", padding: "3px 10px",
                  borderRadius: 12,
                  background: result.risk_level === "high"
                    ? "rgba(248,81,73,0.15)"
                    : result.risk_level === "medium"
                    ? "rgba(210,153,34,0.15)"
                    : "rgba(63,185,80,0.15)",
                  color: result.risk_level === "high"
                    ? "var(--danger)"
                    : result.risk_level === "medium"
                    ? "var(--warning)"
                    : "var(--success)",
                  fontSize: 11, fontWeight: 500, textTransform: "uppercase",
                }}>
                  {result.risk_level} risk
                </span>
              </div>
              <RiskMeter probability={result.churn_probability} />
            </div>

            {/* Model metadata */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--text)" }}>
                Model Details
              </div>
              {[
                ["Model", result.model_used?.replace(/_/g, " ")],
                ["Confidence", result.confidence],
                ["Run ID", result.run_id?.slice(0, 12) + "..."],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}>
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Placeholder if no result yet */}
        {!result && !error && (
          <div style={{
            ...card, textAlign: "center", padding: 40,
            color: "var(--muted)", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
          }}>
            <TrendingUp size={28} color="var(--border)" />
            <div style={{ fontSize: 13 }}>
              Fill in the customer data and click <strong style={{ color: "var(--text)" }}>Run Prediction</strong>
            </div>
            <div style={{ fontSize: 11 }}>Make sure to train models first</div>
          </div>
        )}
      </div>
    </div>
  );
}