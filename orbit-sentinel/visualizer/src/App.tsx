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
      { id: "u:1", label: "@pjphillips", type: "User", riskLevel: "critical" },
      { id: "mr:1", label: "MR !1: Initial commit", type: "MergeRequest" },
      { id: "mr:2", label: "MR !2: Add Sentinel agent", type: "MergeRequest" },
      { id: "mr:3", label: "MR !3: Add Sentinel agent", type: "MergeRequest", riskLevel: "high" },
      { id: "iss:1", label: "Issue #1", type: "Issue" },
      { id: "iss:2", label: "Issue #2", type: "Issue" },
      { id: "pl:1", label: "Pipeline #1", type: "Pipeline", riskLevel: "medium" },
      { id: "c:1", label: "c6f2f6f6", type: "Commit" },
      { id: "c:2", label: "a4d1d4d4", type: "Commit" },
      { id: "c:3", label: "b5e0e5e5", type: "Commit", riskLevel: "high" },
      { id: "f:1", label: "src/App.tsx", type: "File" },
      { id: "f:2", label: "src/main.tsx", type: "File" },
      { id: "f:3", label: "package.json", type: "File" },
      { id: "f:4", label: "vite.config.ts", type: "File" },
      { id: "f:5", label: "index.html", type: "File" },
      { id: "f:6", label: ".gitlab/agents/config.yaml", type: "File", riskLevel: "high" },
      { id: "f:7", label: ".gitlab/duo/agent.md", type: "File", riskLevel: "high" },
    ],
    links: [
      { source: "repo:1", target: "mr:1", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:2", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:3", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "iss:1", type: "HAS_ISSUE" },
      { source: "repo:1", target: "iss:2", type: "HAS_ISSUE" },
      { source: "repo:1", target: "pl:1", type: "HAS_PIPELINE" },
      { source: "repo:1", target: "f:1", type: "HAS_FILE" },
      { source: "repo:1", target: "f:2", type: "HAS_FILE" },
      { source: "repo:1", target: "f:3", type: "HAS_FILE" },
      { source: "repo:1", target: "f:4", type: "HAS_FILE" },
      { source: "repo:1", target: "f:5", type: "HAS_FILE" },
      { source: "repo:1", target: "f:6", type: "HAS_FILE" },
      { source: "repo:1", target: "f:7", type: "HAS_FILE" },
      { source: "mr:1", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:2", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:3", target: "u:1", type: "AUTHORED_BY" },
      { source: "iss:1", target: "u:1", type: "AUTHORED_BY" },
      { source: "iss:2", target: "u:1", type: "AUTHORED_BY" },
      { source: "pl:1", target: "u:1", type: "TRIGGERED_BY" },
      { source: "mr:1", target: "c:1", type: "HAS_COMMIT" },
      { source: "mr:2", target: "c:2", type: "HAS_COMMIT" },
      { source: "mr:3", target: "c:3", type: "HAS_COMMIT" },
      { source: "pl:1", target: "c:3", type: "HAS_COMMIT" },
      { source: "mr:3", target: "pl:1", type: "TRIGGERED_PIPELINE" },
      { source: "c:1", target: "f:1", type: "MODIFIES" },
      { source: "c:1", target: "f:2", type: "MODIFIES" },
      { source: "c:1", target: "f:3", type: "MODIFIES" },
      { source: "c:1", target: "f:4", type: "MODIFIES" },
      { source: "c:1", target: "f:5", type: "MODIFIES" },
      { source: "c:3", target: "f:6", type: "MODIFIES" },
      { source: "c:3", target: "f:7", type: "MODIFIES" },
    ],
  },
  riskData: { score: 0.68, level: "HIGH", breakdown: [
    { category: "Bus Factor", value: 9, maxValue: 10 },
    { category: "Test Coverage", value: 8, maxValue: 10 },
    { category: "Pipeline Risk", value: 4, maxValue: 10 },
    { category: "Duplicate Issues", value: 3, maxValue: 10 },
    { category: "No Deployments", value: 5, maxValue: 10 },
  ]},
  timelines: [
    { label: "Commits Analyzed", value: 3, color: "#22c55e" },
    { label: "MRs Discovered", value: 3, color: "#60a5fa" },
    { label: "Files in Graph", value: 11, color: "#a78bfa" },
    { label: "Risk Signals Found", value: 5, color: "#ef4444" },
    { label: "Risk Score (%)", value: 68, color: "#f97316" },
  ],
  summary: { project: "gitlab-ai-hackathon/transcend/39251857", mrIid: 3, branch: "3-add-orbit-sentinel-agent", totalNodes: 22, totalEdges: 40, riskScore: "68.0%", riskLevel: "HIGH", timestamp: new Date().toISOString() },
  hero: { mrIid: 3, riskLevel: "HIGH", riskScore: 0.68, predictedOutcome: "Single contributor risk — no reviewers, zero test coverage, no deployment chain", recommendedAction: "Add at least 1 reviewer, set up CI/CD pipeline with coverage, define deployment environments", confidence: "High (4 query types, 22 nodes discovered via Orbit traversal)", generatedUsing: "Generated using GitLab Orbit — real traversal on project 39251857" },
  evidence: [
    { queryType: "TRAVERSAL", queryName: "Full Graph Traversal", result: "→ 22 nodes, 40 relationships discovered across 6 node types\n→ Repository → 3 MRs → 3 Commits → 11 Files (4 hops)" },
    { queryType: "PATH_FINDING", queryName: "MR-to-Deployment Trace", result: "→ MR !3 → Commit b5e0e5e5 → Pipeline #1 (success, 0% coverage)\n→ No deployment chain found — 0 environments configured" },
    { queryType: "NEIGHBORS", queryName: "Blast Radius Computation", result: "→ 1 contributor impacts all 3 MRs (bus factor = 1)\n→ 0 reviewers across entire project history" },
    { queryType: "AGGREGATION", queryName: "Pipeline Risk Analysis", result: "→ 1 pipeline found (success), 2 MRs with NO pipelines\n→ Coverage: null — no test coverage instrumented" },
  ],
  decisionCenter: { deploymentStrategy: "Add .gitlab-ci.yml with test stage → deploy to Pages → monitor coverage", reviewers: [{ name: "@pjphillips", role: "Sole Contributor" }], requiredTests: ["Set up test framework (Vitest)", "Add CI pipeline with coverage threshold", "Configure at least staging environment"], rollbackStrategy: "No rollback path exists — create .gitlab-ci.yml with manual approval gates before defining environments", riskReduction: { current: 0.68, afterRecommendation: 0.29 } },
  counterfactuals: [
    { label: "Add CI Pipeline", riskAfter: 0.45, color: "#60a5fa" },
    { label: "Add Test Coverage", riskAfter: 0.35, color: "#22c55e" },
    { label: "Assign Reviewer", riskAfter: 0.42, color: "#a78bfa" },
    { label: "All Mitigations", riskAfter: 0.18, color: "#f97316" },
  ],
  incidents: [
    { similarity: 100, mrIid: 2, title: "Resolve 'Add Orbit Sentinel agent'", files: ["a4d1d4d4"], outcome: "Incident", rootCause: "MR !2 commit a4d1d4d4 has zero MODIFIES edges in Orbit graph", mitigation: "Always verify Orbit graph records new file changes after commit", recommendedAction: "Check Orbit graph ingestion after push", date: "2025-06-13" },
    { similarity: 90, mrIid: 1, title: "Initial commit", files: ["src/App.tsx", "package.json"], outcome: "Rollback", rootCause: "First issue created, closed by MR !2, then recreated as #2 and closed by MR !3", mitigation: "Link duplicate issues to avoid confusion in graph", recommendedAction: "Check for existing issues before creating new ones", date: "2025-06-13" },
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
