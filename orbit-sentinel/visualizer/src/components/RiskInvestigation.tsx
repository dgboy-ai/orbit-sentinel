import React, { useEffect, useState } from "react";
import type { RiskBreakdown, OrbitQueryEvidence, DecisionCenterData } from "../types";
import TiltCard from "./TiltCard";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  riskData: { score: number; level: string; breakdown: RiskBreakdown[] };
  evidence: OrbitQueryEvidence[];
  decisionCenter: DecisionCenterData;
  confidence: string;
  mrIid: number;
}

interface CardDef {
  severity: "critical" | "high" | "medium";
  title: string;
  evidenceSource: string;
  finding: string;
  orbitEvidence: string;
  impact: string;
  confidence: number;
  queryType: string;
}

function GlowOrb({ color, top, left, right, bottom, size }: { color: string; top?: string; left?: string; right?: string; bottom?: string; size: number }) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom, width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size * 0.35}px)`, pointerEvents: "none",
      opacity: 0.5, animation: "float 8s ease-in-out infinite",
    }} />
  );
}

function EvidenceCard({ card, evidence, isMobile }: { card: CardDef; evidence: OrbitQueryEvidence[]; isMobile?: boolean }) {
  const q = evidence.find(e => e.queryType === card.queryType);
  const [touched, setTouched] = useState(false);
  const severityColors = {
    critical: { dot: "#ef4444", bg: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))", border: "rgba(239,68,68,0.2)", label: "CRITICAL SIGNAL", glow: "rgba(239,68,68,0.15)" },
    high: { dot: "#f97316", bg: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))", border: "rgba(249,115,22,0.2)", label: "HIGH SIGNAL", glow: "rgba(249,115,22,0.15)" },
    medium: { dot: "#eab308", bg: "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))", border: "rgba(234,179,8,0.2)", label: "MEDIUM SIGNAL", glow: "rgba(234,179,8,0.15)" },
  };
  const c = severityColors[card.severity];
  return (
    <div style={{
      padding: isMobile ? "12px 14px" : "16px 18px", borderRadius: 12, position: "relative", overflow: "hidden",
      background: touched ? `${c.dot}12` : c.bg, border: `1px solid ${touched ? c.dot : c.border}`,
      animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      display: "flex", flexDirection: "column", gap: 8,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      WebkitTapHighlightColor: "transparent",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.dot; e.currentTarget.style.boxShadow = `0 0 24px ${c.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none"; }}
      onTouchStart={() => setTouched(true)} onTouchEnd={() => setTouched(false)}
    >
      <GlowOrb color={c.glow} top="-30%" left="-20%" size={140} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            background: `${c.dot}18`, border: `1px solid ${c.dot}33`,
          }}>
            {card.severity === "critical" ? "🔴" : card.severity === "high" ? "🟠" : "🟡"}
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: c.dot, marginBottom: 1 }}>{c.label}</div>
            <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "var(--text-primary)" }}>{card.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
          <span style={{
            fontSize: 9, padding: "2px 8px", borderRadius: 4,
            background: "rgba(96,165,250,0.1)", color: "var(--accent-blue)",
            border: "1px solid rgba(96,165,250,0.15)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}>
            {card.evidenceSource}
          </span>
          {q && (
            <span style={{
              fontSize: 9, padding: "2px 8px", borderRadius: 4,
              background: `${c.dot}12`, color: c.dot,
              border: `1px solid ${c.dot}22`, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            }}>
              {q.queryType}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "auto 1fr" : "60px 1fr", gap: "3px 8px", fontSize: isMobile ? 10 : 11, lineHeight: 1.5 }}>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 500, fontSize: 9 }}>Finding</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{card.finding}</span>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 500, fontSize: 9 }}>Orbit Evidence</span>
          <span style={{ color: "var(--accent-blue)", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{card.orbitEvidence}</span>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 500, fontSize: 9 }}>Impact</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{card.impact}</span>
        </div>

        {q && (
          <div style={{
            padding: "5px 10px", borderRadius: 5, marginTop: 4,
            background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${c.dot}33`,
            fontSize: 9, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.4, whiteSpace: "pre-line",
          }}>
            {q.result}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{
              width: `${card.confidence}%`, height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${c.dot}, ${c.dot}88)`,
              transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: `0 0 6px ${c.dot}44`,
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.dot, fontFamily: "'JetBrains Mono', monospace" }}>{card.confidence}%</span>
        </div>
      </div>
    </div>
  );
}

