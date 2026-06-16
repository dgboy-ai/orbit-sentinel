import type { DigitalTwin, ChangeSimulation, SentinelReport } from "../types.js";

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
  timelines: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  summary: Record<string, string | number>;
}

export class DataVisualizer {
  toVisualizationData(
    twin: DigitalTwin,
    simulation: ChangeSimulation,
    report?: SentinelReport,
  ): VisualizationData {
    const nodeTypeColors: Record<string, string> = {
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

    const nodes = twin.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      riskLevel: n.riskScore !== undefined
        ? n.riskScore > 0.7 ? "high" : n.riskScore > 0.4 ? "medium" : "low"
        : undefined,
      group: nodeTypeColors[n.type] ?? "#999999",
    }));

    const links = twin.edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
      value: e.weight ?? 1,
    }));

    const riskData = {
      score: simulation.riskScore,
      level: simulation.riskLevel,
      breakdown: [
        { category: "File Impact", value: Math.min(simulation.blastRadius.files.length, 10), maxValue: 10 },
        { category: "Service Impact", value: Math.min(simulation.blastRadius.services.length, 10), maxValue: 10 },
        { category: "Pipeline Risk", value: Math.min(simulation.blastRadius.pipelines.length, 10), maxValue: 10 },
        { category: "Historical Incidents", value: Math.min(simulation.failurePredictions.filter((p) => p.mode === "historical_incident_recurrence").length, 10), maxValue: 10 },
        { category: "Failure Probability", value: Math.round(simulation.riskScore * 10), maxValue: 10 },
      ],
    };

    const timelines = [
      { label: "Files Changed", value: simulation.changeScope.length, color: "#2ca02c" },
      { label: "Transitive Files", value: simulation.blastRadius.files.length, color: "#ff7f0e" },
      { label: "Services Affected", value: simulation.blastRadius.services.length, color: "#d62728" },
      { label: "Failure Predictions", value: simulation.failurePredictions.length, color: "#9467bd" },
      { label: "Risk Score (%)", value: Math.round(simulation.riskScore * 100), color: "#e377c2" },
    ];

    return {
      graph: { nodes, links },
      riskData,
      timelines,
      summary: {
        project: twin.metadata.projectPath,
        mrIid: twin.metadata.mrIid ?? "N/A",
        branch: twin.metadata.branch ?? "N/A",
        totalNodes: twin.nodes.length,
        totalEdges: twin.edges.length,
        riskScore: `${(simulation.riskScore * 100).toFixed(1)}%`,
        riskLevel: simulation.riskLevel.toUpperCase(),
        timestamp: twin.metadata.timestamp,
      },
    };
  }
}

export const dataVisualizer = new DataVisualizer();
