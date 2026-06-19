import type { TestPlan, DigitalTwin } from "../types.js";

export class TestGenerator {
  generate(
    twin: DigitalTwin,
    changedFiles: string[],
    affectedServices: string[],
  ): TestPlan {
    const unitTests = changedFiles.map((f) => {
      const ext = f.split(".").pop();
      const base = f.replace(/\./g, "_");
      if (ext === "ts" || ext === "tsx") {return `__tests__/${base}.test.ts`;}
      if (ext === "py") {return `tests/test_${base}.py`;}
      if (ext === "rb") {return `spec/${base}_spec.rb`;}
      if (ext === "go") {return `${f}_test.go`;}
      return `tests/test_${base}.${ext ?? "test"}`;
    });

    const integrationTests = affectedServices.map((s) => {
      const safeName = s.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      return `tests/integration/test_${safeName}_integration.py`;
    });

    const e2eTests = affectedServices.slice(0, 2).map((s) => {
      const safeName = s.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      return `cypress/e2e/${safeName}_workflow.cy.ts`;
    });

    const deployNodes = twin.nodes.filter(
      (n) => n.type === "Deployment" || n.properties?.environment_id,
    );
    if (deployNodes.length > 0) {
      e2eTests.push("cypress/e2e/deployment_rollback.cy.ts");
    }

    return {
      unitTests: unitTests.length > 0 ? unitTests : ["No unit tests needed (no source files changed)"],
      integrationTests: integrationTests.length > 0
        ? integrationTests
        : ["tests/integration/test_default_integration.py"],
      e2eTests: e2eTests.length > 0
        ? e2eTests
        : ["No E2E tests required"],
      suggestedFramework: "pytest + jest + cypress",
      coverageTargets: [
        "100% of new/modified lines in changed files",
        ">80% branch coverage in affected services",
        "Critical integration paths covered by E2E",
      ],
    };
  }
}

export const testGenerator = new TestGenerator();
