import React, { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
import type { VisualizationData, PredictionRecord } from "./types";
import { DEMO_DATA } from "./data/demoData";
import ErrorBoundary from "./components/ErrorBoundary";
import RiskInvestigation from "./components/RiskInvestigation";
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
import OnboardingOverlay from "./components/OnboardingOverlay";
import HelpTooltip from "./components/HelpTooltip";
import RealityCheck from "./components/RealityCheck";
import SimulateWebhook from "./components/SimulateWebhook";
import LoadingSkeleton from "./components/LoadingSkeleton";
import EngineStatus from "./components/EngineStatus";

import DataModeBanner from "./components/DataModeBanner";
import type { DataMode } from "./components/DataModeBanner";
import ProblemSection from "./components/ProblemSection";
import JudgesTour from "./components/JudgesTour";
import SetupWizard from "./components/SetupWizard";
import OrbitQueryLog from "./components/OrbitQueryLog";
import ImpactCalculator from "./components/ImpactCalculator";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import MrAnalyzer from "./components/MrAnalyzer";
import OrbitQueryExplorer from "./components/OrbitQueryExplorer";
import ConfettiCelebration from "./components/ConfettiCelebration";
import AgentFlowProgress from "./components/AgentFlowProgress";
import PredictionsTracker from "./components/PredictionsTracker";
import OrbitQueryInspector from "./components/OrbitQueryInspector";
import { exportAsHtml } from "./components/EnhancedExport";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { riskScoreToKey, RISK } from "./utils/colors";
import { apiService } from "./services/api";
import { ssRead, ssWrite } from "./utils/session";
import { loadPredictions, savePrediction, updatePrediction } from "./utils/predictions";
import type { View } from "./constants/views";
import { DEMO_STEPS, VIEW_LABELS, VIEW_QUERY_TAG, ALL_VIEWS } from "./constants/views";
import PanelFallback from "./components/PanelFallback";
import { COLORS, Z, FONT, ANIM } from "./constants/tokens";
import ScanLine from "./components/ScanLine";

// Lazy-loaded heavy components (D3, large bundles)
const DigitalTwinGraph = React.lazy(() => import("./components/DigitalTwinGraph"));
const BlastRadiusExplorer = React.lazy(() => import("./components/BlastRadiusExplorer"));
const ForecastEngine = React.lazy(() => import("./components/ForecastEngine"));
const HistoricalContext = React.lazy(() => import("./components/HistoricalContext"));

function getInitialView(): View {
  if (typeof window === "undefined") return "setup";
  const p = new URLSearchParams(window.location.search);
  const v = p.get("view");
  if (v && (ALL_VIEWS as readonly string[]).includes(v)) return v as View;
  const onboarded = localStorage.getItem("orbit-sentinel-onboarded");
  return onboarded ? "overview" : "setup";
}

function getInitialDemo(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "true";
}

export default function App() {
  const [view, setView] = useState<View>(() => ssRead("view", getInitialView()));
  const [demo, setDemo] = useState(() => ssRead("demo", getInitialDemo()));
  const [stepIndex, setStepIndex] = useState(() => ssRead("step", 0));
  const [data, setData] = useState<VisualizationData | null>(DEMO_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataMode, setDataMode] = useState<DataMode>("demo");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("orbit-sentinel-onboarded") && new URLSearchParams(window.location.search).get("judge") !== "true";
  });
  const [showTour, setShowTour] = useState(() => {
    if (typeof window === "undefined") return false;
    const p = new URLSearchParams(window.location.search);
    return p.get("tour") === "true" || p.get("judge") === "true";
  });
  const [mobileViewOpen, setMobileViewOpen] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const screenshotMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("screenshot") === "true";
  const presentMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("present") === "true";
  const [currentScenario, setCurrentScenario] = useState<string | null>(() => ssRead("scenario", null));
  const [analyzing, setAnalyzing] = useState(false);
  const queuedDataRef = useRef<{ data: VisualizationData; label: string } | null>(null);
  const [showQueryLog, setShowQueryLog] = useState(true);
  const [showQueryInspector, setShowQueryInspector] = useState(false);
