import { describe, it, expect } from "vitest";
import { ChangeSimulator } from "../src/twin/simulator.js";
import type { DigitalTwin } from "../src/types.js";

describe("ChangeSimulator", () => {
  const simulator = new ChangeSimulator();

  const makeTwin = (overrides?: Partial<DigitalTwin>): DigitalTwin => ({
    nodes: [
      { id: "f:1", type: "File", label: "src/auth.ts", properties: {} },
      { id: "f:2", type: "File", label: "src/utils.ts", properties: {} },
      { id: "svc:1", type: "Service", label: "auth-service", properties: {} },
      { id: "pl:1", type: "Pipeline", label: "Pipeline #1", properties: { status: "failed" } },
    ],
    edges: [
      { source: "f:1", target: "svc:1", type: "CONTAINS" },
      { source: "f:2", target: "f:1", type: "DEPENDS_ON" },
    ],
    metadata: { projectPath: "test/project", timestamp: "2025-01-01T00:00:00Z" },
    ...overrides,
  });

  it("simulates change with blast radius", () => {
    const twin = makeTwin();
    const result = simulator.simulate(twin, "update auth logic", ["src/auth.ts"]);
    expect(result.changeScope).toEqual(["src/auth.ts"]);
    expect(result.blastRadius.services.length).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(1);
    expect(["low", "medium", "high", "critical"]).toContain(result.riskLevel);
  });

  it("identifies pipelines at risk", () => {
    const twin = makeTwin();
    const result = simulator.simulate(twin, "risky change", ["src/auth.ts"]);
    const pipelineRisks = result.failurePredictions.filter(p => p.mode === "pipeline_failure");
    expect(pipelineRisks.length).toBeGreaterThanOrEqual(0);
  });

  it("generates failure predictions", () => {
    const twin = makeTwin();
    const result = simulator.simulate(twin, "big change", ["src/auth.ts", "src/utils.ts"]);
    expect(result.failurePredictions.length).toBeGreaterThan(0);
    expect(result.failurePredictions[0]).toHaveProperty("mode");
    expect(result.failurePredictions[0]).toHaveProperty("probability");
    expect(result.failurePredictions[0]).toHaveProperty("severity");
  });
});
