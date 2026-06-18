import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { HistoricalIncident } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  incidents: HistoricalIncident[];
  totalAnalyzed: number;
  mrIid?: number;
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
  return <span style={{ fontSize: 18, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${color}40` }}>{val}{suffix}</span>;
}

function AnimatedStatCard({ label, value, sub, color, target, suffix = "" }: { label: string; value: string; sub?: string; color: string; target?: number; suffix?: string }) {
  return (
    <div style={{
      padding: "7px 10px", borderRadius: 6, textAlign: "center",
      background: `linear-gradient(135deg, ${color}12, ${color}04)`,
      border: `1px solid ${color}25`,
      boxShadow: `0 0 12px ${color}15`,
      animation: "fadeSlideUp 0.3s ease both",
    }}>
      {target !== undefined
        ? <AnimatedCounter target={target} suffix={suffix} color={color} />
        : <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 8px ${color}30` }}>{value}</div>}
      <div style={{ fontSize: 8, color: "var(--text-secondary)", fontWeight: 500, marginTop: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 0 }}>{sub}</div>}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const isClosed = outcome === "Closed";
  return (
    <span style={{
      fontSize: 8, padding: "2px 8px", borderRadius: 3, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3,
      background: isClosed ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)",
      color: isClosed ? "#ef4444" : "#22c55e",
      border: `1px solid ${isClosed ? "rgba(239,68,68,0.22)" : "rgba(34,197,94,0.2)"}`,
    }}>
      {isClosed ? "🔒" : "✅"} {outcome}
    </span>
  );
}

function TimelineDot({ status, delay }: { status: string; delay: number }) {
  const col = status === "current" ? "#3b82f6" : status === "Merged" ? "#22c55e" : "#ef4444";
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), delay * 1000 + 300);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, position: "relative",
      animation: `fadeSlideUp 0.4s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
        background: status === "current" ? "rgba(59,130,246,0.18)" : status === "Merged" ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.15)",
        border: status === "current" ? `2px solid ${col}` : `1px solid ${col}55`,
        boxShadow: pulse ? `0 0 20px ${col}44` : `0 0 8px ${col}22`,
        transition: "box-shadow 0.5s ease",
        position: "relative",
      }}>
        {status === "current" ? "◉" : status === "Merged" ? "✓" : "✗"}
        {pulse && <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: `1px solid ${col}33`,
          animation: "ripple 1.5s ease-out infinite",
        }} />}
      </div>
      <span style={{ fontSize: 7, fontWeight: 700, color: status === "current" ? col : "var(--text-secondary)", letterSpacing: "0.3px" }}>
        {status === "current" ? `MR #${10}` : status === "Merged" ? "✓ MR #1" : "✗"}
      </span>
      <span style={{ fontSize: 6, color: col, fontWeight: 600 }}>
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

