import { queryEngine } from "../orbit/queries.js";
import type {
  DigitalTwin,
  DigitalTwinNode,
  DigitalTwinEdge,
} from "../types.js";

interface BuildTwinParams {
  projectId: number;
  projectPath: string;
  changedFiles: string[];
  mrIid?: number;
  branch?: string;
}

export interface QueryTiming {
  queryType: string;
  queryName: string;
  durationMs: number;
  nodeCount: number;
  edgeCount: number;
  status: "success" | "error";
}

export class DigitalTwinBuilder {
  private timings: QueryTiming[] = [];

  getQueryTimings(): QueryTiming[] {
    return [...this.timings];
  }

  clearTimings(): void {
    this.timings = [];
  }

  // Cap changed files to avoid Orbit API rate limits (max queries: 1 + cap * 4 + 2)
  private static readonly MAX_CHANGED_FILES = 5;

  private async timedQuery<T>(
    queryType: string,
    queryName: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.timings.push({
        queryType,
        queryName,
        durationMs,
        nodeCount: 0,
        edgeCount: 0,
        status: "success",
      });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      this.timings.push({
        queryType,
        queryName,
        durationMs,
        nodeCount: 0,
        edgeCount: 0,
        status: "error",
      });
      throw err;
    }
  }

  private mergeGraph(nodes: Map<string, DigitalTwinNode>, edges: Map<string, DigitalTwinEdge>, result: { nodes?: unknown[], edges?: unknown[] }): void {
    if (!result.nodes) return;
    const edgeKey = (s: string, t: string, type: string) => `${s}|${t}|${type}`;
    for (const raw of result.nodes as Array<Record<string, unknown>>) {
      const id = String(raw.id ?? '');
      if (!id) continue;
      const type = this.mapEntityType(String(raw.type ?? ''));
      const label = String(raw.label_field ? raw[raw.label_field as string] : (raw.name ?? raw.path ?? raw.title ?? raw.username ?? raw.id));
      if (!nodes.has(id)) {
        nodes.set(id, { id, type, label, properties: {} });
      }
    }
    if (result.edges) {
      for (const raw of result.edges as Array<Record<string, unknown>>) {
        const fromId = String(raw.from_id ?? raw.source ?? '');
        const toId = String(raw.to_id ?? raw.target ?? '');
        const relType = String(raw.type ?? '');
        if (fromId && toId && relType) {
          edges.set(edgeKey(fromId, toId, relType), { source: fromId, target: toId, type: relType });
        }
      }
    }
  }

  async build(params: BuildTwinParams): Promise<DigitalTwin> {
    this.clearTimings();
    const nodes: Map<string, DigitalTwinNode> = new Map();
    const edges: Map<string, DigitalTwinEdge> = new Map();

    // Cap changed files to avoid Orbit API rate limits
    const changedFiles = params.changedFiles.slice(0, DigitalTwinBuilder.MAX_CHANGED_FILES);

    const projectSummary = await this.timedQuery("NEIGHBORS", "Project Summary", () =>
      queryEngine.getProjectSummary(params.projectId)
    );
    this.mergeGraph(nodes, edges, projectSummary.result);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (const filePath of changedFiles) {
      const blastRadiusResult = await this.timedQuery("NEIGHBORS", "Blast Radius", () =>
        queryEngine.findBlastRadius(filePath)
      );
      this.mergeGraph(nodes, edges, blastRadiusResult.result);

      const depResult = await this.timedQuery("PATH_FINDING", "Dependency Chain", () =>
        queryEngine.findDependentProjects(filePath)
      );
      this.mergeGraph(nodes, edges, depResult.result);

      const historicalResult = await this.timedQuery("TRAVERSAL", "Historical MRs", () =>
        queryEngine.findHistoricalMRs(params.projectPath, filePath)
      );
      this.mergeGraph(nodes, edges, historicalResult.result);

      const incidentResult = await this.timedQuery("TRAVERSAL", "File Incidents", () =>
        queryEngine.findIncidentsConnectedToFile(filePath)
      );
      this.mergeGraph(nodes, edges, incidentResult.result);

      // Throttle between files to avoid Orbit API rate limits
      await delay(500);
    }

    // PATH_FINDING: deployment path tracing — the 4th required Orbit query type
    const deployPathResult = await this.timedQuery("PATH_FINDING", "Deployment Path", () =>
      queryEngine.findDeploymentPath(params.projectId)
    );
    this.mergeGraph(nodes, edges, deployPathResult.result);

    const pipelineResult = await this.timedQuery("AGGREGATION", "Pipeline Failures", () =>
      queryEngine.findPipelineFailures([params.projectId])
    );
    if (pipelineResult.result.rows) {
      for (const row of pipelineResult.result.rows as Array<Record<string, unknown>>) {
        const pipelineInfo = row as { failed_pipelines?: number; p?: { id: string; type: string; properties: Record<string, unknown> } };
        if (pipelineInfo.p) {
          nodes.set(pipelineInfo.p.id, {
            id: pipelineInfo.p.id,
            type: "Project",
            label: (pipelineInfo.p.properties?.name as string) ?? "",
            properties: { ...pipelineInfo.p.properties, failedPipelineCount: pipelineInfo.failed_pipelines },
          });
        }
      }
    }
    // Also merge aggregation nodes/edges if available
    this.mergeGraph(nodes, edges, pipelineResult.result);

    const allNodes = Array.from(nodes.values());
    const allEdges = Array.from(edges.values());
    const nodeCount = allNodes.length;
    const edgeCount = allEdges.length;

    // Update timings with actual node/edge counts
    this.timings = this.timings.map(t => ({ ...t, nodeCount, edgeCount }));

    return {
      nodes: allNodes,
      edges: allEdges,
      metadata: {
        projectPath: params.projectPath,
        mrIid: params.mrIid,
        branch: params.branch,
        timestamp: new Date().toISOString(),
        queryTimings: this.getQueryTimings(),
      },
    };
  }

  private mapEntityType(entityType: string): DigitalTwinNode["type"] {
    const map: Record<string, DigitalTwinNode["type"]> = {
      Project: "Project",
      File: "File",
      Definition: "Definition",
      MergeRequest: "MergeRequest",
      Pipeline: "Pipeline",
      Deployment: "Deployment",
      Incident: "Incident",
      User: "User",
      Group: "Team",
    };
    return map[entityType] ?? "Service";
  }
}

export const twinBuilder = new DigitalTwinBuilder();
