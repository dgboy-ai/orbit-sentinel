export type View = "overview" | "blast-radius" | "risk" | "simulation" | "historical" | "report" | "predictions" | "setup";

export type DemoStep = { view: View; label: string; sublabel: string; icon: string; duration: number };

export const DEMO_STEPS: DemoStep[] = [
  { view: "overview",     label: "Orbit Sentinel Dashboard",  sublabel: "Impact Calculator, architecture diagram, MR risk, Orbit evidence, and incident intelligence — all 4 query types",      icon: "🛰️", duration: 15000 },
  { view: "predictions",  label: "Predictions Tracker",       sublabel: "Prediction accuracy scoreboard, post-merge verification, closed-loop ROI — proves Orbit Sentinel learns from every MR",  icon: "🎯", duration: 14000 },
  { view: "blast-radius", label: "Orbit Graph",               sublabel: "Visualize affected files, services, and downstream dependencies from Orbit NEIGHBORS query",                              icon: "💥", duration: 10000 },
  { view: "risk",         label: "Risk Investigation",        sublabel: "Orbit evidence cards showing why this MR cannot deploy — signals, findings, and verdict",                                 icon: "🔍", duration: 10000 },
  { view: "simulation",   label: "Forecast Engine",           sublabel: "Digital twin forecast with interactive what-if scenarios — predicts outcomes before deployment",                          icon: "🧪", duration: 10000 },
  { view: "historical",   label: "Historical Context",        sublabel: "Past incidents and MRs with similarity scores from Orbit TRAVERSAL query",                                                icon: "📜", duration:  8000 },
  { view: "report",       label: "Impact Report",             sublabel: "Full MR impact summary — deploy decisions, rollback strategy, and evidence chain",                                        icon: "📋", duration: 12000 },
  { view: "setup",        label: "Setup Wizard",              sublabel: "4-step guided journey — Mission → Architecture → Setup → Launch. Copy commands, Devpost checklist.",                     icon: "⚡", duration:  8000 },
];

export const VIEW_LABELS: Record<View, string> = {
  overview: "Dashboard",
  "blast-radius": "Blast Radius",
  risk: "Risk Investigation",
  simulation: "Forecast Engine",
  historical: "Historical Context",
  report: "Impact Report",
  predictions: "Predictions",
  setup: "Setup Wizard",
};

export const VIEW_QUERY_TAG: Partial<Record<View, { tag: string; color: string }>> = {
  "blast-radius": { tag: "NEIGHBORS", color: "#a78bfa" },
  "historical": { tag: "TRAVERSAL", color: "#22d3ee" },
  "risk": { tag: "AGGREGATION", color: "#f97316" },
};

export const ALL_VIEWS: View[] = ["overview", "predictions", "blast-radius", "risk", "simulation", "historical", "report", "setup"];
