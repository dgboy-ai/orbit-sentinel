import React, { useState, useEffect, useRef, useCallback } from "react";
import type { VisualizationData, OrbitQueryEvidence } from "../types";
import {
  riskScoreToColor, riskScoreToGlow, riskScoreToKey, riskScoreToGradient, RISK,
} from "../utils/colors";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props { data: VisualizationData }

function scoreFromSummary(s: string): number {
  return Number(s.replace("%", "")) / 100;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, suffix = "%", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayed, setDisplayed] = useState(value);
  const rafRef = useRef(0);
  const valueRef = useRef(value);
  const startedRef = useRef(false);
  valueRef.current = value;
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  useEffect(() => {
    if (startedRef.current) { setDisplayed(value); return; }
    startedRef.current = true;
    const dur = 1400;
    const t0 = performance.now();
    const target = valueRef.current;
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <span>{displayed.toFixed(decimals)}{suffix}</span>;
}

/* ─── SVG Risk Arc Gauge ─── */
function RiskGauge({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const filled = score * circ;
  const col = riskScoreToColor(score);
  const glow = riskScoreToGlow(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 2px ${glow})` }}>
      <defs>
        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#gauge-grad)" strokeWidth={6}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        strokeOpacity={0.4}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={2}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

/* ─── Sparkline ─── */
function RiskSparkline({ points }: { points: { label: string; value: number }[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points.map(p => p.value)) * 0.7;
  const max = Math.max(...points.map(p => p.value)) * 1.1;
  const range = max - min || 1;
  const width = 180;
  const height = 40;
  const padX = 16;
  const padY = 4;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const stepX = chartW / (points.length - 1);
  const line = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = padY + chartH - ((p.value - min) / range) * chartH;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", maxWidth: "100%" }}>
      <defs>
        <linearGradient id="spark-fill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
          <stop offset="50%" stopColor="#eab308" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={`${line} L${padX + (points.length - 1) * stepX},${padY + chartH} L${padX},${padY + chartH} Z`}
        fill="url(#spark-fill)" opacity={0.3} />
      {/* Line */}
      <path d={line} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => {
        const x = padX + i * stepX;
        const y = padY + chartH - ((p.value - min) / range) * chartH;
        const dotColor = riskScoreToColor(p.value);
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r={3} fill={dotColor} stroke="rgba(0,0,0,0.4)" strokeWidth={1}
              style={{ filter: `drop-shadow(0 0 3px ${dotColor}88)` }} />
            {i % 2 === 0 && (
              <text x={x} y={y - 8} textAnchor="middle" fill="rgba(255,255,255,0.5)"
                fontSize={7} fontFamily="'JetBrains Mono', monospace"
              >{p.label}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Evidence card icons ─── */
const EVIDENCE_META: Record<string, { icon: string; color: string; label: string }> = {
  NEIGHBORS: { icon: "🔷", color: "#60a5fa", label: "Orbit Graph" },
  PATH_FINDING: { icon: "🧭", color: "#a78bfa", label: "Dependency Trace" },
  TRAVERSAL: { icon: "📜", color: "#fb923c", label: "Historical Match" },
  AGGREGATION: { icon: "📊", color: "#22c55e", label: "Pipeline Stats" },
};

function extractKeyFindings(result: string): string[] {
  return result.split("\n").filter(l => l.trim().startsWith("→")).map(l => l.replace(/^→\s*/, "").trim());
}

function EvidenceMiniCard({ e, delay }: { e: OrbitQueryEvidence; delay: number }) {
  const [open, setOpen] = useState(false);
  const meta = EVIDENCE_META[e.queryType] || { icon: "🔍", color: "#8b949e", label: "Query" };
  const findings = extractKeyFindings(e.result);
  const lines = e.result.split("\n").filter(l => l.trim());
  return (
    <div style={{
      borderRadius: 8, overflow: "hidden",
      border: `1px solid ${meta.color}20`,
      animation: `fadeSlideUp 0.35s ${delay}s ease both`,
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "12px 14px", cursor: "pointer",
        background: open ? `${meta.color}08` : "rgba(255,255,255,0.015)",
        borderBottom: open ? `1px solid ${meta.color}15` : "none",
        transition: "all 0.15s ease",
        display: "flex", alignItems: "center", gap: 10,
        userSelect: "none",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}10`; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? `${meta.color}08` : "rgba(255,255,255,0.015)"; }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{
              fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 3,
              background: `${meta.color}18`, color: meta.color,
              letterSpacing: "0.5px", fontFamily: "'JetBrains Mono', monospace",
            }}>{e.queryType}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{e.queryName}</span>
          </div>
          {findings.length > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {findings[0]}
            </div>
          )}
        </div>
        <span style={{
          fontSize: 10, color: meta.color, transition: "transform 0.2s ease", flexShrink: 0,
          transform: open ? "rotate(180deg)" : "none",
        }}>▾</span>
      </div>
      {open && (
        <div style={{
          padding: "10px 14px 14px",
          animation: "fadeSlideUp 0.15s ease",
        }}>
          {lines.map((l, i) => {
            const isKey = l.startsWith("→");
            return (
              <div key={i} style={{
                padding: "2px 0", fontSize: 10, lineHeight: 1.5,
                color: isKey ? "var(--text-primary)" : "var(--text-secondary)",
                display: "flex", gap: 6,
              }}>
                {isKey ? <span style={{ color: meta.color, flexShrink: 0 }}>▸</span> : <span style={{ flexShrink: 0, opacity: 0.3 }}>·</span>}
                <span style={{ fontWeight: isKey ? 500 : 400 }}>{l.replace(/^→\s*/, "")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Connected Remediation Flow ─── */
function RemediationFlow({ current, scenarios }: { current: number; scenarios: { label: string; riskAfter: number; color: string }[] }) {
  const steps = [
    { label: "Current", value: current, color: riskScoreToColor(current) },
    ...scenarios.map(s => ({ label: s.label.replace(/^(Add|Trigger|Assign|All)\s*/g, "").slice(0, 6), value: s.riskAfter, color: s.color })),
  ];
  const totalDots = steps.length;
  const vbW = Math.max(300, totalDots * 70);
  const spacing = totalDots > 1 ? (vbW - 40) / (totalDots - 1) : 0;
  return (
    <svg width="100%" height={60} viewBox={`0 0 ${vbW} 60`} style={{ display: "block", maxWidth: "100%" }}>
      <defs>
        <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={riskScoreToColor(current)} />
          <stop offset="100%" stopColor={riskScoreToColor(scenarios[scenarios.length - 1].riskAfter)} />
        </linearGradient>
      </defs>
      {totalDots > 1 && (
        <line x1={20} y1={30} x2={20 + (totalDots - 1) * spacing} y2={30}
          stroke="url(#flow-grad)" strokeWidth={2} strokeOpacity={0.4}
          strokeDasharray="4 3" />
      )}
      {steps.map((s, i) => {
        const x = 20 + i * spacing;
        return (
          <g key={s.label}>
            <circle cx={x} cy={30} r={8} fill={`${s.color}15`} />
            <circle cx={x} cy={30} r={5} fill={s.color}
              style={{ filter: `drop-shadow(0 0 3px ${s.color}88)` }} />
            <text x={x} y={19} textAnchor="middle" fill={s.color}
              fontSize={9} fontWeight={700} fontFamily="'JetBrains Mono', monospace"
            >{(s.value * 100).toFixed(0)}%</text>
            <text x={x} y={44} textAnchor="middle" fill="var(--text-tertiary)"
              fontSize={7} fontFamily="'Inter', sans-serif">{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Incident Similarity Bar ─── */
function IncidentBar({ incidents }: { incidents: { mrIid: number; similarity: number; outcome: string }[] }) {
  if (incidents.length === 0) return null;
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 8,
      background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)",
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 8 }}>
        Incident Similarity Spectrum
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {incidents.map((inc, i) => {
          const simColor = inc.similarity > 80 ? "#ef4444" : inc.similarity > 50 ? "#f97316" : "#eab308";
          return (
            <div key={inc.mrIid} style={{
              flex: inc.similarity, height: 24, borderRadius: 4,
              background: `linear-gradient(90deg, ${simColor}, ${simColor}66)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.9)",
              minWidth: 30, maxWidth: 120,
              fontFamily: "'JetBrains Mono', monospace",
              position: "relative",
              transition: "all 0.2s ease",
              cursor: "default",
            }}
              title={`!${inc.mrIid}: ${inc.similarity}% match`}
            >
              !{inc.mrIid}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-tertiary)", marginTop: 4 }}>
        <span>Low match</span>
        <span>High match</span>
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
const SectionCard = React.memo(function SectionCard({
  id, icon, title, col, children,
}: {
  id: string; icon: string; title: string; col: string; children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  return (
    <div id={id} className="card" style={{ padding: isMobile ? "14px 14px" : "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: `${col}15`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>{icon}</div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${col}22, transparent)`, marginLeft: 4 }} />
      </div>
      {children}
    </div>
  );
});

/* ─── Main Component ─── */
function GlowOrb({ color, top, right, size = 280 }: { color: string; top?: number; right?: number; size?: number }) {
  return (
    <div style={{
      position: "absolute", top: top ?? -80, right: right ?? 20,
      width: size, height: size,
      borderRadius: "50%", background: `${color}06`, filter: "blur(80px)",
      pointerEvents: "none",
    }} />
  );
}

export default function ImpactReport({ data }: Props) {
  const { summary, hero, evidence, decisionCenter, incidents, counterfactuals, riskData, futureTimeline } = data;
  const score = scoreFromSummary(summary.riskScore);
  const rk = riskScoreToKey(score);
  const col = RISK[rk].hex;
  const glow = RISK[rk].glow;
  const grad = RISK[rk].gradient;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isSmall = useMediaQuery("(max-width: 480px)");

  const [stickyVerdict, setStickyVerdict] = useState(false);
  const verdictRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = verdictRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setStickyVerdict(!entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePrint = useCallback(() => window.print(), []);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navSections: { key: string; icon: string; label: string }[] = [
    { key: "summary", icon: "📋", label: "Summary" },
    { key: "breakdown", icon: "📊", label: "Risks" },
    { key: "evidence", icon: "🔗", label: "Evidence" },
    { key: "timeline", icon: "📅", label: "Timeline" },
    { key: "incidents", icon: "⚠️", label: "Incidents" },
    { key: "remediation", icon: "🔧", label: "Remediation" },
    { key: "info", icon: "ℹ️", label: "Meta" },
  ];

  return (
    <div style={{ maxWidth: isMobile ? "100%" : 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12, padding: isMobile ? "0 4px" : 0, position: "relative", wordBreak: "break-word", overflowWrap: "break-word" }}>
      {/* ── Scroll Progress Bar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 200,
        background: `linear-gradient(90deg, ${col}, ${glow})`,
        transform: `scaleX(${scrollProgress})`, transformOrigin: "left",
        transition: "transform 0.1s linear",
        opacity: scrollProgress > 0 ? 1 : 0,
      }} />

      {/* ── Sticky Verdict Banner ── */}
      {stickyVerdict && (
        <div style={{
          position: "fixed", top: isMobile ? 46 : 54, left: "50%", transform: "translateX(-50%)", zIndex: 150,
          padding: isMobile ? "4px 12px" : "6px 18px", borderRadius: 20,
          background: `linear-gradient(135deg, ${col}22, ${col}11)`,
          backdropFilter: "blur(16px)",
          border: `1px solid ${col}33`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: isMobile ? 9 : 11, fontWeight: 600, color: col,
          animation: "fadeSlideDown 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          <span>🛰️</span> MR !{summary.mrIid} · Risk: {summary.riskScore} ({summary.riskLevel})
          <span style={{ width: 1, height: 12, background: `${col}33`, margin: "0 4px" }} />
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>DO NOT DEPLOY</span>
        </div>
      )}

      {/* ── Sticky Nav ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        paddingTop: 0, marginBottom: 0,
      }}>
        <div className="card" style={{
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 4,
          background: "rgba(8,9,13,0.85)", backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", gap: 3, flex: 1, overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {navSections.map(s => (
              <button key={s.key} aria-label={`Scroll to ${s.label} section`} onClick={() => {
                document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
                style={{
                  padding: "3px 9px", fontSize: 9, fontWeight: 500, cursor: "pointer",
                  border: "1px solid transparent", borderRadius: 4,
                  background: "transparent", color: "var(--text-secondary)",
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${col}10`; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >{s.icon} {s.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={handlePrint} aria-label="Print report" title="Print report"
              style={{
                padding: "3px 8px", fontSize: 10, cursor: "pointer",
                border: "1px solid var(--border)", borderRadius: 4,
                background: "transparent", color: "var(--text-secondary)",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >🖨️</button>
            <span style={{
              fontSize: 8, color: "var(--text-tertiary)", padding: "4px 6px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              v{summary.timestamp ? new Date(summary.timestamp).toISOString().slice(0, 10) : "1.0"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="card" style={{
        padding: 0, overflow: "hidden",
        border: `1px solid ${col}33`,
        animation: "fadeSlideDown 0.4s ease",
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${col}12, transparent 60%)`,
          padding: isMobile ? "18px 18px" : "26px 30px", position: "relative",
        }} ref={verdictRef}>
          <GlowOrb color={col} top={-80} right={20} size={isMobile ? 180 : 280} />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 24, position: "relative", zIndex: 1, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <RiskGauge score={score} size={88} />
              <div style={{
                fontSize: 14, fontWeight: 800, color: col,
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 16px ${glow}`,
                marginTop: -52, position: "relative", pointerEvents: "none",
              }}>
                <AnimatedCounter value={score} />
              </div>
              <div style={{
                fontSize: 7, fontWeight: 700, color: col, letterSpacing: "1px", marginTop: 1,
                textTransform: "uppercase", opacity: 0.85,
              }}>{summary.riskLevel}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: grad, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>🛰️</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                    Engineering Impact Report
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {summary.project} · MR !{summary.mrIid} · {summary.branch}
                  </div>
                </div>
              </div>
              {/* Verdict */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                padding: "5px 14px", borderRadius: 6, marginTop: 4,
                background: `${col}18`, border: `1px solid ${col}30`,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: col, boxShadow: `0 0 8px ${glow}`,
                  animation: "pulseDot 1.5s ease-in-out infinite", flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.3px", textTransform: "uppercase", flexShrink: 0 }}>
                  DO NOT DEPLOY
                </span>
                <span style={{ width: 1, height: 12, background: `${col}33`, margin: "0 4px", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "var(--text-secondary)", wordBreak: "break-word", minWidth: 0 }}>
                  {hero.predictedOutcome.split("—")[0]?.trim() || hero.predictedOutcome}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "repeat(2, 1fr)" : isMobile ? "repeat(4, 1fr)" : "repeat(4, 1fr)",
          gap: 0,
          borderTop: `1px solid ${col}12`,
        }}>
          {[
            { label: "Graph Nodes", value: summary.totalNodes, suffix: "", color: "#60a5fa", icon: "🔷" },
            { label: "Connections", value: summary.totalEdges, suffix: "", color: "#a78bfa", icon: "🔗" },
            { label: "Past Incidents", value: incidents.length, suffix: "", color: "#fb923c", icon: "⚠️" },
            { label: "Risk Reduction", value: 1 - decisionCenter.riskReduction.afterRecommendation / decisionCenter.riskReduction.current, suffix: "%", color: "#22c55e", decimals: 0, icon: "📉" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: isSmall ? "10px 8px" : "14px 16px 12px", textAlign: "center",
              borderRight: i < 3 && !isSmall ? `1px solid var(--border)` : "none",
              borderBottom: isSmall && i < 2 ? `1px solid var(--border)` : "none",
            }}>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 5 }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-Column Body Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, alignItems: "start" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* ── Executive Summary ── */}
          <SectionCard id="sec-summary" icon="📋" title="Executive Summary & Confidence" col={col}>
            <div style={{
              padding: "12px 16px", borderRadius: 8,
              background: `linear-gradient(135deg, ${col}08, transparent)`,
              border: `1px solid ${col}15`,
              position: "relative", overflow: "hidden",
              marginBottom: 10,
            }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: grad, borderRadius: "0 2px 2px 0" }} />
              <div style={{ fontSize: 18, color: col, marginBottom: 4, lineHeight: 1, opacity: 0.35 }}>"</div>
              <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, fontStyle: "italic" }}>
                {hero.predictedOutcome}
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.4 }}>
              <strong style={{ color: "var(--text-primary)" }}>Action:</strong> {hero.recommendedAction}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {hero.confidenceFactors.map(f => {
                const dotColor = f.status === "success" ? "#22c55e" : f.status === "warning" ? "#eab308" : "#ef4444";
                return (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5,
                    background: `${dotColor}08`, border: `1px solid ${dotColor}18`, fontSize: 9, color: "var(--text-secondary)",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, boxShadow: `0 0 4px ${dotColor}66`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.label}:</span> {f.value}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Risk Breakdown ── */}
          <SectionCard id="sec-breakdown" icon="📊" title="Risk Factor Breakdown" col={col}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {riskData.breakdown.map((b, i) => {
                const pct = (b.value / b.maxValue) * 100;
                const bc = pct > 75 ? "#ef4444" : pct > 50 ? "#f97316" : pct > 25 ? "#eab308" : "#22c55e";
                return (
                  <div key={b.category} style={{ animation: `fadeSlideUp 0.25s ${0.1 + i * 0.03}s ease both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <div style={{ fontSize: 9, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.2 }}>{b.category}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: bc, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginLeft: 6 }}>
                        {b.value}/{b.maxValue}
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg, ${bc}, ${bc}77)`, boxShadow: `0 0 4px ${bc}33`, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Risk Trajectory + Timeline side by side ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            <SectionCard id="sec-remediation" icon="📉" title="Trajectory" col={col}>
              <RiskSparkline points={[
                { label: "Current", value: decisionCenter.riskReduction.current },
                { label: "Changes", value: counterfactuals[0]?.riskAfter ?? 0 },
                { label: "Pipeline", value: counterfactuals[1]?.riskAfter ?? 0 },
                { label: "Review", value: counterfactuals[2]?.riskAfter ?? 0 },
                { label: "All", value: decisionCenter.riskReduction.afterRecommendation },
              ]} />
            </SectionCard>
            <SectionCard id="sec-timeline" icon="📅" title="Timeline" col={col}>
              <div style={{ position: "relative", paddingLeft: 18 }}>
                <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 1.5, background: `linear-gradient(180deg, ${col}44, ${col}08)`, borderRadius: 1 }} />
                {futureTimeline.slice(0, 4).map((evt, i) => (
                  <div key={evt.day} style={{ position: "relative", paddingBottom: i < 3 ? 6 : 0 }}>
                    <div style={{ position: "absolute", left: -13, top: 2, width: 10, height: 10, borderRadius: "50%", background: `${col}15`, border: `1.5px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${col}06` }}>
                      <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: col }} />
                    </div>
                    <div style={{ padding: "6px 10px", borderRadius: 5, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                        <span style={{ fontSize: 10 }}>{evt.icon}</span>
                        <span style={{ fontSize: 7, fontWeight: 700, color: col, letterSpacing: "0.2px", fontFamily: "'JetBrains Mono', monospace" }}>D+{evt.day}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)" }}>{evt.label}</span>
                      </div>
                      <div style={{ fontSize: 8, color: "var(--text-secondary)", lineHeight: 1.3, marginLeft: 14 }}>{evt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* ── Orbit Evidence Chain ── */}
          <SectionCard id="sec-evidence" icon="🔗" title="Orbit Evidence Chain" col={col}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {evidence.map((e, i) => (
                <EvidenceMiniCard key={e.queryName} e={e} delay={0.1 + i * 0.03} />
              ))}
            </div>
          </SectionCard>

          {/* ── Historical Incidents ── */}
          <SectionCard id="sec-incidents" icon="⚠️" title="Incident Analysis" col={col}>
            {incidents.length === 0 ? (
              <div style={{ padding: 12, textAlign: "center", color: "var(--text-secondary)", fontSize: 11 }}>No similar historical incidents found.</div>
            ) : (
              <>
                <IncidentBar incidents={incidents} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {incidents.map((inc, i) => {
                    const simColor = inc.similarity > 80 ? "#ef4444" : inc.similarity > 50 ? "#f97316" : "#eab308";
                    return (
                      <div key={`${inc.mrIid}`} style={{
                        padding: "8px 12px", borderRadius: 6,
                        background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)",
                        display: "flex", gap: 8,
                        animation: `fadeSlideUp 0.2s ${0.1 + i * 0.04}s ease both`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${simColor}33`; e.currentTarget.style.background = `${simColor}06`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                      >
                        <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)" }}>!{inc.mrIid}</span>
                            <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${simColor}15`, color: simColor, border: `1px solid ${simColor}25` }}>{inc.similarity}%</span>
                            <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: inc.outcome === "Merged" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: inc.outcome === "Merged" ? "#22c55e" : "#ef4444", border: `1px solid ${inc.outcome === "Merged" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>{inc.outcome.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 8, color: "var(--text-secondary)", lineHeight: 1.3 }}>{inc.rootCause}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </SectionCard>

          {/* ── Report Metadata ── */}
          <SectionCard id="sec-info" icon="ℹ️" title="Metadata" col={col}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { label: "Generated", value: new Date(summary.timestamp).toLocaleString() },
                { label: "Confidence", value: hero.confidence },
                { label: "Score", value: summary.riskScore },
                { label: "Level", value: summary.riskLevel },
              ].map(item => (
                <div key={item.label} style={{ padding: "5px 8px", borderRadius: 4, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)", wordBreak: "break-word" }}>
                  <div style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.2px", textTransform: "uppercase", marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.3 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Section: Decision Center + Remediation (full-width) ── */}
      <div style={{ position: "relative" }}>
        <GlowOrb color={col} top={-60} right={10} size={200} />
      <SectionCard id="sec-decision" icon="🎯" title="Decision Center & Remediation Plan" col={col}>
        {/* Verdict banner */}
        <div style={{
          padding: "12px 16px", borderRadius: 8, marginBottom: 10,
          background: `linear-gradient(135deg, ${col}15, ${col}05)`,
          border: `1px solid ${col}28`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${col}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🚫</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 1 }}>DO NOT DEPLOY — Remediation Required</div>
            <div style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.3 }}>{decisionCenter.deploymentStrategy}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
          {/* Left half: Risk bars + remediation flow */}
          <div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderRadius: 5, marginBottom: 3, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9, color: "var(--text-secondary)" }}>Current Risk</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 70, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${decisionCenter.riskReduction.current * 100}%`, background: grad, boxShadow: `0 0 4px ${glow}` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: "'JetBrains Mono', monospace" }}>{(decisionCenter.riskReduction.current * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderRadius: 5, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 600 }}>After Full Remediation</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 70, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${decisionCenter.riskReduction.afterRecommendation * 100}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", boxShadow: "0 0 4px rgba(34,197,94,0.3)" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>{(decisionCenter.riskReduction.afterRecommendation * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Remediation Pathway</div>
              <RemediationFlow current={decisionCenter.riskReduction.current} scenarios={counterfactuals} />
            </div>
          </div>

          {/* Right half: Reviewers + Tests + Rollback */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
              <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>👤 Reviewers</div>
                {decisionCenter.reviewers.map(r => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0", fontSize: 9 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: r.role.includes("Needed") ? "#eab308" : "#22c55e", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.name}</span>
                    <span style={{ color: "var(--text-tertiary)", marginLeft: "auto", fontSize: 7 }}>{r.role}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>✅ Actions</div>
                {decisionCenter.requiredTests.map((t, i) => (
                  <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: "1.5px 0", fontSize: 8, color: "var(--text-secondary)", lineHeight: 1.3 }}>
                    <span style={{ fontSize: 6, fontWeight: 700, color: col, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "7px 12px", borderRadius: 6, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 3 }}>🔄 Rollback Strategy</div>
              <div style={{ fontSize: 9, color: "var(--text-primary)", lineHeight: 1.4 }}>{decisionCenter.rollbackStrategy}</div>
            </div>
          </div>
        </div>
      </SectionCard>
      </div>

      {/* ── Footer ── */}
      <div style={{
        textAlign: "center", padding: "24px 0 16px",
        color: "var(--text-tertiary)", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px",
        opacity: 0.5, position: "relative",
      }}>
        <div style={{
          position: "absolute", left: "20%", right: "20%", top: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${col}22, transparent)`,
        }} />
        <div style={{ marginBottom: 2 }}>Predicted before merge. Prevented before production.</div>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Orbit Sentinel · v{new Date(summary.timestamp).toISOString().slice(0, 10).replace(/-/g, ".")} · {summary.project.split("/")[0]}/{summary.project.split("/")[1]}
        </div>
      </div>
    </div>
  );
}
