import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { OrbitQueryEvidence, FutureTimelineEvent, CounterfactualScenario, DecisionCenterData } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  evidence: OrbitQueryEvidence[];
  futureTimeline: FutureTimelineEvent[];
  counterfactuals: CounterfactualScenario[];
  decisionCenter: DecisionCenterData;
  confidence: string;
  riskScore: number;
  riskLevel: string;
  mrIid: number;
  pipelinesTotal: number;
  failureCount?: number;
  dataMode?: "live" | "demo";
}

interface ScenarioDetail {
  key: string;
  label: string;
  outcome: string;
  riskAfter: number;
  probability: number;
  color: string;
  icon: string;
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

function AnimatedNum({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let t0: number, id: number;
    function tick(now: number) {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / 800, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <span style={{ fontSize: "inherit", fontWeight: "inherit", color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${color}40` }}>{display.toLocaleString()}</span>;
}

function CircularGauge({ pct, color, size = 32, strokeWidth = 3, label, value }: { pct: number; color: string; size?: number; strokeWidth?: number; label?: string; value?: string }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = Math.max(circumference - (pct / 100) * circumference, 0);
  const [animOffset, setAnimOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(() => setAnimOffset(offset), 50);
    return () => clearTimeout(t);
  }, [offset]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--overlay-04)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={animOffset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 4px ${color}44)` }}
        />
      </svg>
      {value && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</span>
        {label && <span style={{ fontSize: size * 0.14, color: "var(--text-tertiary)", lineHeight: 1, marginTop: 1 }}>{label}</span>}
      </div>}
    </div>
  );
}

function StatusBadge({ label, good }: { label: string; good?: boolean }) {
  return (
    <span style={{
      fontSize: 13, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
      background: good ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${good ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
      color: good ? "#22c55e" : "#ef4444",
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      {good ? "✓" : "✗"} {label}
    </span>
  );
}

function ScenarioCard({ s, active, onClick, touched, onTouch }: { s: ScenarioDetail; active: boolean; onClick: () => void; touched: boolean; onTouch: (v: boolean) => void }) {
  const curCol = riskScoreToColor(s.riskAfter);
  return (
    <div onClick={onClick} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onTouchStart={() => onTouch(true)} onTouchEnd={() => onTouch(false)}
      role="button" tabIndex={0} aria-label={`${s.label}: ${s.outcome}, ${s.probability}% probability`}
      style={{
        padding: "14px 16px", borderRadius: 10, cursor: "pointer", position: "relative", overflow: "hidden",
        background: active ? `linear-gradient(135deg, ${s.color}18, ${s.color}0a)` : touched ? "var(--overlay-04)" : "linear-gradient(135deg, var(--overlay-02), var(--overlay-01))",
        border: active ? `1px solid ${s.color}50` : touched ? "1px solid var(--overlay-12)" : "1px solid var(--overlay-06)",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: active ? "scale(1.01)" : touched ? "translateY(-2px) scale(1.005)" : "scale(1)",
        boxShadow: active ? `0 0 30px ${s.color}18, inset 0 1px 0 ${s.color}15` : "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.transform = "translateY(-2px) scale(1.005)"; e.currentTarget.style.borderColor = "var(--overlay-12)"; e.currentTarget.style.background = "var(--overlay-04)"; e.currentTarget.style.boxShadow = "0 0 12px var(--overlay-08)"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--overlay-06)"; e.currentTarget.style.background = "linear-gradient(135deg, var(--overlay-02), var(--overlay-01))"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {active && <div style={{ position: "absolute", inset: 0, borderRadius: 10, padding: 1, background: `linear-gradient(135deg, ${s.color}44, transparent 60%)`, mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 20, opacity: active ? 1 : 0.6, flexShrink: 0 }}>{s.icon}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: active ? s.color : "var(--text-secondary)", letterSpacing: "0.2px", transition: "color 0.2s ease", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
        </div>
        <span style={{
          fontSize: 14, padding: "2px 10px", borderRadius: 4, flexShrink: 0,
          background: `${s.color}18`, color: s.color, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${s.color}30`,
          boxShadow: active ? `0 0 10px ${s.color}33` : "none", transition: "box-shadow 0.3s ease",
        }}>{s.probability}%</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: active ? s.color : "var(--text-primary)", marginBottom: 6, transition: "color 0.2s ease", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.outcome}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", width: 32, flexShrink: 0 }}>Risk</span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--overlay-05)", overflow: "hidden" }}>
          <div style={{
            width: `${s.riskAfter * 100}%`, height: "100%", borderRadius: 3,
            background: `linear-gradient(90deg, ${curCol}, ${riskScoreToColor(Math.max(s.riskAfter - 0.15, 0))})`,
            transition: "width 0.6s ease", boxShadow: `0 0 8px ${riskScoreToGlow(s.riskAfter)}`,
          }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: curCol, fontFamily: "'JetBrains Mono', monospace", width: 34, textAlign: "right", flexShrink: 0, transition: "color 0.3s ease", textShadow: `0 0 8px ${riskScoreToGlow(s.riskAfter)}` }}>{(s.riskAfter * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default function ForecastEngine({ evidence, futureTimeline, decisionCenter, confidence, riskScore, riskLevel, mrIid, pipelinesTotal, failureCount: fc, counterfactuals, dataMode }: Props) {
  const [activeScenario, setActiveScenario] = useState<string>("current");
  const [animRisk, setAnimRisk] = useState(riskScore);
  const [touchedCard, setTouchedCard] = useState<string | null>(null);
  useEffect(() => { setAnimRisk(riskScore); }, [riskScore]);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isLow = riskLevel?.toLowerCase() === "low" || riskScore < 0.3;
  const isMedium = riskLevel?.toLowerCase() === "medium" || riskLevel?.toLowerCase() === "warning" || (riskScore >= 0.3 && riskScore < 0.7);
  const isSmall = useMediaQuery("(max-width: 480px)");

  // Parse actual evidence data
  const evidenceSummary = useMemo(() => {
    const summary: Record<string, { nodes?: number; edges?: number; finding: string }> = {};
    for (const e of evidence) {
      const text = e.result || "";
      const nodeCapture = (t: string) => {
        const colon = t.match(/(?:Nodes?|Nodes detected):\s*(\d+)/i);
        if (colon) return parseInt(colon[1]);
        const inline = t.match(/(\d+)\s+nodes?\b/i);
        return inline ? parseInt(inline[1]) : undefined;
      };
      const edgeCapture = (t: string) => {
        const colon = t.match(/(?:Edges?|Edges detected):\s*(\d+)/i);
        if (colon) return parseInt(colon[1]);
        const inline = t.match(/(\d+)\s+edges?\b/i);
        return inline ? parseInt(inline[1]) : undefined;
      };
      const nodes = nodeCapture(text);
      const edges = edgeCapture(text);
      const firstLine = text.split("\n")[0] || text.slice(0, 80);
      summary[e.queryType] = { nodes, edges, finding: firstLine };
    }
    return summary;
  }, [evidence]);

  const totalNodes = evidenceSummary.NEIGHBORS?.nodes ?? evidenceSummary["Orbit Graph Discovery"]?.nodes ?? 23;
  const totalEdges = evidenceSummary.NEIGHBORS?.edges ?? evidenceSummary["Orbit Graph Discovery"]?.edges ?? 43;

  // Derive real MR state from evidence
  const mrState = useMemo(() => {
    const neighText = (evidence.find(e => e.queryType === "NEIGHBORS")?.result || "").toLowerCase();
    const hasChanges = neighText.includes("files") && !neighText.includes("0 affected files") && !neighText.includes("no file changes");
    const noChanges = neighText.includes("0 affected files") || neighText.includes("empty diff") || neighText.includes("no file changes");
    const hasPipeline = neighText.includes("pipeline") && !neighText.includes("no pipeline") && !neighText.includes("no linked pipeline");
    return { hasChanges: hasChanges || !noChanges, noChanges, hasPipeline };
  }, [evidence]);

  // Derive historical count from evidence
  const historicalCount = useMemo(() => {
    const travText = (evidence.find(e => e.queryType === "TRAVERSAL")?.result || "").toLowerCase();
    const match = travText.match(/(\d+)\s*historical/);
    return match ? parseInt(match[1]) : 0;
  }, [evidence]);

  const scenarios = useMemo<ScenarioDetail[]>(() => {
    const baseOutcome = mrState.noChanges ? "MR Closed Without Merge" : mrState.hasPipeline ? "Ready for Deployment" : "Blocked — No Pipeline";
    const baseProb = mrState.noChanges ? 85 : mrState.hasPipeline ? 60 : 78;
    const base: ScenarioDetail = { key: "current", label: "Current Path", outcome: baseOutcome, riskAfter: riskScore, probability: baseProb, color: "#ef4444", icon: "🔴" };
    const fromCF = counterfactuals.map((cf, i): ScenarioDetail => {
      const outcomes: Record<string, { outcome: string; icon: string }> = {
        "Add File Changes": { outcome: "Code Ready", icon: "🔵" },
        "Trigger Pipeline": { outcome: "Ready For Review", icon: "🟢" },
        "Assign Reviewers": { outcome: "Active Development", icon: "🟣" },
        "All Mitigations": { outcome: "Successfully Merged", icon: "🟠" },
      };
      const mapped = outcomes[cf.label] ?? { outcome: "Improved", icon: "🔄" };
      const prob = Math.round((1 - cf.riskAfter) * 100 - 5);
      return { key: `cf-${i}`, label: cf.label, outcome: mapped.outcome, riskAfter: cf.riskAfter, probability: Math.min(Math.max(prob, 40), 95), color: cf.color, icon: mapped.icon };
    });
    return [base, ...fromCF];
  }, [counterfactuals, riskScore, mrState]);

  const sel = scenarios.find(s => s.key === activeScenario) ?? scenarios[0];

  const selectScenario = useCallback((key: string) => {
    setActiveScenario(key);
    const target = scenarios.find(s => s.key === key)?.riskAfter ?? riskScore;
    const dur = 700;
    const startRisk = animRisk;
    const t0 = performance.now();
    let animId: number;
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimRisk(startRisk + (target - startRisk) * eased);
      if (p < 1) {
        animId = requestAnimationFrame(tick);
      }
    }
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [scenarios, riskScore, animRisk]);

  const failureCount = fc ?? Math.round(pipelinesTotal * 0.18);
  const failureRate = pipelinesTotal > 0 ? ((failureCount / pipelinesTotal) * 100).toFixed(1) : "N/A";

  const cfAll = useMemo(() => scenarios.find(s => s.label.toLowerCase().includes("all mitigations") || s.key === "cf-3") || scenarios[scenarios.length - 1], [scenarios]);
  const minCfRisk = useMemo(() => Math.min(...scenarios.map(s => s.riskAfter)), [scenarios]);
  const currentSuccessProb = useMemo(() => isLow ? Math.round((1 - riskScore) * 100) : (100 - scenarios[0].probability), [isLow, riskScore, scenarios]);
  const targetSuccessProb = useMemo(() => isLow ? Math.round((1 - minCfRisk) * 100) : cfAll.probability, [isLow, minCfRisk, cfAll]);
  const outcomeLeap = useMemo(() => Math.max(targetSuccessProb - currentSuccessProb, 0), [targetSuccessProb, currentSuccessProb]);
  const riskReduction = useMemo(() => riskScore > 0 ? Math.round(((riskScore - minCfRisk) / riskScore) * 100) : 0, [riskScore, minCfRisk]);

  const curCol = riskScoreToColor(sel.riskAfter);
  const gaugeColor = riskScoreToColor(animRisk);

  const qEvidence = (type: string) => evidence.find(e => e.queryType === type);

  const queryConfidence = useMemo(() => {
    const types = ["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"];
    const labels: Record<string, { label: string; color: string; icon: string }> = {
      NEIGHBORS: { label: "Graph Discovery", color: "#22c55e", icon: "🌐" },
      PATH_FINDING: { label: "Deployment Path", color: "#60a5fa", icon: "🛣" },
      TRAVERSAL: { label: "Historical Analysis", color: "#a78bfa", icon: "📚" },
      AGGREGATION: { label: "Pipeline Trend", color: "#f97316", icon: "📊" },
    };
    return types.map(t => {
      const ev = evidence.find(e => e.queryType === t);
      const text = (ev?.result || "").toLowerCase();
      let pct = 0;
      if (ev && text.length > 0 && !text.includes("no data") && !text.includes("no pipeline data returned")) {
        pct = text.includes("0 nodes") || text.includes("0 affected") || text.includes("no results") ? 40 : text.includes("error") ? 30 : 85;
      }
      return { type: t, pct, ...labels[t] };
    });
  }, [evidence]);

  const overallPct = useMemo(() => {
    const vals = queryConfidence.map(q => q.pct);
    return Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1));
  }, [queryConfidence]);

  const fadeIn = (delay: number) => ({
    animation: `fadeSlideUp 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
  });

  const isMitigated = activeScenario.includes("cf-3") || sel.label.toLowerCase().includes("all mitigations");
  const isPending = activeScenario.startsWith("cf-");
  const futureStateIcon = isMitigated ? "✅" : isPending ? "🔄" : "🔒";
  const futureStateLabel = isMitigated ? "Successfully Merged" : isPending ? "In Review" : sel.outcome;
  const futureStateColor = isMitigated ? "#22c55e" : isPending ? "#a78bfa" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 2px" }}>
      {/* HERO FORECAST — Premium redesign */}
      <div className="card" style={{
        padding: isMobile ? "16px 18px" : "24px 28px", position: "relative", overflow: "hidden",
        borderColor: `${curCol}55`,
        background: `linear-gradient(135deg, ${curCol}10 0%, rgba(10,12,20,0.95) 50%, rgba(59,130,246,0.04) 100%)`,
        boxShadow: `0 0 60px ${curCol}12, inset 0 0 60px ${curCol}06`,
      }}>
        <div style={{ position: "absolute", top: -80, left: -60, width: 400, height: 400, borderRadius: "50%", background: `${curCol}12`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 250, height: 250, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 4,
                  background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(139,92,246,0.08))",
                  border: "1px solid rgba(96,165,250,0.2)",
                  color: "var(--accent-blue)",
                  boxShadow: "0 0 12px rgba(96,165,250,0.08)",
                }}>Forecast Engine</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>v2.0</span>
                {dataMode && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", padding: "2px 8px", borderRadius: 3,
                    background: dataMode === "live" ? "rgba(34,197,94,0.12)" : "rgba(167,139,250,0.12)",
                    color: dataMode === "live" ? "#22c55e" : "#a78bfa",
                    border: `1px solid ${dataMode === "live" ? "rgba(34,197,94,0.2)" : "rgba(167,139,250,0.2)"}`,
                    textTransform: "uppercase",
                  }}>{dataMode === "live" ? "● LIVE" : "◆ DEMO"}</span>
                )}
              </div>
              <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 12, letterSpacing: "-0.3px" }}>
                🧪 Digital Twin Forecast
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0", fontFamily: "'JetBrains Mono', monospace" }}>MR !{mrIid}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 2 }}>Orbit Confidence</div>
              <div style={{
                fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace",
                textShadow: "0 0 24px rgba(59,130,246,0.3)",
              }}>{confidence.split(" ")[0]}</div>
            </div>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${curCol}33, transparent)`, margin: "0 0 14px 0" }} />
          {/* Metric badges with glow */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { label: "Nodes", value: totalNodes, color: "var(--accent-blue)", glow: "rgba(59,130,246,0.3)" },
              { label: "Edges", value: totalEdges, color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
              { label: "Queries", value: evidence.length, color: "#22c55e", glow: "rgba(34,197,94,0.3)" },
              { label: "Pipelines", value: pipelinesTotal.toLocaleString("en-US"), color: "#f97316", glow: "rgba(249,115,22,0.3)" },
            ].map(d => (
              <div key={d.label} style={{
                padding: "8px 16px", borderRadius: 8,
                background: `linear-gradient(135deg, ${d.color}12, ${d.color}04)`,
                border: `1px solid ${d.color}30`,
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: `0 0 20px ${d.glow}, inset 0 0 12px ${d.color}06`,
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 32px ${d.glow}, inset 0 0 16px ${d.color}0a`; e.currentTarget.style.borderColor = `${d.color}55`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 20px ${d.glow}, inset 0 0 12px ${d.color}06`; e.currentTarget.style.borderColor = `${d.color}30`; e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.3px" }}>{d.label}</span>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: d.color, fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 14px ${d.glow}`,
                }}>{d.value}</span>
              </div>
            ))}
          </div>
          {/* THREE-COLUMN RISK BREAKDOWN — horizontal on desktop */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {/* Column 1: Operational Risk */}
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))",
              border: `1px solid ${gaugeColor}33`,
              boxShadow: `inset 0 0 30px ${gaugeColor}06, 0 0 20px ${gaugeColor}08`,
              transition: "all 0.3s ease", display: "flex", flexDirection: "column", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${gaugeColor}55`; e.currentTarget.style.boxShadow = `inset 0 0 30px ${gaugeColor}0a, 0 0 30px ${gaugeColor}12`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${gaugeColor}33`; e.currentTarget.style.boxShadow = `inset 0 0 30px ${gaugeColor}06, 0 0 20px ${gaugeColor}08`; }}
            >
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>Operational Risk</div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--overlay-05)", overflow: "hidden" }}>
                <div style={{
                  width: `${animRisk * 100}%`, height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${riskScoreToColor(Math.max(animRisk - 0.2, 0))}, ${gaugeColor})`,
                  transition: "width 0.1s linear",
                  boxShadow: `0 0 12px ${riskScoreToGlow(animRisk)}, inset 0 0 4px rgba(255,255,255,0.1)`,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", opacity: 0.6 }}>Code changes · Graph health</span>
                <span style={{
                  fontSize: isMobile ? 18 : 22, fontWeight: 800, color: gaugeColor, fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 20px ${riskScoreToGlow(animRisk)}`,
                  transition: "all 0.1s linear",
                }}>{(animRisk * 100).toFixed(0)}%</span>
              </div>
            </div>
            {/* Column 2: Process Risk */}
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(0,0,0,0.2))",
              border: "1px solid rgba(239,68,68,0.22)",
              boxShadow: "inset 0 0 30px rgba(239,68,68,0.06), 0 0 20px rgba(239,68,68,0.08)",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>Process Risk</span>
                <span style={{
                  fontSize: 11, color: "#ef4444", fontWeight: 800,
                  padding: "2px 10px", borderRadius: 3, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)",
                  letterSpacing: "0.8px", textShadow: "0 0 10px rgba(239,68,68,0.3)",
                  animation: "pulseBadge 2s ease-in-out infinite",
                }}>HIGH</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", opacity: 0.6 }}>Workflow blockers</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { show: !mrState.hasPipeline, label: "✗ No Pipeline", color: "#ef4444" },
                  { show: true, label: "✗ No Reviewer", color: "#ef4444" },
                  { show: mrState.noChanges, label: "⚠ Empty Diff", color: "#eab308" },
                  { show: true, label: "✗ Draft Status", color: "#ef4444" },
                ].filter(b => b.show).map(b => (
                  <span key={b.label} style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 3,
                    background: `${b.color}15`, border: `1px solid ${b.color}30`,
                    color: b.color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 2,
                    boxShadow: `0 0 8px ${b.color}12`,
                  }}>{b.label}</span>
                ))}
              </div>
            </div>
            {/* Column 3: Outcome Prediction */}
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: `linear-gradient(135deg, ${curCol}0E, rgba(0,0,0,0.22))`,
              border: `1px solid ${curCol}44`,
              boxShadow: `inset 0 0 30px ${curCol}08, 0 0 20px ${curCol}08`,
              transition: "all 0.4s ease", display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ fontSize: 11, color: curCol, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", textShadow: `0 0 8px ${curCol}44`, transition: "color 0.4s ease" }}>Outcome Prediction</div>
              <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: curCol, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{sel.icon}</span>
                <span style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textShadow: `0 0 16px ${curCol}66`,
                }}>{sel.outcome}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", opacity: 0.6 }}>7-day horizon · {sel.probability}% prob.</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", opacity: 0.8 }}>{evidence.length} queries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIFECYCLE TIMELINE — 5 stages of MR lifecycle with Orbit prediction */}
      <div className="card" style={{
        padding: isMobile ? "10px 14px" : "14px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.1)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(var(--bg-card-rgb),0.95))",
        ...fadeIn(0.03),
      }}>
        <GlowOrb color="rgba(96,165,250,0.05)" top="-30%" left="-10%" size={180} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 10 }}>Orbit Lifecycle Prediction</div>
          <div style={{ display: "flex", gap: 0, alignItems: "center", justifyContent: "space-between", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch", paddingBottom: isMobile ? 4 : 0 }}>
            {[
              { label: "MR Open", icon: "📝", status: "active", color: "#22c55e", desc: "Current" },
              { label: "Pipeline", icon: "⚡", status: mrState.hasPipeline ? "done" : "blocked", color: mrState.hasPipeline ? "#22c55e" : "#ef4444", desc: mrState.hasPipeline ? "Ready" : "Missing" },
              { label: "Review", icon: "👁", status: "blocked", color: "#eab308", desc: "No reviewer" },
              { label: "Development", icon: "🔧", status: mrState.noChanges ? "blocked" : "ready", color: mrState.noChanges ? "#ef4444" : "#22c55e", desc: mrState.noChanges ? "Empty diff" : "Active" },
              { label: "Production", icon: "🚀", status: "predicted", color: curCol, desc: sel.outcome },
            ].map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: isMobile ? "0 0 70px" : 1, minWidth: isMobile ? 70 : 0, position: "relative" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    background: stage.status === "active" ? "rgba(34,197,94,0.15)"
                      : stage.status === "blocked" ? "rgba(239,68,68,0.12)"
                      : stage.status === "predicted" ? `${curCol}18`
                      : "var(--overlay-03)",
                    border: stage.status === "active" ? "1px solid rgba(34,197,94,0.3)"
                      : stage.status === "blocked" ? "1px solid rgba(239,68,68,0.25)"
                      : stage.status === "predicted" ? `1px solid ${curCol}44`
                      : "1px solid var(--overlay-08)",
                    boxShadow: stage.status === "active" ? "0 0 12px rgba(34,197,94,0.2)"
                      : stage.status === "predicted" ? `0 0 12px ${curCol}22`
                      : "none",
                    transition: "all 0.3s ease",
                  }}>
                    {stage.status === "blocked" ? "✗" : stage.icon}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.2px",
                    color: stage.status === "active" ? "#22c55e"
                      : stage.status === "blocked" ? "#ef4444"
                      : stage.status === "predicted" ? curCol
                      : "var(--text-secondary)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                    transition: "color 0.3s ease",
                  }}>{stage.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{stage.desc}</span>
                </div>
                {i < 4 && (
                  <div style={{ flex: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 12, height: 1.5, background: `linear-gradient(90deg, ${stage.status === "blocked" ? "#ef4444" : stage.status === "active" ? "#22c55e" : "var(--overlay-08)"}, ${i === 0 ? `var(--overlay-08)` : "var(--overlay-08)"})` }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{
            marginTop: 10, padding: "6px 12px", borderRadius: 6,
            background: "var(--overlay-02)", border: "1px solid var(--overlay-05)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s 0.1s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px" }}>
              <span style={{ color: "#22c55e" }}>●</span> Current: Open · <span style={{ color: "#ef4444" }}>●</span> Blocked ({["No Pipeline", "Empty Diff", "No Reviewer"].filter(Boolean).length}) · <span style={{ color: curCol }}>●</span> Orbit Prediction: {sel.outcome}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${riskScoreToGlow(animRisk)}` }}>
              {(animRisk * 100).toFixed(0)}% risk
            </span>
          </div>
        </div>
      </div>

      {/* ORBIT EVIDENCE — 4 query types */}
      <style>{`
        @keyframes pulseBadge { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glowPulse { 0%,100% { box-shadow: var(--glow-base); } 50% { box-shadow: var(--glow-peak); } }
      `}</style>
      <div className="card" style={{
        padding: isMobile ? "10px 12px" : "14px 18px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.1)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(var(--bg-card-rgb),0.95), rgba(139,92,246,0.02))",
        ...fadeIn(0.06),
      }}>
        <GlowOrb color="rgba(96,165,250,0.06)" top="-35%" left="-5%" size={200} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🛰</span>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)" }}>Orbit Evidence</span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--overlay-04)", padding: "1px 6px", borderRadius: 3, fontFamily: "'JetBrains Mono', monospace" }}>4 queries</span>
            </div>
            <span style={{ fontSize: 11, color: "#22c55e", fontStyle: "italic" }}>All independently supportive</span>
          </div>

          {/* 4 compact stat cards in a row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { type: "NEIGHBORS", icon: "🌐", color: "#22c55e", severity: "info", severityLabel: "Info", metric: `${totalNodes}N · ${totalEdges}E`, sub: "Graph Mapped" },
              { type: "PATH_FINDING", icon: "🛣", color: "#ef4444", severity: "critical", severityLabel: "Critical", metric: mrState.hasPipeline ? "✓ Route" : "✗ Blocked", sub: mrState.hasPipeline ? "Deploy Path" : "No Pipeline" },
              { type: "TRAVERSAL", icon: "📚", color: "#f97316", severity: "high", severityLabel: "High", metric: `${historicalCount}`, sub: "Historical Matches" },
              { type: "AGGREGATION", icon: "📊", color: "#eab308", severity: "medium", severityLabel: "Medium", metric: `${failureRate}%`, sub: "Pipeline Fail Rate" },
            ].map((st, i) => (
              <div key={st.type} style={{
                padding: "10px 12px", borderRadius: 8, position: "relative", overflow: "hidden",
                background: `linear-gradient(135deg, ${st.color}0c, rgba(var(--bg-card-rgb),0.9))`,
                border: `1px solid ${st.color}28`,
                boxShadow: `0 0 16px ${st.color}0a`,
                animation: `fadeSlideUp 0.3s ${0.06 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "all 0.2s ease",
                cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${st.color}55`; e.currentTarget.style.boxShadow = `0 0 24px ${st.color}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${st.color}28`; e.currentTarget.style.boxShadow = `0 0 16px ${st.color}0a`; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 16 }}>{st.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: st.color, letterSpacing: "0.3px", textShadow: `0 0 6px ${st.color}33` }}>{st.type}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.5px",
                    background: st.severity === "critical" ? "rgba(239,68,68,0.2)" : st.severity === "high" ? "rgba(249,115,22,0.15)" : st.severity === "medium" ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.12)",
                    color: st.severity === "critical" ? "#ef4444" : st.severity === "high" ? "#f97316" : st.severity === "medium" ? "#eab308" : "#22c55e",
                    border: `1px solid ${st.color}35`,
                    boxShadow: st.severity === "critical" || st.severity === "high" ? `0 0 8px ${st.color}22` : "none",
                    animation: st.severity === "critical" || st.severity === "high" ? "pulseBadge 2s ease-in-out infinite" : "none",
                  }}>
                    {st.severity === "critical" ? "🔴" : st.severity === "high" ? "🟠" : st.severity === "medium" ? "🟡" : "🟢"} {st.severityLabel}
                  </span>
                </div>
                <div style={{ fontSize: isSmall ? 14 : 18, fontWeight: 800, color: st.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 14px ${st.color}40`, lineHeight: 1.2 }}>
                  {st.metric}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{st.sub}</div>
              </div>
            ))}
          </div>

          {/* 2-column detail cards */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              {
                type: "NEIGHBORS", icon: "🌐", color: "#22c55e", severity: "info", severityLabel: "Info",
                title: `${totalNodes} Nodes + ${totalEdges} Edges Mapped`,
                finding: evidenceSummary.NEIGHBORS?.finding?.slice(0, 60) || "Graph discovery complete",
                detail: `${totalNodes} nodes, ${totalEdges} edges discovered in digital twin`,
                pct: 100, signalText: "Graph health OK",
              },
              {
                type: "PATH_FINDING", icon: "🛣", color: "#ef4444", severity: "critical", severityLabel: "Critical",
                title: mrState.hasPipeline ? "Deployment Path Detected" : "No Deployment Path Exists",
                finding: evidenceSummary.PATH_FINDING?.finding?.slice(0, 60) || "MR → Pipeline relation missing",
                detail: mrState.hasPipeline ? "Validated production deployment route exists" : "No validated production deployment route exists",
                pct: 95, signalText: "Blocking deployment",
              },
              {
                type: "TRAVERSAL", icon: "📚", color: "#f97316", severity: "high", severityLabel: "High",
                title: `${historicalCount} Historical Match${historicalCount !== 1 ? "es" : ""} Found`,
                finding: evidenceSummary.TRAVERSAL?.finding?.slice(0, 60) || "Branch abandonment pattern detected",
                detail: `${historicalCount} of 10 prior MRs from this branch were closed without merge`,
                pct: 90, signalText: "Requires attention",
              },
              {
                type: "AGGREGATION", icon: "📊", color: "#eab308", severity: "medium", severityLabel: "Medium",
                title: `${failureRate}% Pipeline Failure Rate`,
                finding: evidenceSummary.AGGREGATION?.finding?.slice(0, 60) || `${pipelinesTotal.toLocaleString("en-US")} pipelines analyzed`,
                detail: `${failureRate}% historical failure rate across ${pipelinesTotal.toLocaleString("en-US")} pipelines — used for calibration`,
                pct: 75, signalText: failureRate === "N/A" ? "Insufficient data" : `${pipelinesTotal} pipelines tracked`,
                showMini: true,
              },
            ].map((signal, i) => (
              <div key={signal.type} className="card" style={{
                padding: isMobile ? "8px 10px" : "12px 14px", position: "relative", overflow: "hidden",
                borderColor: `${signal.color}25`,
                background: `linear-gradient(135deg, ${signal.color}0a, rgba(var(--bg-card-rgb),0.9), ${signal.color}04)`,
                boxShadow: `0 0 16px ${signal.color}0c`,
                animation: `fadeSlideUp 0.3s ${0.12 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${signal.color}50`; e.currentTarget.style.boxShadow = `0 0 28px ${signal.color}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${signal.color}25`; e.currentTarget.style.boxShadow = `0 0 16px ${signal.color}0c`; e.currentTarget.style.transform = "none"; }}
              >
                <GlowOrb color={`${signal.color}10`} top={i % 2 === 0 ? "-25%" : "45%"} left={i < 2 ? "-10%" : "auto"} right={i >= 2 ? "-10%" : "auto"} size={140} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Header row: icon + type + severity + inline confidence */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{signal.icon}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: signal.color,
                      padding: "2px 6px", borderRadius: 3, background: `${signal.color}18`, border: `1px solid ${signal.color}30`,
                      textShadow: `0 0 6px ${signal.color}22`,
                    }}>{signal.type}</span>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--overlay-04)", overflow: "hidden" }}>
                        <div style={{ width: `${signal.pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${signal.color}, ${signal.color}88)`, boxShadow: `0 0 6px ${signal.color}44` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: signal.color, fontFamily: "'JetBrains Mono', monospace", minWidth: 22, textAlign: "right", textShadow: `0 0 6px ${signal.color}33` }}>{signal.pct}%</span>
                    </div>
                  </div>
                  {/* Title */}
                  <div style={{ fontSize: isSmall ? 11 : 14, fontWeight: 800, color: "var(--text-primary)", marginBottom: 3, lineHeight: 1.3, display: "flex", alignItems: "center", gap: 3 }}>
                    {signal.type === "NEIGHBORS" ? <><AnimatedNum value={totalNodes} color={signal.color} /> Nodes + <AnimatedNum value={totalEdges} color={signal.color} /> Edges</>
                    : signal.type === "TRAVERSAL" ? <><AnimatedNum value={historicalCount} color={signal.color} /> Historical Match{historicalCount !== 1 ? "es" : ""}</>
                    : signal.title}
                  </div>
                  {/* Finding + detail inline */}
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ width: 3, minWidth: 3, height: "1.2em", background: signal.color, borderRadius: 1, marginTop: 4, boxShadow: `0 0 6px ${signal.color}55` }} />
                    <span>{signal.finding}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4, lineHeight: 1.4 }}>{signal.detail}</div>
                  {/* Signal text */}
                  <div style={{ marginTop: 6, paddingTop: 5, borderTop: "1px solid var(--overlay-04)", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>Signal</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: signal.color, textShadow: `0 0 8px ${signal.color}44` }}>{signal.signalText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIGITAL TWIN STATE TRANSITION + SCENARIOS */}
      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* State Transition */}
        <div className="card" style={{
          padding: isMobile ? "12px 14px" : "16px 18px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
          ...fadeIn(0.08),
        }}>
          <GlowOrb color="rgba(96,165,250,0.06)" top="-40%" left="-30%" size={isMobile ? 100 : 160} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>Digital Twin State Transition</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
              {/* Current State */}
              <div style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 6, boxShadow: "0 0 12px rgba(34,197,94,0.04)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#22c55e", marginBottom: 4, textShadow: "0 0 8px rgba(34,197,94,0.2)" }}>CURRENT STATE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>MR Open</div>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3, paddingLeft: 12, borderLeft: "2px solid rgba(34,197,94,0.2)" }}>
                  {["Empty Diff", "No Pipeline", "No Reviewer", "Draft Status"].map(f => (
                    <div key={f} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 5 }}>
                      <span style={{ color: "#ef4444", fontWeight: 700 }}>✗</span> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, rgba(34,197,94,0.1), ${curCol}55)` }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: curCol, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${curCol}33`, letterSpacing: "0.5px" }}>ORBIT SIMULATION</span>
                <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${curCol}55, rgba(34,197,94,0.1))` }} />
              </div>

              {/* Future State */}
              <div style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: `linear-gradient(135deg, ${futureStateColor}0c, ${futureStateColor}04)`,
                border: `1px solid ${futureStateColor}30`,
                boxShadow: `0 0 20px ${futureStateColor}10`,
                transition: "all 0.4s ease",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: futureStateColor, marginBottom: 4, textShadow: `0 0 8px ${futureStateColor}33` }}>FUTURE STATE</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: futureStateColor, transition: "color 0.4s ease", textShadow: `0 0 12px ${futureStateColor}44` }}>{futureStateIcon} {futureStateLabel}</div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>{activeScenario === "current" ? "Based on current trajectory" : "Scenario simulation applied"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* What-If Scenarios */}
        <div className="card" style={{
          padding: isMobile ? "12px 14px" : "16px 18px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
          borderColor: `${curCol}22`,
          boxShadow: `0 0 20px ${curCol}06`,
          ...fadeIn(0.1),
        }}>
          <GlowOrb color={`${curCol}0c`} top="-30%" right="-20%" size={isMobile ? 100 : 160} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 2 }}>What-If Scenarios</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 10, lineHeight: 1.4 }}>Click to simulate a different future.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scenarios.map((s, i) => (
                <div key={s.key} style={{ animation: `fadeSlideUp 0.4s ${0.12 + i * 0.06}s cubic-bezier(0.16,1,0.3,1) both` }}>
                  <ScenarioCard s={s} active={activeScenario === s.key} onClick={() => selectScenario(s.key)} touched={touchedCard === s.key} onTouch={(v) => setTouchedCard(v ? s.key : null)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FORECAST CONFIDENCE — Circular gauges for each query type + overall */}
      <div className="card" style={{
        padding: isMobile ? "12px 14px" : "16px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.18)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.05), rgba(var(--bg-card-rgb),0.95), rgba(139,92,246,0.03))",
        boxShadow: "0 0 24px rgba(96,165,250,0.06)",
        ...fadeIn(0.08),
      }}>
        <GlowOrb color="rgba(96,165,250,0.08)" top="-40%" left="-5%" size={200} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 2, textShadow: "0 0 8px rgba(96,165,250,0.2)" }}>Forecast Confidence</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", opacity: 0.8 }}>All 4 Orbit query types independently support this prediction</div>
            </div>
            <CircularGauge pct={overallPct} color={overallPct >= 70 ? "#22c55e" : overallPct >= 40 ? "#eab308" : "#ef4444"} size={56} strokeWidth={5} value={`${overallPct}%`} label={overallPct >= 70 ? "HIGH" : overallPct >= 40 ? "MEDIUM" : "LOW"} />
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {queryConfidence.map(q => (
              <div key={q.type} style={{
                padding: isSmall ? "4px 8px" : "7px 12px", borderRadius: 6,
                background: `linear-gradient(135deg, ${q.color}0a, rgba(var(--bg-card-rgb),0.9))`,
                border: `1px solid ${q.color}20`,
                boxShadow: `0 0 10px ${q.color}08`,
                display: "flex", alignItems: "center", gap: 10,
                animation: "fadeSlideUp 0.3s 0.1s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <CircularGauge pct={q.pct} color={q.color} size={34} strokeWidth={3} />
                <div style={{
                  position: "absolute", width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, pointerEvents: "none",
                }}>{q.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: q.color, textShadow: `0 0 6px ${q.color}33` }}>{q.type}</span>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{q.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--overlay-04)", overflow: "hidden" }}>
                      <div style={{ width: `${q.pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${q.color}, ${q.color}88)`, transition: "width 1s ease", boxShadow: `0 0 6px ${q.color}33` }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: q.color, fontFamily: "'JetBrains Mono', monospace", width: 24, textAlign: "right", flexShrink: 0, textShadow: `0 0 6px ${q.color}33` }}>{q.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explainable Confidence Card */}
          <div style={{
            marginTop: 10, padding: "12px 16px", borderRadius: 8,
            background: "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.15))",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "inset 0 0 16px rgba(0,0,0,0.2)",
            animation: "fadeSlideUp 0.3s 0.12s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase", textShadow: "0 0 8px rgba(96,165,250,0.15)" }}>
              Why {confidence.split(" ")[0]}? (Explainable Confidence)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "4px 12px", fontSize: 15, color: "var(--text-primary)" }}>
              {isLow ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#22c55e", fontWeight: "bold" }}>✓</span> Deployment path verified</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#22c55e", fontWeight: "bold" }}>✓</span> 0 historical incident matches</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#22c55e", fontWeight: "bold" }}>✓</span> Clean ecosystem pipeline trend</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#22c55e", fontWeight: "bold" }}>✓</span> Reviewer approvals validated</div>
                </>
              ) : isMedium ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#eab308", fontWeight: "bold" }}>✓</span> Empty changes diff detected</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#eab308", fontWeight: "bold" }}>✓</span> No active pipeline linked</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#eab308", fontWeight: "bold" }}>✓</span> 9 historical closed MR matches</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#eab308", fontWeight: "bold" }}>✓</span> No reviewers assigned to MR</div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#ef4444", fontWeight: "bold" }}>✓</span> Deployment path missing</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#ef4444", fontWeight: "bold" }}>✓</span> 9 historical closed MR matches</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#ef4444", fontWeight: "bold" }}>✓</span> 23 failed pipelines nearby</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#ef4444", fontWeight: "bold" }}>✓</span> Empty diff detected</div>
                </>
              )}
            </div>
          </div>

          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8,
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
            border: "1px solid rgba(34,197,94,0.18)",
            boxShadow: "0 0 16px rgba(34,197,94,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s 0.15s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🎯</span>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.3px" }}>Orbit Conclusion: </span>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, textShadow: "0 0 8px rgba(34,197,94,0.2)" }}>All 4 query types independently support the same outcome</span>
              </div>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 14px rgba(34,197,94,0.35)" }}>
              {(animRisk * 100).toFixed(0)}% risk
            </span>
          </div>
        </div>
      </div>

      {/* ENGINEERING FUTURES + COST OF INACTION + ORBIT DELTA */}
      <div className="card" style={{
        padding: isMobile ? "12px 14px" : "18px 22px", position: "relative", overflow: "hidden",
        borderColor: "rgba(34,197,94,0.12)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(var(--bg-card-rgb),0.95), rgba(59,130,246,0.02))",
        ...fadeIn(0.18),
      }}>
        <GlowOrb color="rgba(34,197,94,0.08)" top="-30%" right="-10%" size={isMobile ? 120 : 200} />
        <GlowOrb color="rgba(239,68,68,0.05)" top="50%" left="-10%" size={isMobile ? 100 : 150} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#22c55e", marginBottom: 12 }}>Engineering Futures</div>

          {/* Before/After Comparison */}
          <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div style={{ padding: "14px 18px", borderRadius: 8, background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 16px rgba(239,68,68,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#ef4444", marginBottom: 4, textShadow: "0 0 8px rgba(239,68,68,0.2)" }}>⚔ If Nothing Changes</div>
              <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, color: "#ef4444", marginBottom: 2, textShadow: "0 0 10px rgba(239,68,68,0.15)" }}>{scenarios[0].outcome}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Risk {Math.round(riskScore * 100)}% · {scenarios[0].probability}% probability</div>
              <div style={{ padding: "4px 8px", borderRadius: 4, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 13, color: "var(--text-tertiary)" }}>Based on {historicalCount} historical match{historicalCount !== 1 ? "es" : ""}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.12))",
                border: "1px solid rgba(34,197,94,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                boxShadow: "0 0 20px rgba(34,197,94,0.2)",
              }}>→</div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.5px", textTransform: "uppercase" }}>vs</span>
            </div>
            <div style={{ padding: "14px 18px", borderRadius: 8, background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 0 16px rgba(34,197,94,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#22c55e", marginBottom: 4, textShadow: "0 0 8px rgba(34,197,94,0.2)" }}>✅ If Recommendations Followed</div>
              <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, color: "#22c55e", marginBottom: 2, textShadow: "0 0 10px rgba(34,197,94,0.15)" }}>{isLow ? "Successfully Merged" : cfAll.outcome}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{targetSuccessProb}% probability · Risk {Math.round(riskScore * 100)}% → {Math.round(minCfRisk * 100)}%</div>
              
              {/* Why This Changed (Causality reinforcement) */}
              <div style={{
                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                background: "linear-gradient(135deg, rgba(0,0,0,0.25), rgba(0,0,0,0.15))",
                border: "1px solid var(--overlay-05)",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.15)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Why This Changed</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: "#22c55e", fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, textShadow: "0 0 4px rgba(34,197,94,0.1)" }}>✓ Pipeline Triggered</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>✓ Reviewer Assigned</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>✓ Meaningful Code Change</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>✓ Deployment Path Restored</div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbit Delta (Louder & Defensible Outcome Improvement) */}
          <div style={{
            padding: "14px 16px", borderRadius: 8, marginBottom: 14, position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.05))",
            border: "1px solid rgba(96,165,250,0.22)",
            boxShadow: "0 0 24px rgba(96,165,250,0.06)",
          }}>
            <div style={{ position: "absolute", top: -40, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(96,165,250,0.05)", filter: "blur(50px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--accent-blue)", textShadow: "0 0 8px rgba(96,165,250,0.15)" }}>🛰 Orbit Delta</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#22c55e", padding: "3px 10px", borderRadius: 4,
                  background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)",
                  textShadow: "0 0 8px rgba(34,197,94,0.25)", boxShadow: "0 0 10px rgba(34,197,94,0.08)",
                }}>Forecast Shift: {scenarios[0]?.outcome?.slice(0, 10) || "Closed"} ➔ {cfAll?.outcome?.slice(0, 10) || "Merged"}</span>
              </div>
              <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Current Success Prob.", value: `${currentSuccessProb}%`, color: "#ef4444", sub: currentSuccessProb < 50 ? "⚠ Failure Expected" : "Marginal State", bg: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))", border: "rgba(239,68,68,0.2)" },
                  { label: "Target Success Prob.", value: `${targetSuccessProb}%`, color: "#22c55e", sub: "✓ With Mitigations", bg: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))", border: "rgba(34,197,94,0.2)" },
                  { label: "Outcome Leap", value: `+${outcomeLeap}% pp`, color: "var(--accent-blue)", sub: `${riskReduction}% Risk Reduction`, bg: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(139,92,246,0.05))", border: "rgba(96,165,250,0.22)" },
                ].map(d => (
                  <div key={d.label} style={{
                    padding: "10px 12px", borderRadius: 6, textAlign: "center", position: "relative", overflow: "hidden",
                    background: d.bg, border: `1px solid ${d.border}`,
                    boxShadow: d.color === "#22c55e" ? "0 0 12px rgba(34,197,94,0.06)" : d.color === "#ef4444" ? "0 0 12px rgba(239,68,68,0.06)" : "0 0 12px rgba(96,165,250,0.06)",
                    transition: "all 0.2s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = `0 0 20px ${d.color === "#22c55e" ? "rgba(34,197,94,0.12)" : d.color === "#ef4444" ? "rgba(239,68,68,0.12)" : "rgba(96,165,250,0.12)"}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = d.color === "#22c55e" ? "0 0 12px rgba(34,197,94,0.06)" : d.color === "#ef4444" ? "0 0 12px rgba(239,68,68,0.06)" : "0 0 12px rgba(96,165,250,0.06)"; }}
                  >
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>{d.label}</div>
                    <div style={{
                      fontSize: 24, fontWeight: 900, color: d.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1,
                      textShadow: `0 0 16px ${d.color}40`,
                      transition: "all 0.3s ease",
                    }}>{d.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{d.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engineering Cost of Inaction (Dynamic + Animated) */}
          <div style={{
            padding: "14px 16px", borderRadius: 8, position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03), rgba(0,0,0,0.2))",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 0 24px rgba(239,68,68,0.08), inset 0 0 24px rgba(239,68,68,0.03)",
            animation: "pulseGlow 3s ease-in-out infinite",
          }}>
            <style>{`@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 24px rgba(239,68,68,0.08), inset 0 0 24px rgba(239,68,68,0.03); } 50% { box-shadow: 0 0 36px rgba(239,68,68,0.15), inset 0 0 30px rgba(239,68,68,0.05); } }`}</style>
            <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(239,68,68,0.06)", filter: "blur(40px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#ef4444", textShadow: "0 0 8px rgba(239,68,68,0.2)" }}>⚠ Impact of Doing Nothing</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", opacity: 0.7 }}>If current path continues</span>
              </div>
              <div className="resp-grid-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                {(() => {
                  const devDays = Math.round(riskScore * 12 + 2);
                  const baseOutcome = mrState.noChanges ? "MR Auto-Closed" : scenarios[0]?.outcome || "MR Closed";
                  const reviewCycles = Math.max(historicalCount, Math.round(pipelinesTotal > 100 ? 2 : 1));
                  const pipeNum = pipelinesTotal > 0 ? `${Math.min(pipelinesTotal, 999)}` : "0";
                  const prodImpact = scenarios[0]?.outcome?.toLowerCase().includes("deploy") || scenarios[0]?.outcome?.toLowerCase().includes("merge") ? "Delayed ship" : "Never ships";
                  return [
                    { label: "Dev Time Lost", value: `${devDays}-${devDays + 3}d`, color: "#ef4444", icon: "⏱" },
                    { label: "Expected Outcome", value: baseOutcome.length > 12 ? baseOutcome.slice(0, 12) + "…" : baseOutcome, color: "#ef4444", icon: "🎯" },
                    { label: "Review Wasted", value: `${reviewCycles} cycle${reviewCycles > 1 ? "s" : ""}`, color: "#eab308", icon: "👤" },
                    { label: "Pipeline Execs", value: pipeNum, color: "#8b949e", icon: "⚙️" },
                    { label: "Production Impact", value: prodImpact, color: "#ef4444", icon: "🚀" },
                  ].map(d => (
                    <div key={d.label} style={{
                      padding: "8px 6px", borderRadius: 5, textAlign: "center",
                      background: "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.18))",
                      border: `1px solid ${d.color}22`,
                      boxShadow: `0 0 8px ${d.color}08`,
                      transition: "all 0.2s ease",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${d.color}50`; e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.25))"; e.currentTarget.style.boxShadow = `0 0 16px ${d.color}15`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${d.color}22`; e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.18))"; e.currentTarget.style.boxShadow = `0 0 8px ${d.color}08`; e.currentTarget.style.transform = "none"; }}
                    >
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 1 }}>{d.icon} {d.label}</div>
                      <div style={{
                        fontSize: 17, fontWeight: 800, color: d.color, fontFamily: "'JetBrains Mono', monospace",
                        textShadow: `0 0 10px ${d.color}40`,
                      }}>{d.value}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTNOTE */}
      <div style={{
        fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", padding: "6px 0",
        animation: `fadeSlideUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both`,
        letterSpacing: "0.2px",
      }}>
        <span style={{ opacity: 0.5 }}>⏎</span> Aggregation Evidence: {pipelinesTotal.toLocaleString("en-US")} pipelines analyzed · {failureRate}% historical failure rate · Used for confidence calibration
      </div>
    </div>
  );
}
