import React from "react";
import type { DecisionCenterData } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

function Row({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginBottom: 3, textTransform: "uppercase" }}>{icon} {label}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

export default function DecisionCenter({ d }: { d: DecisionCenterData }) {
  const { deploymentStrategy, reviewers, requiredTests, rollbackStrategy, riskReduction } = d;
  const curCol = riskScoreToColor(riskReduction.current);
  const aftCol = riskScoreToColor(riskReduction.afterRecommendation);

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.1s ease both", height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: "rgba(249,115,22,0.12)" }}>🎯</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Decision Center</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Recommended actions</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <Row icon="🚀" label="Deployment Strategy" value={deploymentStrategy} color="#60a5fa" />
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginBottom: 5, textTransform: "uppercase" }}>👥 Reviewers</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {reviewers.map(r => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#60a5fa,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{r.name[1].toUpperCase()}</div>
                <span style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>({r.role})</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginBottom: 5, textTransform: "uppercase" }}>🧪 Required Tests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {requiredTests.map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 500, color: "#22c55e", padding: "2px 8px", borderRadius: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>{t}</span>
            ))}
          </div>
        </div>
        <Row icon="🔙" label="Rollback Strategy" value={rollbackStrategy} color="#f97316" />
        <div style={{ padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginTop: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginBottom: 6, textTransform: "uppercase" }}>📉 Risk Reduction</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${riskScoreToGlow(riskReduction.current)}` }}>{(riskReduction.current * 100).toFixed(0)}%</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 1 }}>Current</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: aftCol, fontFamily: "'JetBrains Mono', monospace" }}>{(riskReduction.afterRecommendation * 100).toFixed(0)}%</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 1 }}>After</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "3px 8px", borderRadius: 5, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
              -{((riskReduction.current - riskReduction.afterRecommendation) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
