import { describe, it, expect } from "vitest";
import { DigitalTwinBuilder } from "../src/twin/builder.js";

describe("DigitalTwinBuilder", () => {
  const builder = new DigitalTwinBuilder();

  it("maps entity types correctly", () => {
    const typeMap: Record<string, string> = {
      Project: "Project", File: "File", Definition: "Definition",
      MergeRequest: "MergeRequest", Pipeline: "Pipeline",
      Deployment: "Deployment", Incident: "Incident",
      User: "User", Group: "Team",
    };
    for (const [input, expected] of Object.entries(typeMap)) {
      expect((builder as any).mapEntityType(input)).toBe(expected);
    }
  });

  it("maps unknown entity types to Service", () => {
    expect((builder as any).mapEntityType("UnknownType")).toBe("Service");
    expect((builder as any).mapEntityType("RandomEntity")).toBe("Service");
    expect((builder as any).mapEntityType("")).toBe("Service");
  });

  it("merges nodes and edges from query result", () => {
    const nodes = new Map();
    const edges = new Map();
    (builder as any).mergeGraph(nodes, edges, {
      nodes: [
        { id: "p:1", type: "Project", name: "Test" },
        { id: "mr:1", type: "MergeRequest", title: "Fix bug" },
      ],
      edges: [
        { from_id: "mr:1", to_id: "p:1", type: "IN_PROJECT" },
      ],
    });
    expect(nodes.size).toBe(2);
    expect(nodes.get("p:1").label).toBe("Test");
    expect(nodes.get("mr:1").label).toBe("Fix bug");
    expect(edges.size).toBe(1);
    expect(edges.get("mr:1|p:1|IN_PROJECT").type).toBe("IN_PROJECT");
  });

  it("skips nodes without id", () => {
    const nodes = new Map();
    const edges = new Map();
    (builder as any).mergeGraph(nodes, edges, {
      nodes: [
        { type: "Project" },
      ],
    });
    expect(nodes.size).toBe(0);
  });

  it("handles empty result gracefully", () => {
    const nodes = new Map();
    const edges = new Map();
    (builder as any).mergeGraph(nodes, edges, {});
    expect(nodes.size).toBe(0);
    expect(edges.size).toBe(0);
  });
});
