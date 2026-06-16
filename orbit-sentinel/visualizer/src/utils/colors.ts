export const NODE_COLORS: Record<string, string> = {
  Project: "#1f77b4",
  Service: "#ff7f0e",
  File: "#2ca02c",
  Definition: "#d62728",
  MergeRequest: "#9467bd",
  Pipeline: "#8c564b",
  Deployment: "#e377c2",
  Incident: "#7f7f7f",
  Team: "#bcbd22",
  User: "#17becf",
};

export const RISK_COLORS: Record<string, string> = {
  low: "#2ea043",
  medium: "#d29922",
  high: "#d1242f",
  critical: "#8b1a1a",
};

export function getNodeColor(type: string): string {
  return NODE_COLORS[type] ?? "#999";
}

export function getRiskColor(level: string): string {
  return RISK_COLORS[level] ?? "#999";
}

export function riskScoreToColor(score: number): string {
  if (score > 0.7) return RISK_COLORS.critical;
  if (score > 0.4) return RISK_COLORS.high;
  if (score > 0.2) return RISK_COLORS.medium;
  return RISK_COLORS.low;
}
