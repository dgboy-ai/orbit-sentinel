import type { RollbackPlan, DigitalTwin } from "../types.js";

export class RollbackStrategist {
  generate(
    twin: DigitalTwin,
    affectedServices: string[],
    riskScore: number,
  ): RollbackPlan {
    if (riskScore > 0.7) {
      return {
        strategy: "revert",
        steps: [
          "Trigger immediate revert of the merge commit via GitLab API",
          `Notify ${affectedServices.slice(0, 3).join(", ")} service owners`,
          "Create a revert MR with the original change gated behind a feature flag",
          "Schedule a follow-up deployment with the feature flag disabled",
          "Monitor error rates for 30 minutes post-revert",
        ],
        estimatedTime: "15-30 minutes",
        riskLevel: "low",
      };
    }

    if (riskScore > 0.4) {
      return {
        strategy: "feature_flag",
        steps: [
          "Deploy with the change behind a feature flag (default: off)",
          "Enable for 5% of traffic for 10 minutes",
          "If no errors, ramp to 25%, then 100% over 1 hour",
          "If errors detected at any stage, disable the flag immediately",
          "Proceed with full rollout only after 1 hour of stable 100% traffic",
        ],
        estimatedTime: "1-2 hours for full rollout",
        riskLevel: "medium",
      };
    }

    return {
      strategy: "gradual_rollback",
      steps: [
        "Deploy with standard canary (10% for 5 min, 50% for 15 min, 100%)",
        "Monitor application error rate, latency, and throughput at each stage",
        "If any metric degrades >5%, pause and evaluate",
        "Revert the commit if degradation persists after 5-minute observation",
      ],
      estimatedTime: "25 minutes for full rollout",
      riskLevel: "low",
    };
  }
}

export const rollbackStrategist = new RollbackStrategist();
