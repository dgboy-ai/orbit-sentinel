import { describe, it, expect } from "vitest";
import { ChangeSimulator } from "../src/twin/simulator.js";
import type { DigitalTwin } from "../src/types.js";

describe("ChangeSimulator edge cases", () => {
  const simulator = new ChangeSimulator();

  it("handles empty twin", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const result = simulator.simulate(twin, "empty", []);
    expect(result.changeScope).toEqual([]);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(1);
  });

  it("handles single change with no edges", () => {
    const twin: DigitalTwin = {
      nodes: [{ id: "f:1", type: "File", label: "new-file.ts", properties: {} }],
      edges: [],
      metadata: { projectPath: "test", timestamp: "" },
    };
    const result = simulator.simulate(twin, "add file", ["new-file.ts"]);
    expect(result.failurePredictions.length).toBe(0);
  });

  it("detects merge conflict risk with many MRs", () => {
    const twin: DigitalTwin = {
      nodes: Array.from({ length: 10 }, (_, i) => ({
        id: `mr:${i}`, type: "MergeRequest" as const,
        label: `MR !${i}`, properties: {},
      })),
      edges: [],
      metadata: { projectPath: "test", timestamp: "" },
    };
    const result = simulator.simulate(twin, "conflict risk", ["file.ts"]);
    const conflictPredictions = result.failurePredictions.filter(p => p.mode === "merge_conflict");
    expect(conflictPredictions.length).toBeGreaterThan(0);
  });

  it("handles deployments correctly", () => {
    const twin: DigitalTwin = {
      nodes: [
        { id: "dep:1", type: "Deployment", label: "production", properties: { status: "success" } },
      ],
      edges: [],
      metadata: { projectPath: "test", timestamp: "" },
    };
    const result = simulator.simulate(twin, "deploy", ["file.ts"]);
    expect(result.blastRadius.deployments.length).toBe(1);
    expect(result.blastRadius.deployments[0].label).toBe("production");
  });

  it("handles failed pipelines correctly", () => {
    const twin: DigitalTwin = {
      nodes: [
        { id: "pl:1", type: "Pipeline", label: "Pipeline #1", properties: { status: "failed" } },
        { id: "pl:2", type: "Pipeline", label: "Pipeline #2", properties: { status: "success" } },
        { id: "pl:3", type: "Pipeline", label: "Pipeline #3", properties: {} },
      ],
      edges: [],
      metadata: { projectPath: "test", timestamp: "" },
    };
    const result = simulator.simulate(twin, "pipeline risk", ["file.ts"]);
    expect(result.blastRadius.pipelines.length).toBe(2);
  });
});
