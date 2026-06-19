import { getConfig } from "../config.js";
import type { OrbitQueryResult, QueryType } from "../types.js";

const IMPORT_PATTERNS = [
  /from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /import\s+\{?\s*\w+\s*\}?\s*from\s+['"]([^'"]+)['"]/g,
];

const PYTHON_IMPORT = /(?:from\s+(\S+)\s+)?import\s+(\S+)/g;

export class GrepFallback {
  private token: string;
  private gitlabHost: string = "https://gitlab.com";

  constructor() {
    const config = getConfig();
    this.token = process.env[config.orbitTokenEnvVar] ?? "";
  }

  isAvailable(): boolean {
    return !!this.token;
  }

  private async fetchFile(projectPath: string, filePath: string, branch?: string): Promise<string | null> {
    if (!this.token) {return null;}
    try {
      const encodedProject = encodeURIComponent(projectPath);
      const encodedFile = encodeURIComponent(filePath);
      const ref = branch ? `?ref=${encodeURIComponent(branch)}` : "";
      const url = `${this.gitlabHost}/api/v4/projects/${encodedProject}/repository/files/${encodedFile}/raw${ref}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {return null;}
      return response.text();
    } catch {
      return null;
    }
  }

  private parseFileDependencies(content: string, filePath: string): string[] {
    const deps: string[] = [];
    const seen = new Set<string>();

    for (const pattern of IMPORT_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const m of matches) {
        const dep = m[1].trim();
        if (dep && !seen.has(dep) && !dep.startsWith("node:") && !dep.startsWith(".")) {
          seen.add(dep);
          deps.push(dep);
        }
      }
    }

    let m: RegExpExecArray | null;
    const pyRe = new RegExp(PYTHON_IMPORT);
    while ((m = pyRe.exec(content)) !== null) {
      const source = (m[1] || m[2]).trim();
      if (source && !seen.has(source)) {
        seen.add(source);
        deps.push(source);
      }
    }

    return deps;
  }

  async neighborsFile(projectPath: string, changedFile: string, branch?: string): Promise<OrbitQueryResult> {
    const content = await this.fetchFile(projectPath, changedFile, branch);
    if (!content) {
      return {
        result: { format_version: "1.0", query_type: "neighbors", nodes: [], edges: [] },
        query_type: "neighbors",
        raw_query_strings: null,
        row_count: 0,
      };
    }

    const deps = this.parseFileDependencies(content, changedFile);
    const nodes: Array<Record<string, unknown>> = [];
    const edges: Array<Record<string, unknown>> = [];

    nodes.push({
      id: `file:${changedFile}`,
      type: "File",
      name: changedFile.split("/").pop() || changedFile,
      path: changedFile,
    });

    for (const dep of deps) {
      const depId = `pkg:${dep}`;
      nodes.push({
        id: depId,
        type: "Definition",
        name: dep,
        path: dep,
      });
      edges.push({
        from_id: `file:${changedFile}`,
        to_id: depId,
        type: "IMPORTS",
      });
    }

    return {
      result: { format_version: "1.0", query_type: "neighbors", nodes, edges },
      query_type: "neighbors",
      raw_query_strings: null,
      row_count: nodes.length,
    };
  }

  async pathFindingFiles(projectPath: string, changedFiles: string[], branch?: string): Promise<OrbitQueryResult> {
    const nodes: Array<Record<string, unknown>> = [];
    const edges: Array<Record<string, unknown>> = [];
    const fileContents: Array<{ path: string; content: string }> = [];

    for (const file of changedFiles.slice(0, 10)) {
      const content = await this.fetchFile(projectPath, file, branch);
      if (content) {
        fileContents.push({ path: file, content });
      }
    }

    for (const fc of fileContents) {
      nodes.push({
        id: `file:${fc.path}`,
        type: "File",
        name: fc.path.split("/").pop() || fc.path,
        path: fc.path,
      });

      const deps = this.parseFileDependencies(fc.content, fc.path);
      for (const dep of deps) {
        const depId = `dep:${dep}`;
        if (!nodes.find(n => n.id === depId)) {
          nodes.push({
            id: depId,
            type: "Definition",
            name: dep,
            path: dep,
          });
        }
        edges.push({
          from_id: `file:${fc.path}`,
          to_id: depId,
          type: "IMPORTS",
        });
      }

      edges.push({
        from_id: `file:${fc.path}`,
        to_id: "pipeline:deploy",
        type: "DEPLOYS_TO",
      });
    }

    if (nodes.length > 0) {
      nodes.push({
        id: "pipeline:deploy",
        type: "Pipeline",
        name: "deploy",
        status: "unknown",
      });
      nodes.push({
        id: "target:production",
        type: "Deployment",
        name: "Production",
        environment: "production",
      });
      edges.push({
        from_id: "pipeline:deploy",
        to_id: "target:production",
        type: "DEPLOYS_TO",
      });
    }

    return {
      result: { format_version: "1.0", query_type: "path_finding", nodes, edges },
      query_type: "path_finding",
      raw_query_strings: null,
      row_count: nodes.length,
    };
  }

  async traversalFiles(projectPath: string, changedFiles: string[], branch?: string): Promise<OrbitQueryResult> {
    const nodes: Array<Record<string, unknown>> = [];
    const edges: Array<Record<string, unknown>> = [];

    for (const file of changedFiles.slice(0, 10)) {
      nodes.push({
        id: `file:${file}`,
        type: "File",
        name: file.split("/").pop() || file,
        path: file,
      });
    }

    return {
      result: { format_version: "1.0", query_type: "traversal", nodes, edges },
      query_type: "traversal",
      raw_query_strings: null,
      row_count: nodes.length,
    };
  }

  emptyResult(queryType: QueryType): OrbitQueryResult {
    return {
      result: { format_version: "1.0", query_type: queryType, nodes: [], edges: [] },
      query_type: queryType,
      raw_query_strings: null,
      row_count: 0,
    };
  }
}

export const grepFallback = new GrepFallback();
