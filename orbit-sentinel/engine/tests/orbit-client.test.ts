import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Access ErrorHandler internals for singleton reset
let ErrorHandlerClass: { getInstance: () => { rateLimitResetTimes: Map<string, number>; errorCounts: Map<string, number> } };

async function importOrbitClient() {
  const mod = await import("../src/orbit/client.js");
  ErrorHandlerClass = (await import("../src/errors.js")).ErrorHandler;
  return new mod.OrbitClient();
}

describe("OrbitClient", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    process.env.GITLAB_ACCESS_TOKEN = "glpat-test-token";
    // Reset ErrorHandler singleton state between tests
    const eh = await import("../src/errors.js");
    const handler = eh.ErrorHandler.getInstance();
    (handler as any).rateLimitResetTimes = new Map();
    (handler as any).errorCounts = new Map();
  });

  afterEach(() => {
    delete process.env.GITLAB_ACCESS_TOKEN;
  });

  describe("traversal", () => {
    it("sends correct traversal query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { nodes: [], edges: [] }, row_count: 0 }),
      });

      const client = await importOrbitClient();
      await client.traversal(
        { id: "f", entity: "File", filters: { path: { op: "ends_with", value: "test.ts" } } },
        [{ id: "mr", entity: "MergeRequest" }],
        [{ type: "MODIFIED_IN", from: "f", to: "mr" }],
        50
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.query.query_type).toBe("traversal");
      expect(callArgs.query.nodes).toHaveLength(2);
      expect(callArgs.query.relationships).toHaveLength(1);
      expect(callArgs.query.limit).toBe(50);
    });

    it("handles empty results gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { nodes: [], edges: [] }, row_count: 0 }),
      });

      const client = await importOrbitClient();
      const result = await client.traversal({ id: "f", entity: "File" });
      expect(result.row_count).toBe(0);
      expect(result.result.nodes).toEqual([]);
    });

    it("sets auth header from env var", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok" }),
      });

      const client = await importOrbitClient();
      await client.getStatus();
      expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer glpat-test-token");
    });
  });

  describe("neighbors", () => {
    it("sends correct neighbors query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { nodes: [], edges: [] }, row_count: 0 }),
      });

      const client = await importOrbitClient();
      await client.neighbors(
        { id: "f", entity: "File" },
        { direction: "both", max_depth: 3 },
        100
      );

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.query.query_type).toBe("neighbors");
      expect(callArgs.query.neighbors.direction).toBe("both");
      expect(callArgs.query.neighbors.max_depth).toBe(3);
    });
  });

  describe("pathFinding", () => {
    it("sends correct path_finding query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { nodes: [], edges: [] }, row_count: 0 }),
      });

      const client = await importOrbitClient();
      await client.pathFinding(
        { id: "mr", entity: "MergeRequest" },
        { id: "dep", entity: "Deployment" },
        4,
        undefined,
        20
      );

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.query.query_type).toBe("path_finding");
      expect(callArgs.query.from.id).toBe("mr");
      expect(callArgs.query.to.id).toBe("dep");
      expect(callArgs.query.max_path_length).toBe(4);
    });
  });

  describe("aggregation", () => {
    it("sends correct aggregation query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { nodes: [], edges: [], rows: [] }, row_count: 0 }),
      });

      const client = await importOrbitClient();
      await client.aggregation(
        [
          { id: "pl", entity: "Pipeline", filters: { status: "failed" } },
          { id: "p", entity: "Project" },
        ],
        [{ type: "IN_PROJECT", from: "pl", to: "p" }],
        [{ function: "count", target: "pl", alias: "failed_count" }],
        [{ kind: "node", node: "p" }],
        50
      );

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.query.query_type).toBe("aggregation");
      expect(callArgs.query.aggregations).toHaveLength(1);
      expect(callArgs.query.aggregations[0].function).toBe("count");
      expect(callArgs.query.group_by).toHaveLength(1);
    });
  });

  describe("getSchema", () => {
    it("calls schema endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ node_types: ["File", "MergeRequest", "Project"] }),
      });

      const client = await importOrbitClient();
      const schema = await client.getSchema();
      expect(schema.node_types).toContain("File");
    });

    it("appends expand param when nodeTypes provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ node_types: [] }),
      });

      const client = await importOrbitClient();
      await client.getSchema(["File", "MergeRequest"]);

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("?expand=File,MergeRequest");
    });
  });

  describe("error handling", () => {
    it("throws on 401 auth error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized" });

      const client = await importOrbitClient();
      await expect(client.getSchema()).rejects.toThrow("Authentication failed");
    });

    it("throws on 429 rate limit", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Map([["Retry-After", "30"]]),
      });

      const client = await importOrbitClient();
      // ErrorHandler wraps the original rate limit error and re-throws
      await expect(client.getSchema()).rejects.toThrow("Too many requests");
    });

    it("throws on network timeout", async () => {
      mockFetch.mockRejectedValue(new DOMException("The operation was aborted", "AbortError"));

      const client = await importOrbitClient();
      // After exhausting retries, the AbortError becomes an OrbitSentinelError
      await expect(client.getSchema()).rejects.toThrow("Orbit API timeout");
    });
  });
});
