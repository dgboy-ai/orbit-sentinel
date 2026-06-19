import type {
  SentinelReport,
  ChangeSimulation,
  FailurePrediction,
  HistoricalMatch,
  ReviewerRecommendation,
  RollbackPlan,
  TestPlan,
  RemediationSuggestion,
  DigitalTwin,
} from "../types.js";

export class MarkdownReporter {
  generateReport(report: SentinelReport): string {
    const sections = [
      this.header(report),
      this.executiveSummary(report.simulation),
      this.digitalTwinSummary(report.digitalTwin),
      this.blastRadiusSection(report.simulation),
      this.failurePredictionsSection(report.simulation.failurePredictions),
      this.riskScoreSection(report.simulation),
      this.historicalMatchesSection(report.historicalMatches),
      this.reviewerRecommendationsSection(report.reviewerRecommendations),
      this.rollbackPlanSection(report.rollbackPlan),
      this.testPlanSection(report.testPlan),
      this.remediationSection(report.remediations),
      this.footer(report),
    ];

    return sections.join("\n\n---\n\n");
  }

  private header(report: SentinelReport): string {
    const riskEmoji = this.riskEmoji(report.simulation.riskLevel);
    return [
      `# ${riskEmoji} Orbit Sentinel Report — MR !${report.mrIid}`,
      "",
      `**Title:** ${report.mrTitle}`,
      `**Risk Level:** \`${report.simulation.riskLevel.toUpperCase()}\` (Score: ${(report.simulation.riskScore * 100).toFixed(1)}%)`,
      `**Generated:** ${report.generatedAt}`,
      "",
      `> **Engineering Digital Twin**: A living model of your software system was built using GitLab Orbit. The following report simulates the impact of this change before it reaches production.`,
    ].join("\n");
  }

  private executiveSummary(simulation: ChangeSimulation): string {
    const icon = simulation.riskLevel === "critical" ? "🚨" :
      simulation.riskLevel === "high" ? "⚠️" :
      simulation.riskLevel === "medium" ? "⚡" : "✅";

    const totalAffected = [
      ...simulation.blastRadius.files,
      ...simulation.blastRadius.services,
      ...simulation.blastRadius.deployments,
      ...simulation.blastRadius.pipelines,
    ].length;

    return [
      "## Executive Summary",
      "",
      `${icon} **${simulation.changeDescription}**`,
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Change Scope | ${simulation.changeScope.length} file(s) |`,
      `| Blast Radius | ${totalAffected} affected nodes |`,
      `| Files Impacted | ${simulation.blastRadius.files.length} |`,
      `| Services Impacted | ${simulation.blastRadius.services.length} |`,
      `| Deployments Affected | ${simulation.blastRadius.deployments.length} |`,
      `| Pipelines at Risk | ${simulation.blastRadius.pipelines.length} |`,
      `| Failure Modes Predicted | ${simulation.failurePredictions.length} |`,
      `| Risk Score | ${(simulation.riskScore * 100).toFixed(1)}% (${simulation.riskLevel.toUpperCase()}) |`,
      "",
      `**Prediction:** ${simulation.failurePredictions.length > 0 ? "This change has identifiable risks. See below for mitigation steps." : "No significant risks detected. Proceed with standard review."}`,
    ].join("\n");
  }

  private digitalTwinSummary(twin: DigitalTwin): string {
    const nodeCounts: Record<string, number> = {};
    for (const node of twin.nodes) {
      nodeCounts[node.type] = (nodeCounts[node.type] ?? 0) + 1;
    }

    const typeBreakdown = Object.entries(nodeCounts)
      .map(([type, count]) => `  - ${type}: ${count}`)
      .join("\n");

    return [
      "## Engineering Digital Twin",
      "",
      "A digital twin of the software system was constructed using GitLab Orbit queries:",
      "",
      `| Dimension | Count |`,
      `|-----------|-------|`,
      `| Total Nodes | ${twin.nodes.length} |`,
      `| Total Edges | ${twin.edges.length} |`,
      `| Projects Indexed | ${nodeCounts["Project"] ?? 0} |`,
      `| Services/Modules | ${nodeCounts["Service"] ?? 0} |`,
      `| Files | ${nodeCounts["File"] ?? 0} |`,
      `| Merge Requests (context) | ${nodeCounts["MergeRequest"] ?? 0} |`,
      `| Pipelines | ${nodeCounts["Pipeline"] ?? 0} |`,
      `| Deployments | ${nodeCounts["Deployment"] ?? 0} |`,
      `| Incidents (history) | ${nodeCounts["Incident"] ?? 0} |`,
      "",
      `\`\`\``,
      typeBreakdown,
      `\`\`\``,
      "",
      `_Twin built from project: \`${twin.metadata.projectPath}\` at ${twin.metadata.timestamp}_`,
    ].join("\n");
  }

