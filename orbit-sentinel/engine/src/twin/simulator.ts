import type {
  DigitalTwin,
  ChangeSimulation,
  DigitalTwinNode,
  FailurePrediction,
} from "../types.js";
import { RiskEngine } from "../risk/engine.js";

export class ChangeSimulator {
  private riskEngine: RiskEngine;

  constructor() {
    this.riskEngine = new RiskEngine();
  }

  simulate(
    twin: DigitalTwin,
    changeDescription: string,
    changeScope: string[],
  ): ChangeSimulation {
    const blastFiles = this.computeBlastFiles(twin, changeScope);
    const blastServices = this.computeBlastServices(twin, blastFiles);
    const blastDeployments = this.computeBlastDeployments(twin);
    const blastPipelines = this.computeBlastPipelines(twin);

    const failurePredictions = this.predictFailures(twin, blastFiles, blastServices);
    const riskScore = this.riskEngine.computeAggregateRisk(
      twin,
      failurePredictions,
      blastFiles.length,
      blastServices.length,
    );
    const riskLevel = this.riskEngine.classifyRiskLevel(riskScore);

    return {
      changeDescription,
      changeScope,
      blastRadius: {
        files: blastFiles,
        services: blastServices,
        deployments: blastDeployments,
        pipelines: blastPipelines,
      },
      failurePredictions,
      riskScore,
      riskLevel,
    };
  }

  private computeBlastFiles(twin: DigitalTwin, changeScope: string[]): DigitalTwinNode[] {
    const changedSet = new Set(changeScope);
    const affectedFiles: DigitalTwinNode[] = [];
    const visited = new Set<string>();

    for (const filePath of changeScope) {
      for (const edge of twin.edges) {
        if (edge.type === "DEPENDS_ON") {
          const sourceNode = twin.nodes.find((n) => n.id === edge.source);
          if (sourceNode && changedSet.has(sourceNode.label) && !visited.has(edge.target)) {
            visited.add(edge.target);
            const targetNode = twin.nodes.find((n) => n.id === edge.target);
            if (targetNode && targetNode.type === "File") {
              affectedFiles.push(targetNode);
            }
          }
        }
      }
    }

    return affectedFiles;
  }

  private computeBlastServices(
    twin: DigitalTwin,
    affectedFiles: DigitalTwinNode[],
  ): DigitalTwinNode[] {
    const fileIds = new Set(affectedFiles.map((f) => f.id));
    const affectedServices: DigitalTwinNode[] = [];
    const visited = new Set<string>();

    for (const edge of twin.edges) {
      if (edge.type === "CONTAINS" || edge.type === "DEPENDS_ON") {
        if (fileIds.has(edge.source) && !visited.has(edge.target)) {
          visited.add(edge.target);
          const targetNode = twin.nodes.find((n) => n.id === edge.target);
          if (targetNode && (targetNode.type === "Service" || targetNode.type === "Project")) {
            affectedServices.push(targetNode);
          }
        }
      }
    }

    return affectedServices;
  }

  private computeBlastDeployments(twin: DigitalTwin): DigitalTwinNode[] {
    return twin.nodes.filter((n) => n.type === "Deployment");
  }

  private computeBlastPipelines(twin: DigitalTwin): DigitalTwinNode[] {
    const pipelineNodes = twin.nodes.filter((n) => n.type === "Pipeline");
    return pipelineNodes.filter((n) => {
      const status = n.properties?.status as string | undefined;
      return status === "failed" || status === "running" || status === "pending" || !status;
    });
  }

  private predictFailures(
    twin: DigitalTwin,
    affectedFiles: DigitalTwinNode[],
    affectedServices: DigitalTwinNode[],
  ): FailurePrediction[] {
    const predictions: FailurePrediction[] = [];

    for (const service of affectedServices) {
      const pipelineCount = twin.nodes.filter(
        (n) => n.type === "Pipeline" && n.properties?.failed_pipeline_count,
      ).length;

      if (pipelineCount > 0) {
        predictions.push({
          mode: "pipeline_failure",
          probability: Math.min(0.9, pipelineCount * 0.15),
          severity: pipelineCount > 3 ? "high" : "medium",
          affectedComponent: service.label,
          description: `Service ${service.label} has ${pipelineCount} recent pipeline failures. Changes may trigger additional failures.`,
        });
      }

      predictions.push({
        mode: "downstream_breakage",
        probability: 0.35 + affectedFiles.length * 0.05,
        severity: affectedFiles.length > 5 ? "critical" : affectedFiles.length > 3 ? "high" : "medium",
        affectedComponent: service.label,
        description: `${affectedFiles.length} files depend on this change through ${service.label}. Downstream breakage possible.`,
      });
    }

    for (const file of affectedFiles.slice(0, 3)) {
      const incidentCount = twin.nodes.filter(
        (n) => n.type === "Incident" && n.id === file.id,
      ).length;

      if (incidentCount > 0) {
        predictions.push({
          mode: "historical_incident_recurrence",
          probability: 0.4 + incidentCount * 0.15,
          severity: "high",
          affectedComponent: file.label,
          description: `This file was involved in ${incidentCount} past incidents. Similar changes carry elevated risk.`,
        });
      }
    }

    if (twin.nodes.filter((n) => n.type === "MergeRequest").length > 3) {
      predictions.push({
        mode: "merge_conflict",
        probability: 0.25,
        severity: "medium",
        affectedComponent: "merge_request",
        description: "Multiple open MRs touch overlapping files. Merge conflict risk is elevated.",
      });
    }

    return predictions;
  }
}

export const simulator = new ChangeSimulator();
