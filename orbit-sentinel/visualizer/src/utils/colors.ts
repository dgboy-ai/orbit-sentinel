export const RISK = {
  critical: { hex: "#ef4444", rgba: "rgba(239,68,68,", gradient: "linear-gradient(135deg, #ef4444, #dc2626)", glow: "rgba(239,68,68,0.4)" },
  high:    { hex: "#f97316", rgba: "rgba(249,115,22,", gradient: "linear-gradient(135deg, #f97316, #ea580c)", glow: "rgba(249,115,22,0.35)" },
  medium:  { hex: "#eab308", rgba: "rgba(234,179,8,", gradient: "linear-gradient(135deg, #eab308, #ca8a04)", glow: "rgba(234,179,8,0.3)" },
  low:     { hex: "#22c55e", rgba: "rgba(34,197,94,", gradient: "linear-gradient(135deg, #22c55e, #16a34a)", glow: "rgba(34,197,94,0.3)" },
} as const;

export function riskScoreToKey(score: number): keyof typeof RISK {
  if (score > 0.7) return "critical";
  if (score > 0.4) return "high";
  if (score > 0.2) return "medium";
  return "low";
}

export function riskScoreToColor(score: number): string {
  return RISK[riskScoreToKey(score)].hex;
}

export function riskScoreToGradient(score: number): string {
  return RISK[riskScoreToKey(score)].gradient;
}

export function riskScoreToGlow(score: number): string {
  return RISK[riskScoreToKey(score)].glow;
}

export function riskLevelToColor(level: string): string {
  const map: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };
  return map[level.toLowerCase()] ?? "#8b949e";
}

export const NODE_COLORS: Record<string, string> = {
  Project: "#60a5fa", Service: "#f97316", File: "#22c55e",
  MergeRequest: "#a78bfa", Pipeline: "#eab308", Deployment: "#ec4899",
  Incident: "#ef4444", User: "#06b6d4", Team: "#f59e0b",
  Issue: "#8b5cf6", Commit: "#ec4899",
};
