import { describe, it, expect } from "vitest";
import { RiskEngine } from "../src/risk/engine.js";
import type { DigitalTwin, FailurePrediction } from "../src/types.js";

describe("RiskEngine edge cases", () => {
  const engine = new RiskEngine();

  it("handles empty twin", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const score = engine.computeAggregateRisk(twin, [], 0, 0);
    expect(score).toBe(0);
    expect(engine.classifyRiskLevel(score)).toBe("low");
  });

  it("caps score at 1.0", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const predictions: FailurePrediction[] = Array.from({ length: 20 }, () => ({
      mode: "pipeline_failure", probability: 0.9, severity: "critical",
      affectedComponent: "svc", description: "",
    }));
    const score = engine.computeAggregateRisk(twin, predictions, 50, 20);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("handles unknown severity gracefully", () => {
    const twin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };
    const predictions: FailurePrediction[] = [{
      mode: "unknown", probability: 0.5, severity: "unknown" as any,
      affectedComponent: "svc", description: "",
    }];
    const score = engine.computeAggregateRisk(twin, predictions, 0, 0);
    expect(score).toBeGreaterThan(0);
  });

  it("generates rollback plan for critical predictions", () => {
    const plan = engine.generateRollbackPlan("critical", [
      { mode: "pipeline_failure", probability: 0.95, severity: "critical", affectedComponent: "core-svc", description: "Core service may fail" },
      { mode: "downstream_breakage", probability: 0.8, severity: "high", affectedComponent: "api", description: "Downstream API breakage" },
    ]);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(["revert", "revert_and_fix", "feature_flag", "gradual_rollback"]).toContain(plan.strategy);
  });

  it("generates low risk rollback for low level", () => {
    const plan = engine.generateRollbackPlan("low", []);
    expect(plan.riskLevel).toBe("low");
  });

  it("classifies boundary values", () => {
    expect(engine.classifyRiskLevel(0.29)).toBe("low");
    expect(engine.classifyRiskLevel(0.3)).toBe("medium");
    expect(engine.classifyRiskLevel(0.59)).toBe("medium");
    expect(engine.classifyRiskLevel(0.6)).toBe("high");
    expect(engine.classifyRiskLevel(0.84)).toBe("high");
    expect(engine.classifyRiskLevel(0.85)).toBe("critical");
  });
});
