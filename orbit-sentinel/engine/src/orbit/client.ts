import { getConfig } from "../config.js";
import type {
  OrbitQuery,
  OrbitQueryEnvelope,
  OrbitQueryResult,
  QueryType,
  ResponseFormat,
  OrbitNodeSelector,
  OrbitRelationship,
  OrbitAggregation,
  OrbitGroupBy,
  OrbitPathConfig,
  OrbitNeighborsConfig,
} from "../types.js";

export class OrbitClient {
  private endpoint: string;
  private token: string;

  constructor() {
    const config = getConfig();
    this.endpoint = config.orbitApiEndpoint;
    this.token = process.env[config.orbitTokenEnvVar] ?? "";
  }

  private async executeQuery<T = OrbitQueryResult>(
    query: OrbitQuery,
    format: ResponseFormat = "raw",
  ): Promise<T> {
    const envelope: OrbitQueryEnvelope = { query, response_format: format };

    const response = await fetch(`${this.endpoint}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(envelope),
    });

    if (!response.ok) {
      throw new Error(`Orbit API error: ${response.status} ${response.statusText}`);
    }

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
    const response = await fetch(`${this.endpoint}/schema${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async getStatus(): Promise<unknown> {
    const response = await fetch(`${this.endpoint}/status`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }
}

export const orbitClient = new OrbitClient();
