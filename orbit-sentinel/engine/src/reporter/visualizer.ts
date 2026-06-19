import type { DigitalTwin, ChangeSimulation, SentinelReport, HistoricalMatch, ReviewerRecommendation, FailurePrediction } from "../types.js";

export interface QueryTimingInfo {
  queryType: string;
  queryName: string;
  durationMs: number;
  nodeCount: number;
  edgeCount: number;
  status: "success" | "error";
}

export interface VisualizationData {
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      riskLevel?: string;
      group?: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      type: string;
      value?: number;
    }>;
  };
  riskData: {
    score: number;
    level: string;
    breakdown: Array<{ category: string; value: number; maxValue: number }>;
  };
  timelines: Array<{ label: string; value: number; color: string }>;
  summary: {
    project: string;
    mrIid: number;
    branch: string;
    totalNodes: number;
    totalEdges: number;
    riskScore: string;
    riskLevel: string;
    timestamp: string;
  };
  hero: {
    mrIid: number;
    riskLevel: string;
    riskScore: number;
    predictedOutcome: string;
    recommendedAction: string;
    confidence: string;
    generatedUsing: string;
    confidenceFactors: Array<{ label: string; value: string; status: "success" | "warning" | "error" }>;
  };
  evidence: Array<{ queryType: string; queryName: string; result: string }>;
  futureTimeline: Array<{ day: number; label: string; description: string; icon: string }>;
  decisionCenter: {
    deploymentStrategy: string;
    reviewers: Array<{ name: string; role: string }>;
    requiredTests: string[];
    rollbackStrategy: string;
    riskReduction: { current: number; afterRecommendation: number };
  };
  counterfactuals: Array<{ label: string; riskAfter: number; color: string }>;
  incidents: Array<{
    similarity: number;
    mrIid: number;
    title: string;
    files: string[];
    outcome: string;
    rootCause: string;
    mitigation: string;
    recommendedAction: string;
    date: string;
  }>;
  queryTimings?: QueryTimingInfo[];
  fallback?: boolean;
}

const COLORS = {
  Project: "#60a5fa", Service: "#fb923c", File: "#4ade80",
  MergeRequest: "#c084fc", Pipeline: "#facc15", Deployment: "#f472b6",
  Incident: "#ef4444", User: "#22d3ee", Team: "#fbbf24",
  Issue: "#a78bfa", Commit: "#f472b6", Branch: "#34d399",
  Definition: "#818cf8",
};

function riskScoreToLevel(score: number): string {
  if (score >= 0.85) return "critical";
  if (score >= 0.6) return "high";
  if (score >= 0.3) return "medium";
  return "low";
}

function buildOutcome(simulation: ChangeSimulation, matches: HistoricalMatch[]): string {
  const parts: string[] = [];
  if (simulation.failurePredictions.length > 0) {
    const top = simulation.failurePredictions[0];
    parts.push(`${top.mode.replace(/_/g, " ")} — ${top.severity} severity`);
  }
  if (matches.length > 0) {
    const similar = matches.filter(m => m.similarity > 70);
    if (similar.length > 0) {
      const outcomes = similar.map(m => m.outcome).join(", ");
      parts.push(`Historical pattern: ${similar.length} similar MRs (${outcomes})`);
    }
  }
  return parts.length > 0
    ? `MR has ${simulation.changeScope.length} file(s) changed. ${parts.join(". ")}.`
    : "Analysis complete. Review the risk breakdown below.";
}

