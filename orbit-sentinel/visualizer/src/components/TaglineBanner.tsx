import React from "react";

export default function TaglineBanner() {
  return (
    <div className="card" style={{
      padding: "16px 20px", display: "flex", flexDirection: "column",
      justifyContent: "center", maxWidth: 260, flexShrink: 0,
      background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))",
      border: "1px solid rgba(59,130,246,0.2)",
      boxShadow: "0 0 24px rgba(59,130,246,0.08)",
      animation: "fadeSlideDown 0.5s 0.1s ease both",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 6 }}>
        Why This Is Unique
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{ fontSize: 15, color: "var(--text-tertiary)", flexShrink: 0, marginTop: 1 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Traditional AI</div>
            <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>Explains code</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{ fontSize: 15, color: "var(--accent-blue)", flexShrink: 0, marginTop: 1 }}>🛰️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-blue)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Orbit Sentinel</div>
            <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 600 }}>
              Predicts <span style={{ color: "var(--accent-blue)" }}>consequences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
