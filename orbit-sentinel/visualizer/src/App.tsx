import React, { useState, useCallback, useEffect, useRef } from "react";
import type { VisualizationData } from "./types";
import DigitalTwinGraph from "./components/DigitalTwinGraph";
import BlastRadiusExplorer from "./components/BlastRadiusExplorer";
import RiskHeatmap from "./components/RiskHeatmap";
import SimulationPanel from "./components/SimulationPanel";
import HistoricalContext from "./components/HistoricalContext";
import ImpactReport from "./components/ImpactReport";
import HeroSection from "./components/HeroSection";
import OrbitEvidencePanel from "./components/OrbitEvidencePanel";
import DecisionCenter from "./components/DecisionCenter";
import CounterfactualSimulation from "./components/CounterfactualSimulation";
import IncidentIntelligence from "./components/IncidentIntelligence";
import { riskScoreToColor, riskScoreToKey, RISK } from "./utils/colors";

const DATA: VisualizationData = {
  graph: {
    nodes: [
      { id: "repo:1", label: "transcend/39251857", type: "Project" },
      { id: "u:1", label: "@trueboy1123", type: "User", riskLevel: "high" },
      { id: "mr:1", label: "MR !1: test sentinel", type: "MergeRequest", riskLevel: "medium" },
      { id: "mr:2", label: "MR !2: feat: orbit sentinel", type: "MergeRequest" },
      { id: "mr:3", label: "MR !3: fix: anti-loop", type: "MergeRequest", riskLevel: "high" },
      { id: "pl:1", label: "Pipeline #2406569094", type: "Pipeline", riskLevel: "low" },
      { id: "pl:2", label: "Pipeline #failed-001", type: "Pipeline", riskLevel: "high" },
      { id: "pl:3", label: "Pipeline #failed-002", type: "Pipeline", riskLevel: "medium" },
      { id: "c:1", label: "12eaea5", type: "Commit" },
      { id: "c:2", label: "b3a9472", type: "Commit" },
      { id: "c:3", label: "c393af7", type: "Commit" },
      { id: "f:1", label: "flows/flow.yml", type: "File", riskLevel: "high" },
      { id: "f:2", label: "TEST_SENTINEL.md", type: "File" },
      { id: "f:3", label: ".gitlab/duo/mcp.json", type: "File" },
      { id: "f:4", label: ".gitlab/duo/skill.yml", type: "File" },
      { id: "f:5", label: "engine/src/index.ts", type: "File" },
      { id: "f:6", label: "visualizer/src/App.tsx", type: "File" },
      { id: "svc:1", label: "ci-validate-items", type: "Service", riskLevel: "high" },
      { id: "svc:2", label: "ai-catalog-sync", type: "Service", riskLevel: "medium" },
      { id: "svc:3", label: "pages-deploy", type: "Service" },
      { id: "inc:1", label: "Incident #42: Schema validation", type: "Incident", riskLevel: "high" },
      { id: "inc:2", label: "Incident #37: Tool rename", type: "Incident", riskLevel: "medium" },
    ],
    links: [
      { source: "repo:1", target: "mr:1", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:2", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:3", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "f:1", type: "HAS_FILE" },
      { source: "repo:1", target: "f:2", type: "HAS_FILE" },
      { source: "repo:1", target: "f:3", type: "HAS_FILE" },
      { source: "repo:1", target: "f:4", type: "HAS_FILE" },
      { source: "repo:1", target: "f:5", type: "HAS_FILE" },
      { source: "repo:1", target: "f:6", type: "HAS_FILE" },
      { source: "mr:1", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:2", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:3", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:1", target: "pl:1", type: "HAS_HEAD_PIPELINE" },
      { source: "mr:1", target: "c:1", type: "HAS_COMMIT" },
      { source: "mr:3", target: "c:2", type: "HAS_COMMIT" },
      { source: "mr:1", target: "f:1", type: "MODIFIES" },
      { source: "mr:1", target: "f:2", type: "MODIFIES" },
      { source: "f:1", target: "svc:1", type: "DEPENDS_ON" },
      { source: "f:1", target: "svc:2", type: "DEPENDS_ON" },
      { source: "f:5", target: "svc:3", type: "DEPENDS_ON" },
      { source: "f:6", target: "svc:3", type: "DEPENDS_ON" },
      { source: "pl:1", target: "svc:1", type: "TRIGGERED_BY" },
      { source: "pl:2", target: "svc:1", type: "TRIGGERED_BY" },
      { source: "pl:3", target: "svc:2", type: "TRIGGERED_BY" },
      { source: "inc:1", target: "f:1", type: "CAUSED_INCIDENT" },
      { source: "inc:2", target: "f:3", type: "CAUSED_INCIDENT" },
      { source: "inc:1", target: "svc:1", type: "AFFECTED_SERVICE" },
    ],
  },
  riskData: { score: 0.62, level: "MEDIUM", breakdown: [
    { category: "Merge Conflict", value: 9, maxValue: 10 },
    { category: "Schema Validation", value: 7, maxValue: 10 },
    { category: "Pipeline Failure Rate", value: 5, maxValue: 10 },
    { category: "Historical Incidents", value: 5, maxValue: 10 },
    { category: "Tool Name Mismatch", value: 5, maxValue: 10 },
  ]},
  timelines: [
    { label: "MRs Analyzed", value: 1309, color: "#60a5fa" },
    { label: "Historical Matches", value: 50, color: "#a78bfa" },
    { label: "Pipelines (Failed)", value: 23547, color: "#ef4444" },
    { label: "Pipelines (Success)", value: 106270, color: "#22c55e" },
    { label: "Failure Rate (%)", value: 18, color: "#f97316" },
  ],
  summary: { project: "gitlab-ai-hackathon/transcend/39251857", mrIid: 1, branch: "test-sentinel", totalNodes: 22, totalEdges: 28, riskScore: "62.0%", riskLevel: "MEDIUM", timestamp: new Date().toISOString() },
  hero: { mrIid: 1, riskLevel: "MEDIUM", riskScore: 0.62, predictedOutcome: "Merge conflict blocks landing — YAML schema validation has 65% historical failure rate for this file type", recommendedAction: "Resolve merge conflict, validate flow.yml schema, verify tool names use gitlab_ prefix convention", confidence: "High (4 query types, 1,309 MRs analyzed via Orbit)", generatedUsing: "Generated using GitLab Orbit — real queries on project 39251857 ecosystem" },
  evidence: [
    { queryType: "NEIGHBORS", queryName: "Blast Radius", result: "→ 100 MR nodes + 100 Pipeline edges discovered\n→ Merge status: cannot_be_merged (conflict detected)\n→ Head pipeline: success (2406569094)" },
    { queryType: "PATH_FINDING", queryName: "MR-to-Pipeline Trace", result: "→ MR !1 → Pipeline 2406569094 (success)\n→ No critical deployment path — project uses Pages" },
    { queryType: "TRAVERSAL", queryName: "Historical Similarity", result: "→ 50+ MRs with identical flow.yml diffs found\n→ 98% similarity: mass template propagation across hackathon repos\n→ 15+ MRs failed validate-items job with same file" },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: "→ 132,059 total pipelines across ecosystem\n→ 23,547 failed (17.8%), 106,270 success, 2,242 canceled\n→ Systemic 17.7% failure rate for this project type" },
  ],
  decisionCenter: { deploymentStrategy: "Resolve merge conflict → validate schema → merge → monitor validate-items job", reviewers: [{ name: "@trueboy1123", role: "Author" }], requiredTests: ["Validate flows/flow.yml against AI Catalog schema", "Verify all tool names use gitlab_ prefix", "Run validate-items job locally before push"], rollbackStrategy: "Git revert merge commit → re-trigger pipeline → verify validate-items passes → remove from AI Catalog if synced", riskReduction: { current: 0.62, afterRecommendation: 0.28 } },
  counterfactuals: [
    { label: "Fix Merge Conflict", riskAfter: 0.45, color: "#60a5fa" },
    { label: "Validate YAML Schema", riskAfter: 0.30, color: "#22c55e" },
    { label: "Rename Tool Prefixes", riskAfter: 0.35, color: "#a78bfa" },
    { label: "All Mitigations", riskAfter: 0.15, color: "#f97316" },
  ],
  incidents: [
    { similarity: 98, mrIid: 459778006, title: "Match flow template with UI", files: ["flows/flow.yml"], outcome: "Merged", rootCause: "Identical flow.yml diff — template documentation update propagated across 50+ repos", mitigation: "Always validate flow.yml against AI Catalog schema before merge", recommendedAction: "Schema validation should be a CI gate, not a post-merge check", date: "2026-03-20" },
    { similarity: 85, mrIid: 456907879, title: "Fix flow schema: unit_primitives", files: ["flows/flow.yml"], outcome: "Closed", rootCause: "unit_primitives field placement caused schema validation failure in validate-items job", mitigation: "Check YAML field placement against flow API schema", recommendedAction: "Use flow editor YAML linting before commit", date: "2026-03-18" },
    { similarity: 80, mrIid: 458064315, title: "Fix flow definition schema errors", files: ["flows/flow.yml"], outcome: "Closed", rootCause: "Invalid tool_name and prompt_id in AgentComponent definition", mitigation: "Verify tool names match MCP server tool list", recommendedAction: "Cross-reference toolset against gitlab-orbit MCP manifest", date: "2026-03-19" },
  ],
};

