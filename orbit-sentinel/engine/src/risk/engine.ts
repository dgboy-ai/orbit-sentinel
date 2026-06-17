import type {
  DigitalTwin,
  FailurePrediction,
  RollbackPlan,
} from "../types.js";
import { getConfig } from "../config.js";

export class RiskEngine {
  computeAggregateRisk(
    twin: DigitalTwin,
    predictions: FailurePrediction[],
    affectedFileCount: number,
    affectedServiceCount: number,
  ): number {
    let score = 0;

    const severityWeights: Record<string, number> = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      critical: 0.9,
    };

    for (const prediction of predictions) {
      const severityWeight = severityWeights[prediction.severity] ?? 0.3;
      score += prediction.probability * severityWeight;
    }

    score += Math.min(affectedFileCount * 0.05, 0.3);
    score += Math.min(affectedServiceCount * 0.1, 0.4);

    const incidentCount = twin.nodes.filter((n) => n.type === "Incident").length;
    score += Math.min(incidentCount * 0.1, 0.3);

    const failedPipelineCount = twin.nodes.filter(
      (n) => n.type === "Pipeline" && (n.properties?.status as string) === "failed",
    ).length;
    score += Math.min(failedPipelineCount * 0.05, 0.2);

    return Math.min(Math.max(score, 0), 1);
  }

  classifyRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
    const thresholds = getConfig().riskThresholds;
    if (score >= thresholds.high) return "critical";
    if (score >= thresholds.medium) return "high";
    if (score >= thresholds.low) return "medium";
    return "low";
  }

  generateRollbackPlan(riskLevel: string, predictions: FailurePrediction[]): RollbackPlan {
    const highRiskPredictions = predictions.filter(
      (p) => p.severity === "high" || p.severity === "critical",
    );

    if (highRiskPredictions.length > 2) {
      return {
        strategy: "revert_and_fix",
        steps: [
          "Immediately revert the merge commit",
          "Create a hotfix branch from the parent commit",
          "Apply targeted fixes identified by the remediation plan",
          "Run full CI pipeline on the hotfix branch",
          "Deploy the hotfix with monitored rollout",
          "Create an incident post-mortem",
        ],
        estimatedTime: "30-60 minutes",
        riskLevel: "medium",
      };
    }

    if (riskLevel === "critical" || riskLevel === "high") {
      return {
        strategy: "feature_flag",
        steps: [
          "Wrap the change behind a feature flag",
          "Set the flag to disabled by default",
          "Deploy with the flag off",
          "Monitor for regression signals",
          "Gradually enable for canary groups",
          "Full rollout after 24h of stable canary",
        ],
        estimatedTime: "15-30 minutes",
        riskLevel: "low",
      };
    }

    return {
      strategy: "gradual_rollback",
      steps: [
        "Monitor deployment for 15 minutes post-merge",
        "If error rate increases, trigger revert via `/chatops revert`",
        "Create a follow-up MR with the fix",
        "Re-run impact analysis on the fix MR",
      ],
      estimatedTime: "Immediate with monitoring",
      riskLevel: "low",
    };
  }
}
