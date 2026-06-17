import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { VisualizationData } from "./types";
import ErrorBoundary from "./components/ErrorBoundary";
import DigitalTwinGraph from "./components/DigitalTwinGraph";
import BlastRadiusExplorer from "./components/BlastRadiusExplorer";
import RiskInvestigation from "./components/RiskInvestigation";
import ForecastEngine from "./components/ForecastEngine";
import HistoricalContext from "./components/HistoricalContext";
import ImpactReport from "./components/ImpactReport";
import HeroSection from "./components/HeroSection";
import OrbitEvidencePanel from "./components/OrbitEvidencePanel";
import DecisionCenter from "./components/DecisionCenter";
import CounterfactualSimulation from "./components/CounterfactualSimulation";
import IncidentIntelligence from "./components/IncidentIntelligence";
import FutureTimeline from "./components/FutureTimeline";
import TaglineBanner from "./components/TaglineBanner";
import PathBrokenAnimation from "./components/PathBrokenAnimation";
import BackgroundParticles from "./components/BackgroundParticles";
import ImpactMetrics from "./components/ImpactMetrics";
import OnboardingOverlay from "./components/OnboardingOverlay";
import HelpTooltip from "./components/HelpTooltip";
import RealityCheck from "./components/RealityCheck";
import SimulateWebhook from "./components/SimulateWebhook";
import { riskScoreToKey, RISK } from "./utils/colors";

// API configuration — set VITE_API_BASE_URL as Vercel env var to enable live engine
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string || '';

