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

export class DigitalTwinBuilder {
  async build(params: BuildTwinParams): Promise<DigitalTwin> {
    const nodes: Map<string, DigitalTwinNode> = new Map();
    const edges: Map<string, DigitalTwinEdge> = new Map();
    const edgeKey = (s: string, t: string, type: string) => `${s}|${t}|${type}`;

    const projectSummary = await queryEngine.getProjectSummary(params.projectId);
    if (projectSummary.result.rows) {
      for (const row of projectSummary.result.rows as Array<{
        p: { type: string; id: string; properties: Record<string, unknown> };
        neighbors: Array<{ type: string; id: string; properties: Record<string, unknown> }>;
      }>) {
        if (row.p) {
          nodes.set(row.p.id, {
            id: row.p.id,
            type: "Project",
            label: (row.p.properties?.name as string) ?? params.projectPath,
            properties: row.p.properties ?? {},
          });
        }
        if (row.neighbors) {
          for (const n of row.neighbors) {
            const nodeType = this.mapEntityType(n.type);
            nodes.set(n.id, {
              id: n.id,
              type: nodeType,
              label: (n.properties?.name as string) ?? n.id,
              properties: n.properties ?? {},
            });
            const key = edgeKey(row.p.id, n.id, "CONTAINS");
            edges.set(key, { source: row.p.id, target: n.id, type: "CONTAINS" });
          }
        }
      }
    }

    for (const filePath of params.changedFiles) {
      const blastRadiusResult = await queryEngine.findBlastRadius(filePath);
      if (blastRadiusResult.result.rows) {
        for (const row of blastRadiusResult.result.rows as Array<Record<string, unknown>>) {
          const centerNode = this.extractNodesFromRow(row, "center");
          if (centerNode) nodes.set(centerNode.id, centerNode);

          const neighbors = this.extractNeighborNodes(row);
          for (const n of neighbors) {
            nodes.set(n.id, n);
            if (centerNode) {
              const key = edgeKey(centerNode.id, n.id, "DEPENDS_ON");
              edges.set(key, { source: centerNode.id, target: n.id, type: "DEPENDS_ON" });
            }
          }
        }
      }

      const depResult = await queryEngine.findDependentProjects(filePath);
      if (depResult.result.rows) {
        for (const row of depResult.result.rows as Array<Record<string, unknown>>) {
          const fileNode = this.extractNodesFromRow(row, "f");
          if (fileNode) nodes.set(fileNode.id, fileNode);

          const branchNode = this.extractNodesFromRow(row, "b");
          if (branchNode) nodes.set(branchNode.id, branchNode);

          const projectNode = this.extractNodesFromRow(row, "p");
          if (projectNode) nodes.set(projectNode.id, projectNode);

          if (fileNode && branchNode) {
            const k = edgeKey(fileNode.id, branchNode.id, "ON_BRANCH");
            edges.set(k, { source: fileNode.id, target: branchNode.id, type: "ON_BRANCH" });
          }
          if (projectNode && branchNode) {
            const k = edgeKey(projectNode.id, branchNode.id, "CONTAINS");
            edges.set(k, { source: projectNode.id, target: branchNode.id, type: "CONTAINS" });
          }
        }
      }

      const historicalResult = await queryEngine.findHistoricalMRs(params.projectPath, filePath);
      if (historicalResult.result.rows) {
        for (const row of historicalResult.result.rows as Array<Record<string, unknown>>) {
          const fileNode2 = this.extractNodesFromRow(row, "f");
          if (fileNode2) nodes.set(fileNode2.id, fileNode2);

          const mrNode = this.extractNodesFromRow(row, "mr");
          if (mrNode) nodes.set(mrNode.id, mrNode);

          const projNode = this.extractNodesFromRow(row, "p");
          if (projNode) nodes.set(projNode.id, projNode);

          if (fileNode2 && mrNode) {
            const k = edgeKey(fileNode2.id, mrNode.id, "MODIFIED_IN");
            edges.set(k, { source: fileNode2.id, target: mrNode.id, type: "MODIFIED_IN" });
          }
          if (mrNode && projNode) {
            const k = edgeKey(mrNode.id, projNode.id, "IN_PROJECT");
            edges.set(k, { source: mrNode.id, target: projNode.id, type: "IN_PROJECT" });
          }
        }
      }

      const incidentResult = await queryEngine.findIncidentsConnectedToFile(filePath);
      if (incidentResult.result.rows) {
        for (const row of incidentResult.result.rows as Array<Record<string, unknown>>) {
          const incNode = this.extractNodesFromRow(row, "inc");
          if (incNode) nodes.set(incNode.id, incNode);

          const fileNode3 = this.extractNodesFromRow(row, "f");
          if (fileNode3 && incNode) {
            const k = edgeKey(fileNode3.id, incNode.id, "CAUSED_INCIDENT");
            edges.set(k, { source: fileNode3.id, target: incNode.id, type: "CAUSED_INCIDENT" });
          }
        }
      }
    }

    const pipelineResult = await queryEngine.findPipelineFailures([params.projectId]);
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

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
      metadata: {
        projectPath: params.projectPath,
        mrIid: params.mrIid,
        branch: params.branch,
        timestamp: new Date().toISOString(),
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

  private extractNodesFromRow(row: Record<string, unknown>, key: string): DigitalTwinNode | null {
    const entry = row[key] as { id: string; type: string; properties: Record<string, unknown> } | undefined;
    if (!entry?.id) return null;
    return {
      id: entry.id,
      type: this.mapEntityType(entry.type),
      label: (entry.properties?.name as string) ?? (entry.properties?.full_path as string) ?? entry.id,
      properties: entry.properties ?? {},
    };
  }

  private extractNeighborNodes(row: Record<string, unknown>): DigitalTwinNode[] {
    const nodes: DigitalTwinNode[] = [];
    const neighbors = row["neighbors"] as Array<{ id: string; type: string; properties: Record<string, unknown> }> | undefined;
    if (neighbors) {
      for (const n of neighbors) {
        nodes.push({
          id: n.id,
          type: this.mapEntityType(n.type),
          label: (n.properties?.name as string) ?? (n.properties?.full_path as string) ?? n.id,
          properties: n.properties ?? {},
        });
      }
    }
    return nodes;
  }
}

export const twinBuilder = new DigitalTwinBuilder();
