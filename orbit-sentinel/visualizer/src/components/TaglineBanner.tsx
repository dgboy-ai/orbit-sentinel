import React from "react";

export default function TaglineBanner() {
  return (
    <div className="card" style={{
      padding: "16px 18px", display: "flex", flexDirection: "column",
      justifyContent: "center", maxWidth: 260, flexShrink: 0, position: "relative", overflow: "hidden",
      background: "linear-gradient(145deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06), rgba(15,18,26,0.95))",
      border: "1px solid rgba(59,130,246,0.2)",
      boxShadow: "0 0 30px rgba(59,130,246,0.06), inset 0 0 40px rgba(59,130,246,0.02)",
      animation: "fadeSlideDown 0.5s 0.1s ease both",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(30px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 15 }}>🏆</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--accent-blue)" }}>
            Why This Is Unique
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 6,
            background: "rgba(255,255,255,0.01)", border: "1px solid var(--overlay-05)",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" }}>Code AI</div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 1 }}>Explains code in context</div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))",
            border: "1px solid rgba(59,130,246,0.15)",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🛰️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.2px" }}>Orbit Sentinel</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>
                Predicts <strong style={{ color: "var(--accent-blue)" }}>failure consequences</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