const DATA: VisualizationData = {
  graph: {
    nodes: [
      { id: "repo:1", label: "transcend/39251857", type: "Project" },
      { id: "u:1", label: "@trueboy1123", type: "User", riskLevel: "high" },
      { id: "mr:10", label: "MR !10: analyze this MR", type: "MergeRequest", riskLevel: "high" },
      { id: "mr:1", label: "MR !1: test sentinel", type: "MergeRequest", riskLevel: "low" },
      { id: "mr:2", label: "MR !2: test sentinel", type: "MergeRequest", riskLevel: "medium" },
      { id: "mr:9", label: "MR !9: test sentinel", type: "MergeRequest", riskLevel: "medium" },
      { id: "pl:ecosystem", label: "Pipeline Ecosystem (132k+)", type: "Pipeline", riskLevel: "medium" },
      { id: "pl:1", label: "Pipeline #14878452199", type: "Pipeline", riskLevel: "low" },
      { id: "c:1", label: "12eaea5", type: "Commit" },
      { id: "c:2", label: "b3a94728", type: "Commit" },
      { id: "f:1", label: "flows/flow.yml", type: "File", riskLevel: "high" },
      { id: "f:2", label: "TEST_SENTINEL.md", type: "File" },
      { id: "f:3", label: ".gitlab/duo/mcp.json", type: "File" },
      { id: "f:4", label: ".gitlab/duo/skill.yml", type: "File" },
      { id: "svc:1", label: "ci-validate-items", type: "Service", riskLevel: "high" },
      { id: "svc:2", label: "ai-catalog-sync", type: "Service", riskLevel: "medium" },
      { id: "svc:3", label: "pages-deploy", type: "Service", riskLevel: "low" },
      { id: "inc:1", label: "Incident: Abandoned branch pattern", type: "Incident", riskLevel: "high" },
      { id: "inc:2", label: "Incident: Draft MR with no pipeline", type: "Incident", riskLevel: "high" },
      { id: "iss:1", label: "Issue: duplicate pipeline config", type: "Issue", riskLevel: "medium" },
      { id: "iss:2", label: "Issue: missing coverage threshold", type: "Issue", riskLevel: "low" },
      { id: "mr:3", label: "MR !3: test sentinel", type: "MergeRequest", riskLevel: "low" },
    ],
    links: [
      { source: "repo:1", target: "mr:10", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:1", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:2", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "mr:9", type: "HAS_MERGE_REQUEST" },
      { source: "repo:1", target: "f:1", type: "HAS_FILE" },
      { source: "repo:1", target: "f:2", type: "HAS_FILE" },
      { source: "repo:1", target: "f:3", type: "HAS_FILE" },
      { source: "repo:1", target: "f:4", type: "HAS_FILE" },
      { source: "mr:1", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:2", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:9", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:10", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:1", target: "pl:1", type: "HAS_HEAD_PIPELINE" },
      { source: "mr:10", target: "c:1", type: "HAS_COMMIT" },
      { source: "mr:1", target: "c:2", type: "HAS_COMMIT" },
      { source: "mr:1", target: "f:1", type: "MODIFIES" },
      { source: "mr:2", target: "f:1", type: "MODIFIES" },
      { source: "mr:9", target: "f:1", type: "MODIFIES" },
      { source: "f:1", target: "svc:1", type: "DEPENDS_ON" },
      { source: "f:1", target: "svc:2", type: "DEPENDS_ON" },
      { source: "f:3", target: "svc:2", type: "DEPENDS_ON" },
      { source: "f:4", target: "svc:2", type: "DEPENDS_ON" },
      { source: "mr:1", target: "pl:1", type: "TRIGGERED_PIPELINE" },
      { source: "pl:ecosystem", target: "svc:1", type: "AFFECTED" },
      { source: "inc:1", target: "mr:9", type: "CAUSED_INCIDENT" },
      { source: "inc:2", target: "mr:10", type: "CAUSED_INCIDENT" },
      { source: "repo:1", target: "iss:1", type: "HAS_ISSUE" },
      { source: "repo:1", target: "iss:2", type: "HAS_ISSUE" },
      { source: "repo:1", target: "mr:3", type: "HAS_MERGE_REQUEST" },
      { source: "mr:3", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:3", target: "f:1", type: "MODIFIES" },
      { source: "iss:1", target: "mr:1", type: "RELATES_TO" },
      { source: "iss:2", target: "mr:2", type: "RELATES_TO" },
      { source: "f:2", target: "svc:3", type: "DEPENDS_ON" },
      { source: "c:1", target: "f:3", type: "MODIFIES" },
      { source: "c:2", target: "f:4", type: "MODIFIES" },
      { source: "mr:3", target: "c:1", type: "HAS_COMMIT" },
      { source: "svc:1", target: "svc:2", type: "DEPENDS_ON" },
      { source: "mr:2", target: "iss:1", type: "RELATES_TO" },
      { source: "f:1", target: "f:2", type: "DEPENDS_ON" },
    ],
  },
  futureTimeline: [
    { day: 0, label: "MR Opened", description: "MR !10 created on test-sentinel branch — empty diff, draft status", icon: "📝" },
    { day: 1, label: "Reviewer Required", description: "No reviewers assigned — review process not initiated", icon: "👤" },
    { day: 2, label: "Pipeline Skipped", description: "No CI pipeline triggered — changes never validated", icon: "🔄" },
    { day: 4, label: "Development Stalls", description: "Pattern matches 9 prior MRs from same branch — progress halts", icon: "⏸" },
    { day: 7, label: "MR Likely Closed", description: "90% historical abandonment rate — predicted closure without merge", icon: "🔒" },
  ],
  riskData: { score: 0.55, level: "MEDIUM", breakdown: [
    { category: "Empty Diff — No Changes", value: 10, maxValue: 10 },
    { category: "No Head Pipeline", value: 9, maxValue: 10 },
    { category: "Draft Status", value: 7, maxValue: 10 },
    { category: "Branch Abandonment Pattern", value: 8, maxValue: 10 },
    { category: "No Reviewers Assigned", value: 6, maxValue: 10 },
  ]},
  timelines: [
    { label: "MRs Analyzed", value: 10, color: "#60a5fa" },
    { label: "From Same Branch", value: 10, color: "#a78bfa" },
    { label: "Previously Merged", value: 1, color: "#22c55e" },
    { label: "Previously Closed", value: 9, color: "#ef4444" },
    { label: "Ecosystem Pipelines", value: 132059, color: "#f97316" },
  ],
  summary: { project: "gitlab-ai-hackathon/transcend/39251857", mrIid: 10, branch: "test-sentinel", totalNodes: 22, totalEdges: 40, riskScore: "55.0%", riskLevel: "MEDIUM", timestamp: new Date().toISOString() },
  hero: { mrIid: 10, riskLevel: "MEDIUM", riskScore: 0.55, predictedOutcome: "MR has empty diff and no pipeline — likely abandoned like 9 prior MRs from this branch", recommendedAction: "Add actual file changes, remove draft status, trigger pipeline, assign reviewers or close this MR", confidence: "High (4 Orbit query types, 10 MR history analyzed)", generatedUsing: "Generated via GitLab Duo Flow using Orbit — real session #4490097", confidenceFactors: [
    { label: "Historical Matches", value: "9 prior MRs closed", status: "warning" as const },
    { label: "Pipeline Evidence", value: "Missing", status: "error" as const },
    { label: "Deployment Path", value: "Missing", status: "error" as const },
    { label: "Prediction Confidence", value: "78%", status: "success" as const },
  ] },
  evidence: [
    { queryType: "NEIGHBORS", queryName: "Blast Radius", result: "→ 100 MR nodes + 100 Pipeline edges discovered\n→ MR !10 diff state: empty\n→ No linked pipeline for head commit" },
    { queryType: "PATH_FINDING", queryName: "MR-to-Pipeline Trace", result: "→ MR !10 → no head pipeline (no CI triggered)\n→ Project ecosystem: 132k+ total pipelines (17.8% failure rate)" },
    { queryType: "TRAVERSAL", queryName: "Historical Similarity", result: "→ 50+ historical MRs from test-sentinel branch\n→ Only !1 merged (years ago), !2–!9 all closed\n→ Abandonment pattern detected: 90% closure rate" },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: "→ 132,059 total pipelines across ecosystem\n→ 23,547 failed (17.8%), 106,270 success, 2,242 canceled\n→ MR !10 contributes zero runs to this dataset" },
  ],
  decisionCenter: { deploymentStrategy: "Cannot deploy — no changes to deploy. Add commits with actual changes or close this MR.", reviewers: [{ name: "@trueboy1123", role: "Author" }, { name: "Unassigned", role: "Reviewer Needed" }], requiredTests: ["Add actual file changes to the MR", "Remove draft status before requesting review", "Ensure pipeline triggers on next push", "Assign at least one reviewer"], rollbackStrategy: "Not applicable — no changes have been made. Close MR to prevent confusion.", riskReduction: { current: 0.55, afterRecommendation: 0.22 } },
  counterfactuals: [
    { label: "Add File Changes", riskAfter: 0.35, color: "#60a5fa" },
    { label: "Trigger Pipeline", riskAfter: 0.28, color: "#22c55e" },
    { label: "Assign Reviewers", riskAfter: 0.30, color: "#a78bfa" },
    { label: "All Mitigations", riskAfter: 0.10, color: "#f97316" },
  ],
  incidents: [
    { similarity: 90, mrIid: 9, title: "test sentinel (closed)", files: ["flows/flow.yml"], outcome: "Closed", rootCause: "Ninth MR from same branch with no meaningful changes — pattern of abandoned iterations", mitigation: "Set branch delete-on-merge policy, enforce minimum diff size", recommendedAction: "Close !10, delete test-sentinel branch, start fresh on a new branch", date: "2026-06-15" },
    { similarity: 85, mrIid: 5, title: "test sentinel (closed)", files: ["flows/flow.yml"], outcome: "Closed", rootCause: "Repeat MR from same branch with no pipeline triggered — author may not realize CI is missing", mitigation: "Add CI pipeline mandatory check on MR creation", recommendedAction: "Configure pipeline to auto-trigger on MR open for this branch pattern", date: "2026-06-10" },
    { similarity: 78, mrIid: 2, title: "test sentinel (closed)", files: ["flows/flow.yml"], outcome: "Closed", rootCause: "Early iteration in a long series of abandoned MRs from the same branch", mitigation: "Branch naming convention should include feature scope", recommendedAction: "Rename branch to reflect actual feature work", date: "2026-06-05" },
  ],
};

