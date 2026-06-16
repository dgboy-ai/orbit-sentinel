import { describe, it, expect } from "vitest";
import { TestGenerator } from "../src/remediation/test-generator.js";
import type { DigitalTwin } from "../src/types.js";

describe("TestGenerator", () => {
  const generator = new TestGenerator();

  const twin: DigitalTwin = {
    nodes: [
      { id: "dep:1", type: "Deployment", label: "staging", properties: { environment_id: "1" } },
    ],
    edges: [],
    metadata: { projectPath: "test/project", timestamp: "" },
  };

  it("generates unit tests for changed files", () => {
    const plan = generator.generate(twin, ["src/auth.ts", "src/utils.tsx"], []);
    expect(plan.unitTests.length).toBe(2);
    expect(plan.unitTests[0]).toContain("__tests__");
    expect(plan.unitTests[0]).toContain(".test.ts");
  });

  it("generates integration tests for affected services", () => {
    const plan = generator.generate(twin, ["src/auth.ts"], ["auth-service", "api-gateway"]);
    expect(plan.integrationTests.length).toBe(2);
    expect(plan.integrationTests[0]).toContain("integration");
  });

  it("detects language from file extension", () => {
    const plan = generator.generate(twin, ["app.py", "server.go"], []);
    const pyTests = plan.unitTests.filter(t => t.includes(".py"));
    const goTests = plan.unitTests.filter(t => t.includes(".go"));
    expect(pyTests.length).toBe(1);
    expect(goTests.length).toBe(1);
  });

  it("adds rollback E2E test when deployments exist", () => {
    const plan = generator.generate(twin, ["src/auth.ts"], ["auth-service"]);
    expect(plan.e2eTests.some(t => t.includes("rollback"))).toBe(true);
  });

  it("includes coverage targets", () => {
    const plan = generator.generate(twin, ["src/auth.ts"], []);
    expect(plan.coverageTargets.length).toBeGreaterThan(0);
    expect(plan.coverageTargets[0]).toContain("100%");
  });

  it("includes suggested framework", () => {
    const plan = generator.generate(twin, ["src/auth.ts"], []);
    expect(plan.suggestedFramework).toBeTruthy();
  });
});
