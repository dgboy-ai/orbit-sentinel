import React, { useState } from "react";
import type { CounterfactualScenario } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

const SIM_RESULTS: Record<string, { outcome: string; detail: string }> = {
  "Add File Changes": { outcome: "Risk drops to moderate — still needs pipeline & reviewers", detail: "Adding changes removes the empty-diff blocker but CI and review gaps remain." },
  "Trigger Pipeline": { outcome: "Risk drops to moderate — CI validation provides safety", detail: "Pipeline run validates the diff but empty-diff still blocks deployment." },
  "Assign Reviewers": { outcome: "Risk drops to moderate — human oversight reduces abandonment", detail: "Review assignment forces completion but code still has no pipeline coverage." },
  "All Mitigations": { outcome: "Risk near-eliminated — ready for safe deployment", detail: "Full remediation: changes + CI + review. Standard safe-merge protocol." },
};

export default function CounterfactualSimulation({
  scenarios, currentRisk, onViewDetail,
}: {
  scenarios: CounterfactualScenario[];
  currentRisk: number;
  onViewDetail?: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [simRisk, setSimRisk] = useState(currentRisk);
  const displayedRisk = active !== null ? scenarios[active].riskAfter : simRisk;
  const curCol = riskScoreToColor(displayedRisk);
  const activeScenario = active !== null ? scenarios[active] : null;
  const simResult = activeScenario ? SIM_RESULTS[activeScenario.label] : null;

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
    <div className="card" style={{
      padding: "16px 20px",
      animation: "fadeSlideUp 0.5s 0.15s ease both",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(167,139,250,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>🧪</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            What-If Simulation
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>
            {active !== null
              ? `Simulating: ${scenarios[active].label}`
              : "Click a scenario to simulate the outcome"}
          </div>
          {onViewDetail && (
            <button onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
              style={{
                marginTop: 6, padding: "2px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer",
                border: "1px solid rgba(167,139,250,0.25)", borderRadius: 5,
                background: "rgba(167,139,250,0.08)", color: "#a78bfa",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.15)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.08)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"; }}
            >
              Open in Forecast Engine →
            </button>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.3px", marginBottom: 1 }}>
            Risk Level
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: curCol,
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: `0 0 16px ${riskScoreToGlow(displayedRisk)}`,
            lineHeight: 1.2, transition: "color 0.3s ease",
          }}>
            {(displayedRisk * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Result description */}
      {simResult && (
        <div style={{
          padding: "10px 12px", marginBottom: 12, borderRadius: 8,
          background: "rgba(167,139,250,0.06)",
          border: "1px solid rgba(167,139,250,0.15)",
          animation: "fadeSlideUp 0.25s ease",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 2 }}>
            {simResult.outcome}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
            {simResult.detail}
          </div>
        </div>
      )}

      {/* Scenario grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: 8 }}>
        {scenarios.map((s, i) => {
          const isActive = active === i;
          const barPct = s.riskAfter * 100;
  if (!scenarios.length) {
    return (
      <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>🧪 No scenarios available</div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>What-if simulation requires counterfactual data</div>
        </div>
      </div>
    );
  }

  return (
            <div key={s.label} onClick={() => applySimulation(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); applySimulation(i); } }}
              role="button" tabIndex={0}
              style={{
                padding: "10px 12px", borderRadius: 7, cursor: "pointer",
                background: isActive ? `${s.color}18` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? s.color + "55" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                position: "relative", overflow: "hidden",
                userSelect: "none",
                boxShadow: isActive ? `0 0 0 1px ${s.color}22, 0 4px 16px ${s.color}11` : "none",
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
              <div style={{
                fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)",
                letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 3,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{s.label}</div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: s.color,
                fontFamily: "'JetBrains Mono', monospace", marginBottom: 8,
              }}>{barPct.toFixed(0)}%</div>
              <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${barPct}%`,
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}66)`,
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isActive ? `0 0 8px ${s.color}44` : "none",
                }} />
              </div>
              {isActive && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 7,
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