export default function RiskInvestigation({ riskData, evidence, decisionCenter, confidence, mrIid }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmall = useMediaQuery("(max-width: 480px)");

  const cards: CardDef[] = [
    {
      severity: "critical", title: "No Head Pipeline",
      evidenceSource: "MR-to-Pipeline Trace", finding: "MR has no validated deployment path",
      orbitEvidence: "PATH_FINDING: MR → Pipeline relation missing",
      impact: "No production deployment route exists", confidence: 95, queryType: "PATH_FINDING",
    },
    {
      severity: "high", title: "Branch Abandonment Pattern",
      evidenceSource: "Historical Similarity", finding: "9 prior MRs from this branch abandoned",
      orbitEvidence: "TRAVERSAL: 9 of 10 prior MRs from this branch were closed",
      impact: "High probability of MR being closed without merge", confidence: 90, queryType: "TRAVERSAL",
    },
    {
      severity: "critical", title: "Empty Diff",
      evidenceSource: "Orbit Graph Discovery", finding: "MR contains no file changes",
      orbitEvidence: "NEIGHBORS: Diff state is empty — no code to deploy",
      impact: "Nothing deployable identified", confidence: 100, queryType: "NEIGHBORS",
    },
    {
      severity: "critical", title: "Pipeline Failure Correlation",
      evidenceSource: "Pipeline Risk Aggregation", finding: "23 failed pipelines in blast radius services",
      orbitEvidence: "AGGREGATION: 23 failed pipelines across 7 affected services",
      impact: "High probability of pipeline failure propagating to production", confidence: 88, queryType: "AGGREGATION",
    },
    {
      severity: "medium", title: "No Reviewers Assigned",
      evidenceSource: "Ownership Analysis", finding: "No reviewer assigned to MR",
      orbitEvidence: "NEIGHBORS: Ownership path missing from graph",
      impact: "Merge velocity likely reduced", confidence: 75, queryType: "NEIGHBORS",
    },
  ];

  const actions = decisionCenter.requiredTests;
  const afterRisk = decisionCenter.riskReduction.afterRecommendation;

  const fadeIn = (delay: number) => ({
    animation: `fadeSlideUp 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 2px" }}>
      {/* TOP HERO BANNER */}
      <TiltCard maxTilt={3} glare={false}>
      <div className="card" style={{
        padding: isMobile ? "16px 18px" : "24px 28px", position: "relative", overflow: "hidden",
        borderColor: "rgba(239,68,68,0.25)",
        background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(15,18,26,0.9) 50%, rgba(239,68,68,0.02) 100%)",
        ...fadeIn(0),
      }}>
        <GlowOrb color="rgba(239,68,68,0.12)" top="-30%" right="-5%" size={isMobile ? 200 : 300} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, flexDirection: isSmall ? "column" : "row", gap: isSmall ? 6 : 0 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>Orbit Forecast</span>
                <span style={{ fontSize: 7, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>MR !{mrIid}</span>
              </div>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, color: "#ef4444", textShadow: "0 0 40px rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 8 }}>
                🔮 ORBIT FORECAST
              </div>
            </div>
            <div style={{ textAlign: isSmall ? "left" : "right" }}>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 0 }}>Orbit Confidence</div>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 800, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(59,130,246,0.3)" }}>{confidence}</div>
            </div>
          </div>

          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Predicted Outcome</div>
              <div style={{ fontSize: isSmall ? 13 : 16, fontWeight: 800, color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Will Not Reach Production</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <div><span style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Confidence </span><span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>91%</span></div>
                <div><span style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Horizon </span><span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>7 Days</span></div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                padding: "6px 10px", borderRadius: 6,
                background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))",
                border: "1px solid rgba(239,68,68,0.15)", fontSize: 11, color: "#ef4444",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><strong>Primary:</strong> No deployment path exists.</span>
              </div>
              <div style={{
                padding: "6px 10px", borderRadius: 6,
                background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))",
                border: "1px solid rgba(249,115,22,0.15)", fontSize: 11, color: "#f97316",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><strong>Secondary:</strong> 9 prior MRs from this branch were abandoned.</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {evidence.map((e, i) => (
              <span key={e.queryType} style={{
                fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                padding: "3px 10px", borderRadius: 5, letterSpacing: "0.3px",
                background: "rgba(96,165,250,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(96,165,250,0.2)",
                animation: `fadeSlideUp 0.3s ${0.05 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
              }}>
                {e.queryType}
              </span>
            ))}
          </div>
        </div>
      </div>
      </TiltCard>

      {/* PREDICTED PATH TIMELINE */}
      <div className="card" style={{
        padding: isMobile ? "10px 14px" : "14px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(15,18,26,0.95))",
        ...fadeIn(0.04),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
          {[
            { label: "MR OPEN", color: "#22c55e", icon: "📝" },
            { label: "PIPELINE MISSING", color: "#ef4444", icon: "✗" },
            { label: "REVIEW NEVER STARTS", color: "#eab308", icon: "⏸" },
            { label: "DEVELOPMENT STALLS", color: "#eab308", icon: "⏳" },
            { label: "MR CLOSED", color: "#ef4444", icon: "🔒" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 0,
                animation: `fadeSlideUp 0.3s ${0.06 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                  background: `${step.color}12`, border: `1px solid ${step.color}33`,
                }}>{step.icon}</div>
                <span style={{ fontSize: 7, fontWeight: 700, color: step.color, textAlign: "center", letterSpacing: "0.3px", lineHeight: 1.2, whiteSpace: "nowrap" }}>{step.label}</span>
              </div>
              {i < 4 && <div style={{ flex: "0 0 12px", height: 1.5, minWidth: 12, background: `linear-gradient(90deg, ${step.color}66, transparent)`, marginTop: -14 }} />}
            </React.Fragment>
          ))}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto",
            padding: "4px 8px", borderRadius: 5, marginLeft: 4,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
            animation: "fadeSlideUp 0.3s 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "#ef4444", whiteSpace: "nowrap" }}>Predicted</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>CLOSED</span>
          </div>
        </div>
      </div>

      {/* ORBIT CONFIDENCE BREAKDOWN */}
      <div className="card" style={{
        padding: isMobile ? "10px 14px" : "14px 18px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.12)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(15,18,26,0.95), rgba(139,92,246,0.03))",
        ...fadeIn(0.05),
      }}>
        <GlowOrb color="rgba(96,165,250,0.08)" top="-50%" left="-15%" size={180} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)" }}>Orbit Confidence Breakdown</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(() => {
              const CONF_COLORS: Record<string, string> = { PATH_FINDING: "#60a5fa", TRAVERSAL: "#a78bfa", NEIGHBORS: "#22c55e", AGGREGATION: "#f97316" };
              const CONF_PCTS: Record<string, number> = { PATH_FINDING: 95, TRAVERSAL: 90, NEIGHBORS: 91, AGGREGATION: 75 };
              return evidence.map((e, i) => {
                const color = CONF_COLORS[e.queryType] ?? "#8b949e";
                const pct = CONF_PCTS[e.queryType] ?? 50;
                return (
                  <div key={e.queryType} style={{ display: "flex", alignItems: "center", gap: 6, animation: `fadeSlideUp 0.3s ${0.08 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both` }}>
                    <span style={{ fontSize: isSmall ? 8 : 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)", flexShrink: 0, minWidth: isSmall ? 60 : 80 }}>{e.queryType}</span>
                    <div className="resp-hide-mobile-bar" style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${color}33` }} />
                    </div>
                    <span style={{ width: 28, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                  </div>
                );
              });
            })()}
          </div>
          <div style={{
            marginTop: 8, padding: "6px 12px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
            border: "1px solid rgba(34,197,94,0.12)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s 0.2s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              <span style={{ color: "#22c55e" }}>●</span> Overall Confidence
            </span>
            <span style={{ fontSize: isSmall ? 12 : 14, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.3)" }}>HIGH</span>
          </div>
        </div>
      </div>

      {/* EVIDENCE CARDS */}
      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map((card, i) => (
          <div key={card.title} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <EvidenceCard card={card} evidence={evidence} isMobile={isMobile} />
          </div>
        ))}
      </div>

      {/* ORBIT CONCLUSION */}
      <div style={{
        padding: "10px 18px", borderRadius: 8,
        background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(139,92,246,0.03))",
        border: "1px solid rgba(96,165,250,0.12)",
        display: "flex", alignItems: "center", gap: 8,
        ...fadeIn(0.18),
      }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
          <strong style={{ color: "var(--accent-blue)" }}>Orbit Conclusion:</strong> All {evidence.length} query types independently support the same outcome.
        </span>
      </div>

      {/* VERDICT */}
      <TiltCard maxTilt={3} glare={false}>
      <div className="card" style={{
        padding: isMobile ? "14px 16px" : "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(239,68,68,0.2)",
        background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(15,18,26,0.95) 50%, rgba(249,115,22,0.03) 100%)",
        ...fadeIn(0.2),
      }}>
        <GlowOrb color="rgba(239,68,68,0.08)" top="-20%" right="-10%" size={isMobile ? 150 : 220} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>Orbit Verdict</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 6 : 10,
            padding: isMobile ? "8px 16px" : "12px 28px", borderRadius: 10, marginBottom: 12, maxWidth: "100%", boxSizing: "border-box",
            background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
            border: "1px solid rgba(239,68,68,0.25)",
            animation: mounted ? "pulseGlow 2s ease-in-out infinite" : "none",
          }}>
            <span style={{ fontSize: isMobile ? 18 : 24, flexShrink: 0 }}>🚫</span>
            <span style={{ fontSize: isMobile ? 16 : 22, fontWeight: 900, color: "#ef4444", letterSpacing: "0.8px", textShadow: "0 0 20px rgba(239,68,68,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>DO NOT DEPLOY</span>
          </div>

          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 10 : 16 }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Reasoning</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "No deployment path exists",
                  "No validated pipeline exists",
                  "No meaningful code changes detected",
                  "Historical abandonment pattern detected",
                ].map((r, i) => (
                  <div key={r} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 8px", borderRadius: 5,
                    background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)",
                    fontSize: 11, color: "var(--text-primary)",
                    animation: `fadeSlideUp 0.3s ${0.25 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}>
                    <span style={{ fontSize: 9, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{i + 1}.</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Recommended Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {actions.map((a, i) => (
                  <div key={a} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 8px", borderRadius: 5,
                    background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
                    fontSize: 11, color: "var(--text-primary)",
                    animation: `fadeSlideUp 0.3s ${0.35 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}>
                    <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</span>
                    {a}
                  </div>
                ))}
              </div>
              <div style={{
                padding: "8px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
                border: "1px solid rgba(34,197,94,0.12)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                animation: "fadeSlideUp 0.3s 0.45s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 500 }}>Expected Risk After Mitigation</span>
                <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.3)" }}>
                  {(afterRisk * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </TiltCard>
    </div>
  );
}