  private blastRadiusSection(simulation: ChangeSimulation): string {
    return [
      "## Blast Radius Analysis",
      "",
      "The following systems are within the blast radius of this change:",
      "",
      ...(simulation.blastRadius.services.length > 0
        ? [
          "### Affected Services",
          ...simulation.blastRadius.services.map(
            (s) => `- \`${s.label}\``,
          ),
          "",
        ].join("\n")
        : "### Affected Services\n_No services directly impacted._\n"),
      "",
      ...(simulation.blastRadius.files.length > 0
        ? [
          "### Affected Files (Transitive)",
          ...simulation.blastRadius.files.slice(0, 20).map(
            (f) => `- \`${f.label}\``,
          ),
          simulation.blastRadius.files.length > 20
            ? `  _... and ${simulation.blastRadius.files.length - 20} more_`
            : "",
          "",
        ].join("\n")
        : ""),
      "",
      ...(simulation.blastRadius.pipelines.length > 0
        ? [
          "### Pipelines at Risk",
          ...simulation.blastRadius.pipelines.map(
            (p) => `- Pipeline ${p.id} (Status: ${p.properties?.status as string ?? "unknown"})`,
          ),
          "",
        ].join("\n")
        : ""),
    ].join("\n");
  }

  private failurePredictionsSection(predictions: FailurePrediction[]): string {
    if (predictions.length === 0) {
      return "## Failure Predictions\n\n_No failure modes predicted for this change._";
    }

    const rows = predictions.map((p) => {
      const sevIcon = p.severity === "critical" ? "🔴" :
        p.severity === "high" ? "🟠" :
        p.severity === "medium" ? "🟡" : "🟢";
      return `| ${sevIcon} ${p.mode.replace(/_/g, " ")} | ${(p.probability * 100).toFixed(0)}% | ${p.severity.toUpperCase()} | ${p.affectedComponent} | ${p.description} |`;
    }).join("\n");

    return [
      "## Failure Predictions",
      "",
      "Based on digital twin simulation, the following failure modes are predicted:",
      "",
      "| Failure Mode | Probability | Severity | Component | Description |",
      "|---|---|---|---|---|",
      rows,
      "",
    ].join("\n");
  }

  private riskScoreSection(simulation: ChangeSimulation): string {
    const barLength = Math.round(simulation.riskScore * 20);
    const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);

