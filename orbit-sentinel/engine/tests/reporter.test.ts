import { describe, it, expect } from "vitest";
import { DataVisualizer } from "../src/reporter/visualizer.js";
import type { DigitalTwin, ChangeSimulation, FailurePrediction } from "../src/types.js";

describe("DataVisualizer", () => {
  const visualizer = new DataVisualizer();

  const twin: DigitalTwin = {
    nodes: [
      { id: "p:1", type: "Project", label: "test/project", properties: {} },
      { id: "f:1", type: "File", label: "src/app.ts", properties: {} },
    ],
    edges: [{ source: "p:1", target: "f:1", type: "CONTAINS" }],
    metadata: { projectPath: "test/project", timestamp: "2025-01-01T00:00:00Z" },
  };

  const simulation: ChangeSimulation = {
    changeDescription: "fix bug",
    changeScope: ["src/app.ts"],
    blastRadius: { files: [], services: [], deployments: [], pipelines: [] },
    failurePredictions: [],
    riskScore: 0.3,
    riskLevel: "medium",
  };

  it("transforms twin into visualization data", () => {
    const data = visualizer.toVisualizationData(twin, simulation);
    expect(data.graph.nodes.length).toBe(twin.nodes.length);
    expect(data.graph.links.length).toBe(twin.edges.length);
    expect(data.riskData.score).toBe(0.3);
    expect(data.riskData.level).toBe("medium");
    expect(data.timelines.length).toBe(5);
    expect(data.summary.totalNodes).toBe(2);
  });

  it("includes risk level in visualization data", () => {
    const data = visualizer.toVisualizationData(twin, simulation);
    expect(data.riskData.level).toBe("medium");
  });

  it("maps node types to colors", () => {
    const data = visualizer.toVisualizationData(twin, simulation);
    const projectNode = data.graph.nodes.find(n => n.id === "p:1");
    expect(projectNode).toBeDefined();
    expect(projectNode!.type).toBe("Project");
  });
});

describe("MarkdownReporter", () => {
  it("generates valid markdown report", async () => {
    const { MarkdownReporter } = await import("../src/reporter/markdown.js");
    const reporter = new MarkdownReporter();
    const report = {
      mrIid: 1,
      mrTitle: "Test MR",
      digitalTwin: { nodes: [], edges: [], metadata: { projectPath: "test", timestamp: "" } },
      simulation: {
        changeDescription: "test change",
        changeScope: ["file.ts"],
        blastRadius: { files: [], services: [], deployments: [], pipelines: [] },
        failurePredictions: [] as FailurePrediction[],
        riskScore: 0.2,
        riskLevel: "low" as const,
      },
      historicalMatches: [],
      reviewerRecommendations: [],
      rollbackPlan: { strategy: "revert" as const, steps: ["Step 1"], estimatedTime: "5m", riskLevel: "low" as const },
      testPlan: { unitTests: [], integrationTests: [], e2eTests: [], suggestedFramework: "vitest", coverageTargets: [] },
      remediations: [],
      generatedAt: new Date().toISOString(),
    };
    const output = reporter.generateReport(report);
    expect(output).toContain("Orbit Sentinel Report");
    expect(output).toContain("MR !1");
    expect(output).toContain("test change");
    expect(output).toContain("Rollback Plan");
  });
});
