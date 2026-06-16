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
  const demoLabelRef = useRef<HTMLDivElement>(null);

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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [demo, startDemo, stopDemo]);

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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <header style={{ position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>🛰️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>Orbit Sentinel</div>
            <div style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginTop: -1 }}>Engineering Decision Intelligence</div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
          {/* Workflow steps mini-timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 500, marginRight: 4, letterSpacing: "0.3px" }}>FLOW</span>
            {FLOW_STEPS.map((s, i) => (
              <div key={s} title={s} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i < 5 ? "rgba(59,130,246,0.5)" : i < 7 ? "rgba(167,139,250,0.5)" : "rgba(34,197,94,0.5)",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {tabs.map(([k, lbl]) => (
            <button key={k} onClick={() => { if (demo) stopDemo(); setView(k); }} style={{
              padding: "4px 11px", fontSize: 11, fontWeight: view === k ? 600 : 400,
              border: view === k ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              borderRadius: 6, cursor: "pointer",
              background: view === k ? "rgba(59,130,246,0.12)" : "transparent",
              color: view === k ? "var(--accent-blue)" : "var(--text-secondary)",
              transition: "all 0.15s ease", letterSpacing: "0.2px",
            }}>{lbl}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
          <button onClick={demo ? stopDemo : startDemo} style={{
            padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: demo ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(59,130,246,0.4)",
            borderRadius: 6,
            background: demo ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
            color: demo ? "var(--accent-red)" : "var(--accent-blue)",
            transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 13 }}>{demo ? "■" : "▶"}</span>
            {demo ? "Stop Demo" : "Play Demo"}
          </button>
        </div>
      </header>

      {demo && (
        <div ref={demoLabelRef} style={{
          position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          animation: "fadeSlideDown 0.3s ease, pulseGlow 2s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            padding: "8px 20px", borderRadius: 24, fontSize: 11, fontWeight: 600,
            background: "rgba(59,130,246,0.15)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "var(--accent-blue)", letterSpacing: "1px", textTransform: "uppercase",
          }}>
            {demo && `DEMO · ${DEMO_STEPS[stepIndex].icon} ${DEMO_STEPS[stepIndex].label}`}
          </div>
          <div style={{
            padding: "4px 16px", borderRadius: 12, fontSize: 10,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "var(--text-secondary)",
          }}>
            {demo && DEMO_STEPS[stepIndex].sublabel}
          </div>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === stepIndex ? 16 : 6, height: 4, borderRadius: 2,
                background: i === stepIndex ? "var(--accent-blue)" : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      )}

      <main style={{ position: "relative", zIndex: 1, flex: 1, padding: 16, overflow: "auto", minHeight: 0 }}>
        {body()}
      </main>
    </div>
  );
}
