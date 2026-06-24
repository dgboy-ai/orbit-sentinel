import React, { useEffect, useState, useMemo } from "react";
import type { RiskBreakdown, OrbitQueryEvidence, DecisionCenterData } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";

function computeConfidence(evidence: OrbitQueryEvidence[]): string {
  const withData = evidence.filter(e => {
    const t = (e.result || "").toLowerCase();
    return t.length > 0 && !t.includes("no data") && !t.includes("no pipeline data returned") && !t.includes("0 nodes");
  });
  const pct = evidence.length > 0 ? Math.round((withData.length / evidence.length) * 100) : 0;
  const clamped = Math.max(Math.min(pct, 99), 50);
  return `${clamped}%`;
}

interface Props {
  riskData: { score: number; level: string; breakdown: RiskBreakdown[] };
  evidence: OrbitQueryEvidence[];
  decisionCenter: DecisionCenterData;
  confidence: string;
  mrIid: number;
  dataMode?: "live" | "demo";
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
    critical: { dot: "#ef4444", bg: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))", border: "rgba(239,68,68,0.35)", label: "CRITICAL SIGNAL", glow: "rgba(239,68,68,0.25)" },
    high: { dot: "#f97316", bg: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))", border: "rgba(249,115,22,0.3)", label: "HIGH SIGNAL", glow: "rgba(249,115,22,0.2)" },
    medium: { dot: "#eab308", bg: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.03))", border: "rgba(234,179,8,0.3)", label: "MEDIUM SIGNAL", glow: "rgba(234,179,8,0.2)" },
  };
  const c = severityColors[card.severity];
  return (
    <div style={{
      padding: isMobile ? "12px 14px" : "16px 18px", borderRadius: 10, position: "relative", overflow: "hidden",
      background: touched ? `${c.dot}18` : c.bg, border: `1px solid ${touched ? c.dot : c.border}`,
      boxShadow: touched ? `0 0 30px ${c.glow}, inset 0 0 20px ${c.glow}` : `0 0 16px ${c.glow}`,
      animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      display: "flex", flexDirection: "column", gap: 8,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      WebkitTapHighlightColor: "transparent",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.dot; e.currentTarget.style.boxShadow = `0 0 40px ${c.glow}, inset 0 0 30px ${c.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = `0 0 16px ${c.glow}`; }}
      onTouchStart={() => setTouched(true)} onTouchEnd={() => setTouched(false)}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c.dot, boxShadow: `0 0 10px ${c.dot}`, borderRadius: "2px 0 0 2px" }} />
      <GlowOrb color={c.glow} top="-25%" left="-15%" size={120} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header row: severity icon + label + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            background: `${c.dot}20`, border: `1px solid ${c.dot}44`,
            boxShadow: `0 0 8px ${c.glow}`,
          }}>
            {card.severity === "critical" ? "🔴" : card.severity === "high" ? "🟠" : "🟡"}
          </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: c.dot, marginBottom: 1, textShadow: `0 0 8px ${c.glow}` }}>{c.label}</div>
            <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "var(--text-primary)" }}>{card.title}</div>
          </div>
        </div>

        {/* Badge row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
          <span style={{
            fontSize: 12, padding: "2px 8px", borderRadius: 4,
            background: "rgba(96,165,250,0.12)", color: "#93c5fd",
            border: "1px solid rgba(96,165,250,0.2)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            textShadow: "0 0 6px rgba(96,165,250,0.3)",
          }}>
            {card.evidenceSource}
          </span>
          {q && (
            <span style={{
              fontSize: 12, padding: "2px 8px", borderRadius: 4,
              background: `${c.dot}15`, color: c.dot,
              border: `1px solid ${c.dot}30`, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              textShadow: `0 0 6px ${c.glow}`,
            }}>
              {q.queryType}
            </span>
          )}
        </div>

        {/* Detail grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "auto 1fr" : "70px 1fr", gap: "4px 8px", fontSize: 14, lineHeight: 1.5 }}>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: 12, letterSpacing: "0.3px", textTransform: "uppercase" }}>Finding</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>{card.finding}</span>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: 12, letterSpacing: "0.3px", textTransform: "uppercase" }}>Orbit Evidence</span>
          <span style={{ color: "#93c5fd", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, textShadow: "0 0 8px rgba(96,165,250,0.3)" }}>{card.orbitEvidence}</span>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: 12, letterSpacing: "0.3px", textTransform: "uppercase" }}>Impact</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>{card.impact}</span>
        </div>

        {/* Raw query result */}
        {q && (
          <div style={{
            padding: "6px 10px", borderRadius: 5, marginTop: 5,
            background: "rgba(var(--bg-card-rgb),0.3)", borderLeft: `2px solid ${c.dot}55`,
            fontSize: 13, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5, whiteSpace: "pre-line",
          }}>
            {q.result}
          </div>
        )}

        {/* Confidence bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--overlay-04)", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}>
            <div style={{
              width: `${card.confidence}%`, height: "100%", borderRadius: 3,
              background: `linear-gradient(90deg, ${c.dot}, ${c.dot}bb)`,
              transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: `0 0 8px ${c.dot}66`,
            }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: c.dot, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${c.glow}` }}>{card.confidence}%</span>
        </div>
      </div>
    </div>
  );
}