    return [
      "## Risk Assessment",
      "",
      `\`\`\``,
      `Risk Score: ${(simulation.riskScore * 100).toFixed(1)}%`,
      `Risk Level: ${simulation.riskLevel.toUpperCase()}`,
      `            ${bar}`,
      `           0%        25%       50%       75%      100%`,
      `\`\`\``,
      "",
      `**Interpretation:** ${this.riskInterpretation(simulation.riskLevel)}`,
    ].join("\n");
  }

  private historicalMatchesSection(matches: HistoricalMatch[]): string {
    if (matches.length === 0) {
      return "## Historical Context\n\n_No historical matches found for this change pattern._";
    }

    const rows = matches.slice(0, 5).map((m) => {
      const outcomeIcon = m.outcome === "success" ? "✅" :
        m.outcome === "rollback" ? "🔙" :
        m.outcome === "incident" ? "🚨" : "⚠️";
      return `| !${m.mrIid} | ${m.mrTitle} | ${outcomeIcon} ${m.outcome} | ${(m.similarity * 100).toFixed(0)}% | ${new Date(m.timestamp).toLocaleDateString()} |`;
    }).join("\n");

    return [
      "## Historical Context (Repository Memory)",
      "",
      "Similar changes found in repository history:",
      "",
      "| MR | Title | Outcome | Similarity | Date |",
      "|---|---|---|---|---|",
      rows,
      "",
      matches.length > 5
        ? `_${matches.length - 5} more historical matches available._`
        : "",
    ].join("\n");
  }

  private reviewerRecommendationsSection(recommendations: ReviewerRecommendation[]): string {
    if (recommendations.length === 0) {
      return "## Reviewer Recommendations\n\n_Analyzing ownership data..._";
    }

    const rows = recommendations.map((r) =>
      `| @${r.username} | ${r.expertise.join(", ")} | ${(r.relevanceScore * 100).toFixed(0)}% | ${r.currentWorkload} open MRs |`,
    ).join("\n");

    return [
      "## Reviewer Recommendations",
      "",
      "Based on file ownership and expertise analysis:",
      "",
      "| Reviewer | Expertise | Relevance | Workload |",
      "|---|---|---|---|",
      rows,
      "",
    ].join("\n");
  }

  private rollbackPlanSection(plan: RollbackPlan): string {
    const strategyLabels: Record<string, string> = {
      revert: "Direct Revert",
      revert_and_fix: "Revert & Fix Forward",
      feature_flag: "Feature Flag Gating",
      gradual_rollback: "Gradual Rollback",
    };

    return [
      "## Rollback Plan",
      "",
      `**Strategy:** ${strategyLabels[plan.strategy] ?? plan.strategy}`,
      `**Estimated Time:** ${plan.estimatedTime}`,
      `**Residual Risk:** ${plan.riskLevel.toUpperCase()}`,
      "",
      "**Steps:**",
      ...plan.steps.map((s, i) => `  ${i + 1}. ${s}`),
      "",
    ].join("\n");
  }

  private testPlanSection(plan: TestPlan): string {
    return [
      "## Generated Test Plan",
      "",
      `**Framework:** ${plan.suggestedFramework}`,
      "",
      "### Unit Tests",
      ...plan.unitTests.map((t) => `- [ ] \`${t}\``),
      "",
      "### Integration Tests",
      ...plan.integrationTests.map((t) => `- [ ] \`${t}\``),
      "",
      "### E2E Tests",
      ...plan.e2eTests.map((t) => `- [ ] \`${t}\``),
      "",
      "### Coverage Targets",
      ...plan.coverageTargets.map((t) => `- ${t}`),
      "",
    ].join("\n");
  }

  private remediationSection(remediations: RemediationSuggestion[]): string {
    if (remediations.length === 0) {
      return "## Remediation Suggestions\n\n_No remediation needed._";
    }

    return [
      "## Remediation Suggestions",
      "",
      ...remediations.map((r, i) => {
        const typeIcon: Record<string, string> = {
          fix_mr: "🔧",
          config_change: "⚙️",
          rollback: "🔙",
          feature_flag: "🚩",
          test_addition: "🧪",
        };
        return `### ${i + 1}. ${typeIcon[r.type] ?? "💡"} ${r.type.replace(/_/g, " ")}`
          + `\n\n${r.description}${
           r.autoGeneratedMr ? "\n\n_Auto-generated fix MR available._" : ""
           }${r.mrUrl ? `\n\n[View Fix MR](${r.mrUrl})` : ""}`;
      }).join("\n\n"),
      "",
    ].join("\n");
  }

  private footer(report: SentinelReport): string {
    return [
      "## About This Report",
      "",
      `_Generated by **Orbit Sentinel** — Autonomous Engineering Digital Twin_`,
      "",
      "This report was built using GitLab Orbit knowledge graph queries to construct a",
      "digital twin of the software system, simulate the proposed change, and predict",
      "its impact across the entire development lifecycle.",
      "",
      "**Data Sources:**",
      "- GitLab Orbit (Knowledge Graph) — project structure, dependencies, history",
      "- Orbit Traversal Queries — file-level dependency analysis",
      "- Orbit Path Finding — deployment and dependency chain tracing",
      "- Orbit Neighbor Queries — blast radius computation",
      "- Orbit Aggregation — pipeline failure patterns",
      "",
      "---",
      "",
      `_Report ID: ${report.generatedAt.replace(/[:.]/g, "-")}_`,
      `_Digital Twin Node Count: ${report.digitalTwin.nodes.length}_`,
      `_Edges Traversed: ${report.digitalTwin.edges.length}_`,
    ].join("\n");
  }

  private riskEmoji(level: string): string {
    switch (level) {
      case "critical": return "🚨";
      case "high": return "⚠️";
      case "medium": return "⚡";
      default: return "✅";
    }
  }

  private riskInterpretation(level: string): string {
    switch (level) {
      case "critical":
        return "This change carries significant risk of production impact. Strongly consider splitting into smaller changes, adding feature flags, and involving senior reviewers.";
      case "high":
        return "This change has elevated risk. Review the failure predictions and remediation suggestions carefully. Consider canary deployment.";
      case "medium":
        return "Moderate risk detected. Follow the test plan and reviewer recommendations to ensure safe deployment.";
      default:
        return "Low risk change. Standard review and deployment process is sufficient.";
    }
  }
}

export const markdownReporter = new MarkdownReporter();
