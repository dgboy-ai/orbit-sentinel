import React from "react";

interface Props {
  message?: string;
  onRetry?: () => void;
  height?: string;
}

export default function InlineError({ message, onRetry, height }: Props) {
  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.pathname; // strip query params too to recover clean slate
    } catch (e) {
      console.warn("Storage flush failed", e);
    }
  };

  return (
    <div className="card" style={{
      padding: "16px 20px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 8,
      minHeight: height ?? 120, textAlign: "center",
      borderColor: "rgba(239,68,68,0.12)",
      background: "rgba(239,68,68,0.03)",
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>⚠️</span>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
        {message || "Failed to load this panel"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {onRetry && (
          <button onClick={onRetry}
            style={{
              padding: "4px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              border: "1px solid rgba(239,68,68,0.25)", borderRadius: 5,
              background: "rgba(239,68,68,0.08)", color: "#ef4444",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >Retry</button>
        )}
        <button onClick={handleClearCache}
          style={{
            padding: "4px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            border: "1px solid var(--overlay-08)", borderRadius: 5,
            background: "var(--overlay-04)", color: "var(--text-secondary)",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-08)"; e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >Clear Cache & Reset</button>
      </div>
    </div>
  );
}
