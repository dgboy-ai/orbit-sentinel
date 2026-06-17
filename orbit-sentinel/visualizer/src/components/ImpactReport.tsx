import React, { useState, useEffect, useRef } from "react";
import type { VisualizationData } from "../types";
import {
  riskScoreToColor, riskScoreToGlow, riskScoreToGradient, riskScoreToKey, RISK,
} from "../utils/colors";

interface Props { data: VisualizationData }

function scoreFromSummary(riskScore: string): number {
  return Number(riskScore.replace("%", "")) / 100;
}

function AnimatedCounter({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const dur = 1200;
    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(value * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span ref={ref}>
      {suffix === "%"
        ? (displayed * 100).toFixed(0)
        : displayed.toFixed(0)}{suffix}
    </span>
  );
}

function RiskGauge({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = score * circ;
  const col = riskScoreToColor(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={5}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${col}88)`, transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

type SectionKey = "exec" | "breakdown" | "timeline" | "evidence" | "incidents" | "decision" | "counterfactuals" | "info";

export default function ImpactReport({ data }: Props) {
  const { summary, hero, evidence, decisionCenter, incidents, counterfactuals, riskData, futureTimeline } = data;
  const score = scoreFromSummary(summary.riskScore);
  const rk = riskScoreToKey(score);
  const col = RISK[rk].hex;
  const glow = RISK[rk].glow;
  const grad = RISK[rk].gradient;
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  const sections: { key: SectionKey; label: string; icon: string }[] = [
    { key: "exec", label: "Executive Summary", icon: "📋" },
    { key: "breakdown", label: "Risk Breakdown", icon: "📊" },
    { key: "timeline", label: "Predicted Timeline", icon: "📅" },
    { key: "evidence", label: "Orbit Evidence Chain", icon: "🔗" },
    { key: "incidents", label: "Historical Incidents", icon: "⚠️" },
    { key: "decision", label: "Decision Center", icon: "🎯" },
    { key: "counterfactuals", label: "Remediation Impact", icon: "🔧" },
    { key: "info", label: "Report Metadata", icon: "ℹ️" },
  ];

  return (
    <div style={{
      maxWidth: 820, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 12,
      animation: "fadeSlideUp 0.3s ease",
    }}>
      {/* ── Hero Banner ── */}
      <div className="card" style={{
        padding: 0, overflow: "hidden",
        animation: "fadeSlideDown 0.4s ease",
        border: `1px solid ${col}33`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${col}15, transparent 60%)`,
          padding: "24px 28px", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -60, right: 40, width: 200, height: 200,
            borderRadius: "50%", background: `${col}08`, filter: "blur(60px)",
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
            <div style={{ flexShrink: 0 }}>
              <RiskGauge score={score} size={88} />
              <div style={{
                textAlign: "center", marginTop: -56, position: "relative", pointerEvents: "none",
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: col,
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                  textShadow: `0 0 12px ${glow}`,
                }}>
                  <AnimatedCounter value={score} />
                </div>
                <div style={{
                  fontSize: 7, fontWeight: 700, color: col, letterSpacing: "1px", marginTop: 2,
                  textTransform: "uppercase", opacity: 0.8,
                }}>{summary.riskLevel}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${col}20`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, boxShadow: `0 0 0 1px ${col}22`,
                }}>🛰️</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                    Impact Report — MR !{summary.mrIid}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>
                    {summary.project} · {summary.branch}
                  </div>
                </div>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 10px", borderRadius: 6,
                background: `${col}15`, border: `1px solid ${col}25`,
                fontSize: 10, color: col, fontWeight: 600,
              }}>
                <span style={{ fontSize: 12 }}>🔮</span>
                Predicted: {hero.predictedOutcome.split("—")[0]?.trim() || hero.predictedOutcome}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
          borderTop: `1px solid ${col}15`,
        }}>
          {[
            { label: "Nodes", value: summary.totalNodes, suffix: "", color: "#60a5fa", icon: "🔷" },
            { label: "Edges", value: summary.totalEdges, suffix: "", color: "#a78bfa", icon: "🔗" },
            { label: "Incidents", value: incidents.length, suffix: "", color: "#fb923c", icon: "⚠️" },
            { label: "Risk Reduction", value: (1 - decisionCenter.riskReduction.afterRecommendation / decisionCenter.riskReduction.current), suffix: "%", color: "#22c55e", icon: "📉" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: "12px 16px", textAlign: "center",
              borderRight: i < 3 ? `1px solid var(--border)` : "none",
            }}>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{
                fontSize: 20, fontWeight: 800, color: stat.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {stat.suffix === "%"
                  ? <AnimatedCounter value={stat.value} />
                  : <AnimatedCounter value={stat.value} suffix="" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section Navigator ── */}
      <div className="card" style={{
        padding: "10px 16px", display: "flex", gap: 4, flexWrap: "wrap",
        animation: "fadeSlideUp 0.4s 0.05s ease both",
      }}>
        {sections.map(s => (
          <button key={s.key} onClick={() => {
            const el = document.getElementById(`section-${s.key}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
            style={{
              padding: "4px 10px", fontSize: 10, fontWeight: 500, cursor: "pointer",
              border: expandedSection === s.key ? `1px solid ${col}33` : "1px solid transparent",
              borderRadius: 5, background: expandedSection === s.key ? `${col}12` : "transparent",
              color: expandedSection === s.key ? col : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${col}08`; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = expandedSection === s.key ? `${col}12` : "transparent"; e.currentTarget.style.color = expandedSection === s.key ? col : "var(--text-secondary)"; }}
          >{s.icon} {s.label}</button>
        ))}
      </div>

      {/* ── Executive Summary ── */}
      <SectionCard id="section-exec" icon="📋" title="Executive Summary" col={col} delay={0.1}>
        <div style={{
          padding: "16px 20px", borderRadius: 10,
          background: `linear-gradient(135deg, ${col}08, transparent)`,
          border: `1px solid ${col}18`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: grad, borderRadius: "0 3px 3px 0",
          }} />
          <div style={{ fontSize: 20, color: col, marginBottom: 8, lineHeight: 1, opacity: 0.5 }}>"</div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, fontStyle: "italic" }}>
            {hero.predictedOutcome}
          </div>
          <div style={{ fontSize: 20, color: col, marginTop: 4, lineHeight: 1, textAlign: "right", opacity: 0.5 }}>"</div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hero.confidenceFactors.map(f => {
            const dotColor = f.status === "success" ? "#22c55e" : f.status === "warning" ? "#eab308" : "#ef4444";
            return (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 6,
                background: `${dotColor}10`, border: `1px solid ${dotColor}20`,
                fontSize: 10, color: "var(--text-secondary)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: `0 0 6px ${dotColor}66`, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.label}:</span> {f.value}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Risk Breakdown ── */}
      <SectionCard id="section-breakdown" icon="📊" title="Risk Breakdown" col={col} delay={0.15}>
        {riskData.breakdown.map((b, i) => {
          const pct = (b.value / b.maxValue) * 100;
          const barColor = pct > 75 ? "#ef4444" : pct > 50 ? "#f97316" : pct > 25 ? "#eab308" : "#22c55e";
          return (
            <div key={b.category} style={{ marginBottom: 10, animation: `fadeSlideUp 0.3s ${0.15 + i * 0.05}s ease both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>{b.category}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {b.value}/{b.maxValue}
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`,
                  transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: `0 0 8px ${barColor}44`,
                }} />
              </div>
            </div>
          );
        })}
      </SectionCard>

      {/* ── Predicted Timeline ── */}
      <SectionCard id="section-timeline" icon="📅" title="Predicted Timeline" col={col} delay={0.2}>
        <div style={{ position: "relative", paddingLeft: 28 }}>
          {/* vertical line */}
          <div style={{
            position: "absolute", left: 10, top: 4, bottom: 4, width: 2,
            background: `linear-gradient(180deg, ${col}44, ${col}11)`,
            borderRadius: 1,
          }} />
          {futureTimeline.map((evt, i) => (
            <div key={evt.day} style={{
              position: "relative", paddingBottom: i < futureTimeline.length - 1 ? 14 : 0,
              animation: `fadeSlideUp 0.3s ${0.2 + i * 0.08}s ease both`,
            }}>
              <div style={{
                position: "absolute", left: -22, top: 2,
                width: 14, height: 14, borderRadius: "50%",
                background: `${col}20`, border: `2px solid ${col}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 6,
                boxShadow: `0 0 0 4px ${col}08`,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: col }} />
              </div>
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14 }}>{evt.icon}</span>
                  <div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: col,
                      letterSpacing: "0.5px", textTransform: "uppercase",
                      marginRight: 8,
                    }}>D+{evt.day}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{evt.label}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4, marginLeft: 22 }}>
                  {evt.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Orbit Evidence Chain ── */}
      <SectionCard id="section-evidence" icon="🔗" title="Orbit Evidence Chain" col={col} delay={0.25}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {evidence.map((e, i) => (
            <div key={e.queryType} style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
              animation: `fadeSlideUp 0.3s ${0.25 + i * 0.05}s ease both`,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: `${col}15`, color: col, letterSpacing: "0.5px",
                  textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
                }}>{e.queryType}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{e.queryName}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {e.result.split("\n").slice(0, 2).join("\n")}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Historical Incidents ── */}
      <SectionCard id="section-incidents" icon="⚠️" title="Historical Incidents" col={col} delay={0.3}>
        {incidents.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)", fontSize: 12 }}>
            No similar historical incidents found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {incidents.map((inc, i) => {
              const simColor = inc.similarity > 80 ? "#ef4444" : inc.similarity > 50 ? "#f97316" : "#eab308";
              const simLabel = inc.similarity > 80 ? "HIGH" : inc.similarity > 50 ? "MED" : "LOW";
              return (
                <div key={`${inc.mrIid}-${i}`} style={{
                  padding: "12px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                  display: "flex", gap: 12,
                  animation: `fadeSlideUp 0.3s ${0.3 + i * 0.06}s ease both`,
                }}>
                  <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                        !{inc.mrIid} {inc.title}
                      </span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: "1px 7px", borderRadius: 4,
                        background: `${simColor}18`, color: simColor,
                        border: `1px solid ${simColor}33`,
                        letterSpacing: "0.5px",
                      }}>{simLabel}</span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: "1px 7px", borderRadius: 4,
                        background: inc.outcome === "Merged" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                        color: inc.outcome === "Merged" ? "#22c55e" : "#ef4444",
                        border: `1px solid ${inc.outcome === "Merged" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        letterSpacing: "0.5px",
                      }}>{inc.outcome.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Root cause:</strong> {inc.rootCause}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Mitigation:</strong> {inc.mitigation}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.3px" }}>Similarity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: simColor, fontFamily: "'JetBrains Mono', monospace" }}>
                      {inc.similarity}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Decision Center ── */}
      <SectionCard id="section-decision" icon="🎯" title="Decision Center" col={col} delay={0.35}>
        {/* Recommendation banner */}
        <div style={{
          padding: "12px 16px", borderRadius: 8, marginBottom: 12,
          background: `linear-gradient(135deg, ${col}12, ${col}05)`,
          border: `1px solid ${col}25`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `${col}20`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>🚫</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 1 }}>
              DO NOT DEPLOY
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {decisionCenter.deploymentStrategy}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Reviewers */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 6 }}>
              👤 Reviewers
            </div>
            {decisionCenter.reviewers.map(r => (
              <div key={r.name} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 0", fontSize: 11,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: r.role.includes("Needed") ? "#eab308" : "#22c55e",
                  flexShrink: 0,
                }} />
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.name}</span>
                <span style={{ color: "var(--text-tertiary)", marginLeft: "auto", fontSize: 9 }}>
                  {r.role}
                </span>
              </div>
            ))}
          </div>

          {/* Required Tests */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 6 }}>
              ✅ Required Tests
            </div>
            {decisionCenter.requiredTests.map((t, i) => (
              <div key={t} style={{
                display: "flex", alignItems: "flex-start", gap: 6,
                padding: "3px 0", fontSize: 10, color: "var(--text-secondary)",
                lineHeight: 1.4,
              }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: col,
                  fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: 2,
                }}>{i + 1}.</span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>
              🔄 Rollback Strategy
            </div>
            <div style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1.5 }}>
              {decisionCenter.rollbackStrategy}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Remediation Impact (Counterfactuals) ── */}
      <SectionCard id="section-counterfactuals" icon="🔧" title="Remediation Impact" col={col} delay={0.4}>
        <div style={{ marginBottom: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Current Risk</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                height: 8, width: 120, borderRadius: 4,
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${decisionCenter.riskReduction.current * 100}%`,
                  background: grad,
                  boxShadow: `0 0 8px ${glow}`,
                }} />
              </div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: col,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {(decisionCenter.riskReduction.current * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)",
            marginTop: 6,
          }}>
            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>After Full Remediation</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                height: 8, width: 120, borderRadius: 4,
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${decisionCenter.riskReduction.afterRecommendation * 100}%`,
                  background: "linear-gradient(90deg, #22c55e, #4ade80)",
                  boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                }} />
              </div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: "#22c55e",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {(decisionCenter.riskReduction.afterRecommendation * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div style={{
            textAlign: "center", marginTop: 8,
            fontSize: 10, color: "var(--text-tertiary)",
          }}>
            Risk reduction: <strong style={{ color: "#22c55e" }}>
              {((1 - decisionCenter.riskReduction.afterRecommendation / decisionCenter.riskReduction.current) * 100).toFixed(0)}%
            </strong> improvement
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {counterfactuals.map((c, i) => {
            const currentPct = c.riskAfter * 100;
            return (
              <div key={c.label} style={{
                padding: "10px 12px", borderRadius: 8,
                background: `${c.color}10`, border: `1px solid ${c.color}25`,
                animation: `fadeSlideUp 0.3s ${0.4 + i * 0.05}s ease both`,
              }}>
                <div style={{
                  fontSize: 8, fontWeight: 600, color: "var(--text-tertiary)",
                  letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 3,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{c.label}</div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: c.color,
                  fontFamily: "'JetBrains Mono', monospace", marginBottom: 6,
                }}>{currentPct.toFixed(0)}%</div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${currentPct}%`,
                    background: `linear-gradient(90deg, ${c.color}, ${c.color}66)`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Report Metadata ── */}
      <SectionCard id="section-info" icon="ℹ️" title="Report Metadata" col={col} delay={0.45}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
        }}>
          {[
            { label: "Generated", value: new Date(summary.timestamp).toLocaleString() },
            { label: "Confidence", value: hero.confidence },
            { label: "Risk Score", value: summary.riskScore },
            { label: "Risk Level", value: summary.riskLevel },
            { label: "Project", value: summary.project },
            { label: "Branch", value: summary.branch },
            { label: "Digital Twin", value: `${summary.totalNodes} nodes, ${summary.totalEdges} edges` },
            { label: "Method", value: hero.generatedUsing },
          ].map((item, i) => (
            <div key={item.label} style={{
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Footer ── */}
      <div style={{
        textAlign: "center", padding: "20px 0 10px",
        color: "var(--text-tertiary)", fontSize: 12, fontWeight: 500, letterSpacing: "0.3px",
        animation: "fadeSlideUp 0.4s 0.5s ease both",
        opacity: 0.6,
      }}>
        Predicted before merge. Prevented before production.
      </div>
    </div>
  );
}

/* ── Section Card Wrapper ── */
function SectionCard({
  id, icon, title, col, delay, children,
}: {
  id: string;
  icon: string;
  title: string;
  col: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="card" style={{
      padding: "18px 22px",
      animation: `fadeSlideUp 0.4s ${delay}s ease both`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `${col}15`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>{icon}</div>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0,
        }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${col}22, transparent)`, marginLeft: 4 }} />
      </div>
      {children}
    </div>
  );
}
