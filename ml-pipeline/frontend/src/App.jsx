import { useState, useEffect, useCallback } from "react";
import ModelStatus from "./components/ModelStatus";
import PredictForm from "./components/PredictForm";
import MetricsPanel from "./components/MetricsPanel";
import ExperimentsTable from "./components/ExperimentsTable";
import { Activity, Cpu, FlaskConical, BarChart3 } from "lucide-react";

const API = "/api";

const tabs = [
  { id: "predict", label: "Predict", Icon: Activity },
  { id: "experiments", label: "Experiments", Icon: FlaskConical },
  { id: "metrics", label: "Metrics", Icon: BarChart3 },
];

export default function App() {
  const [tab, setTab] = useState("predict");
  const [health, setHealth] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [training, setTraining] = useState(false);
  const [trainMsg, setTrainMsg] = useState("");

  const fetchHealth = useCallback(async () => {
    try {
      const r = await fetch(`${API}/health`);
      setHealth(await r.json());
    } catch {
      setHealth({ status: "error" });
    }
  }, []);

  const fetchExperiments = useCallback(async () => {
    try {
      const r = await fetch(`${API}/experiments`);
      setExperiments(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchExperiments();
    const t = setInterval(() => {
      fetchHealth();
      if (training) checkTrainingStatus();
    }, 5000);
    return () => clearInterval(t);
  }, [training]);

  const checkTrainingStatus = async () => {
    try {
      const r = await fetch(`${API}/train/status`);
      const data = await r.json();
      if (!data.running && training) {
        setTraining(false);
        setTrainMsg("Training complete!");
        fetchHealth();
        fetchExperiments();
        setTimeout(() => setTrainMsg(""), 3000);
      }
    } catch {}
  };

  const startTraining = async () => {
    setTraining(true);
    setTrainMsg("Training 3 models... this may take ~60s");
    try {
      const r = await fetch(`${API}/train`, { method: "POST" });
      const data = await r.json();
      if (data.status !== "started") {
        setTraining(false);
        setTrainMsg(data.detail || "Failed to start");
      }
    } catch (e) {
      setTraining(false);
      setTrainMsg("Connection error");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "var(--card)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--primary-dim)", border: "1px solid var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Cpu size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ML Pipeline</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Churn Prediction</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: tab === id ? "var(--primary-dim)" : "transparent",
                color: tab === id ? "var(--primary)" : "var(--muted)",
                fontSize: 13, fontWeight: 500, marginBottom: 2,
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Train button */}
        <div style={{ padding: "0 12px 8px" }}>
          <button
            onClick={startTraining}
            disabled={training}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid var(--primary)",
              background: training ? "transparent" : "var(--primary-dim)",
              color: training ? "var(--muted)" : "var(--primary)",
              fontSize: 13, fontWeight: 500,
              opacity: training ? 0.6 : 1,
              transition: "all 0.15s",
            }}
          >
            {training ? "⏳ Training..." : "▶ Train Models"}
          </button>
          {trainMsg && (
            <div style={{
              marginTop: 8, fontSize: 11, color: training ? "var(--warning)" : "var(--success)",
              textAlign: "center", lineHeight: 1.4,
            }}>
              {trainMsg}
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Top bar */}
        <header style={{
          padding: "16px 28px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--card)", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
              {tabs.find(t => t.id === tab)?.label}
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
              Telco Customer Churn · MLflow Tracked · FastAPI Served
            </p>
          </div>
          <ModelStatus health={health} />
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {tab === "predict" && <PredictForm api={API} />}
          {tab === "experiments" && <ExperimentsTable experiments={experiments} onRefresh={fetchExperiments} />}
          {tab === "metrics" && <MetricsPanel experiments={experiments} />}
        </div>
      </main>
    </div>
  );
}