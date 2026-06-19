import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#58A6FF", "#3FB950", "#D29922", "#F85149"];

export default function MetricsPanel({ experiments }) {
  if (!experiments.length) return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--muted)", fontSize: 13 }}>
      Train models first to see metrics comparison.
    </div>
  );

  const barData = experiments.map(run => ({
    name: run.model_name?.replace(/_/g, " ").replace("gradient boosting", "GBM").replace("random forest", "RF").replace("logistic regression", "LR"),
    Accuracy: +(run.accuracy * 100).toFixed(1),
    F1: +(run.f1_score * 100).toFixed(1),
    "ROC-AUC": +(run.roc_auc * 100).toFixed(1),
    Precision: +(run.precision * 100).toFixed(1),
    Recall: +(run.recall * 100).toFixed(1),
  }));

  const radarData = ["accuracy", "precision", "recall", "f1_score", "roc_auc"].map(k => ({
    metric: k.replace("_", " ").replace("roc auc", "ROC-AUC").toUpperCase(),
    ...Object.fromEntries(experiments.map(r => [r.model_name?.replace(/_/g, " "), +(r[k] * 100).toFixed(1)])),
  }));

  const tooltipStyle = {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 12, color: "var(--text)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Bar chart */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 20,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Metric Comparison</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis domain={[50, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} unit="%" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(88,166,255,0.05)" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
            {["Accuracy", "F1", "ROC-AUC"].map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 20,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Radar — All Metrics</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--muted)", fontSize: 10 }} />
            {experiments.map((run, i) => (
              <Radar
                key={run.run_id}
                name={run.model_name?.replace(/_/g, " ")}
                dataKey={run.model_name?.replace(/_/g, " ")}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={0.12}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat cards */}
      {experiments.slice(0, 1).map(best => (
        <div key={best.run_id} style={{
          gridColumn: "1 / -1",
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12,
        }}>
          {[
            ["Accuracy", best.accuracy],
            ["Precision", best.precision],
            ["Recall", best.recall],
            ["F1 Score", best.f1_score],
            ["ROC-AUC", best.roc_auc],
          ].map(([label, val]) => (
            <div key={label} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)", color: "var(--primary)" }}>
                {(val * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}