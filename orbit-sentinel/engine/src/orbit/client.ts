import { getConfig } from "../config.js";
import { ErrorHandler, OrbitSentinelError, ErrorType } from "../errors.js";
import { MRValidator } from "../validators.js";
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
const ERROR_HANDLER = ErrorHandler.getInstance();

export class OrbitClient {
  private endpoint: string;
  private token: string;
  private errorHandler: ErrorHandler;

  constructor() {
    const config = getConfig();
    this.endpoint = config.orbitApiEndpoint;
    this.token = process.env[config.orbitTokenEnvVar] ?? "";
    this.errorHandler = ERROR_HANDLER;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const opts = { ...options, signal: controller.signal };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, opts);
        if (response.ok) return response;

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 
                           (response.statusText.match(/retry after (\d+)/)?.[1] || '60');
          throw new OrbitSentinelError(
            `Rate limit exceeded. Retry after ${retryAfter} seconds`,
            ErrorType.RATE_LIMIT,
            429,
            parseInt(retryAfter)
          );
        }

        // Handle authentication errors
        if (response.status === 401) {
          throw new OrbitSentinelError(
            'Authentication failed. Please check your GitLab token.',
            ErrorType.AUTHENTICATION_ERROR,
            401
          );
        }

        // Handle quota exceeded
        if (response.status === 403 && response.headers.get('X-Quota-Exceeded')) {
          throw new OrbitSentinelError(
            'API quota exceeded. Please try again later.',
            ErrorType.QUOTA_EXCEEDED,
            403
          );
        }

        if (attempt === retries) {
          const body = await response.text().catch(() => '(no body)');
          const preview = body.length > 200 ? body.slice(0, 200) + '...' : body;
          throw new OrbitSentinelError(
            `Orbit API error: ${response.status} ${response.statusText} — ${preview}`,
            ErrorType.ORBIT_API_ERROR,
            response.status
          );
        }

        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      } catch (err) {
        clearTimeout(timeoutId);
        
        // Re-throw OrbitSentinelError as-is
        if (err instanceof OrbitSentinelError) {
          throw err;
        }

        if (attempt === retries) {
          if (err instanceof Error && err.name === "AbortError") {
            throw new OrbitSentinelError(
              "Orbit API timeout after 15s",
              ErrorType.NETWORK_ERROR
            );
          }
          const fe = this.errorHandler.handleError(err, 'fetchWithRetry');
          throw new Error(fe.message);
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
    try {
      const envelope: OrbitQueryEnvelope = { query, format };
      const response = await this.fetchWithRetry(`${this.endpoint}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(envelope),
      });
      return response.json() as Promise<T>;
    } catch (error) {
      const sentinelErr = this.errorHandler.handleError(error, 'executeQuery');
      throw new Error(sentinelErr.message);
    }
  }

  async traversal(
    node: OrbitNodeSelector,
    nodes?: OrbitNodeSelector[],
    relationships?: OrbitRelationship[],
    limit = 100,
  ): Promise<OrbitQueryResult> {
    try {
      const query: OrbitQuery = {
        query_type: "traversal",
        ...(nodes ? { nodes: [node, ...nodes] } : { node }),
        ...(relationships ? { relationships } : {}),
        limit,
      };
      return await this.executeQuery(query);
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'traversal');
      throw new Error(se.message);
    }
  }

  async aggregation(
    nodes: OrbitNodeSelector[],
    relationships: OrbitRelationship[],
    aggregations: OrbitAggregation[],
    groupBy?: OrbitGroupBy[],
    limit = 50,
  ): Promise<OrbitQueryResult> {
    try {
      const query: OrbitQuery = {
        query_type: "aggregation",
        nodes,
        relationships,
        aggregations,
        ...(groupBy ? { group_by: groupBy } : {}),
        limit,
      };
      return await this.executeQuery(query);
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'aggregation');
      throw new Error(se.message);
    }
  }

  async pathFinding(
    nodes: OrbitNodeSelector[],
    path: OrbitPathConfig,
    relationships?: OrbitRelationship[],
    limit = 50,
  ): Promise<OrbitQueryResult> {
    try {
      const query: OrbitQuery = {
        query_type: "path_finding",
        nodes,
        path,
        ...(relationships ? { relationships } : {}),
        limit,
      };
      return await this.executeQuery(query);
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'pathFinding');
      throw new Error(se.message);
    }
  }

  async pathFindingInline(
    from: OrbitNodeSelector,
    to: OrbitNodeSelector,
    maxPathLength: number,
    relTypes?: string[],
    limit?: number,
  ): Promise<OrbitQueryResult> {
    try {
      const query: Record<string, unknown> = {
        query_type: "path_finding",
        from,
        to,
        max_path_length: maxPathLength,
        ...(relTypes ? { rel_types: relTypes } : {}),
        ...(limit ? { limit } : {}),
      };
      return await this.executeQuery(query as unknown as OrbitQuery);
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'pathFinding');
      throw new Error(se.message);
    }
  }

  async neighbors(
    node: OrbitNodeSelector,
    neighborsConfig: Omit<OrbitNeighborsConfig, 'node'>,
    limit = 100,
  ): Promise<OrbitQueryResult> {
    try {
      const query: OrbitQuery = {
        query_type: "neighbors",
        node,
        neighbors: { node: node.id!, ...neighborsConfig },
        limit,
      };
      return await this.executeQuery(query);
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'neighbors');
      throw new Error(se.message);
    }
  }

  async getSchema(nodeTypes?: string[]): Promise<unknown> {
    try {
      const params = nodeTypes?.length ? `?expand=${nodeTypes.join(",")}` : "";
      const response = await this.fetchWithRetry(`${this.endpoint}/schema${params}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.json();
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'getSchema');
      throw new Error(se.message);
    }
  }

  async getStatus(): Promise<unknown> {
    try {
      const response = await this.fetchWithRetry(`${this.endpoint}/status`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.json();
    } catch (error) {
      const se = this.errorHandler.handleError(error, 'getStatus');
      throw new Error(se.message);
    }
  }

  async safeQuery<T = OrbitQueryResult>(
    query: OrbitQuery,
    maxRetries = MAX_RETRIES,
    format: ResponseFormat = "raw"
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.executeQuery<T>(query, format);
      } catch (error) {
        const sentinelErr = error instanceof Error ? error : this.errorHandler.handleError(error, 'safeQuery');
        const msg = typeof sentinelErr === 'object' && 'message' in sentinelErr ? (sentinelErr as any).message : String(sentinelErr);
        
        // If it's a rate limit error, wait before retrying
        if ('type' in sentinelErr && sentinelErr.type === ErrorType.RATE_LIMIT && 'retryAfter' in sentinelErr) {
          const retryAfter = (sentinelErr as any).retryAfter;
          if (retryAfter) {
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }
        }
        
        // If it's a service unavailable error, wait longer
        if (msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('503')) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors, rethrow
        throw new Error(msg);
      }
    }
    throw new OrbitSentinelError(
      `Query failed after ${maxRetries} attempts`,
      ErrorType.ORBIT_API_ERROR
    );
  }
}

export const orbitClient = new OrbitClient();