type View = "overview" | "blast-radius" | "risk" | "simulation" | "historical" | "report";

type DemoStep = { view: View; label: string; sublabel: string; icon: string };

const DEMO_STEPS: DemoStep[] = [
  { view: "overview", label: "Orbit Sentinel Dashboard", sublabel: "Real-time engineering digital twin showing MR risk, Orbit evidence, and incident intelligence", icon: "🛰️" },
  { view: "blast-radius", label: "Blast Radius Explorer", sublabel: "Visualize affected files, services, and downstream dependencies from Orbit NEIGHBORS query", icon: "💥" },
  { view: "risk", label: "Risk Investigation", sublabel: "Orbit evidence cards showing why this MR cannot deploy — signals, findings, and verdict", icon: "🔍" },
  { view: "simulation", label: "Forecast Engine", sublabel: "Digital twin forecast with interactive what-if scenarios — predicts outcomes before deployment", icon: "🧪" },
  { view: "historical", label: "Historical Context", sublabel: "Past incidents and MRs with similarity scores from Orbit TRAVERSAL query", icon: "📜" },
  { view: "report", label: "Impact Report", sublabel: "Full MR impact summary — deploy decisions, rollback strategy, and evidence chain", icon: "📋" },
];

// API service functions
const apiService = {
  async analyzeChange(params: {
    projectId: number;
    projectPath: string;
    mrIid: number;
    mrTitle: string;
    changedFiles: string[];
    changeDescription: string;
    branch?: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze change');
    }

    return response.json();
  },

  async getDemoData(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/demo`);
    if (!response.ok) {
      throw new Error('Failed to fetch demo data');
    }
    return response.json();
  },

  isApiAvailable(): boolean {
    return !!API_BASE_URL && API_BASE_URL !== 'https://your-engine-domain.com';
  },
};

function ScanLine() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), 1200);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden", opacity: active ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: "40%",
        background: "linear-gradient(180deg, rgba(59,130,246,0.03) 0%, rgba(59,130,246,0.01) 40%, transparent 100%)",
        animation: active ? "scanLine 1.2s ease-in-out forwards" : "none",
      }} />
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
    "## Predicted Future Timeline",
    ...data.futureTimeline.map(f => `- **D+${f.day}** ${f.icon} ${f.label}: ${f.description}`),
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
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("orbit-sentinel-onboarded");
  });
  const demoRef = useRef<number | null>(null);

  // Load data from API or fallback to demo
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch real data from engine API
        if (apiService.isApiAvailable()) {
          const result = await apiService.analyzeChange({
            projectId: 39251857,
            projectPath: 'gitlab-ai-hackathon/transcend/39251857',
            mrIid: 10,
            mrTitle: 'test sentinel',
            changedFiles: ['flows/flow.yml'],
            changeDescription: 'test sentinel MR',
            branch: 'test-sentinel',
          });
          setData(result.report);
        } else {
          // No engine server — use hardcoded demo data
          setData(DATA);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Fallback: try demo endpoint, then hardcoded data
        try {
          if (apiService.isApiAvailable()) {
            const result = await apiService.getDemoData();
            setData(result.report);
          } else {
            setData(DATA);
          }
        } catch (demoErr) {
          console.error('Failed to load demo data:', demoErr);
          setData(DATA);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const rk = data ? riskScoreToKey(data.hero.riskScore) : riskScoreToKey(0.5);
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
      setStepIndex(prev => (prev + 1) % DEMO_STEPS.length);
    }, 4000);
    return () => { if (demoRef.current) { clearInterval(demoRef.current); } };
  }, [demo]);

  useEffect(() => {
    if (demo) setView(DEMO_STEPS[stepIndex].view);
  }, [demo, stepIndex]);

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

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try { localStorage.setItem("orbit-sentinel-onboarded", "1"); } catch {}
  }, []);

  const tabs: [View, string][] = [["overview","Overview"],["blast-radius","Blast Radius"],["risk","Risk"],["simulation","Simulation"],["historical","History"],["report","Report"]];
  const FLOW_STEPS = ["Schema Discovery", "Blast Radius", "Dependency Chains", "Historical Context", "Pipeline Risk", "Analysis & Prediction", "Post Report", "Complete"];
  const [prevView, setPrevView] = useState<View>(view);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (view === prevView) return;
    setTransitioning(true);
    const t = setTimeout(() => {
      setPrevView(view);
      setTransitioning(false);
    }, 80);
    return () => clearTimeout(t);
  }, [view, prevView]);

  const body = useCallback(() => {
    if (!data) return null;
    switch (view) {
      case "overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Tier 0: Impact Metrics */}
            <ImpactMetrics />
            {/* Tier 1: Hero Outcome + Tagline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
              <HeroSection {...data.hero} />
              <TaglineBanner />
            </div>
            {/* Tier 2: Decision Center + Future Timeline + Path Analysis */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: 12 }}>
              <DecisionCenter d={data.decisionCenter} />
              <FutureTimeline events={data.futureTimeline} confidence={data.hero.confidence} />
              <PathBrokenAnimation />
            </div>
            {/* Tier 3: Evidence + Incidents + Graph + Simulation */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <OrbitEvidencePanel evidence={data.evidence} />
                <IncidentIntelligence incidents={data.incidents} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ minHeight: 380, flex: 1 }}><DigitalTwinGraph graph={data.graph} /></div>
                <CounterfactualSimulation scenarios={data.counterfactuals} currentRisk={data.hero.riskScore} onViewDetail={() => navigate("simulation")} />
              </div>
            </div>
            {/* Tier 4: Simulate Webhook + Reality Check */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <SimulateWebhook />
              <RealityCheck />
            </div>
          </div>
        );
      case "blast-radius": return <BlastRadiusExplorer graph={data.graph} />;
      case "risk": return <RiskInvestigation riskData={data.riskData} evidence={data.evidence} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} mrIid={data.hero.mrIid} />;
      case "simulation": return <ForecastEngine evidence={data.evidence} futureTimeline={data.futureTimeline} counterfactuals={data.counterfactuals} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} riskScore={data.hero.riskScore} riskLevel={data.hero.riskLevel} mrIid={data.hero.mrIid} pipelinesTotal={data.timelines.find(t => t.label === "Ecosystem Pipelines")?.value ?? 0} />;
      case "historical": return <HistoricalContext incidents={data.incidents} totalAnalyzed={data.timelines.find(t => t.label === "MRs Analyzed")?.value ?? 10} mrIid={data.hero.mrIid} />;
      case "report": return <ImpactReport data={data} />;
    }
  }, [view, data, navigate]);

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(59,130,246,0.2)", borderTopColor: "#60a5fa", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#8b8fa3", fontSize: 13 }}>Loading Orbit Sentinel...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, maxWidth: 440, textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🛰️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {error?.includes("Failed") || error?.includes("fetch") ? "Engine API Unreachable" : "No Data Available"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {error?.includes("Failed") || error?.includes("fetch")
                ? "The Orbit Sentinel engine API could not be reached. The visualizer needs a running engine server to produce live analysis data."
                : error || "No visualization data loaded."}
            </div>
            <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", textAlign: "left", fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.6, width: "100%" }}>
              <strong style={{ color: "var(--text-primary)" }}>To set up the engine locally:</strong>
              <ol style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                <li>Set <code style={{ color: "#60a5fa" }}>VITE_API_BASE_URL</code> to your engine URL</li>
                <li>Run <code style={{ color: "#60a5fa" }}>cd engine &amp;&amp; npm start:api</code></li>
                <li>The visualizer will fetch live data from <code style={{ color: "#60a5fa" }}>/api/analyze</code></li>
                <li>Set <code style={{ color: "#60a5fa" }}>DEMO_MODE=true</code> for synthetic demo data</li>
              </ol>
            </div>
            <button onClick={() => window.location.reload()}
              style={{ marginTop: 4, padding: "6px 18px", fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--text-primary)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >Retry</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", position: "relative" }}>
      {data && showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
      <BackgroundParticles />
      <ScanLine />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <header style={{
        position: "relative", zIndex: 10,
        borderBottom: `1px solid ${accentColor}22`,
        padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)",
        boxShadow: `0 1px 0 ${accentColor}11`,
        transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${accentColor},${RISK[rk].glow.replace("rgba","rgb")})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: `0 2px 8px ${accentGlow}` }}>🛰️</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>Orbit Sentinel</span>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "1px 8px", borderRadius: 8,
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                fontSize: 8, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", textTransform: "uppercase",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: "#22c55e",
                  animation: "pulseDot 1.5s ease-in-out infinite",
                  boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                }} />
                LIVE
              </span>
            </div>
            <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.3px", marginTop: -1 }}>Engineering Decision Intelligence</span>
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
        <div style={{ display: "flex", gap: 2, alignItems: "center" }} role="tablist" aria-label="Dashboard views">
          {tabs.map(([k, lbl]) => {
            const help = DEMO_STEPS.find(d => d.view === k)?.sublabel ?? "";
            return (
            <span key={k} style={{ display: "inline-flex", alignItems: "center" }}>
              <button onClick={() => { if (demo) stopDemo(); navigate(k); }}
                role="tab"
                aria-selected={view === k}
                aria-label={`${lbl} view: ${help}`}
                style={{
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
              <HelpTooltip text={help} />
            </span>
          );})}
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
          <button onClick={() => exportReport(data)} title="Export report" aria-label="Export report as markdown" style={{
            padding: "5px 10px", fontSize: 13, cursor: "pointer",
            border: "1px solid var(--border)", borderRadius: 6,
            background: "transparent", color: "var(--text-secondary)",
            transition: "all 0.15s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >⬇</button>
          <button onClick={demo ? stopDemo : startDemo}
            aria-label={demo ? "Stop demo" : "Play demo"}
            style={{
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
        willChange: "transform", display: "flex", flexDirection: "column",
        animation: transitioning ? "none" : "fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <ErrorBoundary>
          <div style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(8px)" : "none",
            transition: "opacity 0.08s ease, transform 0.08s ease",
            display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
          }}>
            {body()}
          </div>
        </ErrorBoundary>
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
