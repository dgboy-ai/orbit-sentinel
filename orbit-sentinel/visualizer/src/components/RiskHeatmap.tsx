import React from "react";
import type { RiskBreakdown } from "../types";
import { riskScoreToColor, riskScoreToGlow, riskScoreToGradient } from "../utils/colors";

interface Props {
  riskData: { score: number; level: string; breakdown: RiskBreakdown[] };
  expanded?: boolean;
}

export default function RiskHeatmap({ riskData, expanded }: Props) {
  const color = riskScoreToColor(riskData.score);
  const glow = riskScoreToGlow(riskData.score);
  const grad = riskScoreToGradient(riskData.score);
  const p = expanded ? 24 : 20;

  return (
    <div className="card" style={{ padding: p, height: expanded ? "100%" : undefined, animation: "fadeSlideUp 0.4s ease", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: `${color}18` }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Risk Assessment</div>
        </div>
        <div style={{ padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", background: `${color}18`, color, border: `1px solid ${color}25` }}>
          {riskData.level.toUpperCase()}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
          <span style={{ fontWeight: 500 }}>Risk Score</span>
          <span style={{ fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${glow}` }}>{(riskData.score * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ width: `${riskData.score * 100}%`, height: "100%", borderRadius: 4, background: grad, transition: "width 0.8s ease", boxShadow: `0 0 8px ${glow}` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {riskData.breakdown.map((item) => {
          const c = riskScoreToColor(item.value / item.maxValue);
          return (
            <div key={item.category}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
                <span>{item.category}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}/{item.maxValue}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${(item.value / item.maxValue) * 100}%`, height: "100%", borderRadius: 2, background: c, transition: "width 0.6s ease", boxShadow: `0 0 4px ${riskScoreToGlow(item.value / item.maxValue)}` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