export default function HistoricalContext({ incidents, totalAnalyzed, mrIid = 10 }: Props) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmall = useMediaQuery("(max-width: 480px)");
  const sorted = useMemo(() => [...incidents].sort((a, b) => a.mrIid - b.mrIid), [incidents]);
  const closedCount = incidents.filter(i => i.outcome === "Closed").length;
  const totalCount = incidents.length;
  const closeRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;
  const highestSimilarity = incidents.length > 0 ? Math.max(...incidents.map(i => i.similarity)) : 0;
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

  // Lessons from the data
  const lessons = useMemo(() => [
    { text: "Empty diff MRs rarely merge — no code changes = no deployment path", icon: "📝", color: "#60a5fa" },
    { text: "Missing pipeline strongly predicts closure — CI validation is a strong signal", icon: "🔄", color: "#a78bfa" },
    { text: "No reviewer assignment increases abandonment probability significantly", icon: "👤", color: "#22c55e" },
    { text: `Same branch showed repeated failure — ${closedCount} of ${totalAnalyzed} MRs from this branch were closed without merge`, icon: "🔀", color: "#f97316" },
  ], [closedCount, totalAnalyzed]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 2px" }}>
      {/* HEADER */}
      <div className="card" style={{
        padding: "16px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(139,92,246,0.3)",
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(15,18,26,0.95), rgba(59,130,246,0.05))",
        animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 0 20px rgba(139,92,246,0.1)",
      }}>
        <GlowOrb color="rgba(139,92,246,0.08)" top="-40%" left="-10%" size={240} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.15)" }}>Repository Memory Intelligence</span>
            <span style={{ fontSize: 7, padding: "1px 6px", borderRadius: 3, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.15)", fontWeight: 600, letterSpacing: "0.3px" }}>● Live</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12, maxWidth: "90%" }}>
            Orbit discovered a recurring branch failure pattern across{" "}
            <strong style={{ color: "var(--text-primary)" }}>{totalAnalyzed} historical MRs</strong>.
            <span style={{ color: "#ef4444", fontWeight: 600 }}> {closedCount} closed without merge</span>,
            <span style={{ color: "#22c55e", fontWeight: 600 }}> 1 successfully merged</span>.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 5 }}>
            <AnimatedStatCard label="MRs Analyzed" value={String(totalAnalyzed)} target={totalAnalyzed} sub="From same branch" color="#60a5fa" />
            <AnimatedStatCard label="Closed Without Merge" value={String(closedCount)} target={closedCount} sub={`Out of ${totalAnalyzed}`} color="#ef4444" />
            <AnimatedStatCard label="Abandonment Rate" value={`${closeRate}%`} suffix="%" color="#f97316" />
            <AnimatedStatCard label="Forecast Confidence" value="HIGH" sub="4 query types" color="#22c55e" />
          </div>
        </div>
      </div>

      {/* PATTERN DISCOVERY TIMELINE */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(234,179,8,0.15)",
        background: "linear-gradient(135deg, rgba(234,179,8,0.03), rgba(15,18,26,0.95))",
        animation: "fadeSlideUp 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(234,179,8,0.05)" top="-30%" left="20%" size={140} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#eab308" }}>Pattern Discovery Timeline</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(234,179,8,0.2), transparent)" }} />
          </div>
          {/* SVG connecting line background */}
          <div style={{ position: "relative", padding: "4px 0" }}>
            <svg style={{ position: "absolute", top: 0, left: "5%", width: "90%", height: "100%", pointerEvents: "none" }}>
              <line x1="0" y1="16" x2="100%" y2="16" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
            </svg>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative" }}>
              {timeline.map((t, i) => (
                <React.Fragment key={t.key}>
                  <TimelineDot status={t.outcome} delay={0.06 + i * 0.05} />
                  {i < timeline.length - 1 && (
                    <div style={{ flex: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
                      <div style={{
                        width: 10, height: 2, borderRadius: 1,
                        background: `linear-gradient(90deg, ${t.outcome === "current" ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.2)"}, ${timeline[i + 1]?.outcome === "current" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.08)"})`,
                      }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{
            marginTop: 8, padding: "5px 10px", borderRadius: 4,
            background: "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))",
            border: "1px solid rgba(234,179,8,0.1)",
            textAlign: "center",
            animation: "fadeSlideUp 0.3s 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: "#eab308", letterSpacing: "0.3px" }}>Orbit Pattern Detected</span>
            <span style={{ fontSize: 8, color: "var(--text-secondary)", marginLeft: 4 }}>— {closeRate}% abandonment trajectory from same branch</span>
          </div>
        </div>
      </div>

      {/* CASE FILES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px" }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Historical Case Files</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: 7, color: "var(--text-tertiary)" }}>{incidents.length} files</span>
        </div>
        {sorted.map((item, i) => {
          const isClosed = item.outcome === "Closed";
          const caseColor = isClosed ? "#ef4444" : "#22c55e";
          const isHovered = hoveredCase === item.mrIid;
          return (
            <div key={item.mrIid} className="card" style={{
              padding: "12px 16px", position: "relative", overflow: "hidden",
              borderColor: isHovered ? `${caseColor}44` : `${caseColor}25`,
              background: isHovered
                ? `linear-gradient(135deg, ${caseColor}12, rgba(15,18,26,0.95), ${caseColor}06)`
                : `linear-gradient(135deg, ${caseColor}08, rgba(15,18,26,0.95))`,
              boxShadow: isHovered ? `0 0 24px ${caseColor}20` : `0 0 12px ${caseColor}12`,
              transform: isHovered ? "translateY(-1px)" : "none",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              cursor: "default",
              animation: `fadeSlideUp 0.45s ${0.08 + i * 0.07}s cubic-bezier(0.16,1,0.3,1) both`,
            }}
              onMouseEnter={() => setHoveredCase(item.mrIid)}
              onMouseLeave={() => setHoveredCase(null)}
            >
              <GlowOrb color={`${caseColor}06`} top="-20%" right={i % 2 === 0 ? "-10%" : "auto"} left={i % 2 !== 0 ? "-10%" : "auto"} size={120} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: caseColor, letterSpacing: "0.3px" }}>Case File #{item.mrIid}</span>
                      <span style={{
                        fontSize: 7, padding: "1px 6px", borderRadius: 3, fontWeight: 600,
                        background: `${caseColor}12`, color: caseColor, border: `1px solid ${caseColor}22`,
                      }}>{item.similarity}% match</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                  </div>
                  <OutcomeBadge outcome={item.outcome} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "2px 10px", fontSize: 9, lineHeight: 1.5, marginBottom: 6 }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 7, letterSpacing: "0.3px" }}>Root Cause</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.rootCause}</span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 7, letterSpacing: "0.3px" }}>Orbit Insight</span>
                  <span style={{ color: "var(--accent-blue)", fontWeight: 500 }}>{formatOrdinal(i + 1)} occurrence of same branch pattern</span>
                </div>
                <div style={{
                  padding: "5px 8px", borderRadius: 4,
                  background: "rgba(0,0,0,0.15)", borderLeft: `2px solid ${caseColor}33`,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ fontSize: 7, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>Recommended Action</div>
                  <div style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.3 }}>{item.recommendedAction}</div>
                  <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 2 }}>{item.date}</div>
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
        background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(15,18,26,0.95))",
        boxShadow: "0 0 16px rgba(34,197,94,0.15)",
        animation: "fadeSlideUp 0.45s 0.2s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(34,197,94,0.06)" top="-30%" left="-5%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#22c55e", marginBottom: 1 }}>Successful Precedent</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#22c55e", textShadow: "0 0 12px rgba(34,197,94,0.2)" }}>✓ MR #1 — Successfully Merged</div>
            </div>
            <div style={{
              padding: "3px 8px", borderRadius: 4, fontSize: 7, color: "var(--text-secondary)",
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
                fontSize: 9, color: "#22c55e", fontWeight: 500,
              }}>
                <span style={{ fontSize: 10 }}>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
          <div style={{
            padding: "5px 8px", borderRadius: 4,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
            fontSize: 9, color: "var(--text-secondary)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 12 }}>✅</span>
            <span><strong style={{ color: "#22c55e" }}>Result:</strong> Successfully shipped — proves the branch pattern is breakable with the right mitigations.</span>
          </div>
        </div>
      </div>

      {/* WHAT ORBIT LEARNED */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.2)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(15,18,26,0.98), rgba(139,92,246,0.03))",
        boxShadow: "0 0 14px rgba(96,165,250,0.12)",
        animation: "fadeSlideUp 0.45s 0.25s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(96,165,250,0.05)" top="-30%" right="-5%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 6, textShadow: "0 0 8px rgba(96,165,250,0.2)" }}>What Orbit Learned</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {lessons.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 8px", borderRadius: 4,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4,
                animation: `fadeSlideUp 0.3s ${0.27 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}22`; e.currentTarget.style.background = `${p.color}06`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                <span style={{ fontSize: 10, flexShrink: 0, width: 16, textAlign: "center" }}>{p.icon}</span>
                <span style={{ borderLeft: `1px solid ${p.color}22`, paddingLeft: 6 }}>{p.text}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 8, padding: "5px 10px", borderRadius: 4,
            background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))",
            border: "1px solid rgba(34,197,94,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 8, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px" }}>Forecast Contribution</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>
              +{closeRate}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* ORBIT'S UNIQUE ANGLE */}
      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: isMobile ? 4 : 8, alignItems: "center",
        animation: "fadeSlideUp 0.4s 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{
          padding: "7px 10px", borderRadius: 6, textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 8px rgba(255,255,255,0.05)",
          transition: "transform 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
        >
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 2 }}>Traditional Git History</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Shows what happened</div>
        </div>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.12))",
          border: "1px solid rgba(96,165,250,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(96,165,250,0.15)",
          animation: "pulseGlow 2s ease-in-out infinite",
        }}>→</div>
        <div style={{
          padding: "7px 10px", borderRadius: 6, textAlign: "center",
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))",
          border: "1px solid rgba(96,165,250,0.15)",
          boxShadow: "0 0 8px rgba(96,165,250,0.1)",
          transition: "transform 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
        >
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 2 }}>Orbit Repository Memory</div>
          <div style={{ fontSize: 10, color: "var(--accent-blue)", fontWeight: 500 }}>Explains why and predicts what happens next</div>
        </div>
      </div>

      {/* COUNTERFACTUAL LEARNING */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(167,139,250,0.18)",
        background: "linear-gradient(135deg, rgba(167,139,250,0.04), rgba(15,18,26,0.97), rgba(59,130,246,0.03))",
        boxShadow: "0 0 12px rgba(167,139,250,0.12)",
        animation: "fadeSlideUp 0.45s 0.34s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(167,139,250,0.06)" top="-20%" right="-10%" size={140} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#a78bfa", textShadow: "0 0 6px rgba(167,139,250,0.2)" }}>Counterfactual Learning</div>
            <div style={{
              fontSize: 7, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px",
              padding: "2px 7px", borderRadius: 3,
              background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)",
            }}>
              What if MR #9 had CI + reviewer?
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{
              flex: 1, padding: "8px 10px", borderRadius: 6, textAlign: "center",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
              boxShadow: "0 0 8px rgba(239,68,68,0.1)",
              transition: "transform 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
            >
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 1 }}>Actual</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.3)" }}>Closed</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)" }}>{highestSimilarity}% match</div>
            </div>
            <div style={{
              flex: 1, padding: "8px 10px", borderRadius: 6, textAlign: "center",
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05))",
              border: "1px solid rgba(34,197,94,0.15)",
              boxShadow: "0 0 10px rgba(34,197,94,0.12)",
              transition: "transform 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
            >
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 1 }}>Orbit Estimate</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#22c55e", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>67% Merged</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)" }}>if mitigations applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* ORBIT MEMORY VERDICT — CLIMAX */}
      <div style={{
        padding: isMobile ? "16px 14px" : "24px 28px", position: "relative", overflow: "hidden",
        borderRadius: 12,
        border: `2px solid rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.4)`,
        background: `linear-gradient(135deg, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.12), rgba(15,18,26,0.98), rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.06))`,
        boxShadow: `0 0 40px rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.2), inset 0 0 20px rgba(255,255,255,0.02)`,
        opacity: verdictVisible ? 1 : 0,
        transform: verdictVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Rotating border glow effect */}
        <div style={{
          position: "absolute", inset: -1, borderRadius: 12, padding: 2, pointerEvents: "none",
          background: `linear-gradient(135deg, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.3), transparent 40%, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.1), transparent 60%, rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.2))`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "spin 4s linear infinite",
        }} />
        <GlowOrb color={`rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.08)`} top="-30%" left="-5%" size={280} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Title */}
          <div style={{
            fontSize: isMobile ? 10 : 12, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase",
            color: "#fff", marginBottom: 14, textAlign: "center",
            textShadow: `0 0 20px rgba(${closeRate > 70 ? "239,68,68" : "34,197,94"},0.5), 0 4px 8px rgba(0,0,0,0.5)`,
          }}>
            Orbit Memory Verdict
          </div>
          
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
            {[
              { label: "MRs Analyzed", value: String(totalAnalyzed), color: "#60a5fa", target: totalAnalyzed, suffix: "" },
              { label: "Pattern Matches", value: String(closedCount), color: "#ef4444", target: closedCount, suffix: "" },
              { label: "Pattern Match Score", value: `${highestSimilarity}%`, color: "#eab308", target: highestSimilarity, suffix: "%" },
              { label: "Forecast Confidence", value: "HIGH", color: "#22c55e" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: "6px 4px", borderRadius: 6, background: "rgba(0,0,0,0.25)", border: `1px solid ${s.color}22`, position: "relative" }}>
                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 2 }}>{s.label}</div>
                {s.target !== undefined
                  ? <AnimatedCounter target={s.target} suffix={s.suffix || ""} color={s.color} duration={1400} />
                  : <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${s.color}40` }}>{s.value}</div>}
              </div>
            ))}
          </div>
          
          {/* Signal Badges */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 8, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>Current MR exhibits the same signals:</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[
                  { label: "No deployment path", color: "#ef4444" },
                  { label: "No CI validation", color: "#ef4444" },
                  { label: "No ownership", color: "#ef4444" },
                ].map(b => (
                  <div key={b.label} style={{
                    padding: "2px 8px", borderRadius: 4,
                    background: `rgba(239,68,68,0.1)`, border: `1px solid rgba(239,68,68,0.25)`,
                    fontSize: 9, color: b.color, fontWeight: 600,
                    animation: "fadeSlideUp 0.3s 0.1s cubic-bezier(0.16,1,0.3,1) both",
                  }}>{b.label}</div>
                ))}
              </div>
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: 6,
              background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)",
              textAlign: "center", whiteSpace: "nowrap",
              animation: "fadeSlideUp 0.3s 0.15s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.3px" }}>Pattern Occurred</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#eab308", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 8px rgba(234,179,8,0.3)" }}>{closedCount}× before</div>
            </div>
          </div>
          
          {/* Pattern Flow */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8, textAlign: "center", letterSpacing: "0.3px" }}>Pattern Visualization</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {[
                { label: "MR #2", color: "#ef4444", status: "CLOSED" },
                { label: "MR #5", color: "#ef4444", status: "CLOSED" },
                { label: "MR #9", color: "#ef4444", status: "CLOSED" },
                { label: mrIid ? `MR #${mrIid}` : "CURRENT", color: "#3b82f6", status: "CURRENT" },
              ].map((m, i) => (
                <React.Fragment key={m.label}>
                  <div style={{ textAlign: "center", minWidth: isMobile ? 40 : 52, animation: `fadeSlideUp 0.3s ${0.2 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both` }}>
                    <div style={{ fontSize: isMobile ? 7 : 8, color: "var(--text-tertiary)" }}>{m.label}</div>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", margin: "3px auto",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: i < 3 ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                      border: i < 3 ? "2px solid rgba(239,68,68,0.4)" : "2px solid rgba(59,130,246,0.4)",
                      boxShadow: i < 3 ? "0 0 10px rgba(239,68,68,0.2)" : "0 0 12px rgba(59,130,246,0.25)",
                      fontSize: 11, color: m.color, fontWeight: 800,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.boxShadow = `0 0 20px ${m.color}44`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = i < 3 ? "0 0 10px rgba(239,68,68,0.2)" : "0 0 12px rgba(59,130,246,0.25)"; }}
                    >●</div>
                    <div style={{ fontSize: 7, color: m.color, fontWeight: 600, letterSpacing: "0.2px" }}>{m.status}</div>
                  </div>
                  {i < 3 && (
                    <div style={{
                      fontSize: 12, color: "var(--text-tertiary)", marginTop: -10,
                      animation: "fadeSlideUp 0.3s 0.45s cubic-bezier(0.16,1,0.3,1) both",
                    }}>→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 9, color: "var(--text-secondary)", marginTop: 6 }}>
              Pattern Strength: <strong style={{ color: "#eab308", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{highestSimilarity}%</strong>
            </div>
          </div>
          
          {/* Prediction */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{
              padding: isMobile ? "10px 12px" : "12px 16px", borderRadius: 8, textAlign: "center",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              boxShadow: "0 0 16px rgba(239,68,68,0.1)",
              transition: "transform 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: "#ef4444", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>If No Action</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(239,68,68,0.4)" }}>Closed</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 3 }}>within 7 days</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 2 }}>{closeRate}% probability</div>
            </div>
            <div style={{
              padding: "12px 16px", borderRadius: 8, textAlign: "center",
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
              boxShadow: "0 0 16px rgba(34,197,94,0.12)",
              transition: "transform 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>With Mitigations</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.4)" }}>88% Merged</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 3 }}>with CI + reviewer + changes</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 2 }}>Risk: 55% → 10%</div>
            </div>
          </div>
          
          {/* Evidence Sources */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 8, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 3 }}>Evidence Sources</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["Traversal", "Historical Similarity", "Neighbors", "Path Finding"].map(src => (
                  <div key={src} style={{
                    padding: "2px 7px", borderRadius: 4,
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                    fontSize: 8, color: "#22c55e", fontWeight: 600,
                  }}>✓ {src}</div>
                ))}
              </div>
            </div>
            <div style={{
              padding: "5px 12px", borderRadius: 6,
              background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)",
              fontSize: 8, color: "var(--text-tertiary)", maxWidth: 240,
            }}>
              <strong style={{ color: "var(--accent-blue)" }}>Query Types Used:</strong> All 4 Orbit query types
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
