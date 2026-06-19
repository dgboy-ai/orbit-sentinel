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
  demo: { label: "Demo", color: "#60a5fa", dotColor: "#60a5fa", description: "Representative scenario — engine live via Analyze button" },
  error: { label: "Error", color: "#ef4444", dotColor: "#ef4444", description: "" },
  degraded: { label: "Degraded", color: "#f97316", dotColor: "#f97316", description: "Orbit unavailable — using file analysis fallback" },
};

export default function DataModeBanner({ mode, errorMessage, onRetry }: Props) {
  const cfg = MODE_CONFIG[mode];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 10px", borderRadius: 6, overflow: "hidden",
      background: mode === "live" ? "rgba(34,197,94,0.06)" :
                 mode === "demo" ? "rgba(96,165,250,0.06)" :
                 mode === "error" ? "rgba(239,68,68,0.06)" :
                 mode === "connecting" || mode === "degraded" ? "rgba(234,179,8,0.06)" :
                 "rgba(255,255,255,0.03)",
      border: `1px solid ${cfg.color}18`,
      fontSize: 9,
      opacity: mode === "loading" ? 0.5 : 1,
      transition: "all 0.3s ease",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.dotColor,
        animation: mode === "connecting" || mode === "loading" ? "pulseDot 1.2s ease-in-out infinite" : "none",
        boxShadow: `0 0 6px ${cfg.dotColor}66`,
        flexShrink: 0,
      }} />
      <span style={{ fontWeight: 600, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {cfg.label}
      </span>
      <span style={{ color: "var(--text-tertiary)" }}>·</span>
      <span style={{ color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
        {mode === "error" && errorMessage ? errorMessage : cfg.description}
      </span>
      {(mode === "error" || mode === "demo") && onRetry && (
        <button onClick={onRetry}
          style={{
            padding: "2px 10px", fontSize: 9, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${cfg.color}33`, borderRadius: 4,
            background: `${cfg.color}11`, color: cfg.color,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${cfg.color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}11`; }}
        >Retry</button>
      )}
    </div>
  );
}