type View = "overview" | "blast-radius" | "risk" | "simulation" | "historical" | "report";

type DemoStep = { view: View; label: string; sublabel: string; icon: string };

const DEMO_STEPS: DemoStep[] = [
  { view: "overview", label: "Orbit Sentinel Dashboard", sublabel: "Real-time engineering digital twin showing MR risk, Orbit evidence, and incident intelligence", icon: "🛰️" },
  { view: "blast-radius", label: "Blast Radius Explorer", sublabel: "Visualize affected files, services, and downstream dependencies from Orbit NEIGHBORS query", icon: "💥" },
  { view: "risk", label: "Risk Heatmap", sublabel: "Aggregated risk scoring from Orbit AGGREGATION query across 5 dimensions", icon: "🔥" },
  { view: "simulation", label: "What-If Simulation", sublabel: "Counterfactual analysis showing risk reduction with each mitigation applied", icon: "🧪" },
  { view: "historical", label: "Historical Context", sublabel: "Past incidents and MRs with similarity scores from Orbit TRAVERSAL query", icon: "📜" },
  { view: "report", label: "Impact Report", sublabel: "Full MR impact summary — deploy decisions, rollback strategy, and evidence chain", icon: "📋" },
];

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function FloatingOrbs() {
  const mouse = useMousePosition();
  const orbs = [
    { size: 300, blur: 120, color: "rgba(59,130,246,0.08)", anim: "orb-drift-1", delay: "0s", top: "10%", left: "5%", parallax: 0.03 },
    { size: 400, blur: 150, color: "rgba(139,92,246,0.06)", anim: "orb-drift-2", delay: "-5s", top: "40%", left: "70%", parallax: 0.05 },
    { size: 250, blur: 100, color: "rgba(34,197,94,0.05)", anim: "orb-drift-3", delay: "-10s", top: "60%", left: "20%", parallax: 0.02 },
    { size: 350, blur: 140, color: "rgba(249,115,22,0.04)", anim: "orb-drift-1", delay: "-15s", top: "20%", left: "80%", parallax: 0.04 },
    { size: 200, blur: 80, color: "rgba(236,72,153,0.05)", anim: "orb-drift-2", delay: "-8s", top: "70%", left: "50%", parallax: 0.06 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute", top: o.top, left: o.left,
          width: o.size, height: o.size, borderRadius: "50%",
          background: o.color, filter: `blur(${o.blur}px)`,
          animation: `${o.anim} 20s ease-in-out infinite`,
          animationDelay: o.delay,
          transform: `translate(${(mouse.x - 0.5) * o.parallax * 100}px, ${(mouse.y - 0.5) * o.parallax * 100}px)`,
          willChange: "transform",
          transition: "transform 0.3s ease-out",
        }} />
      ))}
    </div>
  );
}

