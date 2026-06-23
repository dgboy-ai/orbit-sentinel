export const RISK = {
  critical: { hex: "#ef4444", rgba: "rgba(239,68,68,", gradient: "linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)", glow: "rgba(239,68,68,0.5)", bg: "rgba(239,68,68,0.08)" },
  high:    { hex: "#f97316", rgba: "rgba(249,115,22,", gradient: "linear-gradient(135deg, #fb923c, #f97316, #ea580c)", glow: "rgba(249,115,22,0.4)", bg: "rgba(249,115,22,0.08)" },
  medium:  { hex: "#eab308", rgba: "rgba(234,179,8,", gradient: "linear-gradient(135deg, #facc15, #eab308, #ca8a04)", glow: "rgba(234,179,8,0.35)", bg: "rgba(234,179,8,0.08)" },
  low:     { hex: "#22c55e", rgba: "rgba(34,197,94,", gradient: "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)", glow: "rgba(34,197,94,0.35)", bg: "rgba(34,197,94,0.08)" },
} as const;

export function riskScoreToKey(score: number): keyof typeof RISK {
  if (score >= 0.85) return "critical";
  if (score >= 0.6) return "high";
  if (score >= 0.3) return "medium";
  return "low";
}

export function riskScoreToColor(score: number): string { return RISK[riskScoreToKey(score)].hex; }
export function riskScoreToGradient(score: number): string { return RISK[riskScoreToKey(score)].gradient; }
export function riskScoreToGlow(score: number): string { return RISK[riskScoreToKey(score)].glow; }
export function riskScoreToBg(score: number): string { return RISK[riskScoreToKey(score)].bg; }

export function riskLevelToColor(level: string): string {
  if (!level || typeof level !== "string") return "#8b949e";
  const map: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };
  return map[level.toLowerCase()] ?? "#8b949e";
}

export function riskLevelToGlow(level: string): string {
  if (!level || typeof level !== "string") return "rgba(139,148,158,0.3)";
  const map: Record<string, string> = { critical: "rgba(239,68,68,0.5)", high: "rgba(249,115,22,0.4)", medium: "rgba(234,179,8,0.35)", low: "rgba(34,197,94,0.35)" };
  return map[level.toLowerCase()] ?? "rgba(139,148,158,0.3)";
}

export function riskLevelToGradient(level: string): string {
  if (!level || typeof level !== "string") return "linear-gradient(135deg, #8b949e, #6b7280)";
  const map: Record<string, string> = { critical: "linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)", high: "linear-gradient(135deg, #fb923c, #f97316, #ea580c)", medium: "linear-gradient(135deg, #facc15, #eab308, #ca8a04)", low: "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)" };
  return map[level.toLowerCase()] ?? "linear-gradient(135deg, #8b949e, #6b7280)";
}

export function riskLevelToBg(level: string): string {
  if (!level || typeof level !== "string") return "rgba(255,255,255,0.04)";
  const map: Record<string, string> = { critical: "rgba(239,68,68,0.08)", high: "rgba(249,115,22,0.08)", medium: "rgba(234,179,8,0.08)", low: "rgba(34,197,94,0.08)" };
  return map[level.toLowerCase()] ?? "rgba(255,255,255,0.04)";
}

export const NODE_COLORS: Record<string, string> = {
  Project: "#60a5fa", Service: "#fb923c", File: "#4ade80",
  MergeRequest: "#c084fc", Pipeline: "#facc15", Deployment: "#f472b6",
  Incident: "#ef4444", User: "#22d3ee", Team: "#fbbf24",
  Issue: "#a78bfa", Commit: "#f472b6", Branch: "#34d399",
  Definition: "#818cf8",
};
