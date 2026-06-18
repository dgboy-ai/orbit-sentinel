import { orbitClient } from "./client.js";
import type { OrbitQueryResult } from "../types.js";

export class OrbitQueryEngine {
  async findImportedFiles(importPath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal({
      id: "sym",
      entity: "ImportedSymbol",
      columns: ["file_path", "import_path", "identifier_name"],
      filters: { import_path: { op: "contains", value: importPath } },
    }, undefined, undefined, 100);
  }

  async findDependentProjects(projectPath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "contains", value: projectPath } } },
      [
        { id: "b", entity: "Branch", columns: ["name", "is_default"] },
        { id: "p", entity: "Project", columns: ["name", "full_path"] },
      ],
      [
        { type: "ON_BRANCH", from: "f", to: "b" },
        { type: "CONTAINS", from: "p", to: "b" },
      ],
      100,
    );
  }

  async findBlastRadius(changedFilePath: string): Promise<OrbitQueryResult> {
    return orbitClient.neighbors(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: changedFilePath } } },
      { direction: "both" },
      100,
    );
  }

  async findHistoricalMRs(projectPath: string, filePath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: filePath } } },
      [
        { id: "mr", entity: "MergeRequest", columns: ["iid", "title", "state", "created_at"] },
        { id: "p", entity: "Project", columns: ["full_path"] },
      ],
      [
        { type: "MODIFIED_IN", from: "f", to: "mr" },
        { type: "IN_PROJECT", from: "mr", to: "p" },
      ],
      50,
    );
  }

  async findPipelineFailures(projectIds: number[]): Promise<OrbitQueryResult> {
    return orbitClient.aggregation(
      [
        { id: "pl", entity: "Pipeline", filters: { status: "failed" } },
        { id: "p", entity: "Project", columns: ["name", "full_path"], node_ids: projectIds },
      ],
      [{ type: "IN_PROJECT", from: "pl", to: "p" }],
      [{ function: "count", target: "pl", alias: "failed_pipelines" }],
      [{ kind: "node", node: "p" }],
      50,
    );
  }

  async findDeploymentPath(projectId: number): Promise<OrbitQueryResult> {
    return orbitClient.pathFinding(
      { id: "mr", entity: "MergeRequest" },
      { id: "dep", entity: "Deployment", columns: ["iid", "status", "environment_id"] },
      4,
      undefined,
      20,
    );
  }

  async findTeamOwnership(filePath: string): Promise<OrbitQueryResult> {
    return orbitClient.neighbors(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: filePath } } },
      { direction: "outgoing", node_types: ["User", "Group"] },
      50,
    );
  }

  async findDependencyChain(fromFile: string, toFile: string): Promise<OrbitQueryResult> {
    return orbitClient.pathFinding(
      { id: "f1", entity: "File", filters: { path: { op: "ends_with", value: fromFile } } },
      { id: "f2", entity: "File", filters: { path: { op: "ends_with", value: toFile } } },
      4,
      [{ type: "IMPORTS", from: "f1", to: "f2" }],
      20,
    );
  }

  async countOpenMRsByProject(): Promise<OrbitQueryResult> {
    return orbitClient.aggregation(
      [
        { id: "p", entity: "Project", columns: ["name", "full_path"] },
        { id: "mr", entity: "MergeRequest", filters: { state: "opened" } },
      ],
      [{ type: "IN_PROJECT", from: "mr", to: "p" }],
      [{ function: "count", target: "mr", alias: "open_mrs" }],
      [{ kind: "node", node: "p" }],
      20,
    );
  }

  async findIncidentsConnectedToFile(filePath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: filePath } } },
      [
        { id: "inc", entity: "Incident", columns: ["iid", "title", "severity"] },
      ],
      [{ type: "CAUSED_INCIDENT", from: "f", to: "inc" }],
      20,
    );
  }

  async findMRsByAuthor(authorUsername: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "u", entity: "User", filters: { username: authorUsername } },
      [
        { id: "mr", entity: "MergeRequest", columns: ["iid", "title", "state", "created_at"] },
      ],
      [{ type: "AUTHORED_BY", from: "mr", to: "u" }],
      50,
    );
  }

  async findSimilarChanges(definitionFqn: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "def", entity: "Definition", filters: { fqn: definitionFqn } },
      [
        { id: "mr", entity: "MergeRequest", columns: ["iid", "title", "state", "created_at"] },
      ],
      [{ type: "MODIFIED_IN", from: "def", to: "mr" }],
      20,
    );
  }

  async getProjectSummary(projectId: number): Promise<OrbitQueryResult> {
    return orbitClient.neighbors(
      { id: "p", entity: "Project", node_ids: [projectId], columns: ["name", "full_path", "star_count", "visibility"] },
      { direction: "outgoing" },
      100,
    );
  }
}

export const queryEngine = new OrbitQueryEngine();
