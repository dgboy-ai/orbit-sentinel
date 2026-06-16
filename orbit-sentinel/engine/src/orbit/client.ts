import { getConfig } from "../config.js";
import type {
  OrbitQuery,
  OrbitQueryEnvelope,
  OrbitQueryResult,
  ResponseFormat,
  OrbitNodeSelector,
  OrbitRelationship,
  OrbitAggregation,
  OrbitGroupBy,
  OrbitPathConfig,
  OrbitNeighborsConfig,
} from "../types.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const TIMEOUT_MS = 15000;

export class OrbitClient {
  private endpoint: string;
  private token: string;

  constructor() {
    const config = getConfig();
    this.endpoint = config.orbitApiEndpoint;
    this.token = process.env[config.orbitTokenEnvVar] ?? "";
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const opts = { ...options, signal: controller.signal };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, opts);
        if (response.ok) return response;
        if (attempt === retries) {
          throw new Error(`Orbit API error: ${response.status} ${response.statusText}`);
        }
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt === retries) {
          if (err instanceof Error && err.name === "AbortError") {
            throw new Error("Orbit API timeout after 15s");
          }
          throw err;
        }
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    clearTimeout(timeoutId);
    throw new Error("Orbit API: all retries exhausted");
  }

  private async executeQuery<T = OrbitQueryResult>(
    query: OrbitQuery,
    format: ResponseFormat = "raw",
  ): Promise<T> {
    const envelope: OrbitQueryEnvelope = { query, response_format: format };
    const response = await this.fetchWithRetry(`${this.endpoint}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(envelope),
    });
    return response.json() as Promise<T>;
  }

  async traversal(
    node: OrbitNodeSelector,
    nodes?: OrbitNodeSelector[],
    relationships?: OrbitRelationship[],
    limit = 100,
  ): Promise<OrbitQueryResult> {
    const query: OrbitQuery = {
      query_type: "traversal",
      ...(nodes ? { nodes: [node, ...nodes] } : { node }),
      ...(relationships ? { relationships } : {}),
      limit,
    };
    return this.executeQuery(query);
  }

  async aggregation(
    nodes: OrbitNodeSelector[],
    relationships: OrbitRelationship[],
    aggregations: OrbitAggregation[],
    groupBy?: OrbitGroupBy[],
    limit = 50,
  ): Promise<OrbitQueryResult> {
    const query: OrbitQuery = {
      query_type: "aggregation",
      nodes,
      relationships,
      aggregations,
      ...(groupBy ? { group_by: groupBy } : {}),
      limit,
    };
    return this.executeQuery(query);
  }

  async pathFinding(
    nodes: OrbitNodeSelector[],
    path: OrbitPathConfig,
    relationships?: OrbitRelationship[],
    limit = 50,
  ): Promise<OrbitQueryResult> {
    const query: OrbitQuery = {
      query_type: "path_finding",
      nodes,
      path,
      ...(relationships ? { relationships } : {}),
      limit,
    };
    return this.executeQuery(query);
  }

  async neighbors(
    node: OrbitNodeSelector,
    neighborsConfig: OrbitNeighborsConfig,
    limit = 100,
  ): Promise<OrbitQueryResult> {
    const query: OrbitQuery = {
      query_type: "neighbors",
      node,
      neighbors: neighborsConfig,
      limit,
    };
    return this.executeQuery(query);
  }

  async getSchema(nodeTypes?: string[]): Promise<unknown> {
    const params = nodeTypes?.length ? `?expand=${nodeTypes.join(",")}` : "";
    const response = await this.fetchWithRetry(`${this.endpoint}/schema${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async getStatus(): Promise<unknown> {
    const response = await this.fetchWithRetry(`${this.endpoint}/status`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }
}

export const orbitClient = new OrbitClient();
