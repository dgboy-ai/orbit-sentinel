export { OrbitClient, orbitClient } from "./orbit/client.js";
export { OrbitQueryEngine, queryEngine } from "./orbit/queries.js";
export { DigitalTwinBuilder, twinBuilder } from "./twin/builder.js";
export { ChangeSimulator, simulator } from "./twin/simulator.js";
export { MemoryStore, memoryStore } from "./memory/store.js";
export { SimilarityEngine, similarityEngine } from "./memory/similarity.js";
export { RiskEngine } from "./risk/engine.js";
export { RemediationPlanner, remediationPlanner } from "./remediation/planner.js";
export { RollbackStrategist, rollbackStrategist } from "./remediation/rollback.js";
export { TestGenerator, testGenerator } from "./remediation/test-generator.js";
export { MarkdownReporter, markdownReporter } from "./reporter/markdown.js";
export { DataVisualizer, dataVisualizer } from "./reporter/visualizer.js";

import { twinBuilder } from "./twin/builder.js";
import { simulator } from "./twin/simulator.js";
import { memoryStore } from "./memory/store.js";
import { queryEngine } from "./orbit/queries.js";
import { RiskEngine } from "./risk/engine.js";
import { markdownReporter } from "./reporter/markdown.js";
import { dataVisualizer } from "./reporter/visualizer.js";
import { remediationPlanner } from "./remediation/planner.js";
import { rollbackStrategist } from "./remediation/rollback.js";
import { testGenerator } from "./remediation/test-generator.js";

import type { SentinelReport, ReviewerRecommendation } from "./types.js";

interface AnalyzeChangeParams {
  projectId: number;
  projectPath: string;
  mrIid: number;
  mrTitle: string;
  changedFiles: string[];
  changeDescription: string;
  branch?: string;
}

export class OrbitSentinel {
  private riskEngine: RiskEngine;

  constructor() {
    this.riskEngine = new RiskEngine();
  }

  async analyzeChange(params: AnalyzeChangeParams): Promise<SentinelReport> {
    const twin = await twinBuilder.build({
      projectId: params.projectId,
      projectPath: params.projectPath,
      changedFiles: params.changedFiles,
      mrIid: params.mrIid,
      branch: params.branch,
    });

    const simulation = simulator.simulate(
      twin,
      params.changeDescription,
      params.changedFiles,
    );

    const historicalMatches = await memoryStore.findHistoricalMatches(
      params.projectPath,
      params.changedFiles,
    );

    const reviewerRecommendations = await this.analyzeReviewers(twin);

    const rollbackPlan = this.riskEngine.generateRollbackPlan(
      simulation.riskLevel,
      simulation.failurePredictions,
    );

    const testPlan = testGenerator.generate(
      twin,
      params.changedFiles,
      simulation.blastRadius.services.map((s) => s.label),
    );

    const remediations = remediationPlanner.prioritize(simulation.failurePredictions);

    return {
      mrIid: params.mrIid,
      mrTitle: params.mrTitle,
      digitalTwin: twin,
      simulation,
      historicalMatches,
      reviewerRecommendations,
      rollbackPlan,
      testPlan,
      remediations,
      generatedAt: new Date().toISOString(),
    };
  }

  private async analyzeReviewers(
    twin: import("./types.js").DigitalTwin,
  ): Promise<ReviewerRecommendation[]> {
    const recommendations: ReviewerRecommendation[] = [];
    const userNodes = twin.nodes.filter((n) => n.type === "User");

    for (const user of userNodes.slice(0, 5)) {
      const mrCount = twin.edges.filter(
        (e) => e.type === "AUTHORED_BY" && e.source === user.id,
      ).length;

      const fileCount = twin.edges.filter(
        (e) => e.type === "DEPENDS_ON" && (e.source === user.id || e.target === user.id),
      ).length;

      if (mrCount > 0 || fileCount > 0) {
        recommendations.push({
          username: user.properties?.username as string ?? user.label,
          expertise: [
            ...new Set(
              twin.edges
                .filter((e) => e.source === user.id || e.target === user.id)
                .map((e) => e.type),
            ),
          ],
          relevanceScore: Math.min(0.3 + mrCount * 0.1 + fileCount * 0.05, 1),
          currentWorkload: mrCount,
        });
      }
    }

    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recommendations;
  }

  generateMarkdownReport(report: SentinelReport): string {
    return markdownReporter.generateReport(report);
  }

  generateVisualizationData(report: SentinelReport) {
    return dataVisualizer.toVisualizationData(
      report.digitalTwin,
      report.simulation,
      report,
    );
  }
}

export const sentinel = new OrbitSentinel();
