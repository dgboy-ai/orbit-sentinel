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
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.15s ease both", height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: "rgba(167,139,250,0.12)" }}>🧪</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>What If? Simulation</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Click a bar to simulate mitigation</div>
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>
            {active !== null ? "Simulated Risk" : "Current Risk"}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${riskScoreToGlow(displayedRisk)}` }}>{(displayedRisk * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${curCol}, ${riskScoreToColor(Math.max(displayedRisk - 0.2, 0))})`, width: `${displayedRisk * 100}%`, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 6px ${riskScoreToGlow(displayedRisk)}` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
        {scenarios.map((s, i) => (
          <div key={s.label} onClick={() => applySimulation(i)} style={{
            padding: "8px 10px", borderRadius: 8, cursor: "pointer",
            background: active === i ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
            border: active === i ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.06)",
            animation: `fadeSlideUp 0.4s ${0.3 + i * 0.08}s ease both`,
            transition: "all 0.2s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{(s.riskAfter * 100).toFixed(0)}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: `${simRisk * 100}%`, width: 2, height: "100%", background: "rgba(255,255,255,0.2)", zIndex: 1, transition: "left 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
              <div style={{ height: "100%", borderRadius: 2, background: s.color, width: `${s.riskAfter * 100}%`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${0.15 + i * 0.08}s`, boxShadow: `0 0 4px ${s.color}66` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
