import React from "react";

export type DataMode = "loading" | "connecting" | "live" | "demo" | "error" | "degraded";

interface Props {
  mode: DataMode;
  errorMessage?: string;
  onRetry?: () => void;
}

const MODE_CONFIG: Record<DataMode, { label: string; color: string; dotColor: string; description: string }> = {
  loading: { label: "Loading", color: "#8b8fa3", dotColor: "#8b8fa3", description: "Initializing Orbit Sentinel..." },
  connecting: { label: "Connecting", color: "#eab308", dotColor: "#eab308", description: "Engine warming up... (Render cold-start may take ~30s)" },
  live: { label: "Live", color: "#22c55e", dotColor: "#22c55e", description: "Real-time data from Orbit engine" },
  demo: { label: "Demo", color: "#a78bfa", dotColor: "#a78bfa", description: "Representative scenario — engine live via Analyze button" },
  error: { label: "Error", color: "#ef4444", dotColor: "#ef4444", description: "" },
  degraded: { label: "Degraded", color: "#f97316", dotColor: "#f97316", description: "Orbit unavailable — using file analysis fallback" },
};

export default function DataModeBanner({ mode, errorMessage, onRetry }: Props) {
  const cfg = MODE_CONFIG[mode];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "4px 10px 4px 8px", borderRadius: 8, overflow: "hidden",
      background: mode === "live" ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))" :
                 mode === "demo" ? "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(167,139,250,0.02))" :
                 mode === "error" ? "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))" :
                 mode === "connecting" || mode === "degraded" ? "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))" :
                 "var(--overlay-03)",
      border: `1px solid ${mode === "live" ? "rgba(34,197,94,0.2)" : mode === "demo" ? "rgba(167,139,250,0.2)" : mode === "error" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)"}`,
      boxShadow: mode === "live" ? "0 0 12px rgba(34,197,94,0.06)" :
                 mode === "demo" ? "0 0 12px rgba(167,139,250,0.06)" : "none",
      fontSize: 13,
      opacity: mode === "loading" ? 0.5 : 1,
      transition: "all 0.3s ease",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: cfg.dotColor,
        animation: mode === "connecting" || mode === "loading" ? "pulseDot 1.2s ease-in-out infinite" : "none",
        boxShadow: `0 0 8px ${cfg.dotColor}88`,
        flexShrink: 0,
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.6px", fontSize: 12 }}>
            {cfg.label}
          </span>
          <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>·</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
            {mode === "error" && errorMessage ? errorMessage : cfg.description}
          </span>
        </div>
      </div>
      {(mode === "error" || mode === "demo") && onRetry && (
        <button onClick={onRetry}
          style={{
            padding: "3px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${mode === "demo" ? "rgba(167,139,250,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 5,
            background: mode === "demo" ? "rgba(167,139,250,0.12)" : "rgba(239,68,68,0.12)",
            color: mode === "demo" ? "#a78bfa" : "#ef4444",
            letterSpacing: "0.3px", textTransform: "uppercase",
            transition: "all 0.15s",
            flexShrink: 0,
            boxShadow: mode === "demo" ? "0 0 8px rgba(167,139,250,0.15)" : "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = mode === "demo" ? "rgba(167,139,250,0.2)" : "rgba(239,68,68,0.2)"; e.currentTarget.style.boxShadow = mode === "demo" ? "0 0 14px rgba(167,139,250,0.25)" : "none"; }}
          onMouseLeave={e => { e.currentTarget.style.background = mode === "demo" ? "rgba(167,139,250,0.12)" : "rgba(239,68,68,0.12)"; e.currentTarget.style.boxShadow = mode === "demo" ? "0 0 8px rgba(167,139,250,0.15)" : "none"; }}
        >↻ Retry</button>
      )}
    </div>
  );
}
