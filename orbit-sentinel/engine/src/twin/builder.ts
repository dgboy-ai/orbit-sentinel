import { queryEngine } from "../orbit/queries.js";
import { grepFallback } from "../fallback/grep-fallback.js";
import type {
  DigitalTwin,
  DigitalTwinNode,
  DigitalTwinEdge,
  OrbitQueryResult,
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
  fallback?: boolean;
}

export class DigitalTwinBuilder {
  private timings: QueryTiming[] = [];
  private orbitError = false;

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

  private async orbitOrFallback<T>(
    queryType: string,
    queryName: string,
    orbitFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<{ data: T; fromFallback: boolean; orbitReachable: boolean }> {
    try {
      const result = await orbitFn();
      const isEmpty = Array.isArray(result) ? result.length === 0 : false;
      if (isEmpty) {
        const fallbackResult = await fallbackFn();
        return { data: fallbackResult, fromFallback: true, orbitReachable: true };
      }
      return { data: result, fromFallback: false, orbitReachable: true };
    } catch {
      this.orbitError = true;
      const fallbackResult = await fallbackFn();
      return { data: fallbackResult, fromFallback: true, orbitReachable: false };
    }
  }

  private mergeGraph(nodes: Map<string, DigitalTwinNode>, edges: Map<string, DigitalTwinEdge>, result: { nodes?: unknown[], edges?: unknown[] }): void {
    if (!result.nodes) {return;}
    const edgeKey = (s: string, t: string, type: string) => `${s}|${t}|${type}`;
    for (const raw of result.nodes as Array<Record<string, unknown>>) {
      const id = String(raw.id ?? '');
      if (!id) {continue;}
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
    this.orbitError = false;
    const nodes: Map<string, DigitalTwinNode> = new Map();
    const edges: Map<string, DigitalTwinEdge> = new Map();

    // Cap changed files to avoid Orbit API rate limits
    const changedFiles = params.changedFiles.slice(0, DigitalTwinBuilder.MAX_CHANGED_FILES);

    // Project Summary (NEIGHBORS)
    const projSum = await this.orbitOrFallback(
      "NEIGHBORS", "Project Summary",
      () => this.timedQuery("NEIGHBORS", "Project Summary (Orbit)", () =>
        queryEngine.getProjectSummary(params.projectId)),
      () => this.timedQuery("NEIGHBORS", "Project Summary (Fallback)", async () =>
        grepFallback.emptyResult("neighbors")),
    );
    this.mergeGraph(nodes, edges, (projSum.data as OrbitQueryResult).result);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (const filePath of changedFiles) {
      // Blast Radius (NEIGHBORS) with grep fallback
      const blast = await this.orbitOrFallback(
        "NEIGHBORS", "Blast Radius",
        () => this.timedQuery("NEIGHBORS", "Blast Radius (Orbit)", () =>
          queryEngine.findBlastRadius(filePath)),
        () => this.timedQuery("NEIGHBORS", "Blast Radius (Fallback)", () =>
          grepFallback.neighborsFile(params.projectPath, filePath, params.branch)),
      );
      this.mergeGraph(nodes, edges, (blast.data as OrbitQueryResult).result);

      // Dependency Chain (PATH_FINDING) with grep fallback
      const dep = await this.orbitOrFallback(
        "PATH_FINDING", "Dependency Chain",
        () => this.timedQuery("PATH_FINDING", "Dependency Chain (Orbit)", () =>
          queryEngine.findDependentProjects(filePath)),
        () => this.timedQuery("PATH_FINDING", "Dependency Chain (Fallback)", () =>
          grepFallback.pathFindingFiles(params.projectPath, [filePath], params.branch)),
      );
      this.mergeGraph(nodes, edges, (dep.data as OrbitQueryResult).result);

      // Historical MRs (TRAVERSAL) with grep fallback
      const hist = await this.orbitOrFallback(
        "TRAVERSAL", "Historical MRs",
        () => this.timedQuery("TRAVERSAL", "Historical MRs (Orbit)", () =>
          queryEngine.findHistoricalMRs(params.projectPath, filePath)),
        () => this.timedQuery("TRAVERSAL", "Historical MRs (Fallback)", () =>
          grepFallback.traversalFiles(params.projectPath, [filePath], params.branch)),
      );
      this.mergeGraph(nodes, edges, (hist.data as OrbitQueryResult).result);

      // File Incidents (TRAVERSAL) with grep fallback
      const inc = await this.orbitOrFallback(
        "TRAVERSAL", "File Incidents",
        () => this.timedQuery("TRAVERSAL", "File Incidents (Orbit)", () =>
          queryEngine.findIncidentsConnectedToFile(filePath)),
        () => this.timedQuery("TRAVERSAL", "File Incidents (Fallback)", () =>
          grepFallback.traversalFiles(params.projectPath, [filePath], params.branch)),
      );
      this.mergeGraph(nodes, edges, (inc.data as OrbitQueryResult).result);

      // Security Findings (TRAVERSAL) - query for vulnerabilities/findings on changed files
      const sec = await this.orbitOrFallback(
        "TRAVERSAL", "Security Findings",
        () => this.timedQuery("TRAVERSAL", "Security Findings (Orbit)", () =>
          queryEngine.findSecurityFindings(filePath)),
        () => this.timedQuery("TRAVERSAL", "Security Findings (Fallback)", async () =>
          grepFallback.emptyResult("traversal")),
      );
      this.mergeGraph(nodes, edges, (sec.data as OrbitQueryResult).result);

      await delay(500);
    }

    // Deployment Path (PATH_FINDING) with grep fallback
    const deploy = await this.orbitOrFallback(
      "PATH_FINDING", "Deployment Path",
      () => this.timedQuery("PATH_FINDING", "Deployment Path (Orbit)", () =>
        queryEngine.findDeploymentPath(params.projectId)),
      () => this.timedQuery("PATH_FINDING", "Deployment Path (Fallback)", () =>
        grepFallback.pathFindingFiles(params.projectPath, changedFiles, params.branch)),
    );
    this.mergeGraph(nodes, edges, (deploy.data as OrbitQueryResult).result);

    // Pipeline Failures (AGGREGATION) with fallback
    const pipe = await this.orbitOrFallback(
      "AGGREGATION", "Pipeline Failures",
      () => this.timedQuery("AGGREGATION", "Pipeline Failures (Orbit)", () =>
        queryEngine.findPipelineFailures([params.projectId])),
      () => this.timedQuery("AGGREGATION", "Pipeline Failures (Fallback)", async () =>
        grepFallback.emptyResult("aggregation")),
    );
    const pipelineResult = pipe.data as OrbitQueryResult;
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
    this.mergeGraph(nodes, edges, pipelineResult.result);

    const allNodes = Array.from(nodes.values());
    const allEdges = Array.from(edges.values());
    const nodeCount = allNodes.length;
    const edgeCount = allEdges.length;

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
        fallback: this.orbitError || undefined,
      } as DigitalTwin["metadata"] & { fallback?: boolean },
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
