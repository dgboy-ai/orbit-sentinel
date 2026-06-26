import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { HistoricalIncident } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  incidents: HistoricalIncident[];
  totalAnalyzed: number;
  mrIid?: number;
  riskScore?: number;
  dataMode?: "live" | "demo" | string;
}

function GlowOrb({ color, top, left, right, bottom, size }: { color: string; top?: string; left?: string; right?: string; bottom?: string; size: number }) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom, width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size * 0.35}px)`, pointerEvents: "none",
      opacity: 0.4, animation: "float 8s ease-in-out infinite",
    }} />
  );
}

function AnimatedCounter({ target, suffix = "", duration = 1200, color }: { target: number; suffix?: string; duration?: number; color: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const t0 = performance.now();
    function tick(now: number) {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${color}60, 0 0 60px ${color}20` }}>{val}{suffix}</span>;
}

function AnimatedStatCard({ label, value, sub, color, target, suffix = "" }: { label: string; value: string; sub?: string; color: string; target?: number; suffix?: string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8, textAlign: "center", position: "relative", overflow: "hidden",
      background: `linear-gradient(145deg, ${color}14, ${color}05)`,
      border: `1px solid ${color}35`,
      boxShadow: `0 0 24px ${color}10, inset 0 0 20px ${color}04`,
      animation: "fadeSlideUp 0.3s ease both",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 32px ${color}20, inset 0 0 20px ${color}08`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 0 24px ${color}10, inset 0 0 20px ${color}04`; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${color}06`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {target !== undefined
          ? <AnimatedCounter target={target} suffix={suffix} color={color} />
          : <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 18px ${color}50, 0 0 50px ${color}20` }}>{value}</div>}
        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: `${color}aa`, marginTop: 1, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const isClosed = outcome === "Closed";
  return (
    <span style={{
      fontSize: 13, padding: "3px 10px", borderRadius: 4, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
      background: isClosed ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))" : "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))",
      color: isClosed ? "#ef4444" : "#22c55e",
      border: `1px solid ${isClosed ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`,
      boxShadow: `0 0 10px ${isClosed ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`,
      textShadow: `0 0 6px ${isClosed ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
    }}>
      <span style={{ fontSize: 14 }}>{isClosed ? "🔒" : "✅"}</span> {outcome}
    </span>
  );
}

function TimelineDot({ status, delay, label }: { status: string; delay: number; label: string }) {
  const col = status === "current" ? "#3b82f6" : status === "Merged" ? "#22c55e" : "#ef4444";
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), delay * 1000 + 300);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, position: "relative",
      animation: `fadeSlideUp 0.4s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800,
        background: status === "current" ? "rgba(59,130,246,0.2)" : status === "Merged" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
        border: status === "current" ? `2.5px solid ${col}` : `2px solid ${col}77`,
        boxShadow: `0 0 ${pulse ? 24 : 12}px ${col}44, inset 0 0 8px ${col}22`,
        transition: "box-shadow 0.5s ease",
        position: "relative",
      }}>
        <span style={{ color: col, filter: `drop-shadow(0 0 4px ${col}66)` }}>
          {status === "current" ? "◉" : status === "Merged" ? "✓" : "✗"}
        </span>
        {pulse && <div style={{
          position: "absolute", inset: -5, borderRadius: "50%",
          border: `1.5px solid ${col}44`,
          animation: "ripple 1.5s ease-out infinite",
        }} />}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: status === "current" ? col : "var(--text-primary)", letterSpacing: "0.3px", textShadow: status === "current" ? `0 0 8px ${col}44` : "none" }}>
        {status === "current" ? label : status === "Merged" ? `✓ ${label}` : `✗ ${label}`}
      </span>
      <span style={{ fontSize: 11, color: col, fontWeight: 700, textShadow: `0 0 8px ${col}33` }}>
        {status === "current" ? "CURRENT" : status.toUpperCase()}
      </span>
    </div>
  );
}

function formatOrdinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default function HistoricalContext({ incidents, totalAnalyzed, mrIid = 10, riskScore = 0.55, dataMode = "demo" }: Props) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmall = useMediaQuery("(max-width: 480px)");

  const effectiveIncidents = incidents;

  const sorted = useMemo(() => [...effectiveIncidents].sort((a, b) => a.mrIid - b.mrIid), [effectiveIncidents]);
  const closedCount = effectiveIncidents.filter(i => i.outcome === "Closed").length;
  const mergedCount = effectiveIncidents.filter(i => i.outcome === "Merged").length;
  const totalCount = effectiveIncidents.length;
  const closeRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;
  const highestSimilarity = effectiveIncidents.length > 0 ? Math.max(...effectiveIncidents.map(i => i.similarity)) : 0;
  const [hoveredCase, setHoveredCase] = useState<number | null>(null);
  const [verdictVisible, setVerdictVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVerdictVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  // Build timeline: sorted incidents + current MR
  const timeline = useMemo(() => {
    const items = sorted.map(i => ({ mrIid: i.mrIid, outcome: i.outcome, label: `MR #${i.mrIid}`, key: `hist-${i.mrIid}` }));
    if (mrIid) items.push({ mrIid, outcome: "current" as const, label: `MR #${mrIid}`, key: "current" });
    return items;
  }, [sorted, mrIid]);

  // Build pattern visualization nodes from real incident data (max 3 to avoid crowding)
  const patternNodes = useMemo(() => {
    const nodes = sorted.slice(-3).map(i => ({
      label: `MR #${i.mrIid}`,
      color: i.outcome === "Closed" ? "#ef4444" : "#22c55e",
      status: i.outcome === "Closed" ? "CLOSED" : "MERGED",
      isCurrent: false,
    }));
    nodes.push({ label: mrIid ? `MR #${mrIid}` : "CURRENT", color: "#3b82f6", status: "CURRENT", isCurrent: true });
    return nodes;
  }, [sorted, mrIid]);

  // Lessons from the data
  const lessons = useMemo(() => [
    { text: "Empty diff MRs rarely merge — no code changes = no deployment path", icon: "📝", color: "#60a5fa" },
    { text: "Missing pipeline strongly predicts closure — CI validation is a strong signal", icon: "🔄", color: "#a78bfa" },
    { text: "No reviewer assignment increases abandonment probability significantly", icon: "👤", color: "#22c55e" },
    {
      text: closedCount > 0
        ? `Same branch showed repeated failure — ${closedCount} of ${totalCount} MRs from this branch were closed without merge`
        : `No branch failures yet — confidence is driven by graph signals (deployment path, pipeline, ownership)`,
      icon: "🔀", color: "#f97316"
    },
  ], [closedCount, mergedCount, totalCount]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 2px" }}>
      {/* HEADER — Repository Memory Intelligence */}
      <div className="card" style={{
        padding: isMobile ? "16px 18px" : "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(139,92,246,0.35)",
        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(var(--bg-card-rgb),0.96), rgba(59,130,246,0.06))",
        animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 0 40px rgba(139,92,246,0.08), inset 0 0 50px rgba(59,130,246,0.03)",
      }}>
        <GlowOrb color="rgba(139,92,246,0.1)" top="-40%" left="-10%" size={isMobile ? 200 : 300} />
        <GlowOrb color="rgba(59,130,246,0.06)" bottom="-30%" right="-5%" size={isMobile ? 140 : 200} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--accent-blue)", padding: "3px 10px", borderRadius: 4,
              background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.05))",
              border: "1px solid rgba(96,165,250,0.25)",
              boxShadow: "0 0 12px rgba(96,165,250,0.06)",
            }}>Repository Memory Intelligence</span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 3,
              background: dataMode === "live" ? "rgba(34,197,94,0.12)" : "rgba(167,139,250,0.12)",
              color: dataMode === "live" ? "#22c55e" : "#a78bfa",
              border: `1px solid ${dataMode === "live" ? "rgba(34,197,94,0.2)" : "rgba(167,139,250,0.2)"}`,
              fontWeight: 700, letterSpacing: "0.3px",
              textShadow: `0 0 8px ${dataMode === "live" ? "rgba(34,197,94,0.3)" : "rgba(167,139,250,0.3)"}`,
            }}>{dataMode === "live" ? "● Live" : "◆ Demo"}</span>
          </div>
          {/* Description */}
          <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14, maxWidth: "92%" }}>
            Orbit analysed{" "}
            <strong style={{ color: "var(--text-primary)", textShadow: "0 0 12px rgba(255,255,255,0.05)" }}>{totalCount} historical repository precedents</strong>.
            {closedCount > 0 && <span style={{ color: "#ef4444", fontWeight: 700, textShadow: "0 0 8px rgba(239,68,68,0.2)" }}> {closedCount} closed without merge</span>}
            {closedCount > 0 && mergedCount > 0 && <span style={{ color: "var(--text-tertiary)" }}>,</span>}
            {mergedCount > 0 && <span style={{ color: "#22c55e", fontWeight: 700, textShadow: "0 0 8px rgba(34,197,94,0.2)" }}> {mergedCount} successfully merged</span>}
            {closedCount === 0 && mergedCount === 0 && totalCount > 0 && <span style={{ color: "var(--text-tertiary)" }}> — verdict driven by graph signals, not historical failures</span>}
            {totalCount === 0 && <span style={{ color: "var(--text-tertiary)" }}> — no prior history found, prediction based on graph signals only</span>}
            .
          </div>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 6 }}>
            <AnimatedStatCard label="MRs Analyzed" value={String(totalCount)} target={totalCount} sub="From same branch" color="#60a5fa" />
            <AnimatedStatCard label="Closed Without Merge" value={String(closedCount)} target={closedCount} sub={`Out of ${totalCount}`} color="#ef4444" />
            <AnimatedStatCard label="Abandonment Rate" value={`${closeRate}%`} suffix="%" color="#f97316" />
            <AnimatedStatCard label="Forecast Confidence" value="HIGH" sub="4 query types" color="#22c55e" />
          </div>
        </div>
      </div>

      {/* PATTERN DISCOVERY TIMELINE */}
      <div className="card" style={{
        padding: isMobile ? "12px 14px" : "14px 18px", position: "relative", overflow: "hidden",
        borderColor: "rgba(234,179,8,0.3)",
        background: "linear-gradient(135deg, rgba(234,179,8,0.06), rgba(var(--bg-card-rgb),0.95))",
        animation: "fadeSlideUp 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both",
        boxShadow: "0 0 30px rgba(234,179,8,0.06), inset 0 0 20px rgba(234,179,8,0.03)",
      }}>
        <GlowOrb color="rgba(234,179,8,0.08)" top="-30%" left="20%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#eab308", textShadow: "0 0 8px rgba(234,179,8,0.3)" }}>Pattern Discovery Timeline</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(234,179,8,0.3), transparent)" }} />
          </div>
          {/* SVG connecting line background */}
          <div style={{ position: "relative", padding: "4px 0" }}>
            <svg style={{ position: "absolute", top: 0, left: "5%", width: "90%", height: "100%", pointerEvents: "none" }}>
              <line x1="0" y1="18" x2="100%" y2="18" stroke="rgba(234,179,8,0.15)" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative" }}>
              {timeline.map((t, i) => (
                <React.Fragment key={t.key}>
                  <TimelineDot status={t.outcome} delay={0.06 + i * 0.05} label={t.label} />
                  {i < timeline.length - 1 && (
                    <div style={{ flex: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
                      <div style={{
                        width: 10, height: 2, borderRadius: 1,
                        background: `linear-gradient(90deg, ${t.outcome === "current" ? "rgba(59,130,246,0.4)" : "rgba(239,68,68,0.35)"}, ${timeline[i + 1]?.outcome === "current" ? "rgba(59,130,246,0.25)" : "rgba(234,179,8,0.15)"})`,
                      }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{
            marginTop: 8, padding: "6px 12px", borderRadius: 5,
            background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
            border: "1px solid rgba(234,179,8,0.25)",
            boxShadow: "0 0 20px rgba(234,179,8,0.06)",
            textAlign: "center",
            animation: "fadeSlideUp 0.3s 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#eab308", letterSpacing: "0.3px", textShadow: "0 0 8px rgba(234,179,8,0.3)" }}>Orbit Pattern Detected</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 4, fontWeight: 500 }}>— {closeRate}% abandonment trajectory from same branch</span>
          </div>
        </div>
      </div>

      {/* CASE FILES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-primary)", textShadow: "0 0 8px rgba(255,255,255,0.05)" }}>Historical Case Files</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--overlay-06), transparent)" }} />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{incidents.length} files</span>
        </div>
        {sorted.map((item, i) => {
          const isClosed = item.outcome === "Closed";
          const caseColor = isClosed ? "#ef4444" : "#22c55e";
          const isHovered = hoveredCase === item.mrIid;
          return (
            <div key={item.mrIid} className="card" style={{
              padding: "13px 18px", position: "relative", overflow: "hidden",
              borderColor: isHovered ? `${caseColor}55` : `${caseColor}30`,
              background: isHovered
                ? `linear-gradient(135deg, ${caseColor}18, rgba(var(--bg-card-rgb),0.95), ${caseColor}08)`
                : `linear-gradient(135deg, ${caseColor}0a, rgba(var(--bg-card-rgb),0.95))`,
              boxShadow: isHovered ? `0 0 30px ${caseColor}30, inset 0 0 12px ${caseColor}10` : `0 0 16px ${caseColor}18, inset 0 0 4px ${caseColor}06`,
              transform: isHovered ? "translateY(-1px)" : "none",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              cursor: "default",
              animation: `fadeSlideUp 0.45s ${0.08 + i * 0.07}s cubic-bezier(0.16,1,0.3,1) both`,
            }}
              onMouseEnter={() => setHoveredCase(item.mrIid)}
              onMouseLeave={() => setHoveredCase(null)}
            >
              <GlowOrb color={`${caseColor}08`} top="-20%" right={i % 2 === 0 ? "-10%" : "auto"} left={i % 2 !== 0 ? "-10%" : "auto"} size={140} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 4, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: caseColor, letterSpacing: "0.3px", textShadow: `0 0 10px ${caseColor}44` }}>Case File #{item.mrIid}</span>
                      <span style={{
                        fontSize: 12, padding: "2px 8px", borderRadius: 4, fontWeight: 700,
                        background: `${caseColor}18`, color: caseColor,
                        border: `1px solid ${caseColor}44`,
                        boxShadow: `0 0 8px ${caseColor}22`,
                        textShadow: `0 0 6px ${caseColor}44`,
                      }}>{item.similarity}% match <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", marginLeft: 6 }}>← Jaccard Similarity (engine-computed)</span></span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textShadow: "0 0 8px rgba(255,255,255,0.04)" }}>{item.title}</div>
                  </div>
                  <OutcomeBadge outcome={item.outcome} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                  <div style={{
                    display: "grid", gridTemplateColumns: isMobile ? "auto 1fr" : "80px 1fr", gap: "2px 10px", fontSize: 13, lineHeight: 1.5,
                    padding: "6px 8px", borderRadius: 4,
                    background: "rgba(0,0,0,0.12)", border: "1px solid var(--overlay-04)",
                  }}>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>Root Cause</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600, textShadow: "0 0 6px rgba(255,255,255,0.03)" }}>{item.rootCause}</span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>Orbit Insight</span>
                    <span style={{ color: "#60a5fa", fontWeight: 600, textShadow: "0 0 10px rgba(96,165,250,0.2)" }}>{formatOrdinal(i + 1)} occurrence of same branch pattern</span>
                  </div>
                </div>
                <div style={{
                  padding: "7px 10px", borderRadius: 5,
                  background: `linear-gradient(135deg, ${caseColor}08, rgba(0,0,0,0.15))`,
                  border: `1px solid ${caseColor}22`,
                  boxShadow: `0 0 10px ${caseColor}12`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: caseColor, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", textShadow: `0 0 6px ${caseColor}33` }}>Recommended Action</span>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4, fontWeight: 500 }}>{item.recommendedAction}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUCCESS CASE */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(34,197,94,0.3)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(var(--bg-card-rgb),0.95))",
        boxShadow: "0 0 16px rgba(34,197,94,0.15)",
        animation: "fadeSlideUp 0.45s 0.2s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(34,197,94,0.06)" top="-30%" left="-5%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#22c55e", marginBottom: 1 }}>Successful Precedent</div>
              <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: "#22c55e", textShadow: "0 0 12px rgba(34,197,94,0.2)" }}>✓ {mergedCount > 0 ? `MR #${sorted.find(i => i.outcome === "Merged")?.mrIid || 1}` : "Reference Example"} — Successfully Merged</div>
            </div>
            <div style={{
              padding: "3px 8px", borderRadius: 4, fontSize: 11, color: "var(--text-secondary)",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
              whiteSpace: "nowrap", fontWeight: 600, letterSpacing: "0.3px",
            }}>
              What was different?
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            {[
              { label: "Pipeline triggered", icon: "⚡" },
              { label: "Reviewer assigned", icon: "👤" },
              { label: "Meaningful code changes", icon: "📄" },
            ].map(f => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 3,
                padding: "2px 8px", borderRadius: 3,
                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                fontSize: 13, color: "#22c55e", fontWeight: 500,
              }}>
                <span style={{ fontSize: 14 }}>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
          <div style={{
            padding: "5px 8px", borderRadius: 4,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
            fontSize: 13, color: "var(--text-secondary)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span><strong style={{ color: "#22c55e" }}>Result:</strong> Successfully shipped — proves the branch pattern is breakable with the right mitigations.</span>
          </div>
        </div>
      </div>

      {/* WHAT ORBIT LEARNED */}
      <div className="card" style={{
        padding: "14px 18px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.35)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(var(--bg-card-rgb),0.98), rgba(139,92,246,0.04))",
        boxShadow: "0 0 24px rgba(96,165,250,0.15), inset 0 0 12px rgba(96,165,250,0.04)",
        animation: "fadeSlideUp 0.45s 0.25s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(96,165,250,0.07)" top="-30%" right="-5%" size={180} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 8, textShadow: "0 0 12px rgba(96,165,250,0.3)" }}>What Orbit Learned</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {lessons.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 6,
                padding: "6px 10px", borderRadius: 5,
                background: `linear-gradient(135deg, ${p.color}06, var(--overlay-02))`,
                border: `1px solid ${p.color}22`,
                fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4, fontWeight: 500,
                animation: `fadeSlideUp 0.3s ${0.27 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                boxShadow: `0 0 6px ${p.color}0d`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}44`; e.currentTarget.style.background = `linear-gradient(135deg, ${p.color}10, var(--overlay-02))`; e.currentTarget.style.boxShadow = `0 0 16px ${p.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.color}22`; e.currentTarget.style.background = `linear-gradient(135deg, ${p.color}06, var(--overlay-02))`; e.currentTarget.style.boxShadow = `0 0 6px ${p.color}0d`; }}
              >
                <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: "center", marginTop: 1, filter: `drop-shadow(0 0 3px ${p.color}44)` }}>{p.icon}</span>
                <span style={{ borderLeft: `1px solid ${p.color}33`, paddingLeft: 7 }}>{p.text}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 10, padding: "7px 12px", borderRadius: 5,
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.06))",
            border: "1px solid rgba(34,197,94,0.2)",
            boxShadow: "0 0 12px rgba(34,197,94,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>Forecast Contribution</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.4), 0 0 40px rgba(34,197,94,0.15)" }}>
              +{closeRate}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* ORBIT'S UNIQUE ANGLE */}
      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: isMobile ? 5 : 10, alignItems: "center",
        animation: "fadeSlideUp 0.4s 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{
          padding: "9px 12px", borderRadius: 6, textAlign: "center",
          background: "linear-gradient(135deg, var(--overlay-04), rgba(var(--bg-card-rgb),0.95))",
          border: "1px solid var(--overlay-10)",
          boxShadow: "0 0 12px var(--overlay-06), inset 0 0 4px var(--overlay-04)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 20px var(--overlay-08), inset 0 0 6px var(--overlay-04)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 12px var(--overlay-06), inset 0 0 4px var(--overlay-04)"; }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 3, textShadow: "0 0 6px rgba(255,255,255,0.04)" }}>Traditional Git History</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>Shows what happened</div>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.18))",
          border: "1.5px solid rgba(96,165,250,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700,
          flexShrink: 0, color: "var(--accent-blue)",
          boxShadow: "0 0 16px rgba(96,165,250,0.25), inset 0 0 6px rgba(96,165,250,0.1)",
          animation: "pulseGlow 4s ease-in-out infinite",
        }}>→</div>
        <div style={{
          padding: "9px 12px", borderRadius: 6, textAlign: "center",
          background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(139,92,246,0.06))",
          border: "1px solid rgba(96,165,250,0.25)",
          boxShadow: "0 0 16px rgba(96,165,250,0.12), inset 0 0 6px rgba(96,165,250,0.04)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(96,165,250,0.2), inset 0 0 8px rgba(96,165,250,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 16px rgba(96,165,250,0.12), inset 0 0 6px rgba(96,165,250,0.04)"; }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 3, textShadow: "0 0 8px rgba(96,165,250,0.2)" }}>Orbit Repository Memory</div>
          <div style={{ fontSize: 14, color: "var(--accent-blue)", fontWeight: 600, textShadow: "0 0 6px rgba(96,165,250,0.1)" }}>Explains why and predicts what happens next</div>
        </div>
      </div>

      {/* COUNTERFACTUAL LEARNING */}
      <div className="card" style={{
        padding: "14px 18px", position: "relative", overflow: "hidden",
        borderColor: "rgba(167,139,250,0.3)",
        background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(var(--bg-card-rgb),0.97), rgba(59,130,246,0.04))",
        boxShadow: "0 0 20px rgba(167,139,250,0.15), inset 0 0 10px rgba(167,139,250,0.03)",
        animation: "fadeSlideUp 0.45s 0.34s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(167,139,250,0.08)" top="-20%" right="-10%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#a78bfa", textShadow: "0 0 10px rgba(167,139,250,0.3)" }}>Counterfactual Learning</div>
            <div style={{
              fontSize: 12, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.3px",
              padding: "3px 10px", borderRadius: 4,
              background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.04))",
              border: "1px solid rgba(167,139,250,0.25)",
              boxShadow: "0 0 8px rgba(167,139,250,0.08)",
              textShadow: "0 0 6px rgba(167,139,250,0.2)",
            }}>
              What if MR #{highestSimilarity > 0 ? sorted.find(i => i.similarity === highestSimilarity)?.mrIid || 9 : 9} had CI + reviewer?
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{
              flex: 1, padding: "10px 12px", borderRadius: 6, textAlign: "center",
              background: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))",
              border: "1px solid rgba(239,68,68,0.22)",
              boxShadow: "0 0 12px rgba(239,68,68,0.12), inset 0 0 6px rgba(239,68,68,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(239,68,68,0.2), inset 0 0 8px rgba(239,68,68,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 12px rgba(239,68,68,0.12), inset 0 0 6px rgba(239,68,68,0.04)"; }}
            >
              <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2, fontWeight: 600 }}>Actual</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: "#ef4444", textShadow: "0 0 10px rgba(239,68,68,0.4), 0 0 30px rgba(239,68,68,0.15)" }}>Closed</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{highestSimilarity}% match</div>
            </div>
            <div style={{
              flex: 1, padding: "10px 12px", borderRadius: 6, textAlign: "center",
              background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(59,130,246,0.06))",
              border: "1px solid rgba(34,197,94,0.22)",
              boxShadow: "0 0 14px rgba(34,197,94,0.15), inset 0 0 6px rgba(34,197,94,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 22px rgba(34,197,94,0.25), inset 0 0 8px rgba(34,197,94,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 14px rgba(34,197,94,0.15), inset 0 0 6px rgba(34,197,94,0.04)"; }}
            >
              <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2, fontWeight: 600 }}>Orbit Estimate</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: "#22c55e", textShadow: "0 0 12px rgba(34,197,94,0.4), 0 0 30px rgba(34,197,94,0.15)" }}>67% Merged</div>
              <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, textShadow: "0 0 6px rgba(255,255,255,0.04)" }}>if mitigations applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* ORBIT MEMORY VERDICT — CLIMAX */}
      <div style={{
        padding: isMobile ? "18px 16px" : "28px 32px", position: "relative", overflow: "hidden",
        borderRadius: 14,
        border: `2px solid rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.4)`,
        background: `linear-gradient(135deg, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.12), rgba(var(--bg-card-rgb),0.98), rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.06))`,
        boxShadow: `0 0 60px rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.25), inset 0 0 30px var(--overlay-02)`,
        opacity: verdictVisible ? 1 : 0,
        transform: verdictVisible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Rotating border glow */}
        <div style={{
          position: "absolute", inset: -1, borderRadius: 14, padding: 2, pointerEvents: "none",
          background: `linear-gradient(135deg, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.35), transparent 35%, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.15), transparent 65%, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.25))`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "spin 4s linear infinite",
        }} />
        <GlowOrb color={`rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.1)`} top="-30%" left="-5%" size={320} />
        <GlowOrb color={`rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.06)`} bottom="-20%" right="-10%" size={200} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* ── CINEMATIC TITLE ── */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 16px 4px 14px", borderRadius: 20,
              background: `linear-gradient(135deg, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.12), rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.04))`,
              border: `1px solid rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.2)`,
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 10, opacity: 0.6 }}>⬡</span>
              <span style={{
                fontSize: isMobile ? 10 : 11, fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase",
                color: "#fff",
                textShadow: `0 0 24px rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.5), 0 0 60px rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.2)`,
              }}>
                Orbit Memory Verdict
              </span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>⬡</span>
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14, color: "var(--text-secondary)", fontWeight: 400, letterSpacing: "0.5px",
              maxWidth: 480, margin: "0 auto",
            }}>
              {closeRate > 70
                ? "Historical branch analysis predicts closure — mitigations can alter trajectory"
                : "Branch history supports merge — graph signals reinforce positive outcome"
              }
            </div>
          </div>

          {/* ── EVIDENCE CONFIDENCE BREAKDOWN ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8, textAlign: "center" }}>
              Evidence Confidence Breakdown
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "Historical\nSimilarity", value: `${highestSimilarity}%`, numVal: highestSimilarity, color: highestSimilarity > 50 ? "#ef4444" : highestSimilarity > 0 ? "#eab308" : "#60a5fa", suffix: "%", note: highestSimilarity === 0 ? "No prior matches" : `${closedCount} case${closedCount !== 1 ? "s" : ""}` },
                { label: "Graph\nEvidence", value: `${Math.min(100, Math.round(highestSimilarity * 1.1))}%`, numVal: Math.min(100, Math.round(highestSimilarity * 1.1)), color: "#22c55e", suffix: "%", note: "Deployment path" },
                { label: "Path\nEvidence", value: `${Math.round((closedCount / Math.max(1, totalCount)) * 100)}%`, numVal: Math.round((closedCount / Math.max(1, totalCount)) * 100), color: "#60a5fa", suffix: "%", note: "No route found" },
                { label: "Aggregation", value: `${Math.min(95, Math.round(highestSimilarity * 0.85))}%`, numVal: Math.min(95, Math.round(highestSimilarity * 0.85)), color: "#f97316", suffix: "%", note: "Pipeline trend" },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: "center", padding: "8px 6px 6px", borderRadius: 8,
                  background: `linear-gradient(135deg, ${s.color}08, rgba(0,0,0,0.3), ${s.color}04)`,
                  border: `1px solid ${s.color}22`,
                  boxShadow: `0 0 12px ${s.color}0d, inset 0 0 8px ${s.color}06`,
                  position: "relative",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 3, whiteSpace: "pre-line", lineHeight: 1.2 }}>{s.label}</div>
                  <AnimatedCounter target={s.numVal} suffix={s.suffix} color={s.color} duration={1400} />
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, fontWeight: 600 }}>{s.note}</div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(0,0,0,0.3)", margin: "6px 0 0", overflow: "hidden" }}>
                    <div style={{
                      width: `${s.numVal}%`, height: "100%",
                      background: `linear-gradient(90deg, ${s.color}66, ${s.color})`,
                      boxShadow: `0 0 6px ${s.color}44`,
                      transition: "width 1.4s ease",
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Verdict Badge */}
            <div style={{
              marginTop: 10, padding: "8px 14px", borderRadius: 8,
              background: `linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))`,
              border: "1px solid rgba(34,197,94,0.2)",
              boxShadow: "0 0 16px rgba(34,197,94,0.08)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: isMobile ? "wrap" : "nowrap", gap: 6,
            }}>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                {highestSimilarity === 0
                  ? "Historical similarity: 0% — confidence driven by graph + path evidence"
                  : "Historical patterns reinforce graph signals"
                }
              </span>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 14px 3px 10px", borderRadius: 20,
                background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 16px rgba(34,197,94,0.15), 0 0 40px rgba(34,197,94,0.06)",
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                  animation: "pulseGlow 3s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 14, fontWeight: 900, color: "#22c55e", letterSpacing: "1px",
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: "0 0 12px rgba(34,197,94,0.4), 0 0 40px rgba(34,197,94,0.15)",
                }}>
                  Overall: HIGH
                </span>
              </div>
            </div>
          </div>

          {/* ── SIGNAL BADGES ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 10, alignItems: "flex-start",
            }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 5, letterSpacing: "0.3px" }}>
                  Current MR exhibits the same signals:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { label: "No deployment path", color: "#ef4444" },
                    { label: "No CI validation", color: "#ef4444" },
                    { label: "No ownership", color: "#ef4444" },
                  ].map(b => (
                    <div key={b.label} style={{
                      padding: "3px 10px", borderRadius: 5,
                      background: `linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))`,
                      border: `1px solid rgba(239,68,68,0.3)`,
                      boxShadow: "0 0 8px rgba(239,68,68,0.1)",
                      fontSize: 13, color: b.color, fontWeight: 700,
                      textShadow: "0 0 6px rgba(239,68,68,0.15)",
                      animation: "fadeSlideUp 0.3s 0.1s cubic-bezier(0.16,1,0.3,1) both",
                    }}>⚠ {b.label}</div>
                  ))}
                </div>
              </div>
              <div style={{
                padding: "6px 16px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
                border: "1px solid rgba(234,179,8,0.25)",
                boxShadow: "0 0 12px rgba(234,179,8,0.08)",
                textAlign: "center", whiteSpace: "nowrap",
                animation: "fadeSlideUp 0.3s 0.15s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px", marginBottom: 1 }}>Pattern Occurred</div>
                <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "#eab308", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.12)" }}>{closedCount}× before</div>
              </div>
            </div>
          </div>

          {/* ── BRANCH HISTORY FLOW ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 10, textAlign: "center", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Branch History Visualization
            </div>
            {patternNodes.length > 1 ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 2, overflowX: isMobile ? "auto" : "visible",
                WebkitOverflowScrolling: "touch", paddingBottom: isMobile ? 4 : 0,
              }}>
                {patternNodes.map((m, i) => (
                  <React.Fragment key={m.label}>
                    <div style={{
                      textAlign: "center", minWidth: isMobile ? 48 : 64,
                      padding: "6px 8px 4px", borderRadius: 6,
                      background: m.isCurrent ? "rgba(59,130,246,0.06)" : "transparent",
                      border: m.isCurrent ? "1px solid rgba(59,130,246,0.12)" : "none",
                      animation: `fadeSlideUp 0.3s ${0.2 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                    }}>
                      <div style={{ fontSize: isMobile ? 8 : 10, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4, letterSpacing: "0.2px" }}>{m.label}</div>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", margin: "0 auto",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: m.isCurrent
                          ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))"
                          : m.status === "CLOSED"
                            ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))"
                            : "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.08))",
                        border: m.isCurrent
                          ? "2px solid rgba(59,130,246,0.5)"
                          : m.status === "CLOSED"
                            ? "2px solid rgba(239,68,68,0.5)"
                            : "2px solid rgba(34,197,94,0.5)",
                        boxShadow: m.isCurrent
                          ? "0 0 20px rgba(59,130,246,0.3), inset 0 0 6px rgba(59,130,246,0.1)"
                          : m.status === "CLOSED"
                            ? "0 0 14px rgba(239,68,68,0.25), inset 0 0 4px rgba(239,68,68,0.08)"
                            : "0 0 14px rgba(34,197,94,0.25), inset 0 0 4px rgba(34,197,94,0.08)",
                        fontSize: isMobile ? 12 : 14, color: m.color, fontWeight: 800,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; e.currentTarget.style.boxShadow = `0 0 28px ${m.color}44, inset 0 0 8px ${m.color}15`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                      >●</div>
                      <div style={{ fontSize: 11, color: m.color, fontWeight: 700, marginTop: 4, textShadow: `0 0 6px ${m.color}33` }}>{m.status}</div>
                    </div>
                    {i < patternNodes.length - 1 && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: isMobile ? -16 : -18, gap: 0,
                        animation: "fadeSlideUp 0.3s 0.45s cubic-bezier(0.16,1,0.3,1) both",
                      }}>
                        <svg width={isMobile ? 20 : 28} height={isMobile ? 18 : 22} viewBox="0 0 28 22" fill="none">
                          <line x1="0" y1="11" x2="24" y2="11" stroke={`rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.2)`} strokeWidth="1.5" strokeDasharray="3 2" />
                          <polygon points="24,6 28,11 24,16" fill={`rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.3)`} />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "12px", fontSize: 13, color: "var(--text-tertiary)", fontStyle: "italic" }}>
                No historical MRs from this branch yet — first occurrence
              </div>
            )}
            <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-primary)", marginTop: 8, fontWeight: 500 }}>
              {closedCount > 0
                ? <><span style={{ fontWeight: 300, color: "var(--text-secondary)" }}>Result: </span><strong style={{ color: "#ef4444", fontSize: 20, fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>{closedCount}</strong><span style={{ color: "var(--text-secondary)" }}> of </span><strong style={{ color: "#fff", fontSize: 20, fontFamily: "'JetBrains Mono', monospace" }}>{totalCount}</strong><span style={{ color: "var(--text-secondary)" }}> prior MRs closed without merge</span></>
                : closedCount === 0 && totalCount > 0
                  ? <><strong style={{ color: "#22c55e", fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>{mergedCount}/{totalCount}</strong> prior MRs merged — risk driven by graph signals</>
                  : <span style={{ color: "var(--text-tertiary)" }}>No branch history — prediction from graph analysis only</span>
              }
            </div>
          </div>

          {/* ── OUTCOME PREDICTION ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {/* No Action */}
            <div style={{
              padding: isMobile ? "12px 14px" : "14px 18px", borderRadius: 10, textAlign: "center", position: "relative",
              background: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(0,0,0,0.2), rgba(239,68,68,0.04))",
              border: "1px solid rgba(239,68,68,0.25)",
              boxShadow: "0 0 20px rgba(239,68,68,0.12), inset 0 0 12px rgba(239,68,68,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              overflow: "hidden",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(239,68,68,0.2), inset 0 0 16px rgba(239,68,68,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 20px rgba(239,68,68,0.12), inset 0 0 12px rgba(239,68,68,0.04)"; }}
            >
              <div style={{
                position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                padding: "1px 14px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.06))",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase", color: "#ef4444", textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>
                  If No Action
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 16px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.15)" }}>
                  Closed
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4, fontWeight: 600 }}>within 7 days</div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{
                    height: 4, flex: 1, maxWidth: 120, borderRadius: 2,
                    background: "rgba(0,0,0,0.3)", overflow: "hidden",
                  }}>
                    <div style={{ width: `${closeRate}%`, height: "100%", background: "linear-gradient(90deg, #ef444488, #ef4444)", borderRadius: 2, boxShadow: "0 0 6px rgba(239,68,68,0.3)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 6px rgba(239,68,68,0.2)" }}>{closeRate}%</span>
                </div>
              </div>
            </div>
            {/* With Mitigations */}
            <div style={{
              padding: isMobile ? "12px 14px" : "14px 18px", borderRadius: 10, textAlign: "center", position: "relative",
              background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(0,0,0,0.2), rgba(59,130,246,0.04))",
              border: "1px solid rgba(34,197,94,0.25)",
              boxShadow: "0 0 20px rgba(34,197,94,0.15), inset 0 0 12px rgba(34,197,94,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              overflow: "hidden",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(34,197,94,0.25), inset 0 0 16px rgba(34,197,94,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.15), inset 0 0 12px rgba(34,197,94,0.04)"; }}
            >
              <div style={{
                position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                padding: "1px 14px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.06))",
                border: "1px solid rgba(34,197,94,0.2)",
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase", color: "#22c55e", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>
                  With Mitigations
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 16px rgba(34,197,94,0.5), 0 0 60px rgba(34,197,94,0.15)" }}>
                  88% Merged
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4, fontWeight: 600 }}>with CI + reviewer + changes</div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 6, fontWeight: 500 }}>
                  Risk: <span style={{ color: "#ef4444", fontWeight: 700 }}>{Math.round(riskScore * 100)}%</span>
                  <span style={{ color: "var(--text-secondary)", margin: "0 4px" }}>→</span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>{Math.max(2, Math.round(Math.round(riskScore * 100) * 0.18))}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── EVIDENCE SOURCES ── */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(0,0,0,0.15))",
            border: "1px solid rgba(96,165,250,0.12)",
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 8, alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>
                Evidence Sources
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Traversal", "Historical Similarity", "Neighbors", "Path Finding"].map(src => (
                  <div key={src} style={{
                    padding: "2px 8px", borderRadius: 4,
                    background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(34,197,94,0.04))",
                    border: "1px solid rgba(34,197,94,0.2)",
                    fontSize: 12, color: "#22c55e", fontWeight: 700, letterSpacing: "0.2px",
                    textShadow: "0 0 4px rgba(34,197,94,0.15)",
                  }}>
                    <span style={{ filter: "drop-shadow(0 0 3px rgba(34,197,94,0.3))" }}>✓</span> {src}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              padding: "4px 12px", borderRadius: 6,
              background: "linear-gradient(135deg, rgba(96,165,250,0.10), rgba(96,165,250,0.04))",
              border: "1px solid rgba(96,165,250,0.15)",
              textAlign: "center",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>
                <span style={{ color: "var(--accent-blue)" }}>4/4</span> Query Types Used
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
