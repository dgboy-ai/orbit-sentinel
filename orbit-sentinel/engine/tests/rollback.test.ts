import { describe, it, expect } from "vitest";
import { RollbackStrategist } from "../src/remediation/rollback.js";
import type { DigitalTwin } from "../src/types.js";

describe("RollbackStrategist", () => {
  const strategist = new RollbackStrategist();
  const emptyTwin: DigitalTwin = { nodes: [], edges: [], metadata: { projectPath: "", timestamp: "" } };

  it("generates revert strategy for high risk", () => {
    const plan = strategist.generate(emptyTwin, ["auth-service", "api-gateway"], 0.85);
    expect(plan.strategy).toBe("revert");
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.estimatedTime).toBeTruthy();
  });

  it("generates feature flag strategy for medium risk", () => {
    const plan = strategist.generate(emptyTwin, ["auth-service"], 0.55);
    expect(plan.strategy).toBe("feature_flag");
    expect(plan.riskLevel).toBe("medium");
  });

  it("generates gradual rollback for low risk", () => {
    const plan = strategist.generate(emptyTwin, [], 0.2);
    expect(plan.strategy).toBe("gradual_rollback");
    expect(plan.riskLevel).toBe("low");
  });

  it("includes service names in revert steps", () => {
    const plan = strategist.generate(emptyTwin, ["critical-svc"], 0.9);
    const stepsText = plan.steps.join(" ");
    expect(stepsText).toContain("critical-svc");
  });

  it("handles empty services list", () => {
    const plan = strategist.generate(emptyTwin, [], 0.85);
    expect(plan.strategy).toBe("revert");
    expect(plan.steps.length).toBeGreaterThan(0);
  });
});
