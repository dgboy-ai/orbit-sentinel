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

  it("extracts nodes from row data", () => {
    const row = {
      test: { id: "p:1", type: "Project", properties: { name: "Test Project" } },
    };
    const node = (builder as any).extractNodesFromRow(row, "test");
    expect(node).not.toBeNull();
    expect(node.id).toBe("p:1");
    expect(node.label).toBe("Test Project");
    expect(node.type).toBe("Project");
  });

  it("returns null for missing row key", () => {
    const node = (builder as any).extractNodesFromRow({}, "nonexistent");
    expect(node).toBeNull();
  });

  it("falls back to id when no label properties", () => {
    const row = {
      n: { id: "u:42", type: "User", properties: {} },
    };
    const node = (builder as any).extractNodesFromRow(row, "n");
    expect(node).not.toBeNull();
    expect(node.label).toBe("u:42");
  });
});
