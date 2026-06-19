import { RefreshCw, Trophy } from "lucide-react";

function MetricBadge({ value, best }) {
  const pct = (value * 100).toFixed(1);
  const isBest = Math.abs(value - best) < 0.0001;
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 12,
      color: isBest ? "var(--success)" : "var(--text)",
    }}>
      {pct}%{isBest && " ✦"}
    </span>
  );
}

export default function ExperimentsTable({ experiments, onRefresh }) {
  if (!experiments.length) return (
    <div style={{
      textAlign: "center", padding: 60, color: "var(--muted)", fontSize: 13,
    }}>
      No experiments yet. Click <strong style={{ color: "var(--text)" }}>Train Models</strong> in the sidebar.
    </div>
  );

  const metrics = ["accuracy", "precision", "recall", "f1_score", "roc_auc"];
  const bests = Object.fromEntries(
    metrics.map(m => [m, Math.max(...experiments.map(e => e[m] || 0))])
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Experiment Runs</h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{experiments.length} runs tracked via MLflow</p>
        </div>
        <button onClick={onRefresh} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8,
          border: "1px solid var(--border)", background: "transparent",
          color: "var(--muted)", fontSize: 12,
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#", "Model", "Accuracy", "Precision", "Recall", "F1", "AUC", "Status"].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontSize: 11, color: "var(--muted)", fontWeight: 500,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {experiments.map((run, i) => (
              <tr key={run.run_id} style={{
                borderBottom: "1px solid var(--border)",
                background: i === 0 ? "rgba(88,166,255,0.04)" : "transparent",
              }}>
                <td style={{ padding: "12px 14px" }}>
                  {i === 0 ? <Trophy size={13} color="var(--warning)" /> : <span style={{ color: "var(--muted)", fontSize: 12 }}>{i + 1}</span>}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {run.model_name?.replace(/_/g, " ")}
                  </span>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 2 }}>
                    {run.run_id?.slice(0, 10)}…
                  </div>
                </td>
                {["accuracy", "precision", "recall", "f1_score", "roc_auc"].map(m => (
                  <td key={m} style={{ padding: "12px 14px" }}>
                    <MetricBadge value={run[m]} best={bests[m]} />
                  </td>
                ))}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 12,
                    background: "rgba(63,185,80,0.12)", color: "var(--success)",
                    fontWeight: 500,
                  }}>
                    {run.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}