import React from "react";
import type { DecisionCenterData } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

export default function DecisionCenter({ d }: { d: DecisionCenterData }) {
  const { deploymentStrategy, reviewers, requiredTests, rollbackStrategy, riskReduction } = d;
  const curCol = riskScoreToColor(riskReduction.current);
  const aftCol = riskScoreToColor(riskReduction.afterRecommendation);
  const curPct = Math.round(riskReduction.current * 100);
  const aftPct = Math.round(riskReduction.afterRecommendation * 100);
  const delta = curPct - aftPct;

  const verdict = riskReduction.current > 0.5
    ? { icon: "🚫", label: "DO NOT DEPLOY", color: "#ef4444", desc: "Critical blockers detected — deployment not recommended" }
    : riskReduction.current > 0.3
    ? { icon: "⚠️", label: "PROCEED WITH CAUTION", color: "#eab308", desc: "Review flagged items before deploying" }
    : { icon: "✅", label: "SAFE TO DEPLOY", color: "#22c55e", desc: "All checks passed — standard rollout recommended" };

  return (
    <div className="card" style={{
      padding: 20, display: "flex", flexDirection: "column",
      animation: "fadeSlideUp 0.5s 0.1s ease both", height: "100%", overflow: "auto",
      position: "relative", borderColor: "var(--overlay-06)",
      background: "linear-gradient(135deg, rgba(249,115,22,0.04), rgba(15,18,26,0.98))",
    }}>
      <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: `${verdict.color}08`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${verdict.color}20, ${verdict.color}08)`,
            border: `1px solid ${verdict.color}25`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🎯</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" }}>Decision Center</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Engineering recommendation</div>
          </div>
        </div>

        {/* Verdict Hero */}
        <div style={{
          padding: "12px 14px", borderRadius: 10, marginBottom: 10,
          background: `linear-gradient(135deg, ${verdict.color}12, ${verdict.color}04)`,
          border: `1px solid ${verdict.color}25`,
          boxShadow: `0 0 30px ${verdict.color}10, inset 0 0 20px ${verdict.color}06`,
          display: "flex", alignItems: "center", gap: 12,
          animation: verdict.color === "#ef4444" ? "pulseGlow 4s ease-in-out infinite" : undefined,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            background: `${verdict.color}18`, border: `1px solid ${verdict.color}30`,
            boxShadow: `0 0 16px ${verdict.color}20`,
          }}>{verdict.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: verdict.color, textShadow: `0 0 8px ${verdict.color}40`, marginBottom: 1 }}>Recommendation</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: verdict.color, textShadow: `0 0 16px ${verdict.color}30`, letterSpacing: "-0.2px" }}>{verdict.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{verdict.desc}</div>
          </div>
        </div>

        {/* Reason */}
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 8,
          background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(96,165,250,0.02))",
          border: "1px solid rgba(96,165,250,0.12)",
        }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 3 }}>
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", marginRight: 5, verticalAlign: "middle" }} />
            Reason
          </div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.45, fontWeight: 500 }}>{deploymentStrategy}</div>
        </div>

        {/* Actions Required */}
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 8, flex: 1,
          background: "linear-gradient(135deg, var(--overlay-02), rgba(15,18,26,0.8))",
          border: "1px solid var(--overlay-06)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 5 }}>
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--text-secondary)", marginRight: 5, verticalAlign: "middle" }} />
            Actions Required
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {requiredTests.map((t, i) => {
              const isCritical = t.toLowerCase().includes("blocking") || t.toLowerCase().includes("security") || t.toLowerCase().includes("rollback");
              return (
                <div key={t} style={{
                  display: "flex", alignItems: "flex-start", gap: 6,
                  padding: "5px 8px", borderRadius: 5,
                  background: isCritical ? "rgba(239,68,68,0.06)" : "transparent",
                  borderLeft: isCritical ? "2px solid rgba(239,68,68,0.3)" : "2px solid var(--overlay-08)",
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: isCritical ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.12)",
                    color: isCritical ? "#ef4444" : "#60a5fa",
                    border: `1px solid ${isCritical ? "rgba(239,68,68,0.25)" : "rgba(96,165,250,0.2)"}`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.4, fontWeight: 500 }}>{t}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk After Mitigation */}
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginTop: "auto",
          background: `linear-gradient(135deg, ${aftCol}08, rgba(15,18,26,0.8))`,
          border: `1px solid ${aftCol}18`,
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 5 }}>
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--text-secondary)", marginRight: 5, verticalAlign: "middle" }} />
            Expected Risk After Mitigation
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <svg width={44} height={44} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
                <circle cx={22} cy={22} r={18} fill="none" stroke="var(--overlay-04)" strokeWidth={4} />
                <circle cx={22} cy={22} r={18} fill="none" stroke={aftCol} strokeWidth={4}
                  strokeDasharray={113.1} strokeDashoffset={113.1 * (1 - aftPct / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${aftCol}60)` }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: aftCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${aftCol}50` }}>{aftPct}%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 2, background: "var(--overlay-04)", overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: `${Math.min(aftPct, 100)}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${aftCol}, ${aftCol}66)`, transition: "width 1s ease", boxShadow: `0 0 8px ${aftCol}44` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-tertiary)" }}>
                <span>After: <strong style={{ color: aftCol, fontFamily: "'JetBrains Mono', monospace" }}>{aftPct}%</strong></span>
                <span>Current: <strong style={{ color: curCol, fontFamily: "'JetBrains Mono', monospace" }}>{curPct}%</strong></span>
              </div>
              {delta > 0 && (
                <div style={{
                  marginTop: 3, padding: "2px 6px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 3,
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)",
                  fontSize: 11, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace",
                }}>
                  ↓ -{delta}% reduction
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
