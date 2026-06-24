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

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (err) {
    console.warn("Failed to read from localStorage:", err);
  }
  return null;
}

function getInitialView(): View {
  if (typeof window === "undefined") return "setup";
  const p = new URLSearchParams(window.location.search);
  const v = p.get("view");
  if (v && (ALL_VIEWS as readonly string[]).includes(v)) return v as View;
  const onboarded = safeGetItem("orbit-sentinel-onboarded");
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
  const [dataMode, setDataMode] = useState<DataMode>(() => {
    try {
      const v = localStorage.getItem("orbit-sentinel-predictions");
      if (v) {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.some((p: Record<string, unknown>) => p.source === "live")) return "live";
      }
    } catch { /* ignore */ }
    return "demo";
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !safeGetItem("orbit-sentinel-onboarded") && new URLSearchParams(window.location.search).get("judge") !== "true";
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
  const [showQueryLog, setShowQueryLog] = useState(false);
  const [showQueryInspector, setShowQueryInspector] = useState(false);
const [predictions, setPredictions] = useState<PredictionRecord[]>(() => {
    const dm = localStorage.getItem("orbit-sentinel-predictions");
    const mode: "demo" | "live" = dm ? (() => { try { const p = JSON.parse(dm); return Array.isArray(p) && p.some((x: Record<string, unknown>) => x.source === "live") ? "live" : "demo"; } catch { return "demo"; } })() : "demo";
    return loadPredictions(mode);
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = safeGetItem("orbit-sentinel-theme");
    return saved !== null ? saved === "dark" : true;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("orbit-sentinel-theme", dark ? "dark" : "light"); } catch { console.warn("localStorage theme write blocked"); }
  }, [dark]);
  const toggleTheme = useCallback(() => setDark(prev => !prev), []);
  // Save or update prediction when new data arrives from live analysis only
  useEffect(() => {
    if (dataMode !== "live") {
      setPredictions(loadPredictions("demo"));
      return;
    }
    if (!data || !currentScenario) return;
    const mrIid = data.summary?.mrIid ?? data.hero?.mrIid;
    if (!mrIid) return;
    const existing = predictions.find(p => p.mrIid === mrIid);
    const rec: PredictionRecord = {
      mrIid,
      title: `MR !${mrIid}`,
      predictedRisk: data.hero?.riskScore ?? 0.5,
      predictedLevel: data.hero?.riskLevel ?? "medium",
      actualOutcome: "pending",
      mergedAt: new Date().toISOString().split("T")[0],
      source: "live",
    };
    if (existing) {
      updatePrediction(mrIid, { predictedRisk: rec.predictedRisk, predictedLevel: rec.predictedLevel, source: "live" });
    } else {
      savePrediction(rec);
    }
    setPredictions(loadPredictions("live"));
  }, [data, dataMode]);

  const demoRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const [stepProgress, setStepProgress] = useState(0); // 0-100 for the progress bar
  const progressRef = useRef<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => { ssWrite("view", view); }, [view]);
  useEffect(() => { ssWrite("demo", demo); }, [demo]);
  useEffect(() => { ssWrite("step", stepIndex); }, [stepIndex]);
  useEffect(() => { ssWrite("scenario", currentScenario); }, [currentScenario]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (apiService.isApiAvailable()) {
        const liveData = await apiService.getDemoData();
        setData(liveData?.report || liveData);
        setDataMode("demo");
      } else {
        setData(DEMO_DATA);
        setDataMode("demo");
      }
    } catch (err: any) {
      console.warn("Failed to load live data, falling back to local demo:", err);
      setData(DEMO_DATA);
      setDataMode("demo");
    } finally {
      setLoading(false);
    }
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

  const rk = riskScoreToKey(data?.hero?.riskScore ?? 0.5);
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

  // Schedule next step using per-step duration; rebuilds whenever stepIndex or demo changes
  useEffect(() => {
    if (!demo) {
      if (demoRef.current) { clearTimeout(demoRef.current); demoRef.current = null; }
      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
      setStepProgress(0);
      return;
    }
    const stepDuration = DEMO_STEPS[stepIndex].duration;
    const startTime = Date.now();

    // Animate the thin progress bar for this step
    if (progressRef.current) clearInterval(progressRef.current);
    setStepProgress(0);
    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / stepDuration) * 100);
      setStepProgress(pct);
      if (pct >= 100 && progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }, 80);

    // Advance to next step after this step's duration
    demoRef.current = window.setTimeout(() => {
      setStepIndex(prev => (prev + 1) % DEMO_STEPS.length);
    }, stepDuration);

    return () => {
      if (demoRef.current) { clearTimeout(demoRef.current); demoRef.current = null; }
      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
    };
  }, [demo, stepIndex]);

  // Sync view and scroll to top on step change
  useEffect(() => {
    if (!demo) return;
    setView(DEMO_STEPS[stepIndex].view);
    // After transition completes, scroll back to top so judges can read from the beginning
    setTimeout(() => {
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
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
    setPredictions(loadPredictions("live"));
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
    setTimeout(startDemo, 800);
  }, [startDemo]);

  const onTourNavigate = useCallback((stepIndex: number) => {
    const tourViews: View[] = ["overview", "overview", "overview", "blast-radius", "risk", "overview", "overview", "simulation", "historical", "predictions", "overview", "setup", "overview"];
    if (stepIndex < tourViews.length) {
      setView(tourViews[stepIndex]);
    }
  }, []);

  const tabs: [View, string][] = [["overview","Overview"],["predictions","Predictions"],["blast-radius","Graph"],["risk","Risk"],["simulation","Forecast"],["historical","History"],["report","Report"],["setup","Setup"]];
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
            {showQueryLog ? (
              <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><OrbitQueryLog onComplete={() => setTimeout(() => setShowQueryLog(false), 2000)} /></ErrorBoundary>
                  <ErrorBoundary><ArchitectureDiagram /></ErrorBoundary>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><ProblemSection /></ErrorBoundary>
                <div className="section-accent section-accent-roi" style={{ position: "relative" }}><ErrorBoundary><ImpactCalculator riskScore={data.hero.riskScore} evidenceCount={data.evidence.length} counterfactuals={data.counterfactuals} predictions={predictions} /></ErrorBoundary></div>
                </div>
              </div>
            ) : (
              <>
                <ErrorBoundary><ProblemSection /></ErrorBoundary>
                <div className="resp-grid-2 resp-stack" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: isMobile ? 8 : 12 }}>
                  <div className="section-accent" style={{ position: "relative" }}><ErrorBoundary><HeroSection {...data.hero} /></ErrorBoundary></div>
                  {!isMobile && <ErrorBoundary><TaglineBanner /></ErrorBoundary>}
                </div>
                {isMobile && <ErrorBoundary><TaglineBanner /></ErrorBoundary>}
                <div className="glow-judge" style={{
                  position: "relative", borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}>
                  {!currentScenario && !analyzing && (
                    <div style={{
                      position: "absolute", top: -10, right: 16, zIndex: 5,
                      padding: "3px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                      background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase",
                      boxShadow: "0 0 20px rgba(139,92,246,0.4)",
                    }}>🔬 Try This →</div>
                  )}
                  <ErrorBoundary>
                    <MrAnalyzer
                      onSelectScenario={onSelectScenario}
                      apiAvailable={apiService.isApiAvailable()}
                      currentScenario={currentScenario}
                      onAnalyzeStart={onAnalyzeStart}
                    />
                  </ErrorBoundary>
                </div>
                {analyzing && <AgentFlowProgress active={analyzing} onComplete={onFlowComplete} />}
                <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: isMobile ? 8 : 12 }}>
                  <div className="section-accent section-accent-verdict" style={{ position: "relative" }}><ErrorBoundary><DecisionCenter d={data.decisionCenter} /></ErrorBoundary></div>
                  <ErrorBoundary><FutureTimeline events={data.futureTimeline} confidence={data.hero.confidence} /></ErrorBoundary>
                  <ErrorBoundary><PathBrokenAnimation mrIid={data.hero.mrIid} evidence={data.evidence} /></ErrorBoundary>
                </div>
                <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><OrbitEvidencePanel evidence={data.evidence} graph={data.graph} /></ErrorBoundary>
                  <div style={{ height: isMobile ? 300 : "auto", minHeight: isMobile ? "auto" : 580, display: "flex", flexDirection: "column" }}>
                    <ErrorBoundary><Suspense fallback={<PanelFallback height={580} />}><DigitalTwinGraph graph={data.graph} /></Suspense></ErrorBoundary>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  <ErrorBoundary><SimulateWebhook data={data} dataMode={dataMode} /></ErrorBoundary>
                </div>
              </>
            )}
            <button onClick={() => setShowQueryInspector(!showQueryInspector)} style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: showQueryInspector ? "rgba(96,165,250,0.12)" : "var(--overlay-04)",
              color: showQueryInspector ? "#60a5fa" : "var(--text-secondary)",
              border: `1px solid ${showQueryInspector ? "rgba(96,165,250,0.25)" : "var(--overlay-08)"}`,
              cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-end",
            }}>🔍 {showQueryInspector ? "Hide" : "Show"} Raw Query Payloads</button>
            {showQueryInspector && <ErrorBoundary><OrbitQueryInspector evidence={data.evidence} timings={data.queryTimings} /></ErrorBoundary>}
          </div>
        );
      case "blast-radius": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><BlastRadiusExplorer graph={data.graph} /></Suspense></ErrorBoundary>;
      case "risk":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            <ErrorBoundary><RiskInvestigation riskData={data.riskData} evidence={data.evidence} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} mrIid={data.hero.mrIid} dataMode={dataMode === "live" ? "live" : "demo"} /></ErrorBoundary>
            <ErrorBoundary><OrbitQueryExplorer evidence={data.evidence} /></ErrorBoundary>
          </div>
        );
      case "simulation": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><ForecastEngine evidence={data.evidence} futureTimeline={data.futureTimeline} counterfactuals={data.counterfactuals} decisionCenter={data.decisionCenter} confidence={data.hero.confidence} riskScore={data.hero.riskScore} riskLevel={data.hero.riskLevel} mrIid={data.hero.mrIid} pipelinesTotal={data.timelines.find(t => t.label === "Pipelines Found" || t.label === "Ecosystem Pipelines")?.value ?? 0} dataMode={dataMode === "live" ? "live" : "demo"} /></Suspense></ErrorBoundary>;
      case "historical": return <ErrorBoundary><Suspense fallback={<PanelFallback height={400} />}><HistoricalContext incidents={data.incidents} totalAnalyzed={data.timelines.find(t => t.label === "MRs Analyzed")?.value ?? 10} mrIid={data.hero.mrIid} riskScore={data.hero.riskScore} dataMode={dataMode === "live" ? "live" : "demo"} /></Suspense></ErrorBoundary>;
      case "setup":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            <ErrorBoundary><SetupWizard data={data} /></ErrorBoundary>
            <ErrorBoundary><RealityCheck /></ErrorBoundary>
          </div>
        );
      case "predictions":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            <ErrorBoundary><PredictionsTracker predictions={predictions} onVerify={onVerifyPrediction} /></ErrorBoundary>
            <ErrorBoundary><ImpactCalculator riskScore={data.hero.riskScore} evidenceCount={data.evidence.length} counterfactuals={data.counterfactuals} predictions={predictions} /></ErrorBoundary>
          </div>
        );
      case "report": return <ErrorBoundary><ImpactReport data={data} /></ErrorBoundary>;
    }
  }, [view, data, navigate, isMobile]);

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)" }}>
        <header style={{
          position: "relative", zIndex: Z.dropdown,
          borderBottom: "1px solid var(--overlay-06)",
          padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          flexShrink: 0, background: "rgba(8,9,13,0.8)", backdropFilter: "blur(16px)", overflowX: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#60a5fa,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🛰️</div>
            <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Orbit Sentinel</span>
          </div>
        <div className="resp-hide-subtitle" style={{ flex: 1, maxWidth: 420, minWidth: 0, margin: "0 4px", display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
          <DataModeBanner mode={dataMode} onRetry={loadData} />
        </div>
          {/* Placeholder matching loaded header height to prevent CLS */}
          <div className="header-nav resp-hide-subtitle" style={{ height: 28, display: "flex", alignItems: "center", gap: 6 }}>
            {["Overview","Graph","Risk","Forecast","History","Report"].map(l => (
              <div key={l} style={{ width: Math.max(l.length * 7.5 + 22, 50), height: 24, borderRadius: 6, background: "var(--overlay-02)" }} />
            ))}
          </div>
        </header>
        {loading ? <>
          <LoadingSkeleton />
          {loadingSlow && (
            <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: Z.overlay, background: "var(--bg-elevated)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 15, boxShadow: "0 4px 24px rgba(0,0,0,0.4)",   animation: ANIM.fadeSlideUp.medium }}>
              <span style={{ color: "var(--text-secondary)" }}>Engine is taking longer than expected...</span>
              <button onClick={() => { setData(DEMO_DATA); setDataMode("demo"); }}
                style={{ padding: "5px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, background: "rgba(96,165,250,0.12)", color: COLORS.info, whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.12)"; }}
              >Use Demo Data →</button>
            </div>
          )}
        </> : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, padding: 20, animation: ANIM.fadeSlideUp.slow }}>
            <div style={{ fontSize: 42, animation: ANIM.float.slow }}>🛰️</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              {dataMode === "error" ? "Engine API Unreachable" : "No Data Available"}
            </div>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
              {dataMode === "error" && apiService.isApiAvailable()
                ? "The Orbit Sentinel engine could not be reached. Demo data will be shown as fallback."
                : "No visualization data loaded."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadData}
                style={{ marginTop: 4, padding: "6px 18px", fontSize: 16, fontWeight: 600, border: "1px solid var(--overlay-10)", borderRadius: 6, cursor: "pointer", background: "var(--overlay-04)", color: "var(--text-secondary)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-08)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >Retry</button>
              <button onClick={() => { setData(DEMO_DATA); setDataMode("demo"); }}
                style={{ marginTop: 4, padding: "6px 18px", fontSize: 16, fontWeight: 600, border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, cursor: "pointer", background: "rgba(96,165,250,0.1)", color: COLORS.info }}
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
        padding: "6px 16px", alignItems: "center", gap: 14,
        flexShrink: 0, background: "var(--bg-elevated)", backdropFilter: "blur(20px)",
        boxShadow: `0 1px 0 ${accentColor}11, 0 4px 24px ${accentGlow}08`,
        transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${accentColor},${RISK[rk].glow.replace("rgba","rgb")})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 16px ${accentGlow}` }}>🛰️</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>Orbit Sentinel</span>
        </div>
        <div className="resp-hide-subtitle" style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
          <DataModeBanner mode={dataMode} onRetry={loadData} />
        </div>
        {isMobile && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMobileViewOpen(!mobileViewOpen)}
              aria-label="Switch view" aria-expanded={mobileViewOpen}
              style={{
                padding: "4px 10px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${accentColor}44`, borderRadius: 6,
                background: `${accentColor}15`, color: accentColor, whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s ease",
                boxShadow: mobileViewOpen ? `0 0 12px ${accentGlow}` : "none",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, boxShadow: `0 0 8px ${accentGlow}` }} />
              {tabs.find(([k]) => k === view)?.[1] ?? "Overview"}
              <span style={{
                fontSize: 12, opacity: mobileViewOpen ? 1 : 0.5,
                transform: mobileViewOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.25s ease",
              }}>▾</span>
            </button>
            {mobileViewOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, zIndex: Z.modal, marginTop: 6,
                background: "var(--bg-elevated)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden",
                minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                animation: "fadeSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
              }}>
                {tabs.map(([k, lbl], i) => {
                  const qt = VIEW_QUERY_TAG[k];
                  const isActive = view === k;
                  return (
                  <button key={k} onClick={() => { setView(k); setMobileViewOpen(false); if (demo) stopDemo(); }}
                    style={{
                      display: "flex", width: "100%", padding: "8px 14px", fontSize: 14.5, cursor: "pointer",
                      border: "none", borderBottom: i < tabs.length - 1 ? "1px solid var(--overlay-04)" : "none",
                      background: isActive ? `${accentColor}15` : "transparent",
                      color: isActive ? accentColor : "var(--text-secondary)",
                      textAlign: "left", alignItems: "center", gap: 8,
                      fontWeight: isActive ? 600 : 400,
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--overlay-03)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                  >
                    {isActive && <div style={{ position: "absolute", left: 0, top: "20%", width: 2, height: "60%", borderRadius: 1, background: accentColor, boxShadow: `0 0 8px ${accentGlow}` }} />}
                    <span style={{ fontSize: 16 }}>{qt?.tag === "NEIGHBORS" ? "💥" : qt?.tag === "TRAVERSAL" ? "📜" : qt?.tag === "AGGREGATION" ? "⚠️" : lbl === "Predictions" ? "🎯" : lbl === "Setup" ? "⚡" : lbl === "Overview" ? "🛰️" : lbl === "Report" ? "📋" : lbl === "Forecast" ? "🧪" : "📊"}</span>
                    {lbl}
                    {qt && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${qt.color}18`, color: qt.color, lineHeight: 1.2, marginLeft: "auto" }}>{qt.tag}</span>}
                  </button>
                  );
                })}
                <div style={{
                  padding: "6px 14px", fontSize: 12, color: "var(--text-tertiary)",
                  borderTop: "1px solid var(--overlay-03)",
                  textAlign: "center", letterSpacing: "0.3px",
                }}>
                  {tabs.findIndex(([k]) => k === view) < tabs.length - 1
                    ? `Next: ${tabs[tabs.findIndex(([k]) => k === view) + 1][1]}`
                    : "All views shown"}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={`header-nav${isMobile ? ' resp-hide-tabs' : ''}`} style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, overflow: "auto" }} role="tablist" aria-label="Dashboard views">
          {tabs.map(([k, lbl]) => (
            <button key={k} onClick={() => { if (demo) stopDemo(); navigate(k); }}
              role="tab"
              id={`tab-${k}`}
              aria-selected={view === k}
              aria-controls={`tabpanel-${k}`}
              className={VIEW_QUERY_TAG[k] ? "resp-hide-query-tag" : undefined}
              style={{
              padding: "5px 10px", fontSize: 14.5, fontWeight: view === k ? 600 : 400,
              border: view === k ? `1px solid ${accentColor}30` : "1px solid transparent",
              borderRadius: 6, cursor: "pointer",
              background: view === k ? `${accentColor}12` : "transparent",
              color: view === k ? accentColor : "var(--text-tertiary)",
              transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)", letterSpacing: "0.15px", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 3,
              boxShadow: view === k ? `0 0 12px ${accentGlow}` : "none",
            }}
              onMouseEnter={e => { if (view !== k) { e.currentTarget.style.background = "var(--overlay-03)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
              onMouseLeave={e => { if (view !== k) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; } }}
            >{lbl}
              {VIEW_QUERY_TAG[k] && (
                <span style={{ fontSize: 11.5, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: `${VIEW_QUERY_TAG[k].color}15`, color: VIEW_QUERY_TAG[k].color, lineHeight: 1.2 }}>
                  {VIEW_QUERY_TAG[k].tag}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 6px", flexShrink: 0 }} />
          <button onClick={() => setShowTour(true)} title="Judge's Tour" aria-label="Guided tour for judges"
            style={{
              padding: "4px 10px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              border: "1px solid rgba(167,139,250,0.3)", borderRadius: 6,
              background: "rgba(167,139,250,0.1)", color: COLORS.purple,
              boxShadow: "0 0 10px rgba(167,139,250,0.1)",
              transition: "all 0.15s ease", flexShrink: 0, lineHeight: 1,
              letterSpacing: "0.3px",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.18)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(167,139,250,0.25)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.1)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(167,139,250,0.1)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)"; }}
          >{isMobile ? "👑" : "👑 Tour"}</button>
          <button onClick={() => exportAsHtml(data)} title="Export as HTML" aria-label="Export report as HTML"
            style={{
              padding: "4px 8px", fontSize: 16, cursor: "pointer",
              border: "1px solid var(--overlay-12)", borderRadius: 6,
              background: "var(--overlay-04)", color: "var(--text-secondary)",
              boxShadow: "0 0 6px var(--overlay-06)",
              transition: "all 0.15s ease", flexShrink: 0, lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-08)"; e.currentTarget.style.boxShadow = "0 0 12px var(--overlay-10)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-04)"; e.currentTarget.style.boxShadow = "0 0 6px var(--overlay-06)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--overlay-12)"; }}
          >⬇</button>
          <button onClick={toggleTheme} title={dark ? "Switch to light theme" : "Switch to dark theme"} aria-label="Toggle theme"
            style={{
              padding: "4px 8px", fontSize: 18, cursor: "pointer",
              border: `1px solid ${dark ? "rgba(251,191,36,0.3)" : "rgba(96,165,250,0.3)"}`, borderRadius: 6,
              background: dark ? "rgba(251,191,36,0.08)" : "rgba(96,165,250,0.08)",
              color: dark ? "#fbbf24" : "#60a5fa",
              boxShadow: dark ? "0 0 10px rgba(251,191,36,0.1)" : "0 0 10px rgba(96,165,250,0.1)",
              transition: "all 0.15s ease", flexShrink: 0, lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)"; e.currentTarget.style.boxShadow = dark ? "0 0 18px rgba(251,191,36,0.25)" : "0 0 18px rgba(96,165,250,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(251,191,36,0.08)" : "rgba(96,165,250,0.08)"; e.currentTarget.style.boxShadow = dark ? "0 0 10px rgba(251,191,36,0.1)" : "0 0 10px rgba(96,165,250,0.1)"; }}
          >{dark ? "☀️" : "🌙"}</button>
          <button onClick={demo ? stopDemo : startDemo}
            aria-label={demo ? "Stop demo" : "Play demo"}
            style={{
            padding: "4px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            border: demo ? "1px solid rgba(239,68,68,0.45)" : `1px solid ${accentColor}45`,
            borderRadius: 6, letterSpacing: "0.3px",
            background: demo ? "rgba(239,68,68,0.12)" : `${accentColor}15`,
            color: demo ? "#ef4444" : accentColor,
            transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1,
            boxShadow: demo ? "0 0 14px rgba(239,68,68,0.15)" : `0 0 14px ${accentGlow}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = demo ? "rgba(239,68,68,0.2)" : `${accentColor}22`; e.currentTarget.style.boxShadow = demo ? "0 0 22px rgba(239,68,68,0.25)" : `0 0 22px ${accentGlow}`; e.currentTarget.style.borderColor = demo ? "rgba(239,68,68,0.6)" : `${accentColor}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = demo ? "rgba(239,68,68,0.12)" : `${accentColor}15`; e.currentTarget.style.boxShadow = demo ? "0 0 14px rgba(239,68,68,0.15)" : `0 0 14px ${accentGlow}`; e.currentTarget.style.borderColor = demo ? "rgba(239,68,68,0.45)" : `${accentColor}45`; }}
          >
            <span style={{ fontSize: 13 }}>{demo ? "■" : "▶"}</span>
            {!isMobile && (demo ? "Stop" : "Play")}
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
            padding: "8px 20px", borderRadius: 24, fontSize: 15, fontWeight: 600,
            background: `${accentColor}22`, backdropFilter: "blur(12px)",
            border: `1px solid ${accentColor}33`,
            color: accentColor, letterSpacing: "1px", textTransform: "uppercase",
          }}>
            <span style={{ opacity: 0.5, marginRight: 6 }}>{stepIndex + 1}/{DEMO_STEPS.length}</span>
            {DEMO_STEPS[stepIndex].icon} {DEMO_STEPS[stepIndex].label}
          </div>
          <div style={{
            padding: "4px 16px", borderRadius: 12, fontSize: 14,
            background: "var(--bg-card)", backdropFilter: "blur(8px)",
            color: "var(--text-secondary)",
          }}>
            {DEMO_STEPS[stepIndex].sublabel}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4, alignItems: "center" }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === stepIndex ? 16 : 6, height: 4, borderRadius: 2,
                background: i === stepIndex ? accentColor : "var(--overlay-15)",
                transition: "all 0.3s ease",
              }} />
            ))}
            <span style={{
              fontSize: 12, color: "var(--text-tertiary)", marginLeft: 8,
              fontVariantNumeric: "tabular-nums", letterSpacing: "0.3px",
            }}>
              {Math.max(0, Math.ceil(DEMO_STEPS[stepIndex].duration * (1 - stepProgress / 100) / 1000))}s
            </span>
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
            padding: "20px 24px", maxWidth: 420, width: "90%",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(139,92,246,0.1))",
                border: "1px solid rgba(139,92,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>⌨️</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Keyboard Shortcuts</div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Navigate Orbit Sentinel without touching a mouse</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { key: "Space", icon: "▶", desc: "Start / Stop demo" },
                { key: "← →", icon: "⇄", desc: "Navigate views" },
                { key: "1–8", icon: "🔢", desc: "Jump to view" },
                { key: "D", icon: "🌓", desc: "Toggle theme" },
                { key: "E", icon: "⬇", desc: "Export report" },
                { key: "P", icon: "🎬", desc: "Presentation mode" },
                { key: "?", icon: "⌨️", desc: "Show shortcuts" },
                { key: "Esc", icon: "✕", desc: "Close overlays" },
              ].map(s => (
                <div key={s.key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6,
                  background: "var(--overlay-02)", border: "1px solid var(--overlay-04)",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 5,
                    background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, flexShrink: 0,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{s.key}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>
              Press <kbd style={{ padding: "1px 6px", borderRadius: 3, background: "var(--overlay-06)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>?</kbd> or click anywhere to close
            </div>
          </div>
        </div>
      )}

      {presentMode && (
        <div style={{
          position: "fixed", top: 8, left: 8, zIndex: Z.toast,
          padding: "3px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
          color: COLORS.critical, letterSpacing: "0.5px", textTransform: "uppercase",
        }}>● Presenting</div>
      )}

      {/* Demo progress bar — thin stripe at bottom of header showing time left on current screen */}
      {demo && (
        <div style={{
          position: "absolute", top: isMobile ? 120 : 64, left: 0, right: 0,
          height: 3, zIndex: Z.sticky, background: "var(--overlay-04)",
          pointerEvents: "none",
        }}>
          <div style={{
            height: "100%",
            width: `${stepProgress}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
            boxShadow: `0 0 8px ${accentGlow}`,
            transition: "width 0.08s linear",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>
      )}

      <main ref={mainRef} style={{
        position: "relative", zIndex: Z.base, flex: 1, padding: isMobile ? 10 : 16, overflow: "auto", minHeight: 0,
        willChange: "transform", display: "flex", flexDirection: "column",
        animation: firstLoad ? "scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both" : "none",
        scrollBehavior: "smooth",
      }}>
        <ErrorBoundary>
          <div
            id={`tabpanel-${view}`}
            role="tabpanel"
            aria-labelledby={`tab-${view}`}
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateY(6px) scale(0.99)" : "none",
              transition: "opacity 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)",
              display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
            }}
          >
            {body()}
          </div>
        </ErrorBoundary>
      </main>

      <div className={isMobile ? 'resp-hide-subtitle' : ''} style={{
        position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: Z.modal,
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 14px", borderRadius: 8,
        background: "var(--bg-elevated)", backdropFilter: "blur(8px)",
        border: "1px solid var(--overlay-06)",
        fontSize: 13, color: "var(--text-tertiary)",
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