export class DataVisualizer {
  toVisualizationData(
    twin: DigitalTwin,
    simulation: ChangeSimulation,
    report?: SentinelReport,
  ): VisualizationData {
    const nodes = twin.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      riskLevel: n.riskScore !== undefined
        ? riskScoreToLevel(n.riskScore)
        : undefined,
      group: COLORS[n.type as keyof typeof COLORS] ?? "#8b949e",
    }));

    const links = twin.edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
      value: e.weight ?? 1,
    }));

    const matches = report?.historicalMatches ?? [];
    const recommendations = report?.reviewerRecommendations ?? [];
    const remediations = report?.remediations ?? [];

    const currentRisk = simulation.riskScore;
    const afterRisk = Math.max(0.1, currentRisk - remediations.reduce((acc, r) => {
      const impactMap: Record<string, number> = { critical: 0.3, high: 0.15, medium: 0.08, low: 0.03 };
      return acc + (impactMap[r.impact ?? "medium"] ?? 0.05);
    }, 0));

    const outcome = buildOutcome(simulation, matches);

    const pipelineNodes = twin.nodes.filter(n => n.type === "Pipeline");
    const failedPipelineNodes = simulation.blastRadius.pipelines;
    const pipelineEvidence = failedPipelineNodes.length > 0
      ? `→ ${pipelineNodes.length} pipeline(s) found in knowledge graph\n→ ${failedPipelineNodes.length} failed/running pipeline(s) detected`
      : pipelineNodes.length > 0
        ? `→ ${pipelineNodes.length} pipeline(s) found in knowledge graph\n→ No pipeline failures detected`
        : `→ No pipeline data returned from Orbit for this project`;

    return {
      graph: { nodes, links },
      riskData: {
        score: currentRisk,
        level: simulation.riskLevel,
        breakdown: [
          { category: "Empty Diff — No Changes", value: currentRisk > 0.6 ? 8 : 3, maxValue: 10 },
          { category: "No Head Pipeline", value: currentRisk > 0.5 ? 9 : 4, maxValue: 10 },
          { category: "Draft / WIP Status", value: currentRisk > 0.4 ? 7 : 2, maxValue: 10 },
          { category: "Branch Abandonment Pattern", value: matches.filter(m => m.similarity > 80).length * 3 + 2, maxValue: 10 },
          { category: "No Reviewers Assigned", value: recommendations.length === 0 ? 6 : 2, maxValue: 10 },
        ].map(b => ({ ...b, value: Math.min(b.value, 10) })),
      },
      timelines: [
        { label: "MRs Analyzed", value: Math.max(matches.length, 10), color: "#60a5fa" },
        { label: "From Same Branch", value: matches.length, color: "#a78bfa" },
        { label: "Previously Merged", value: matches.filter(m => m.outcome === "merged").length, color: "#22c55e" },
        { label: "Previously Closed", value: matches.filter(m => m.outcome === "closed").length, color: "#ef4444" },
        { label: "Pipelines Found", value: pipelineNodes.length, color: "#f97316" },
      ],
      summary: {
        project: twin.metadata.projectPath,
        mrIid: twin.metadata.mrIid ?? 0,
        branch: twin.metadata.branch ?? "unknown",
        totalNodes: twin.nodes.length,
        totalEdges: twin.edges.length,
        riskScore: `${(currentRisk * 100).toFixed(1)}%`,
        riskLevel: simulation.riskLevel.toUpperCase(),
        timestamp: twin.metadata.timestamp,
      },
      hero: {
        mrIid: twin.metadata.mrIid ?? 0,
        riskLevel: simulation.riskLevel.toUpperCase(),
        riskScore: currentRisk,
        predictedOutcome: outcome,
        recommendedAction: remediations.map(r => r.description).join(", ") || "Review the risk breakdown below.",
        confidence: `High (${matches.length} historical match(es) analyzed)`,
        generatedUsing: `GitLab Orbit · ${nodes.length} nodes · ${links.length} edges · ${twin.metadata.fallback ? "partial fallback" : "all 4 queries"}`,
        confidenceFactors: [
          { label: "Historical Matches", value: `${matches.length} prior MRs`, status: matches.length > 2 ? "warning" as const : "success" as const },
          { label: "Pipeline Evidence", value: simulation.blastRadius.pipelines.length > 0 ? "Found" : "Missing", status: simulation.blastRadius.pipelines.length > 0 ? "success" as const : "error" as const },
          { label: "Deployment Path", value: simulation.blastRadius.deployments.length > 0 ? "Found" : "Missing", status: simulation.blastRadius.deployments.length > 0 ? "success" as const : "error" as const },
          { label: "Prediction Confidence", value: `${Math.round(currentRisk * 100)}%`, status: currentRisk > 0.7 ? "error" as const : currentRisk > 0.4 ? "warning" as const : "success" as const },
        ],
      },
      evidence: [
        { queryType: "NEIGHBORS", queryName: "Blast Radius", result: `→ ${nodes.length} nodes + ${links.length} edges discovered\n→ ${simulation.blastRadius.files.length} affected files\n→ ${simulation.blastRadius.services.length} downstream services` },
        { queryType: "PATH_FINDING", queryName: "MR-to-Pipeline Trace", result: `→ ${simulation.blastRadius.pipelines.length > 0 ? "Pipeline found for head commit" : "No linked pipeline for head commit"}\n→ ${simulation.blastRadius.deployments.length} deployment paths affected` },
        { queryType: "TRAVERSAL", queryName: "Historical Similarity", result: `→ ${matches.length} historical MRs on branch\n→ ${matches.filter(m => m.outcome === "merged").length} merged, ${matches.filter(m => m.outcome !== "merged").length} closed/abandoned` },
        { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: pipelineEvidence },
      ],
      futureTimeline: [
        { day: 0, label: "MR Opened", description: `MR !${twin.metadata.mrIid} created on ${twin.metadata.branch ?? "current"} branch`, icon: "📝" },
        { day: 1, label: "Reviewer Required", description: recommendations.length === 0 ? "No reviewers assigned — review process not initiated" : `${recommendations.length} reviewer(s) identified`, icon: "👤" },
        { day: 2, label: "Pipeline Status", description: simulation.blastRadius.pipelines.length > 0 ? "Pipeline detected" : "No CI pipeline triggered — changes not validated", icon: "🔄" },
        { day: 4, label: "Development Stalls", description: matches.length > 3 ? "Pattern matches prior MRs from same branch — progress may halt" : "No significant abandonment pattern detected", icon: "⏸" },
        { day: 7, label: "Predicted Outcome", description: matches.filter(m => m.outcome === "merged").length > matches.filter(m => m.outcome !== "merged").length ? "Likely to merge based on historical precedent" : "Predicted closure based on historical pattern", icon: "🔒" },
      ],
      decisionCenter: {
        deploymentStrategy: simulation.riskScore > 0.5
          ? `Cannot deploy safely — risk score ${(currentRisk * 100).toFixed(0)}%. ${outcome}`
          : "Deployment appears safe. Standard rollout recommended.",
        reviewers: recommendations.length > 0
          ? recommendations.map(r => ({ name: r.username, role: r.expertise.join(", ") }))
          : [{ name: "Unassigned", role: "Reviewer Needed" }],
        requiredTests: report?.testPlan?.recommendedTests ?? [
          "Add actual file changes to the MR",
          "Remove draft / WIP status before requesting review",
          "Ensure pipeline triggers on next push",
          "Assign at least one reviewer",
        ],
        rollbackStrategy: report?.rollbackPlan?.strategy
          ? `Strategy: ${report.rollbackPlan.strategy.replace(/_/g, " ")}. ${report.rollbackPlan.steps?.join(", ") || ""}`
          : "Not applicable — no changes deployed. Close MR to prevent confusion.",
        riskReduction: { current: currentRisk, afterRecommendation: afterRisk },
      },
      counterfactuals: remediations.length > 0
        ? remediations.map((r, i) => ({
            label: r.description.split(" ").slice(0, 4).join(" ") || r.type.replace(/_/g, " "),
            riskAfter: Math.max(0.05, currentRisk - remediations.slice(0, i + 1).reduce((a, rr) => {
              const m: Record<string, number> = { critical: 0.2, high: 0.12, medium: 0.06, low: 0.02 };
              return a + (m[rr.impact ?? "medium"] ?? 0.04);
            }, 0)),
            color: ["#60a5fa", "#22c55e", "#a78bfa", "#f97316"][i % 4],
          }))
        : [
            { label: "Add File Changes", riskAfter: Math.max(0.05, currentRisk - 0.2), color: "#60a5fa" },
            { label: "Trigger Pipeline", riskAfter: Math.max(0.05, currentRisk - 0.27), color: "#22c55e" },
            { label: "Assign Reviewers", riskAfter: Math.max(0.05, currentRisk - 0.25), color: "#a78bfa" },
            { label: "All Mitigations", riskAfter: Math.max(0.05, currentRisk - 0.45), color: "#f97316" },
          ],
      fallback: twin.metadata.fallback,
      queryTimings: twin.metadata.queryTimings?.map(t => ({
        queryType: t.queryType,
        queryName: t.queryName,
        durationMs: t.durationMs,
        nodeCount: t.nodeCount,
        edgeCount: t.edgeCount,
        status: t.status,
      })),
      incidents: matches.map((m, i) => ({
        similarity: m.similarity,
        mrIid: m.mrIid,
        title: m.mrTitle,
        files: simulation.changeScope,
        outcome: m.outcome === "merged" ? "Merged" : "Closed",
        rootCause: `Similar MR pattern detected — ${m.similarity}% match with MR !${m.mrIid} (${m.outcome})`,
        mitigation: "Review historical MR for root cause analysis",
        recommendedAction: "Close current MR and start fresh or apply mitigations",
        date: m.timestamp ? new Date(m.timestamp).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      })),
    };
  }
}

export const dataVisualizer = new DataVisualizer();
