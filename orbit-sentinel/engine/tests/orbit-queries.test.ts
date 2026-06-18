import { describe, it, expect, beforeEach, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

async function importQueryEngine() {
  const mod = await import("../src/orbit/queries.js");
  return mod.queryEngine;
}

describe("OrbitQueryEngine", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: { nodes: [], edges: [] }, row_count: 0, query_type: "traversal" }),
    });
    process.env.GITLAB_ACCESS_TOKEN = "glpat-test-token";
    // Reset ErrorHandler singleton state
    const eh = await import("../src/errors.js");
    const handler = eh.ErrorHandler.getInstance();
    (handler as any).rateLimitResetTimes = new Map();
    (handler as any).errorCounts = new Map();
  });

  describe("findBlastRadius", () => {
    it("queries neighbors with correct params", async () => {
      const engine = await importQueryEngine();
      await engine.findBlastRadius("src/auth.ts");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("neighbors");
      expect(body.query.node.filters.path.value).toBe("src/auth.ts");
      expect(body.query.neighbors.node).toBe("f");
      expect(body.query.neighbors.direction).toBe("both");
    });
  });

  describe("findHistoricalMRs", () => {
    it("queries traversal with file→MR path", async () => {
      const engine = await importQueryEngine();
      await engine.findHistoricalMRs("group/project", "src/auth.ts");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("traversal");
      expect(body.query.nodes).toHaveLength(3);
      expect(body.query.relationships[0].type).toBe("modified_in");
    });
  });

  describe("findPipelineFailures", () => {
    it("queries aggregation with group by project", async () => {
      const engine = await importQueryEngine();
      await engine.findPipelineFailures([1, 2, 3]);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("aggregation");
      expect(body.query.aggregations[0].function).toBe("count");
      expect(body.query.group_by[0].node).toBe("p");
    });
  });

  describe("findDeploymentPath", () => {
    it("queries path_finding with shortest path", async () => {
      const engine = await importQueryEngine();
      await engine.findDeploymentPath(42);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("path_finding");
      expect(body.query.path.type).toBe("shortest");
      expect(body.query.path.from).toBe("mr");
      expect(body.query.path.to).toBe("dep");
    });
  });

  describe("findTeamOwnership", () => {
    it("queries neighbors for user/group nodes", async () => {
      const engine = await importQueryEngine();
      await engine.findTeamOwnership("src/deploy.ts");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("neighbors");
      expect(body.query.neighbors.node_types).toContain("User");
    });
  });

  describe("findDependencyChain", () => {
    it("queries path_finding with IMPORTS relationship", async () => {
      const engine = await importQueryEngine();
      await engine.findDependencyChain("src/auth.ts", "src/payment.ts");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("path_finding");
      expect(body.query.relationships[0].type).toBe("IMPORTS");
    });
  });

  describe("countOpenMRsByProject", () => {
    it("queries aggregation for open MRs count", async () => {
      const engine = await importQueryEngine();
      await engine.countOpenMRsByProject();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("aggregation");
      expect(body.query.nodes[1].filters.state).toBe("opened");
    });
  });

  describe("findIncidentsConnectedToFile", () => {
    it("queries traversal with CAUSED_INCIDENT relationship", async () => {
      const engine = await importQueryEngine();
      await engine.findIncidentsConnectedToFile("src/crash.ts");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("traversal");
      expect(body.query.relationships[0].type).toBe("CAUSED_INCIDENT");
    });
  });

  describe("findMRsByAuthor", () => {
    it("queries traversal with AUTHORED_BY relationship", async () => {
      const engine = await importQueryEngine();
      await engine.findMRsByAuthor("trueboy1123");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("traversal");
      expect(body.query.nodes[0].filters.username).toBe("trueboy1123");
    });
  });

  describe("findSimilarChanges", () => {
    it("queries traversal with MODIFIED_IN from Definition", async () => {
      const engine = await importQueryEngine();
      await engine.findSimilarChanges("com.example.Service");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("traversal");
      expect(body.query.nodes[0].entity).toBe("Definition");
    });
  });

  describe("findImportedFiles", () => {
    it("queries traversal with contains filter", async () => {
      const engine = await importQueryEngine();
      await engine.findImportedFiles("@auth/core");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("traversal");
      expect(body.query.node.entity).toBe("ImportedSymbol");
    });
  });

  describe("getProjectSummary", () => {
    it("queries neighbors with project node_ids", async () => {
      const engine = await importQueryEngine();
      await engine.getProjectSummary(42);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.query_type).toBe("neighbors");
      expect(body.query.node.node_ids).toEqual([42]);
      expect(body.query.neighbors.node).toBe("p");
    });
  });
});
