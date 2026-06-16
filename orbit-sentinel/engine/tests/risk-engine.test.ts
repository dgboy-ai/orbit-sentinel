import { describe, it, expect } from "vitest";
import { RiskEngine } from "../src/risk/engine.js";
import type { DigitalTwin, FailurePrediction } from "../src/types.js";

describe("RiskEngine", () => {
  const engine = new RiskEngine();

  it("returns low risk for empty predictions", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const score = engine.computeAggregateRisk(twin, [], 0, 0);
    expect(score).toBeLessThan(0.3);
    expect(engine.classifyRiskLevel(score)).toBe("low");
  });

  it("computes higher risk with more predictions", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const predictions: FailurePrediction[] = [
      { mode: "pipeline_failure", probability: 0.8, severity: "high", affectedComponent: "svc", description: "" },
      { mode: "downstream_breakage", probability: 0.7, severity: "critical", affectedComponent: "svc2", description: "" },
    ];
    const score = engine.computeAggregateRisk(twin, predictions, 5, 2);
    expect(score).toBeGreaterThan(0.5);
  });

  it("classifies risk levels correctly", () => {
    expect(engine.classifyRiskLevel(0)).toBe("low");
    expect(engine.classifyRiskLevel(0.4)).toBe("medium");
    expect(engine.classifyRiskLevel(0.7)).toBe("high");
    expect(engine.classifyRiskLevel(0.9)).toBe("critical");
  });

  it("generates rollback plan based on risk level", () => {
    const plan = engine.generateRollbackPlan("high", [
      { mode: "pipeline_failure", probability: 0.8, severity: "high", affectedComponent: "svc", description: "" },
    ]);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(["revert", "revert_and_fix", "feature_flag", "gradual_rollback"]).toContain(plan.strategy);
  });
});
