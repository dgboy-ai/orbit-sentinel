import React from "react";
import type { TimelineItem } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

interface Props { timelines: TimelineItem[]; riskLevel: string; riskScore: number; expanded?: boolean }

export default function SimulationPanel({ timelines, riskScore, expanded }: Props) {
  const p = expanded ? 24 : 20;
  const color = riskScoreToColor(riskScore);

  return (
    <div className="card" style={{ padding: p, animation: "fadeSlideUp 0.4s ease", display: "flex", flexDirection: "column", height: expanded ? "100%" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: "rgba(167,139,250,0.12)" }}>🔄</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Change Simulation</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Impact analysis</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 2, letterSpacing: "0.3px" }}>SIMULATION SCENARIO</div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>What if <span style={{ color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>auth_service.ts</span> is modified?</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["Current System", "→ Proposed Change", "→ Predicted State"].map((label, i) => (
            <div key={label} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", fontSize: 10, color: i === 2 ? color : "var(--text-secondary)", fontWeight: i === 2 ? 600 : 400 }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {timelines.map((item, i) => (
          <div key={item.label} style={{ animation: `fadeSlideUp 0.3s ${0.1 + i * 0.05}s ease both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(item.value, 100)}%`, height: "100%", borderRadius: 3, background: item.color, transition: "width 0.8s ease", transitionDelay: `${i * 0.05}s`, boxShadow: `0 0 4px ${item.color}66` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
