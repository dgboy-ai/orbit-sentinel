import type { PredictionRecord } from "../types";

const STORAGE_KEY = "orbit-sentinel-predictions";

const PRESEEDED_PREDICTIONS: PredictionRecord[] = [
  { mrIid: 42, title: "Feature: Add GraphQL support", predictedRisk: 0.85, predictedLevel: "high", actualRisk: 0.8, actualOutcome: "failed", mergedAt: "2026-06-12", evidence: "High blast radius and 7 downstream dependencies broken." },
  { mrIid: 38, title: "Refactor: Auth middleware", predictedRisk: 0.75, predictedLevel: "high", actualRisk: 0.15, actualOutcome: "verified", mergedAt: "2026-06-10", evidence: "Clean run through 7-day survival window." },
  { mrIid: 24, title: "Fix: Database migration", predictedRisk: 0.65, predictedLevel: "high", actualRisk: 0.72, actualOutcome: "failed", mergedAt: "2026-06-08", evidence: "Failed post-merge due to schema lock contention." },
  { mrIid: 14, title: "Docs: API specifications", predictedRisk: 0.15, predictedLevel: "low", actualRisk: 0.12, actualOutcome: "verified", mergedAt: "2026-06-05", evidence: "Documentation updates complete without downstream impact." },
  { mrIid: 10, title: "Build: Update configurations", predictedRisk: 0.45, predictedLevel: "medium", actualRisk: 0.40, actualOutcome: "verified", mergedAt: "2026-06-02", evidence: "Successful configuration synchronization." },
];

export function loadPredictions(): PredictionRecord[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESEEDED_PREDICTIONS));
      return PRESEEDED_PREDICTIONS;
    }
    return JSON.parse(v);
  } catch {
    return PRESEEDED_PREDICTIONS;
  }
}

export function savePrediction(rec: PredictionRecord) {
  try {
    const all = loadPredictions().filter(p => p.mrIid !== rec.mrIid);
    all.unshift(rec);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { console.warn("localStorage save blocked"); }
}

export function updatePrediction(mrIid: number, updates: Partial<PredictionRecord>) {
  try {
    const all = loadPredictions();
    const i = all.findIndex(p => p.mrIid === mrIid);
    if (i === -1) return;
    all[i] = { ...all[i], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { console.warn("localStorage update blocked"); }
}

export function clearPredictions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { console.warn("localStorage clear blocked"); }
}