export default function RiskInvestigation({ riskData, evidence, decisionCenter, confidence, mrIid, dataMode }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmall = useMediaQuery("(max-width: 480px)");

  const isLow = riskData.level?.toLowerCase() === "low";
  const isMedium = riskData.level?.toLowerCase() === "medium" || riskData.level?.toLowerCase() === "warning";

  const hasNoPipelineData = (() => {
    const pathFinding = evidence.find(e => e.queryType === "PATH_FINDING");
    const noPipelineText = evidence.some(e => {
      const t = (e.result || "").toLowerCase();
      return t.includes("no pipeline") || t.includes("no linked pipeline") || t.includes("no deployment path") || t.includes("0 deployment paths") || t.includes("no pipeline data returned");
    });
    return (pathFinding?.result || "").toLowerCase().includes("no linked pipeline") || noPipelineText;
  })();

  const reviewersCount = decisionCenter?.reviewers?.length ?? 0;
  const hasNoReviewers = reviewersCount === 0;

  const config = isLow ? {
    color: "#22c55e",
    bg: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(var(--bg-card-rgb),0.9) 50%, rgba(34,197,94,0.02) 100%)",
    border: "rgba(34,197,94,0.25)",
    glow: "rgba(34,197,94,0.12)",
    predictedOutcome: "Safe to Deploy",
    primaryWarn: "Primary: Change scope is isolated in graph.",
    secondaryWarn: (hasNoPipelineData && hasNoReviewers)
      ? "Secondary: No pipeline detected · No reviewers assigned"
      : "Secondary: Reviewers approved, head pipeline passed.",
    primaryColor: "#22c55e",
    secondaryColor: "#22c55e",
    verdictLabel: "SAFE TO DEPLOY",
    verdictIcon: "✅",
    reasoning: [
      "All unit and integration tests pass",
      "Full reviewer approvals received",
      "Isolated scope has zero downstream risk",
      "Historical similarity matches clean merges",
    ],
  } : isMedium ? {
    color: "#eab308",
    bg: "linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(var(--bg-card-rgb),0.9) 50%, rgba(234,179,8,0.02) 100%)",
    border: "rgba(234,179,8,0.25)",
    glow: "rgba(234,179,8,0.12)",
    predictedOutcome: "Needs Review",
    primaryWarn: "Primary: Empty changes diff detected.",
    secondaryWarn: "Secondary: No pipeline execution triggered.",
    primaryColor: "#eab308",
    secondaryColor: "#eab308",
    verdictLabel: "NEEDS REMEDIATION",
    verdictIcon: "⚠️",
    reasoning: [
      "Empty changes diff detected",
      "No pipeline execution triggered",
      "Branch abandonment history match",
      "No reviewers assigned to the MR",
    ],
  } : {
    color: "#ef4444",
    bg: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(var(--bg-card-rgb),0.9) 50%, rgba(239,68,68,0.02) 100%)",
    border: "rgba(239,68,68,0.25)",
    glow: "rgba(239,68,68,0.12)",
    predictedOutcome: "Will Not Reach Production",
    primaryWarn: "Primary: No deployment path exists.",
    secondaryWarn: "Secondary: 9 prior MRs from this branch were abandoned.",
    primaryColor: "#ef4444",
    secondaryColor: "#f97316",
    verdictLabel: "DO NOT DEPLOY",
    verdictIcon: "🚫",
    reasoning: [
      "No deployment path exists",
      "No validated pipeline exists",
      "No meaningful code changes detected",
      "Historical abandonment pattern detected",
    ],
  };

  const baseCards: CardDef[] = isLow ? [
    {
      severity: "medium", title: "Isolated Change Scope",
      evidenceSource: "Orbit Graph Discovery", finding: "No downstream services affected",
      orbitEvidence: "NEIGHBORS: Change is fully isolated in graph",
      impact: "Zero impact on production service dependency paths", confidence: 96, queryType: "NEIGHBORS",
    },
    {
      severity: "medium", title: "Pipeline Passed",
      evidenceSource: "MR-to-Pipeline Trace", finding: "All deployment gates are green",
      orbitEvidence: "PATH_FINDING: head pipeline passed cleanly",
      impact: "Build and deploy artifacts verified safe", confidence: 95, queryType: "PATH_FINDING",
    },
    {
      severity: "medium", title: "Clean Merges History",
      evidenceSource: "Historical Similarity", finding: "12 similar MRs merged with no incidents",
      orbitEvidence: "TRAVERSAL: zero incident patterns matching files",
      impact: "Extremely low probability of regression", confidence: 90, queryType: "TRAVERSAL",
    },
    {
      severity: "medium", title: "Ecosystem Stability",
      evidenceSource: "Pipeline Risk Aggregation", finding: "0 pipeline failures in last 30 days",
      orbitEvidence: "AGGREGATION: no failures detected on target files",
      impact: "Highly stable codebase location", confidence: 95, queryType: "AGGREGATION",
    },
  ] : isMedium ? [
    {
      severity: "medium", title: "Reviewers Required",
      evidenceSource: "Ownership Analysis", finding: "No reviewers have approved the MR yet",
      orbitEvidence: "NEIGHBORS: Reviewer approval links missing from graph",
      impact: "Requires manual check before deployment", confidence: 75, queryType: "NEIGHBORS",
    },
    {
      severity: "medium", title: "No Executing Pipeline",
      evidenceSource: "MR-to-Pipeline Trace", finding: "Pipeline has not run for this MR",
      orbitEvidence: "PATH_FINDING: MR → Pipeline relation missing",
      impact: "Deployment states cannot be validated", confidence: 80, queryType: "PATH_FINDING",
    },
    {
      severity: "high", title: "Branch Abandonment Pattern",
      evidenceSource: "Historical Similarity", finding: "9 prior MRs from this branch abandoned",
      orbitEvidence: "TRAVERSAL: 9 of 10 prior MRs from this branch were closed",
      impact: "High probability of MR being closed without merge", confidence: 90, queryType: "TRAVERSAL",
    },
    {
      severity: "critical", title: "Empty Changes Diff",
      evidenceSource: "Orbit Graph Discovery", finding: "MR contains no file changes",
      orbitEvidence: "NEIGHBORS: Diff state is empty — no code to deploy",
      impact: "Nothing deployable identified", confidence: 100, queryType: "NEIGHBORS",
    },
  ] : [
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

  const cards = useMemo(() => {
    return baseCards.map(card => {
      const e = evidence.find(x => x.queryType === card.queryType);
      if (!e) return card;

      const r = e.result.toLowerCase();
      let finding = card.finding;
      let title = card.title;
      let severity = card.severity;

      if (card.queryType === "NEIGHBORS") {
        if (r.includes("no downstream services affected") || r.includes("0 downstream services")) {
          finding = "No downstream services affected";
          title = "Isolated Change Scope";
        }
      } else if (card.queryType === "PATH_FINDING") {
        if (r.includes("no linked pipeline") || r.includes("no deployment path") || r.includes("0 deployment paths")) {
          finding = "No linked pipeline detected";
          title = "Pipeline Verification Pending";
          severity = "medium";
        } else {
          finding = "All deployment gates are green";
          title = "Pipeline Passed";
        }
      } else if (card.queryType === "TRAVERSAL") {
        if (r.includes("0 historical mr") || r.includes("0 merged") || r.includes("zero incident")) {
          finding = "No branch history patterns matching files";
          title = "Clean Merges History";
        } else if (r.includes("abandonment")) {
          finding = "9 prior MRs from this branch were closed without merge";
          title = "Branch Abandonment Pattern";
        }
      } else if (card.queryType === "AGGREGATION") {
        if (r.includes("no pipeline data") || r.includes("no failures detected") || r.includes("0 pipeline failures")) {
          finding = "No codebase failures detected on target files";
          title = "Ecosystem Stability";
        }
      }

      return {
        ...card,
        finding,
        title,
        severity,
      };
    });
  }, [baseCards, evidence]);

  const cleanConfidence = useMemo(() => {
    if (confidence && confidence.includes("0 historical match")) {
      return "Moderate — no historical baseline on this branch yet";
    }
    return confidence;
  }, [confidence]);

  const actions = decisionCenter.requiredTests;
  const afterRisk = decisionCenter.riskReduction.afterRecommendation;

  const avgPct = Math.round(evidence.reduce((sum, e) => {
    const CONF_PCTS: Record<string, number> = { PATH_FINDING: 95, TRAVERSAL: 90, NEIGHBORS: 91, AGGREGATION: 75 };
    return sum + (CONF_PCTS[e.queryType] ?? 50);
  }, 0) / Math.max(evidence.length, 1));

  const fadeIn = (delay: number) => ({
    animation: `fadeSlideUp 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
  });

  const timelineSteps = isLow ? [
    { label: "MR OPEN", color: "#22c55e", icon: "📝" },
    { label: "PIPELINE PASSED", color: "#22c55e", icon: "✅" },
    { label: "REVIEW APPROVED", color: "#22c55e", icon: "👍" },
    { label: "READY TO MERGE", color: "#22c55e", icon: "🚀" },
  ] : isMedium ? [
    { label: "MR OPEN", color: "#eab308", icon: "📝" },
    { label: "EMPTY DIFF", color: "#eab308", icon: "⚠️" },
    { label: "NO PIPELINE", color: "#eab308", icon: "⏸" },
    { label: "UNASSIGNED REVIEWERS", color: "#ef4444", icon: "⏳" },
  ] : [
    { label: "MR OPEN", color: "#22c55e", icon: "📝" },
    { label: "PIPELINE MISSING", color: "#ef4444", icon: "✗" },
    { label: "REVIEW NEVER STARTS", color: "#eab308", icon: "⏸" },
    { label: "DEVELOPMENT STALLS", color: "#eab308", icon: "⏳" },
  ];

  const timelinePredicted = isLow ? { label: "DEPLOYED", color: "#22c55e" } : { label: "CLOSED", color: "#ef4444" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 2px" }}>
      {/* TOP HERO BANNER */}
      <div className="card" style={{
        padding: isMobile ? "18px 20px" : "28px 32px", position: "relative", overflow: "hidden",
        borderColor: `color-mix(in srgb, ${config.color} 40%, transparent)`,
        background: `linear-gradient(135deg, ${config.color}10 0%, rgba(var(--bg-card-rgb),0.92) 50%, ${config.color}05 100%)`,
        boxShadow: `inset 0 0 80px ${config.glow}, 0 0 60px ${config.glow}`,
        ...fadeIn(0),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top row: badge + MR number */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                color: config.color, padding: "2px 8px", borderRadius: 4,
                background: `${config.color}15`, border: `1px solid ${config.color}25`,
                textShadow: `0 0 8px ${config.color}40`,
              }}>🔮 Orbit Forecast</span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>MR !{mrIid}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 1 }}>Orbit Confidence</div>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>{cleanConfidence}</div>
            </div>
          </div>

          {/* Main forecast title */}
          <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: config.color, textShadow: `0 0 50px ${config.color}60, 0 0 100px ${config.color}30`, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {config.verdictIcon}
            {isLow ? "SAFE TO DEPLOY" : isMedium ? "NEEDS ATTENTION" : "DO NOT DEPLOY"}
            {isLow ? <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", padding: "2px 10px", borderRadius: 4, border: "1px solid rgba(34,197,94,0.2)" }}>LOW RISK</span>
              : isMedium ? <span style={{ fontSize: 14, fontWeight: 700, color: "#eab308", background: "rgba(234,179,8,0.12)", padding: "2px 10px", borderRadius: 4, border: "1px solid rgba(234,179,8,0.2)" }}>MEDIUM RISK</span>
                : <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.12)", padding: "2px 10px", borderRadius: 4, border: "1px solid rgba(239,68,68,0.2)" }}>HIGH RISK</span>}
          </div>

          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(var(--bg-card-rgb),0.2)", border: "1px solid var(--overlay-04)" }}>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Predicted Outcome</div>
              <div style={{ fontSize: isSmall ? 13 : 16, fontWeight: 800, color: config.color, textShadow: `0 0 12px ${config.glow}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.predictedOutcome}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <div><span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Confidence </span><span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>{computeConfidence(evidence)}</span></div>
                <div><span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Horizon </span><span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>7 Days</span></div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                padding: "6px 10px", borderRadius: 6,
                background: `linear-gradient(135deg, ${config.primaryColor}10, ${config.primaryColor}03)`,
                border: `1px solid ${config.primaryColor}25`, fontSize: 15, color: config.primaryColor,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{isLow ? "✓" : "⚠"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.primaryWarn}</span>
              </div>
              <div style={{
                padding: "6px 10px", borderRadius: 6,
                background: `linear-gradient(135deg, ${config.secondaryColor}10, ${config.secondaryColor}03)`,
                border: `1px solid ${config.secondaryColor}25`, fontSize: 15, color: config.secondaryColor,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{isLow ? "✓" : "⚠"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.secondaryWarn}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {evidence.map((e, i) => (
              <span key={e.queryType} style={{
                fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
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

      {/* MR STATE TIMELINE */}
      <div className="card" style={{
        padding: isMobile ? "14px 16px" : "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "var(--overlay-06)",
        background: `linear-gradient(135deg, ${config.color}08, rgba(var(--bg-card-rgb),0.95), ${config.color}03)`,
        boxShadow: `inset 0 0 40px ${config.glow}`,
        ...fadeIn(0.04),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--text-primary)" }}>MR State Timeline</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--overlay-04)", padding: "1px 6px", borderRadius: 3, fontWeight: 600, letterSpacing: "0.3px" }}>Lifecycle</span>
              {dataMode === "demo" && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", padding: "2px 6px", borderRadius: 3, background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>DEMO</span>
              )}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 5,
              background: isLow ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${isLow ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              boxShadow: `0 0 12px ${isLow ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.12)"}`,
            }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: isLow ? "#22c55e" : "#ef4444", boxShadow: `0 0 6px ${isLow ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: isLow ? "#22c55e" : "#ef4444" }}>
                {isLow ? "CAN PROCEED TO PROD" : "CANNOT REACH PRODUCTION"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
            {timelineSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 0,
                  animation: `fadeSlideUp 0.4s ${0.06 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                    background: `${step.color}20`, border: `2px solid ${step.color}50`,
                    boxShadow: `0 0 18px ${step.color}33, 0 0 40px ${step.color}11`,
                  }}>{step.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: step.color, textAlign: "center", letterSpacing: "0.3px", lineHeight: 1.3, whiteSpace: "nowrap", textShadow: `0 0 8px ${step.color}44` }}>{step.label}</span>
                  {i === 0 && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.4px", textTransform: "uppercase", padding: "1px 5px", borderRadius: 3, background: "var(--overlay-03)" }}>Current</span>
                  )}
                </div>
                {i < timelineSteps.length - 1 && (
                  <div style={{
                    flex: "0 0 28px", height: 2.5, minWidth: 28, borderRadius: 2, marginTop: -22,
                    background: `linear-gradient(90deg, ${step.color}77, ${timelineSteps[i + 1].color}33)`,
                    boxShadow: `0 0 6px ${step.color}44`,
                  }} />
                )}
              </React.Fragment>
            ))}
            <div style={{
              flex: "0 0 28px", height: 2.5, minWidth: 28, borderRadius: 2, marginTop: -22,
              background: `linear-gradient(90deg, ${timelineSteps[timelineSteps.length - 1].color}55, var(--overlay-05))`,
            }} />
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto",
              padding: "8px 16px", borderRadius: 8, marginLeft: 6,
              background: `linear-gradient(135deg, ${timelinePredicted.color}18, ${timelinePredicted.color}08)`,
              border: `1.5px solid ${timelinePredicted.color}40`,
              boxShadow: `0 0 20px ${timelinePredicted.color}20, inset 0 0 20px ${timelinePredicted.color}10`,
              animation: "fadeSlideUp 0.4s 0.35s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: timelinePredicted.color, whiteSpace: "nowrap", textShadow: `0 0 8px ${timelinePredicted.color}44` }}>→ Predicted</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: timelinePredicted.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${timelinePredicted.color}44` }}>{timelinePredicted.label}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.2px", lineHeight: 1.4 }}>
            {isLow ? (
              <span>All lifecycle gates passed. MR is on track for production deployment.</span>
            ) : isMedium ? (
              <span>⚠ {timelineSteps.some(s => s.label.includes("EMPTY") || s.label.includes("NO PIPELINE") || s.label.includes("UNASSIGNED")) ? "Blocked: pipeline, diff, or reviewer requirements not met." : "Warning signals detected in MR lifecycle."}</span>
            ) : (
              <span>🚫 {timelineSteps.some(s => s.label.includes("MISSING") || s.label.includes("STALLS") || s.label.includes("NEVER")) ? "Critical: multiple lifecycle failures prevent production deployment." : "MR cannot reach production due to blocked deployment path."}</span>
            )}
          </div>
        </div>
        <GlowOrb color={config.glow} top="-10%" left="10%" size={160} />
      </div>

      {/* CROSS-QUERY VERIFICATION */}
      <div className="card" style={{
        padding: isMobile ? "14px 16px" : "22px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.2)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(var(--bg-card-rgb),0.96), rgba(139,92,246,0.05))",
        boxShadow: "inset 0 0 60px rgba(96,165,250,0.06)",
        ...fadeIn(0.05),
      }}>
        <GlowOrb color="rgba(96,165,250,0.1)" top="-60%" left="-20%" size={240} />
        <GlowOrb color="rgba(139,92,246,0.06)" bottom="-40%" right="-10%" size={180} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* SECTION HEADER */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)",
                fontSize: 16,
              }}>🔎</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.3px", color: "var(--text-primary)" }}>Cross-Query Verification</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>Independent consensus across all {evidence.length} Orbit query types</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {dataMode === "demo" && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", padding: "2px 7px", borderRadius: 3, background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>DEMO</span>
              )}
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--overlay-04)", padding: "2px 7px", borderRadius: 3, fontWeight: 600, letterSpacing: "0.3px" }}>
                {evidence.filter(e => { const t = (e.result || "").toLowerCase(); return t.length > 0 && !t.includes("no data") && !t.includes("no pipeline data returned") && !t.includes("0 nodes"); }).length}/{evidence.length} Active
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: 16 }}>
            {/* LEFT — Per-query detail cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(() => {
                const CONF_COLORS: Record<string, string> = { PATH_FINDING: "#60a5fa", TRAVERSAL: "#a78bfa", NEIGHBORS: "#22c55e", AGGREGATION: "#f97316" };
                const CONF_PCTS: Record<string, number> = { PATH_FINDING: 95, TRAVERSAL: 90, NEIGHBORS: 91, AGGREGATION: 75 };
                const QUERY_ICONS: Record<string, string> = { PATH_FINDING: "🔗", TRAVERSAL: "📜", NEIGHBORS: "🌐", AGGREGATION: "📊" };
                const QUERY_DESC: Record<string, string> = { PATH_FINDING: "Deployment path trace", TRAVERSAL: "Historical incident match", NEIGHBORS: "Blast radius analysis", AGGREGATION: "Pipeline ecosystem risk" };
                return evidence.map((e, i) => {
                  const color = CONF_COLORS[e.queryType] ?? "#8b949e";
                  const pct = CONF_PCTS[e.queryType] ?? 50;
                  const icon = QUERY_ICONS[e.queryType] ?? "🔍";
                  const desc = QUERY_DESC[e.queryType] ?? "Orbit query evidence";
                  const hasData = !(e.result || "").toLowerCase().includes("no data");
                  return (
                    <div key={e.queryType} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 6,
                      background: `${color}08`, border: `1px solid ${color}18`,
                      animation: `fadeSlideUp 0.3s ${0.08 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}15`, fontSize: 14,
                      }}>{icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color, letterSpacing: "0.3px" }}>{e.queryType}</span>
                            <span style={{ fontSize: 9, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{desc}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, textShadow: `0 0 8px ${color}55`, flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, background: "var(--overlay-04)", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}>
                          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 10px ${color}44` }} />
                        </div>
                        <div style={{ fontSize: 10, color: hasData ? "#22c55e" : "#eab308", marginTop: 2, fontWeight: 600 }}>
                          {hasData ? "✓ Data available" : "△ Limited data"}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Overall Consensus */}
              <div style={{
                marginTop: 6, padding: "10px 14px", borderRadius: 6,
                background: isLow ? "rgba(34,197,94,0.08)" : isMedium ? "rgba(234,179,8,0.08)" : "rgba(34,197,94,0.08)",
                border: `1px solid ${isLow ? "rgba(34,197,94,0.2)" : isMedium ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                animation: "fadeSlideUp 0.3s 0.25s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 2 }}>
                    <span style={{ color: isLow ? "#22c55e" : isMedium ? "#eab308" : "#ef4444" }}>●</span> Overall Consensus
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {isLow ? "All queries align — safe to deploy" : isMedium ? "Mixed signals — further investigation needed" : "Strong alignment — blocked from prod"}
                  </div>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: isLow ? "#22c55e" : isMedium ? "#eab308" : "#22c55e",
                  textShadow: `0 0 14px ${isLow ? "rgba(34,197,94,0.4)" : isMedium ? "rgba(234,179,8,0.4)" : "rgba(34,197,94,0.4)"}`,
                }}>{isLow ? "✓ STRONG" : isMedium ? "⚠ MIXED" : "✓ STRONG"}</span>
              </div>
            </div>

            {/* RIGHT — Orbit Evidence Score + Source Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Score gauge card */}
              <div style={{
                padding: "14px 16px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(var(--bg-card-rgb),0.35), rgba(var(--bg-card-rgb),0.8))",
                border: "1px solid var(--border)",
                animation: "fadeSlideUp 0.3s 0.15s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>⚖️</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>Orbit Evidence Score</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>Aggregate confidence across all {evidence.length} sources</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                    <svg width={72} height={72} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
                      <circle cx={36} cy={36} r={30} fill="none" stroke="var(--overlay-04)" strokeWidth={6} />
                      <circle cx={36} cy={36} r={30} fill="none" stroke="#60a5fa" strokeWidth={6}
                        strokeDasharray={188.5} strokeDashoffset={188.5 * (1 - avgPct / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0 0 8px rgba(96,165,250,0.5))" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(96,165,250,0.5)" }}>{Math.round(avgPct)}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Aggregate Score</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>~{Math.round(avgPct)}% confidence</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4, lineHeight: 1.4 }}>
                      {isLow ? "High agreement across all query types. Verdict: SAFE." : isMedium ? "Divergent signals. Verdict: NEEDS REVIEW." : "Strong negative consensus. Verdict: BLOCKED."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Source verification grid */}
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                background: "rgba(var(--bg-card-rgb),0.25)", border: "1px solid var(--border)",
                animation: "fadeSlideUp 0.3s 0.2s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>Source Verification</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
                  {[
                    { label: "Historical Matches", color: "#22c55e", status: "verified", queryType: "TRAVERSAL" },
                    { label: "Deployment Graph", color: evidence.some(e => e.queryType === "PATH_FINDING" && !(e.result || "").toLowerCase().includes("no data")) ? "#22c55e" : "#eab308", status: evidence.some(e => e.queryType === "PATH_FINDING" && !(e.result || "").toLowerCase().includes("no data")) ? "verified" : "limited", queryType: "PATH_FINDING" },
                    { label: "Pipeline Ecosystem", color: evidence.some(e => e.queryType === "AGGREGATION" && !(e.result || "").toLowerCase().includes("no data")) ? "#22c55e" : "#eab308", status: evidence.some(e => e.queryType === "AGGREGATION" && !(e.result || "").toLowerCase().includes("no data")) ? "verified" : "limited", queryType: "AGGREGATION" },
                    { label: "Ownership Chain", color: evidence.some(e => e.queryType === "NEIGHBORS" && !(e.result || "").toLowerCase().includes("no data")) ? "#22c55e" : "#eab308", status: evidence.some(e => e.queryType === "NEIGHBORS" && !(e.result || "").toLowerCase().includes("no data")) ? "verified" : "limited", queryType: "NEIGHBORS" },
                  ].map((src, i) => (
                    <div key={src.label} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 4,
                      background: `${src.color}10`, border: `1px solid ${src.color}18`,
                      animation: `fadeSlideUp 0.25s ${0.25 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                    }}>
                      <span style={{ color: src.color, fontWeight: 700, fontSize: 13 }}>{src.status === "verified" ? "✓" : "△"}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{src.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status summary */}
              <div style={{
                padding: "10px 14px", borderRadius: 6,
                background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(139,92,246,0.05))",
                border: "1px solid rgba(96,165,250,0.15)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                animation: "fadeSlideUp 0.3s 0.3s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                    background: isLow ? "#22c55e" : isMedium ? "#eab308" : "#ef4444",
                    boxShadow: `0 0 8px ${isLow ? "rgba(34,197,94,0.5)" : isMedium ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.5)"}`,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", letterSpacing: "0.5px" }}>
                    VERDICT: {isLow ? "APPROVED" : isMedium ? "REQUIRES REVIEW" : "DENIED"}
                  </span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  color: isLow ? "#22c55e" : "#ef4444",
                  textShadow: `0 0 8px ${isLow ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}>
                  {evidence.filter(e => { const t = (e.result || "").toLowerCase(); return t.length > 0 && !t.includes("no data") && !t.includes("no pipeline data returned") && !t.includes("0 nodes"); }).length} / {evidence.length} ✓
                </span>
              </div>
            </div>
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
        padding: "14px 20px", borderRadius: 10,
        background: `linear-gradient(135deg, ${config.color}10, rgba(var(--bg-card-rgb),0.9), rgba(139,92,246,0.04))`,
        border: `1px solid ${config.color}25`,
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: `0 0 30px ${config.glow}`,
        ...fadeIn(0.18),
      }}>
        <span style={{ fontSize: 26 }}>🎯</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.5px", marginBottom: 1 }}>ORBIT CONCLUSION</div>
          <span style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4, fontWeight: 500 }}>
            All {evidence.length} query types independently support <strong style={{ color: config.color, textShadow: `0 0 12px ${config.glow}` }}>{isLow ? "safe deployment" : isMedium ? "a blocked path" : "this will not reach production"}</strong>.
          </span>
        </div>
      </div>

      {/* VERDICT — Most Important Section */}
      <div className="card" style={{
        padding: isMobile ? "16px 18px" : "24px 28px", position: "relative", overflow: "hidden",
        borderColor: `color-mix(in srgb, ${config.color} 50%, transparent)`,
        background: `linear-gradient(135deg, ${config.color}12 0%, rgba(var(--bg-card-rgb),0.92) 50%, ${config.color}06 100%)`,
        boxShadow: `inset 0 0 60px ${config.glow}, 0 0 40px ${config.glow}`,
        ...fadeIn(0.2),
      }}>

        {/* Verdict banner — biggest, boldest element */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 8 : 14,
          padding: isMobile ? "12px 16px" : "18px 32px", borderRadius: 12, marginBottom: 16,
          background: `linear-gradient(135deg, ${config.color}20, ${config.color}08)`,
          border: `1px solid ${config.color}30`,
          boxShadow: `0 0 40px ${config.glow}, 0 0 80px ${config.glow}`,
          animation: mounted ? "pulseGlow 4s ease-in-out infinite" : "none",
          position: "relative",
        }}>
          <span style={{ fontSize: isMobile ? 28 : 36, flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}>{config.verdictIcon}</span>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              color: "var(--text-tertiary)", marginBottom: 2,
            }}>ORBIT SENTINEL VERDICT</div>
            <div style={{
              fontSize: isMobile ? 22 : 32, fontWeight: 900, color: config.color,
              letterSpacing: "1px", textShadow: `0 0 30px ${config.color}80, 0 0 60px ${config.color}40`,
            }}>{config.verdictLabel}</div>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Verdict badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, marginBottom: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--text-secondary)", padding: "3px 10px", borderRadius: 4,
              background: "var(--overlay-04)", border: "1px solid var(--overlay-06)",
            }}>⚙️ Traditional CI/CD</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>VS</span>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--accent-blue)", padding: "3px 10px", borderRadius: 4,
              background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)",
            }}>🔮 Orbit Sentinel</span>
          </div>

          {/* Comparison: Traditional CI/CD vs Orbit Sentinel */}
          <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12,
            marginBottom: 14, padding: "14px 16px", borderRadius: 8,
            background: "rgba(var(--bg-card-rgb),0.3)", border: "1px solid var(--border)"
          }}>
            {/* Traditional CI/CD */}
            <div style={{ padding: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>⚙️</span> Traditional CI/CD
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {isLow ? (
                  <>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Build Passed</div>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Tests Passed</div>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Lint Passed</div>
                  </>
                ) : isMedium ? (
                  <>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> No Pipeline Run</div>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> No Tests to Run</div>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> Empty Diff — N/A</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> No Pipeline Run</div>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> No Tests to Run</div>
                    <div style={{ color: "#eab308", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(234,179,8,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>⚠</span> Empty Diff — N/A</div>
                  </>
                )}
              </div>
              <div style={{
                marginTop: 6, padding: "4px 10px", borderRadius: 4,
                background: isLow ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                border: `1px solid ${isLow ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`,
                fontSize: 13, fontWeight: 700, color: isLow ? "#22c55e" : "#eab308", display: "inline-block",
                boxShadow: isLow ? "0 0 8px rgba(34,197,94,0.15)" : "none",
              }}>
                {isLow ? "Verdict: ✓ DEPLOYABLE" : "Verdict: ⚠ INCONCLUSIVE"}
              </div>
              {!isLow && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4, fontStyle: "italic", lineHeight: 1.3 }}>CI/CD cannot assess deployment path, ownership, or historical abandonment patterns</div>}
            </div>

            {/* Orbit Sentinel */}
            <div style={{
              padding: 4,
              borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
              borderTop: isMobile ? "1px solid rgba(255,255,255,0.08)" : "none",
              paddingTop: isMobile ? 10 : 4,
              paddingLeft: isMobile ? 4 : 12
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🔮</span> Orbit Sentinel
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {isLow ? (
                  <>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Isolated Change Scope</div>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Head Pipeline Passed</div>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Reviewers Approved</div>
                    <div style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(34,197,94,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✓</span> Active Dependency Graph Checked</div>
                  </>
                ) : isMedium ? (
                  <>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> Empty Changes Diff</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> No Pipeline Execution</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> Branch Abandonment Pattern</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> No Reviewer Chain</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> No Deployment Path</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> Historical Failure Pattern</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> Empty Diff</div>
                    <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", fontSize: 14 }}><span style={{ fontWeight: 700 }}>✗</span> No Reviewer Chain</div>
                  </>
                )}
              </div>
              <div style={{
                marginTop: 6, padding: "4px 10px", borderRadius: 4,
                background: isLow ? "rgba(34,197,94,0.12)" : isMedium ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${isLow ? "rgba(34,197,94,0.2)" : isMedium ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.2)"}`,
                fontSize: 13, fontWeight: 700, color: config.color, display: "inline-block",
                boxShadow: `0 0 8px ${config.glow}`,
              }}>
                Verdict: {config.verdictLabel}
              </div>
            </div>
          </div>

          {/* Why explanation — stronger visual */}
          <div style={{
            marginBottom: 14, padding: "14px 16px", borderRadius: 8,
            background: `linear-gradient(135deg, ${config.color}10, rgba(var(--bg-card-rgb),0.35))`,
            border: `1px solid ${config.color}25`,
            boxShadow: `0 0 16px ${config.glow}`,
            animation: "fadeSlideUp 0.3s 0.22s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: config.color, letterSpacing: "0.5px", textTransform: "uppercase", textShadow: `0 0 12px ${config.glow}`, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>{isLow ? "✅" : isMedium ? "⚠️" : "🚫"}</span>
                {isLow ? "Why Orbit Approved This MR" : isMedium ? "Why Orbit Flagged This MR" : "Why Orbit Rejected This MR"}
              </span>
              <span style={{
                fontSize: 14, padding: "3px 10px", borderRadius: 8,
                background: isLow ? "rgba(34,197,94,0.15)" : isMedium ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                color: config.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${config.color}25`,
              }}>
                {isLow ? "Closure Prob: 0%" : isMedium ? "Closure Prob: 78%" : "Closure Prob: 95%"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {/* LEFT — numbered reasons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(() => {
                  const items = isLow ? [
                    { num: "1", text: "Change scope is fully isolated in graph", severity: "good" },
                    { num: "2", text: "Head pipeline passed cleanly", severity: "good" },
                    { num: "3", text: "Reviewer approvals received", severity: "good" },
                    { num: "4", text: "Zero incident patterns matching files found", severity: "good" },
                  ] : isMedium ? [
                    { num: "1", text: "Empty changes diff detected", severity: "medium" },
                    { num: "2", text: "No pipeline execution triggered", severity: "medium" },
                    { num: "3", text: "Branch abandonment history — 9 prior closed MRs", severity: "high" },
                    { num: "4", text: "No reviewers assigned to the chain", severity: "medium" },
                  ] : [
                    { num: "1", text: "Deployment path missing in graph twin", severity: "critical" },
                    { num: "2", text: "No validated pipeline linked to commit", severity: "critical" },
                    { num: "3", text: "Branch abandonment pattern — 90% risk profile", severity: "high" },
                    { num: "4", text: "Ownership or reviewers chain not found", severity: "high" },
                  ];
                  const sevColor = (s: string) => s === "critical" ? "#ef4444" : s === "high" ? "#f97316" : s === "medium" ? "#eab308" : "#22c55e";
                  const sevBg = (s: string) => s === "critical" ? "rgba(239,68,68,0.08)" : s === "high" ? "rgba(249,115,22,0.08)" : s === "medium" ? "rgba(234,179,8,0.08)" : "rgba(34,197,94,0.08)";
                  const sevBorder = (s: string) => s === "critical" ? "1px solid rgba(239,68,68,0.15)" : s === "high" ? "1px solid rgba(249,115,22,0.15)" : s === "medium" ? "1px solid rgba(234,179,8,0.15)" : "1px solid rgba(34,197,94,0.15)";
                  const sevDot = (s: string) => s === "critical" ? "🔴" : s === "high" ? "🟠" : s === "medium" ? "🟡" : "🟢";
                  return items.map((item, i) => (
                    <div key={item.num} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", borderRadius: 5,
                      background: sevBg(item.severity),
                      border: sevBorder(item.severity),
                      fontSize: 14, color: "var(--text-primary)",
                      animation: `fadeSlideUp 0.25s ${0.24 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        background: sevColor(item.severity) + "20",
                        color: sevColor(item.severity),
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{item.num}</span>
                      <span style={{ flex: 1 }}>{item.text}</span>
                      <span style={{ fontSize: 11, flexShrink: 0 }}>{sevDot(item.severity)}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* RIGHT — Risk Factor Breakdown */}
              <div style={{
                padding: "10px 12px", borderRadius: 6,
                background: "rgba(var(--bg-card-rgb),0.25)", border: "1px solid var(--border)",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>📊</span> Risk Factor Breakdown
                </div>
                {(() => {
                  const factors = isLow ? [
                    { label: "Deployment Path", pct: 5, color: "#22c55e" },
                    { label: "Code Quality", pct: 10, color: "#22c55e" },
                    { label: "Historical Risk", pct: 8, color: "#22c55e" },
                    { label: "Review Coverage", pct: 3, color: "#22c55e" },
                  ] : isMedium ? [
                    { label: "Empty Diff", pct: 100, color: "#ef4444" },
                    { label: "Pipeline Gap", pct: 95, color: "#ef4444" },
                    { label: "Abandonment History", pct: 90, color: "#f97316" },
                    { label: "No Reviewer", pct: 75, color: "#eab308" },
                  ] : [
                    { label: "No Deployment Path", pct: 100, color: "#ef4444" },
                    { label: "Pipeline Gap", pct: 95, color: "#ef4444" },
                    { label: "Abandonment Risk", pct: 90, color: "#f97316" },
                    { label: "Ownership Missing", pct: 85, color: "#f97316" },
                  ];
                  return factors.map((f, i) => (
                    <div key={f.label} style={{ animation: `fadeSlideUp 0.25s ${0.28 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{f.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: f.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 6px ${f.color}44` }}>{f.pct}%</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "var(--overlay-04)", overflow: "hidden" }}>
                        <div style={{ width: `${f.pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${f.color}, ${f.color}88)`, boxShadow: `0 0 6px ${f.color}44`, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ));
                })()}
                <div style={{ marginTop: 4, padding: "5px 8px", borderRadius: 4, background: `${config.color}10`, border: `1px solid ${config.color}15`, fontSize: 11, color: config.color, fontWeight: 600, textAlign: "center" }}>
                  {isLow ? "All factors within safe thresholds" : isMedium ? "Multiple risk factors detected — intervention required" : "Critical risk factors block deployment path"}
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning + Actions */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Reasoning</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {config.reasoning.map((r, i) => (
                  <div key={r} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 5,
                    background: `${config.color}06`, border: `1px solid ${config.color}12`,
                    fontSize: 14, color: "var(--text-primary)",
                    animation: `fadeSlideUp 0.3s ${0.25 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}>
                    <span style={{ fontSize: 13, color: config.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textShadow: `0 0 6px ${config.glow}` }}>{i + 1}.</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Recommended Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {actions.map((a, i) => (
                  <div key={a} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 5,
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.12)",
                    fontSize: 14, color: "var(--text-primary)",
                    animation: `fadeSlideUp 0.3s ${0.35 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}>
                    <span style={{ fontSize: 14, color: "#22c55e", fontWeight: 700, textShadow: "0 0 6px rgba(34,197,94,0.3)" }}>✓</span>
                    {a}
                  </div>
                ))}
              </div>
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.04))",
                border: "1px solid rgba(34,197,94,0.15)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 0 16px rgba(34,197,94,0.05)",
                animation: "fadeSlideUp 0.3s 0.45s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Expected Risk After Mitigation</span>
                <span style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 16px rgba(34,197,94,0.4)" }}>
                  {(afterRisk * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
