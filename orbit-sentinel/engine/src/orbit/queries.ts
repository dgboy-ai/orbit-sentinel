import { orbitClient } from "./client.js";
import type { OrbitQueryResult } from "../types.js";

export class OrbitQueryEngine {
  async findImportedFiles(importPath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal({
      id: "sym",
      entity: "ImportedSymbol",
      filters: { import_path: { op: "contains", value: importPath } },
    }, undefined, undefined, 100);
  }

  async findDependentProjects(projectPath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "contains", value: projectPath } } },
      [
        { id: "b", entity: "Branch" },
        { id: "p", entity: "Project" },
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
      { id: "p", entity: "Project", filters: { full_path: projectPath } },
      [
        { id: "mr", entity: "MergeRequest" },
      ],
      [
        { type: "IN_PROJECT", from: "mr", to: "p" },
      ],
      50,
    );
  }

  async findPipelineFailures(projectIds: number[]): Promise<OrbitQueryResult> {
    return orbitClient.aggregation(
      [
        { id: "pl", entity: "Pipeline", filters: { status: "failed" } },
        { id: "p", entity: "Project", node_ids: projectIds },
      ],
      [{ type: "IN_PROJECT", from: "pl", to: "p" }],
      [{ function: "count", target: "pl", alias: "failed_pipelines" }],
      [{ kind: "node", node: "p" }],
      50,
    );
  }

  async findDeploymentPath(projectId: number): Promise<OrbitQueryResult> {
    return orbitClient.pathFinding(
      [
        { id: "f1", entity: "File", filters: { path: { op: "ends_with", value: ".ts" } } },
        { id: "f2", entity: "File", filters: { path: { op: "ends_with", value: ".tsx" } } },
      ],
      { type: "shortest", from: "f1", to: "f2", max_depth: 2, rel_types: ["IMPORTS", "CALLS", "EXTENDS"] },
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
      [
        { id: "f1", entity: "File", filters: { path: { op: "ends_with", value: fromFile } } },
        { id: "f2", entity: "File", filters: { path: { op: "ends_with", value: toFile } } },
      ],
      { type: "all", from: "f1", to: "f2", max_depth: 3, rel_types: ["IMPORTS", "CALLS", "DEFINES", "EXTENDS"] },
      [{ type: "IMPORTS", from: "f1", to: "f2" }],
      20,
    );
  }

  async countOpenMRsByProject(): Promise<OrbitQueryResult> {
    return orbitClient.aggregation(
      [
        { id: "p", entity: "Project" },
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
      undefined,
      undefined,
      20,
    );
  }

  async findSecurityFindings(filePath: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: filePath } } },
      [
        { id: "vuln", entity: "Vulnerability" },
        { id: "finding", entity: "SecurityFinding" },
      ],
      [
        { type: "HAS_VULNERABILITY", from: "f", to: "vuln" },
        { type: "HAS_FINDING", from: "f", to: "finding" },
      ],
      50,
    );
  }

  async findVulnerabilitiesForFiles(filePaths: string[]): Promise<OrbitQueryResult> {
    const fileNodes = filePaths.map((fp, i) => ({
      id: `f${i}`,
      entity: "File",
      filters: { path: { op: "ends_with", value: fp } },
    }));
    return orbitClient.traversal(
      fileNodes.length === 1 ? fileNodes[0] : { id: "files", entity: "File" },
      fileNodes.length > 1 ? fileNodes.slice(1) : undefined,
      undefined,
      100,
    );
  }

  async findMRsByAuthor(authorUsername: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "u", entity: "User", filters: { username: authorUsername } },
      [
        { id: "mr", entity: "MergeRequest" },
      ],
      [{ type: "AUTHORED", from: "u", to: "mr" }],
      50,
    );
  }

  async findSimilarChanges(definitionFqn: string): Promise<OrbitQueryResult> {
    return orbitClient.traversal(
      { id: "def", entity: "Definition", filters: { fqn: definitionFqn } },
      [
        { id: "mr", entity: "MergeRequest" },
      ],
      [{ type: "HAS_LATEST_DIFF", from: "def", to: "mr" }],
      20,
    );
  }

  async getProjectSummary(projectId: number): Promise<OrbitQueryResult> {
    return orbitClient.neighbors(
      { id: "p", entity: "Project", node_ids: [projectId] },
      { direction: "outgoing" },
      100,
    );
  }
}

export const queryEngine = new OrbitQueryEngine();