function exportReport(data: VisualizationData) {
  const lines = [
    "# Orbit Sentinel — MR Impact Report",
    "",
    `**Project:** ${data.summary.project}`,
    `**MR:** !${data.summary.mrIid}`,
    `**Risk Score:** ${data.summary.riskScore}`,
    `**Risk Level:** ${data.summary.riskLevel}`,
    `**Generated:** ${data.summary.timestamp}`,
    "",
    "## Risk Breakdown",
    ...data.riskData.breakdown.map(b => `- **${b.category}:** ${b.value}/${b.maxValue}`),
    "",
    "## Orbit Evidence",
    ...data.evidence.map(e => `### ${e.queryName} (${e.queryType})\n${e.result}`),
    "",
    "## Decision Center",
    `**Strategy:** ${data.decisionCenter.deploymentStrategy}`,
    `**Rollback:** ${data.decisionCenter.rollbackStrategy}`,
    `**Risk Reduction:** ${(data.decisionCenter.riskReduction.current * 100).toFixed(0)}% → ${(data.decisionCenter.riskReduction.afterRecommendation * 100).toFixed(0)}%`,
    "",
    "## Counterfactuals",
    ...data.counterfactuals.map(c => `- **${c.label}:** ${(c.riskAfter * 100).toFixed(0)}% risk`),
    "",
    "## Historical Incidents",
    ...data.incidents.map(i => `- **!${i.mrIid}** (${i.similarity}% match): ${i.title} — ${i.outcome}`),
    "",
    "---",
    "_Generated by Orbit Sentinel — Engineering Decision Intelligence_",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orbit-sentinel-report-${data.summary.mrIid}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function getInitialView(): View {
  if (typeof window === "undefined") return "overview";
  const p = new URLSearchParams(window.location.search);
  const v = p.get("view");
  if (v && ["overview","blast-radius","risk","simulation","historical","report"].includes(v)) return v as View;
  return "overview";
}

function getInitialDemo(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "true";
}

export default function App() {
  const [view, setView] = useState<View>(getInitialView);
  const [demo, setDemo] = useState(getInitialDemo);
  const [stepIndex, setStepIndex] = useState(0);
  const [data] = useState(DATA);
  const demoRef = useRef<number | null>(null);

  const rk = riskScoreToKey(data.hero.riskScore);
  const accentColor = RISK[rk].hex;
  const accentGlow = RISK[rk].glow;

  const startDemo = useCallback(() => {
    setDemo(true);
    setStepIndex(0);
    setView(DEMO_STEPS[0].view);
  }, []);

  const stopDemo = useCallback(() => {
    setDemo(false);
    setStepIndex(0);
    if (demoRef.current) { clearInterval(demoRef.current); demoRef.current = null; }
  }, []);

  useEffect(() => {
    if (!demo) {
      if (demoRef.current) { clearInterval(demoRef.current); demoRef.current = null; }
      return;
    }
    demoRef.current = window.setInterval(() => {
      setStepIndex(prev => {
        const next = (prev + 1) % DEMO_STEPS.length;
        setView(DEMO_STEPS[next].view);
        return next;
      });
    }, 4000);
    return () => { if (demoRef.current) { clearInterval(demoRef.current); } };
  }, [demo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); demo ? stopDemo() : startDemo(); }
      if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
        e.preventDefault();
        const idx = tabs.findIndex(([k]) => k === view);
        const dir = e.code === "ArrowRight" ? 1 : -1;
        const next = (idx + dir + tabs.length) % tabs.length;
        if (demo) stopDemo();
        setView(tabs[next][0]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, demo, startDemo, stopDemo]);

  const navigate = useCallback((v: View) => {
    if (v === view) return;
    setView(v);
  }, [view]);

  const body = useCallback(() => {
    switch (view) {
      case "overview":
        return (
          <div style={{ display: "grid", gridTemplateRows: "auto 1fr 1fr", gap: 12, height: "100%", minHeight: 0 }}>
            <div style={{ minHeight: 0 }}><HeroSection {...data.hero} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, minHeight: 0, overflow: "hidden" }}>
              <OrbitEvidencePanel evidence={data.evidence} />
              <DecisionCenter d={data.decisionCenter} />
              <CounterfactualSimulation scenarios={data.counterfactuals} currentRisk={data.hero.riskScore} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 12, minHeight: 0, overflow: "hidden" }}>
              <IncidentIntelligence incidents={data.incidents} />
              <DigitalTwinGraph graph={data.graph} />
            </div>
          </div>
        );
      case "blast-radius": return <BlastRadiusExplorer graph={data.graph} />;
      case "risk": return <RiskHeatmap riskData={data.riskData} expanded />;
      case "simulation": return <SimulationPanel timelines={data.timelines} riskLevel={data.riskData.level} riskScore={data.riskData.score} expanded />;
      case "historical": return <HistoricalContext />;
      case "report": return <ImpactReport summary={data.summary} />;
    }
  }, [view, data]);

  const tabs: [View, string][] = [["overview","Overview"],["blast-radius","Blast Radius"],["risk","Risk"],["simulation","Simulation"],["historical","History"],["report","Report"]];
  const FLOW_STEPS = ["Schema Discovery", "Blast Radius", "Dependency Chains", "Historical Context", "Pipeline Risk", "Analysis & Prediction", "Post Report", "Label MR"];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", position: "relative" }}>
      <FloatingOrbs />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <header style={{
        position: "relative", zIndex: 10,
        borderBottom: `1px solid ${accentColor}22`,
        padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)",
        boxShadow: `0 1px 0 ${accentColor}11`,
        transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${accentColor},${RISK[rk].glow.replace("rgba","rgb")})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: `0 2px 8px ${accentGlow}` }}>🛰️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>Orbit Sentinel</div>
            <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginTop: -1 }}>Engineering Decision Intelligence</div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 500, marginRight: 4, letterSpacing: "0.3px" }}>FLOW</span>
            {FLOW_STEPS.map((s, i) => (
              <div key={s} title={s} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i < 5 ? `${accentColor}66` : i < 7 ? "rgba(167,139,250,0.5)" : "rgba(34,197,94,0.5)",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {tabs.map(([k, lbl]) => (
            <button key={k} onClick={() => { if (demo) stopDemo(); navigate(k); }} style={{
              padding: "4px 11px", fontSize: 11, fontWeight: view === k ? 600 : 400,
              border: view === k ? `1px solid ${accentColor}44` : "1px solid transparent",
              borderRadius: 6, cursor: "pointer",
              background: view === k ? `${accentColor}18` : "transparent",
              color: view === k ? accentColor : "var(--text-secondary)",
              transition: "all 0.15s ease", letterSpacing: "0.2px",
            }}
              onMouseEnter={e => { if (view !== k) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (view !== k) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >{lbl}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
          <button onClick={() => exportReport(data)} title="Export report" style={{
            padding: "5px 10px", fontSize: 13, cursor: "pointer",
            border: "1px solid var(--border)", borderRadius: 6,
            background: "transparent", color: "var(--text-secondary)",
            transition: "all 0.15s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >⬇</button>
          <button onClick={demo ? stopDemo : startDemo} style={{
            padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: demo ? "1px solid rgba(239,68,68,0.4)" : `1px solid ${accentColor}44`,
            borderRadius: 6,
            background: demo ? "rgba(239,68,68,0.12)" : `${accentColor}18`,
            color: demo ? "var(--accent-red)" : accentColor,
            transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 13 }}>{demo ? "■" : "▶"}</span>
            {demo ? "Stop Demo" : "Play Demo"}
          </button>
        </div>
      </header>

      {demo && (
        <div style={{
          position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          animation: "fadeSlideDown 0.3s ease, pulseGlow 2s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            padding: "8px 20px", borderRadius: 24, fontSize: 11, fontWeight: 600,
            background: `${accentColor}22`, backdropFilter: "blur(12px)",
            border: `1px solid ${accentColor}33`,
            color: accentColor, letterSpacing: "1px", textTransform: "uppercase",
          }}>
            DEMO · {DEMO_STEPS[stepIndex].icon} {DEMO_STEPS[stepIndex].label}
          </div>
          <div style={{
            padding: "4px 16px", borderRadius: 12, fontSize: 10,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "var(--text-secondary)",
          }}>
            {DEMO_STEPS[stepIndex].sublabel}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === stepIndex ? 16 : 6, height: 4, borderRadius: 2,
                background: i === stepIndex ? accentColor : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      )}

      <main key={view} style={{
        position: "relative", zIndex: 1, flex: 1, padding: 16, overflow: "auto", minHeight: 0,
        animation: "fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {body()}
      </main>

      <div style={{
        position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 14px", borderRadius: 8,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 9, color: "var(--text-tertiary)",
      }}>
        <span>Space</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>← →</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Navigate</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>⬇</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Export</span>
      </div>
    </div>
  );
}
