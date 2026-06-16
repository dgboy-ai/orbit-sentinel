import React, { useState } from "react";
import type { CounterfactualScenario } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

export default function CounterfactualSimulation({ scenarios, currentRisk }: { scenarios: CounterfactualScenario[]; currentRisk: number }) {
  const [active, setActive] = useState<number | null>(null);
  const [simRisk, setSimRisk] = useState(currentRisk);
  const displayedRisk = active !== null ? scenarios[active].riskAfter : simRisk;
  const curCol = riskScoreToColor(displayedRisk);

  function applySimulation(idx: number) {
    if (active === idx) {
      setActive(null);
      setSimRisk(currentRisk);
      return;
    }
    setActive(idx);
    const target = scenarios[idx].riskAfter;
    const start = simRisk;
    const dur = 800;
    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setSimRisk(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return (
    <div className="card" style={{ padding: "14px 18px", animation: "fadeSlideUp 0.5s 0.15s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🧪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>What-If Simulation</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Click any scenario to simulate</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.3px" }}>Risk Level</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${riskScoreToGlow(displayedRisk)}`, lineHeight: 1.2, transition: "color 0.3s ease" }}>
            {(displayedRisk * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: 6 }}>
        {scenarios.map((s, i) => {
          const isActive = active === i;
          const barPct = s.riskAfter * 100;
          return (
            <div key={s.label} onClick={() => applySimulation(i)}
              style={{
                padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                background: isActive ? `${s.color}15` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? s.color + "44" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                position: "relative", overflow: "hidden",
                userSelect: "none",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = `${s.color}08`;
                  e.currentTarget.style.borderColor = `${s.color}33`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 12px ${s.color}15`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = isActive ? "none" : "translateY(-2px)"; }}
            >
              <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>{barPct.toFixed(0)}%</div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${barPct}%`,
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}66)`,
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isActive ? `0 0 8px ${s.color}44` : "none",
                }} />
              </div>
              {isActive && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 6,
                  background: `linear-gradient(135deg, ${s.color}15, transparent 60%)`,
                  pointerEvents: "none",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
