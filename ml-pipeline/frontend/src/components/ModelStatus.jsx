export default function ModelStatus({ health }) {
  if (!health) return null;

  const ok = health.status === "ok" && health.model_ready;
  const dot = ok ? "var(--success)" : "var(--warning)";
  const label = ok ? `${health.model_name} · F1 ${health.best_f1?.toFixed(3)}` : "No model";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 12px", borderRadius: 20,
      border: "1px solid var(--border)", background: "var(--card2)",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: dot, display: "block",
        boxShadow: ok ? `0 0 6px ${dot}` : "none",
      }} />
      <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>
        {label}
      </span>
    </div>
  );
}