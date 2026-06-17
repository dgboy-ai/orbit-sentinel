import React from "react";
import type { DecisionCenterData } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

export default function DecisionCenter({ d }: { d: DecisionCenterData }) {
  const { deploymentStrategy, reviewers, requiredTests, rollbackStrategy, riskReduction } = d;
  const curCol = riskScoreToColor(riskReduction.current);
  const aftCol = riskScoreToColor(riskReduction.afterRecommendation);
  const verdict = riskReduction.current > 0.5 ? { icon: "🚫", label: "DO NOT DEPLOY", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" } : riskReduction.current > 0.3 ? { icon: "⚠️", label: "PROCEED WITH CAUTION", color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.15)" } : { icon: "✅", label: "SAFE TO DEPLOY", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" };

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.1s ease both", height: "100%", overflow: "auto", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, borderRadius: "50%", background: "rgba(249,115,22,0.05)", filter: "blur(60px)", pointerEvents: "none", transform: "translate(-20%, -20%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="card-header-icon" style={{ background: "rgba(249,115,22,0.12)" }}>🎯</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Decision Center</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Engineering recommendation</div>
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8,
        background: verdict.bg, border: `1px solid ${verdict.border}`, marginBottom: 10,
        animation: verdict.color === "#ef4444" ? "pulseGlow 2s ease-in-out infinite" : undefined,
        boxShadow: verdict.color === "#ef4444" ? "0 0 24px rgba(239,68,68,0.15)" : "none",
      }}>
        <span style={{ fontSize: 18 }}>{verdict.icon}</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: verdict.color }}>Recommendation</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: verdict.color }}>{verdict.label}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px", marginBottom: 3, textTransform: "uppercase" }}>Reason</div>
          <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{deploymentStrategy}</div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px", marginBottom: 4, textTransform: "uppercase" }}>Actions Required</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {requiredTests.map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-primary)" }}>
                <span style={{ fontSize: 9, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{i + 1}.</span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginTop: "auto" }}>
          <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px", marginBottom: 4, textTransform: "uppercase" }}>Expected Risk After Mitigation</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: aftCol, fontFamily: "'JetBrains Mono', monospace" }}>{(riskReduction.afterRecommendation * 100).toFixed(0)}%</div>
            <div style={{ padding: "2px 8px", borderRadius: 5, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
              -{((riskReduction.current - riskReduction.afterRecommendation) * 100).toFixed(0)}% from current
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
