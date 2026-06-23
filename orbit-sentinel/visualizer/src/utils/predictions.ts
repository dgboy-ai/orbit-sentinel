import type { PredictionRecord, PredictionCategory, ROIMetrics } from "../types";

const STORAGE_KEY = "orbit-sentinel-predictions";
const MIGRATION_KEY = "orbit-sentinel-predictions-v2";

const DEMO_PREDICTIONS: PredictionRecord[] = [
  { mrIid: 42, title: "Add GraphQL support", predictedRisk: 0.85, predictedLevel: "critical", actualOutcome: "failed", actualRisk: 0.80, mergedAt: "2026-06-10", verifiedAt: "2026-06-17", source: "demo", category: "true_positive" },
  { mrIid: 38, title: "Refactor auth middleware", predictedRisk: 0.75, predictedLevel: "high", actualOutcome: "verified", actualRisk: 0.15, mergedAt: "2026-06-08", verifiedAt: "2026-06-15", source: "demo", category: "false_positive" },
  { mrIid: 24, title: "Fix database migration", predictedRisk: 0.65, predictedLevel: "high", actualOutcome: "failed", actualRisk: 0.72, mergedAt: "2026-06-05", verifiedAt: "2026-06-12", source: "demo", category: "true_positive" },
  { mrIid: 14, title: "API specifications", predictedRisk: 0.15, predictedLevel: "low", actualOutcome: "verified", actualRisk: 0.12, mergedAt: "2026-06-02", verifiedAt: "2026-06-09", source: "demo", category: "true_negative" },
  { mrIid: 10, title: "Update configurations", predictedRisk: 0.55, predictedLevel: "medium", actualOutcome: "verified", actualRisk: 0.40, mergedAt: "2026-06-01", verifiedAt: "2026-06-08", source: "demo", category: "true_negative" },
];

export function categorizePrediction(rec: PredictionRecord): PredictionCategory {
  if (rec.actualOutcome === "pending" || rec.actualOutcome === "unknown") return "pending";
  const highRisk = rec.predictedRisk >= 0.6;
  const failed = rec.actualOutcome === "failed";
  if (highRisk && failed) return "true_positive";
  if (!highRisk && !failed) return "true_negative";
  if (highRisk && !failed) return "false_positive";
  return "false_negative";
}

function getCategoryLabel(cat: PredictionCategory): string {
  const labels: Record<PredictionCategory, string> = {
    true_positive: "TP",
    true_negative: "TN",
    false_positive: "FP",
    false_negative: "FN",
    pending: "—",
  };
  return labels[cat];
}

const DEFAULT_INCIDENT_COST = 15000;

export function computeROI(predictions: PredictionRecord[], mrsPerWeek = 15, hourlyRate = 80, manualHoursPerMR = 2.5, incidentCost = DEFAULT_INCIDENT_COST): ROIMetrics {
  const withCategories = predictions.map(p => ({ ...p, category: p.category || categorizePrediction(p) }));
  const verified = withCategories.filter(p => p.actualOutcome !== "pending" && p.actualOutcome !== "unknown");

  const truePositives = verified.filter(p => p.category === "true_positive").length;
  const trueNegatives = verified.filter(p => p.category === "true_negative").length;
  const falsePositives = verified.filter(p => p.category === "false_positive").length;
  const falseNegatives = verified.filter(p => p.category === "false_negative").length;
  const totalVerified = truePositives + trueNegatives + falsePositives + falseNegatives;
  const accuracyPercent = totalVerified > 0 ? Math.round(((truePositives + trueNegatives) / totalVerified) * 100) : 0;

  const WEEKS_PER_YEAR = 48;
  const sentinelHours = 0.08;
  const hoursPerMR = manualHoursPerMR - sentinelHours;
  const hoursPerYear = hoursPerMR * mrsPerWeek * WEEKS_PER_YEAR;
  const costPerYear = hoursPerYear * hourlyRate;
  const costPerMR = sentinelHours * hourlyRate;
  const mrsPerYear = mrsPerWeek * WEEKS_PER_YEAR;

  const incidentsIdentified = truePositives;
  const incidentsCostImpact = incidentsIdentified * incidentCost;
  const falseNegativeCost = falseNegatives * incidentCost;
  const analysisCost = costPerYear;
  const netSavings = incidentsCostImpact + (hoursPerMR * mrsPerYear * hourlyRate) - falseNegativeCost;
  const netROI = analysisCost > 0 ? Math.round((netSavings / analysisCost) * 100) : 0;

  return {
    hoursPerMR, hoursPerYear, costPerYear, costPerMR,
    incidentsIdentified,
    falsePositiveCost: falsePositives * (manualHoursPerMR * hourlyRate),
    falseNegativeCost,
    netROI, accuracyPercent,
    totalPredictions: totalVerified,
    truePositives, trueNegatives, falsePositives, falseNegatives,
    avgIncidentCost: incidentCost,
  };
}

function loadLivePredictions(): PredictionRecord[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return [];
    const parsed: PredictionRecord[] = JSON.parse(v);
    return parsed
      .filter(p => p.source === "live")
      .map(p => ({ ...p, category: p.category || categorizePrediction(p) }));
  } catch {
    return [];
  }
}

export function loadPredictions(mode?: "demo" | "live"): PredictionRecord[] {
  if (mode === "demo") return DEMO_PREDICTIONS;
  const live = loadLivePredictions();
  if (live.length > 0) return live;
  return DEMO_PREDICTIONS;
}

export function savePrediction(rec: PredictionRecord) {
  const withCategory = { ...rec, category: rec.category || categorizePrediction(rec) };
  try {
    const all = loadLivePredictions().filter(p => p.mrIid !== rec.mrIid);
    all.unshift(withCategory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { console.warn("localStorage save blocked"); }
}

export function updatePrediction(mrIid: number, updates: Partial<PredictionRecord>) {
  try {
    const all = loadLivePredictions();
    const i = all.findIndex(p => p.mrIid === mrIid);
    if (i === -1) return;
    const updated = { ...all[i], ...updates };
    updated.category = categorizePrediction(updated);
    all[i] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { console.warn("localStorage update blocked"); }
}

export function clearPredictions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { console.warn("localStorage clear blocked"); }
}
