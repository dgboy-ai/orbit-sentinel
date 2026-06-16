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
    <div className="card" style={{ padding: "10px 14px", animation: "fadeSlideUp 0.5s 0.15s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🧪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>What-If Simulation</div>
          <div style={{ fontSize: 9, color: "var(--text-secondary)" }}>Click to simulate mitigation</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.3px" }}>Risk</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${riskScoreToGlow(displayedRisk)}`, lineHeight: 1.2 }}>
            {(displayedRisk * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: 4 }}>
        {scenarios.map((s, i) => {
          const isActive = active === i;
          const barPct = s.riskAfter * 100;
          return (
            <div key={s.label} onClick={() => applySimulation(i)}
              style={{
                padding: "5px 6px", borderRadius: 5, cursor: "pointer",
                background: isActive ? `${s.color}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? s.color + "33" : "rgba(255,255,255,0.04)"}`,
                transition: "all 0.2s ease",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; } }}
            >
              <div style={{ fontSize: 7, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>{barPct.toFixed(0)}%</div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${barPct}%`,
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}66)`,
                  transition: "width 0.6s ease",
                  boxShadow: isActive ? `0 0 6px ${s.color}44` : "none",
                }} />
              </div>
              {isActive && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 5,
                  background: `linear-gradient(135deg, ${s.color}11, transparent 50%)`,
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
