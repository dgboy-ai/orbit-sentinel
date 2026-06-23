import type { PredictionRecord, PredictionCategory, ROIMetrics } from "../types";

const STORAGE_KEY = "orbit-sentinel-predictions";

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

export function loadPredictions(): PredictionRecord[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return [];
    const parsed: PredictionRecord[] = JSON.parse(v);
    return parsed.map(p => ({ ...p, category: p.category || categorizePrediction(p) }));
  } catch {
    return [];
  }
}

export function savePrediction(rec: PredictionRecord) {
  const withCategory = { ...rec, category: rec.category || categorizePrediction(rec) };
  try {
    const all = loadPredictions().filter(p => p.mrIid !== rec.mrIid);
    all.unshift(withCategory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { console.warn("localStorage save blocked"); }
}

export function updatePrediction(mrIid: number, updates: Partial<PredictionRecord>) {
  try {
    const all = loadPredictions();
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
