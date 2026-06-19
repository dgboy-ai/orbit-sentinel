import type { PredictionRecord } from "../types";

const STORAGE_KEY = "orbit-sentinel-predictions";

export function loadPredictions(): PredictionRecord[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
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