const [predictions, setPredictions] = useState<PredictionRecord[]>(() => loadPredictions());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("orbit-sentinel-theme");
    return saved !== null ? saved === "dark" : true;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("orbit-sentinel-theme", dark ? "dark" : "light"); } catch { console.warn("localStorage theme write blocked"); }
  }, [dark]);
  const toggleTheme = useCallback(() => setDark(prev => !prev), []);
  // Save prediction when new data arrives (from demo or live analysis)
  useEffect(() => {
    if (!data) return;
    const mrIid = data.summary?.mrIid ?? data.hero?.mrIid;
    if (!mrIid) return;
    const existing = predictions.find(p => p.mrIid === mrIid);
    if (existing) return;
    const rec: PredictionRecord = {
      mrIid,
      title: `MR !${mrIid}`,
      predictedRisk: data.hero?.riskScore ?? 0.5,
      predictedLevel: data.hero?.riskLevel ?? "medium",
      actualOutcome: "pending",
      mergedAt: new Date().toISOString().split("T")[0],
    };
    savePrediction(rec);
    setPredictions(loadPredictions());
  }, [data]);

  const demoRef = useRef<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTiny = useMediaQuery("(max-width: 360px)");

  useEffect(() => { ssWrite("view", view); }, [view]);
  useEffect(() => { ssWrite("demo", demo); }, [demo]);
  useEffect(() => { ssWrite("step", stepIndex); }, [stepIndex]);
  useEffect(() => { ssWrite("scenario", currentScenario); }, [currentScenario]);

  const loadData = useCallback(async () => {
    setData(DEMO_DATA);
    setDataMode("demo");
    setLoading(false);
  }, []);

  // Load data from API or fallback to demo
  useEffect(() => {
    loadData();
  }, [loadData]);

  const [showFooter, setShowFooter] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowFooter(false), 30000);
    const h = () => { setShowFooter(true); clearTimeout(t); };
    window.addEventListener("keydown", h);
    window.addEventListener("click", h);
    return () => { clearTimeout(t); window.removeEventListener("keydown", h); window.removeEventListener("click", h); };
  }, []);
  useEffect(() => {
    if (!loading) { setLoadingSlow(false); return; }
    const t = setTimeout(() => setLoadingSlow(true), 10000);
    return () => clearTimeout(t);
  }, [loading]);

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
    if (presentMode && !demo) startDemo();
  }, [presentMode, demo, startDemo]);

  useEffect(() => { document.title = `Orbit Sentinel — ${VIEW_LABELS[view]}${presentMode ? " (Presentation)" : ""} | Engineering Digital Twin`; }, [view, presentMode]);

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
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.key === "Escape") setShowShortcuts(false);
      if (e.key === "p" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const u = new URL(window.location.href);
        if (u.searchParams.get("present") === "true") u.searchParams.delete("present"); else u.searchParams.set("present", "true");
        window.history.replaceState({}, "", u.toString());
        window.location.reload();
      }
      if (e.key === "d" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleTheme(); }
      if (e.key === "e" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (data) exportAsHtml(data); }
      if (e.key >= "1" && e.key <= "8" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < tabs.length) {
          if (demo) stopDemo();
          setView(tabs[idx][0]);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, demo, startDemo, stopDemo]);

  const navigate = useCallback((v: View) => {
    if (v === view) return;
    setView(v);
    try { window.history.replaceState(null, '', `?view=${v}`); } catch { console.warn("history.replaceState blocked"); }
  }, [view]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try { localStorage.setItem("orbit-sentinel-onboarded", "1"); } catch { console.warn("localStorage onboarded write blocked"); }
  }, []);

  const onVerifyPrediction = useCallback((mrIid: number, outcome: "verified" | "failed") => {
    updatePrediction(mrIid, {
      actualOutcome: outcome,
      verifiedAt: new Date().toISOString().split("T")[0],
      actualRisk: outcome === "failed" ? 0.8 : 0.15,
      evidence: outcome === "failed" ? "Failed within the 7-day survival window." : "No incidents reported in the 7-day survival window.",
    });
    setPredictions(loadPredictions());
  }, []);

  const onSelectScenario = useCallback((scenarioData: VisualizationData, label: string) => {
    setData(scenarioData);
    setDataMode(label.startsWith("Live") ? "live" : "demo");
    setCurrentScenario(label);
    setError(null);
    setView("overview");
  }, []);

  const onAnalyzeStart = useCallback(() => {
    setAnalyzing(true);
  }, []);

  const onFlowComplete = useCallback(() => {
    setAnalyzing(false);
  }, []);

  const dismissTour = useCallback(() => {
    setShowTour(false);
    // Auto-start demo after tour ends so judges see live auto-rotation
    const p = new URLSearchParams(window.location.search);
    if (p.get("judge") === "true" || p.get("tour") === "true") {
      setTimeout(startDemo, 800);
    }
  }, [startDemo]);

  const onTourNavigate = useCallback((stepIndex: number) => {
    const tourViews: View[] = ["overview", "overview", "overview", "blast-radius", "risk", "overview", "overview", "simulation", "historical", "overview", "setup", "overview"];
    if (stepIndex < tourViews.length) {
      setView(tourViews[stepIndex]);
    }
  }, []);

  const tabs: [View, string][] = [["overview","Overview"],["setup","Setup"],["blast-radius","Graph"],["risk","Risk"],["simulation","Forecast"],["historical","History"],["report","Report"],["predictions","Predictions"]];
  const [prevView, setPrevView] = useState<View>(view);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (view === prevView) return;
    setTransitioning(true);
    const t = setTimeout(() => {
      setPrevView(view);
      setTransitioning(false);
    }, 260);
    return () => clearTimeout(t);
  }, [view, prevView]);

  useEffect(() => { if (data && firstLoad) { const t = setTimeout(() => setFirstLoad(false), 600); return () => clearTimeout(t); } }, [data, firstLoad]);
  const body = useCallback(() => {
    if (!data) return null;
    switch (view) {
      case "overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            <ErrorBoundary>
              <MrAnalyzer
                onSelectScenario={onSelectScenario}
                apiAvailable={apiService.isApiAvailable()}
                currentScenario={currentScenario}
                onAnalyzeStart={onAnalyzeStart}
              />
            </ErrorBoundary>
            {analyzing && <AgentFlowProgress active={analyzing} onComplete={onFlowComplete} />}
            {showQueryLog ? (
              <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><OrbitQueryLog onComplete={() => setTimeout(() => setShowQueryLog(false), 2000)} /></ErrorBoundary>
                  <ErrorBoundary><ArchitectureDiagram /></ErrorBoundary>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><ProblemSection /></ErrorBoundary>
                  <ErrorBoundary><ImpactCalculator riskScore={data.hero.riskScore} evidenceCount={data.evidence.length} counterfactuals={data.counterfactuals} /></ErrorBoundary>
                </div>
              </div>
            ) : (
              <>
                <ErrorBoundary><ProblemSection /></ErrorBoundary>
                <ErrorBoundary><ArchitectureDiagram /></ErrorBoundary>
                <ErrorBoundary><ImpactCalculator riskScore={data.hero.riskScore} evidenceCount={data.evidence.length} counterfactuals={data.counterfactuals} /></ErrorBoundary>
              </>
            )}
            <div className="resp-grid-2 resp-stack" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: isMobile ? 8 : 12 }}>
              <ErrorBoundary><HeroSection {...data.hero} /></ErrorBoundary>
              {!isMobile && <ErrorBoundary><TaglineBanner /></ErrorBoundary>}
            </div>
            {isMobile && <ErrorBoundary><TaglineBanner /></ErrorBoundary>}
            <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: isMobile ? 8 : 12 }}>
              <ErrorBoundary><DecisionCenter d={data.decisionCenter} /></ErrorBoundary>
              <ErrorBoundary><FutureTimeline events={data.futureTimeline} confidence={data.hero.confidence} /></ErrorBoundary>
              <ErrorBoundary><PathBrokenAnimation mrIid={data.hero.mrIid} /></ErrorBoundary>
            </div>
            <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: isMobile ? 8 : 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                <ErrorBoundary><OrbitEvidencePanel evidence={data.evidence} graph={data.graph} /></ErrorBoundary>
                <ErrorBoundary><IncidentIntelligence incidents={data.incidents} /></ErrorBoundary>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                <div style={{ height: isMobile ? 300 : "auto", minHeight: isMobile ? "auto" : 380, flex: isMobile ? "none" : 1 }}><ErrorBoundary><Suspense fallback={<PanelFallback height={380} />}><DigitalTwinGraph graph={data.graph} /></Suspense></ErrorBoundary></div>
                <ErrorBoundary><CounterfactualSimulation scenarios={data.counterfactuals} currentRisk={data.hero.riskScore} onViewDetail={() => navigate("simulation")} /></ErrorBoundary>
              </div>
            </div>
            <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 12 }}>
              <ErrorBoundary><SimulateWebhook /></ErrorBoundary>
              <ErrorBoundary><RealityCheck /></ErrorBoundary>
            </div>
            <ErrorBoundary><OrbitQueryExplorer evidence={data.evidence} /></ErrorBoundary>
            <button onClick={() => setShowQueryInspector(!showQueryInspector)} style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: showQueryInspector ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.04)",
              color: showQueryInspector ? "#60a5fa" : "var(--text-secondary)",
              border: `1px solid ${showQueryInspector ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-end",
            }}>🔍 {showQueryInspector ? "Hide" : "Show"} Raw Query Data</button>
            {showQueryInspector && <ErrorBoundary><OrbitQueryInspector evidence={data.evidence} timings={data.queryTimings} /></ErrorBoundary>}
          </div>
        );
      case "blast-radius": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><BlastRadiusExplorer graph={data.graph} /></Suspense></ErrorBoundary>;
      case "risk": return <ErrorBoundary><RiskInvestigation riskData={data.riskData} evidence={data.evidence} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} mrIid={data.hero.mrIid} /></ErrorBoundary>;
      case "simulation": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><ForecastEngine evidence={data.evidence} futureTimeline={data.futureTimeline} counterfactuals={data.counterfactuals} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} riskScore={data.hero.riskScore} riskLevel={data.hero.riskLevel} mrIid={data.hero.mrIid} pipelinesTotal={data.timelines.find(t => t.label === "Pipelines Found" || t.label === "Ecosystem Pipelines")?.value ?? 0} /></Suspense></ErrorBoundary>;
      case "historical": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><HistoricalContext incidents={data.incidents} totalAnalyzed={data.timelines.find(t => t.label === "MRs Analyzed")?.value ?? 10} mrIid={data.hero.mrIid} /></Suspense></ErrorBoundary>;
      case "setup": return <ErrorBoundary><SetupWizard /></ErrorBoundary>;
      case "predictions": return <ErrorBoundary><PredictionsTracker predictions={predictions} onVerify={onVerifyPrediction} /></ErrorBoundary>;
      case "report": return <ErrorBoundary><ImpactReport data={data} /></ErrorBoundary>;
    }
  }, [view, data, navigate, isMobile, isTiny]);

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)" }}>
        <header style={{
          position: "relative", zIndex: Z.dropdown,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)", overflowX: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#60a5fa,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛰️</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Orbit Sentinel</span>
          </div>
        <div className="resp-hide-subtitle" style={{ flex: 1, maxWidth: 420, minWidth: 0, margin: "0 4px", display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
          <DataModeBanner mode={dataMode} onRetry={apiService.isApiAvailable() ? loadData : undefined} />
          <EngineStatus />
        </div>
          {/* Placeholder matching loaded header height to prevent CLS */}
          <div className="header-nav resp-hide-subtitle" style={{ height: 28, display: "flex", alignItems: "center", gap: 6 }}>
            {["Overview","Graph","Risk","Forecast","History","Report"].map(l => (
              <div key={l} style={{ width: Math.max(l.length * 7.5 + 22, 50), height: 24, borderRadius: 6, background: "rgba(255,255,255,0.02)" }} />
            ))}
          </div>
        </header>
        {loading ? <>
          <LoadingSkeleton />
          {loadingSlow && (
            <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: Z.overlay, background: "rgba(8,9,13,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 11, boxShadow: "0 4px 24px rgba(0,0,0,0.4)",   animation: ANIM.fadeSlideUp.medium }}>
              <span style={{ color: "var(--text-secondary)" }}>Engine is taking longer than expected...</span>
              <button onClick={() => { setData(DEMO_DATA); setDataMode("demo"); }}
                style={{ padding: "5px 14px", fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, background: "rgba(96,165,250,0.12)", color: COLORS.info, whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.12)"; }}
              >Use Demo Data →</button>
            </div>
          )}
        </> : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, padding: 20, animation: ANIM.fadeSlideUp.slow }}>
            <div style={{ fontSize: 36, animation: ANIM.float.slow }}>🛰️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {dataMode === "error" ? "Engine API Unreachable" : "No Data Available"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
              {dataMode === "error" && apiService.isApiAvailable()
                ? "The Orbit Sentinel engine could not be reached. Demo data will be shown as fallback."
                : "No visualization data loaded."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadData}
                style={{ marginTop: 4, padding: "6px 18px", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >Retry</button>
              <button onClick={() => { setData(DEMO_DATA); setDataMode("demo"); }}
                style={{ marginTop: 4, padding: "6px 18px", fontSize: 12, fontWeight: 600, border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, cursor: "pointer", background: "rgba(96,165,250,0.1)", color: COLORS.info }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.1)"; }}
              >Use Demo Data</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", position: "relative" }}>
      {data && showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
      {showTour && <JudgesTour onDismiss={dismissTour} onNavigate={onTourNavigate} />}
      <BackgroundParticles />
      <ScanLine />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <header style={{
        display: screenshotMode || presentMode ? "none" : "flex",
        position: "relative", zIndex: Z.dropdown,
        borderBottom: `1px solid ${accentColor}22`,
        padding: "8px 20px", alignItems: "center", justifyContent: "space-between", gap: 8,
        flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)",
        boxShadow: `0 1px 0 ${accentColor}11`,
        transition: "border-color 0.5s ease, box-shadow 0.5s ease", overflowX: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${accentColor},${RISK[rk].glow.replace("rgba","rgb")})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: `0 2px 8px ${accentGlow}` }}>🛰️</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>Orbit Sentinel</span>
        </div>
        <div className="resp-hide-subtitle" style={{ flex: 1, maxWidth: 420, minWidth: 0, margin: "0 4px", display: "flex", alignItems: "center", gap: 6 }}>
          <DataModeBanner mode={dataMode} onRetry={apiService.isApiAvailable() ? loadData : undefined} />
          <EngineStatus />
          <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(139,92,246,0.1)", color: COLORS.purple, border: "1px solid rgba(139,92,246,0.15)", whiteSpace: "nowrap", letterSpacing: "0.3px" }}>4 Queries</span>
        </div>
        {isTiny && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMobileViewOpen(!mobileViewOpen)}
              aria-label="Switch view" aria-expanded={mobileViewOpen}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${accentColor}44`, borderRadius: 6,
                background: `${accentColor}18`, color: accentColor, whiteSpace: "nowrap",
              }}
            >{tabs.find(([k]) => k === view)?.[1] ?? "Overview"} ▾</button>
            {mobileViewOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, zIndex: Z.modal, marginTop: 4,
                background: "rgba(15,18,26,0.96)", backdropFilter: "blur(12px)",
                border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden",
                minWidth: 140, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}>
                {tabs.map(([k, lbl]) => {
                  const qt = VIEW_QUERY_TAG[k];
                  return (
                  <button key={k} onClick={() => { setView(k); setMobileViewOpen(false); if (demo) stopDemo(); }}
                    style={{
                      display: "flex", width: "100%", padding: "7px 14px", fontSize: 11, cursor: "pointer",
                      border: "none", borderBottom: "1px solid var(--border)",
                      background: view === k ? `${accentColor}18` : "transparent",
                      color: view === k ? accentColor : "var(--text-secondary)", textAlign: "left",
                      alignItems: "center", gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = view === k ? `${accentColor}18` : "transparent"; }}
                  >{lbl}{qt && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: `${qt.color}18`, color: qt.color, lineHeight: 1.2, marginLeft: "auto" }}>{qt.tag}</span>}</button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className={`header-nav${isTiny ? ' resp-hide-tabs' : ''}`} style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0, flexWrap: "wrap", overflow: "auto" }} role="tablist" aria-label="Dashboard views">
          {tabs.map(([k, lbl]) => {
            const help = DEMO_STEPS.find(d => d.view === k)?.sublabel ?? "";
            return (
            <span key={k} style={{ display: "inline-flex", alignItems: "center" }}>
              <button onClick={() => { if (demo) stopDemo(); navigate(k); }}
                role="tab"
                aria-selected={view === k}
                aria-label={`${lbl} view: ${help}`}
                className={VIEW_QUERY_TAG[k] ? "resp-hide-query-tag" : undefined}
                style={{
                padding: isMobile ? "3px 8px" : "4px 11px", fontSize: isMobile ? 10 : 11, fontWeight: view === k ? 600 : 400,
                border: view === k ? `1px solid ${accentColor}44` : "1px solid transparent",
                borderRadius: 6, cursor: "pointer",
                background: view === k ? `${accentColor}18` : "transparent",
                color: view === k ? accentColor : "var(--text-secondary)",
                transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)", letterSpacing: "0.2px", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 3,
                transform: view === k ? "translateY(-1px)" : "none",
                boxShadow: view === k ? `0 2px 8px ${accentGlow}` : "none",
              }}
                onMouseEnter={e => { if (view !== k) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { if (view !== k) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "none"; } }}
              >{lbl}
                {VIEW_QUERY_TAG[k] && (
                  <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${VIEW_QUERY_TAG[k].color}18`, color: VIEW_QUERY_TAG[k].color, lineHeight: 1.2 }}>
                    {VIEW_QUERY_TAG[k].tag}
                  </span>
                )}
              </button>
              {help && <HelpTooltip text={help} />}
            </span>
          );})}
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px", flexShrink: 0 }} />
          <button onClick={() => setShowTour(true)} title="Judge's Tour" aria-label="Guided tour for judges"
            style={{
              padding: isMobile ? "3px 7px" : "4px 8px", fontSize: isMobile ? 10 : 12, cursor: "pointer",
              border: "1px solid rgba(167,139,250,0.25)", borderRadius: 6,
              background: "rgba(167,139,250,0.08)", color: COLORS.purple,
              transition: "all 0.15s ease", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.16)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.08)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"; }}
          >{isMobile ? "👑" : "👑 Tour"}</button>
          <button onClick={() => exportAsHtml(data)} title="Export as HTML" aria-label="Export report as HTML"
            style={{
              padding: isMobile ? "3px 7px" : "5px 10px", fontSize: isMobile ? 10 : 13, cursor: "pointer",
              border: "1px solid var(--border)", borderRadius: 6,
              background: "transparent", color: "var(--text-secondary)",
              transition: "all 0.15s ease", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >⬇</button>
          <button onClick={toggleTheme} title={dark ? "Switch to light theme" : "Switch to dark theme"} aria-label="Toggle theme"
            style={{
              padding: isMobile ? "3px 7px" : "5px 10px", fontSize: isMobile ? 10 : 13, cursor: "pointer",
              border: "1px solid var(--border)", borderRadius: 6,
              background: "transparent", color: "var(--text-secondary)",
              transition: "all 0.15s ease", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >{dark ? "☀️" : "🌙"}</button>
          <button onClick={demo ? stopDemo : startDemo}
            aria-label={demo ? "Stop demo" : "Play demo"}
            style={{
            padding: isMobile ? "3px 10px" : "5px 14px", fontSize: isMobile ? 10 : 11, fontWeight: 600, cursor: "pointer",
            border: demo ? "1px solid rgba(239,68,68,0.4)" : `1px solid ${accentColor}44`,
            borderRadius: 6,
            background: demo ? "rgba(239,68,68,0.12)" : `${accentColor}18`,
            color: demo ? "var(--accent-red)" : accentColor,
            transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span style={{ fontSize: 11 }}>{demo ? "■" : "▶"}</span>
            {isMobile ? "" : (demo ? "Stop" : "Play")}
          </button>
        </div>
      </header>

      {demo && !presentMode && (
        <div style={{
          display: screenshotMode ? "none" : "flex",
          position: "absolute", top: isMobile ? 120 : 64, left: "50%", transform: "translateX(-50%)", zIndex: Z.sticky,
          flexDirection: "column", alignItems: "center", gap: 2,
          animation: `${ANIM.fadeSlideDown.medium}, ${ANIM.pulseGlow}`,
          pointerEvents: "none",
        }}>
          <div style={{
            padding: "8px 20px", borderRadius: 24, fontSize: 11, fontWeight: 600,
            background: `${accentColor}22`, backdropFilter: "blur(12px)",
            border: `1px solid ${accentColor}33`,
            color: accentColor, letterSpacing: "1px", textTransform: "uppercase",
          }}>
            <span style={{ opacity: 0.5, marginRight: 6 }}>{stepIndex + 1}/{DEMO_STEPS.length}</span>
            {DEMO_STEPS[stepIndex].icon} {DEMO_STEPS[stepIndex].label}
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

      {data && data.hero && data.hero.riskLevel?.toLowerCase() === "low" && <ConfettiCelebration />}

      {showShortcuts && (
        <div style={{
          position: "fixed", inset: 0, zIndex: Z.onboarding,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          animation: ANIM.fadeSlideUp.xfast,
        }} onClick={() => setShowShortcuts(false)}>
          <div className="card" style={{
            padding: "24px 28px", maxWidth: 400, width: "90%",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>⌨️ Keyboard Shortcuts</div>
            {[
              { key: "Space", desc: "Start / Stop demo" },
              { key: "← →", desc: "Navigate between views" },
              { key: "1-8", desc: "Jump to view by number" },
              { key: "D", desc: "Toggle dark/light theme" },
              { key: "E", desc: "Export report as HTML" },
              { key: "P", desc: "Toggle presentation mode" },
              { key: "?", desc: "Toggle this overlay" },
              { key: "Esc", desc: "Close overlays" },
            ].map(s => (
              <div key={s.key} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "6px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <kbd style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace",
                  minWidth: 50, textAlign: "center",
                }}>{s.key}</kbd>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.desc}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 9, color: "var(--text-tertiary)", textAlign: "center" }}>
              Press <kbd style={{ padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontSize: 9 }}>?</kbd> to close
            </div>
          </div>
        </div>
      )}

      {presentMode && (
        <div style={{
          position: "fixed", top: 8, left: 8, zIndex: Z.toast,
          padding: "3px 10px", borderRadius: 6, fontSize: 9, fontWeight: 700,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
          color: COLORS.critical, letterSpacing: "0.5px", textTransform: "uppercase",
        }}>● Presenting</div>
      )}

      <main style={{
        position: "relative", zIndex: Z.base, flex: 1, padding: isMobile ? 10 : 16, overflow: "auto", minHeight: 0,
        willChange: "transform", display: "flex", flexDirection: "column",
        animation: firstLoad ? "scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <ErrorBoundary>
          <div style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(6px) scale(0.99)" : "none",
            transition: "opacity 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)",
            display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
          }}>
            {body()}
          </div>
        </ErrorBoundary>
      </main>

      <div className={isMobile ? 'resp-hide-subtitle' : ''} style={{
        position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: Z.modal,
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 14px", borderRadius: 8,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 9, color: "var(--text-tertiary)",
        opacity: showFooter && !screenshotMode ? 1 : 0, pointerEvents: showFooter && !screenshotMode ? "auto" : "none",
        transition: "opacity 0.6s ease",
      }}>
        <span>Space</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>← →</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Navigate</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>P</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Present</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>⬇</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Export</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>👑</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Tour</span>
        <span style={{ width: 1, height: 10, background: "var(--border)", margin: "0 2px" }} />
        <span>?</span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Keys</span>
      </div>
    </div>
  );
}
