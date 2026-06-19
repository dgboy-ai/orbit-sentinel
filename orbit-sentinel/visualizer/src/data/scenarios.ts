import type { VisualizationData } from "../types";
import { DEMO_DATA } from "./demoData";

function clone(d: VisualizationData): VisualizationData {
  return JSON.parse(JSON.stringify(d));
}

export const SCENARIO_CRITICAL: VisualizationData = (() => {
  const d = clone(DEMO_DATA);
  d.hero.mrIid = 42;
  d.summary.mrIid = 42;
  d.hero.riskScore = 0.88;
  d.hero.riskLevel = "CRITICAL";
  d.hero.predictedOutcome = "Critical — pipeline failure expected. Dependency graph shows 7 downstream services at risk. Immediate rollback plan required.";
  d.hero.recommendedAction = "Block merge. Request security review, add integration tests, and notify downstream teams.";
  d.hero.confidence = "Very High (100+ MR history, 4 Orbit query types)";
  d.hero.confidenceFactors = [
    { label: "Historical Failures", value: "34 of 50 similar MRs failed", status: "error" as const },
    { label: "Pipeline Failure Rate", value: "78% on affected path", status: "error" as const },
    { label: "Downstream Risk", value: "7 services affected", status: "error" as const },
    { label: "Prediction Confidence", value: "94%", status: "success" as const },
  ];
  d.riskData.score = 0.88;
  d.riskData.level = "CRITICAL";
  d.riskData.breakdown = [
    { category: "Pipeline Failure Risk", value: 10, maxValue: 10 },
    { category: "Downstream Impact", value: 9, maxValue: 10 },
    { category: "No Rollback Plan", value: 8, maxValue: 10 },
    { category: "Insufficient Test Coverage", value: 8, maxValue: 10 },
    { category: "Missing Reviewer", value: 7, maxValue: 10 },
  ];
  d.evidence = [
    { queryType: "NEIGHBORS", queryName: "Orbit Graph", result: "Nodes: 47, Edges: 112\n12 node types discovered\n7 downstream services connected to changed files\n3 services have >80% dependency coupling" },
    { queryType: "PATH_FINDING", queryName: "MR-to-Pipeline Trace", result: "MR !42 → head pipeline #149283749 (failed)\nDeployment path: 3 hops to production\n2 of 3 deployment gates are RED" },
    { queryType: "TRAVERSAL", queryName: "Historical Similarity", result: "34 of 50 similar MRs (68%) resulted in pipeline failure\n3 prior incidents linked to same file patterns\nAverage recovery time: 47 minutes" },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: "189,000 total pipelines across the ecosystem\n43,200 failed (22.9%), 142,100 passed, 3,700 canceled\nAffected path failure rate: 78% (well above ecosystem average)" },
  ];
  d.incidents = [
    { similarity: 97, mrIid: 41, title: "critical-deploy-failure-3", files: ["src/api/gateway.ts", "deploy/config.yml"], outcome: "Incident", rootCause: "Missing rollback plan caused 23min production outage when deployment gate failed silently", mitigation: "Add mandatory rollback plan to all MRs modifying deploy config", recommendedAction: "Add comprehensive rollback plan and test deployment gates before merge", date: "2026-06-17" },
    { similarity: 89, mrIid: 38, title: "pipeline-dependency-breakage", files: ["src/api/gateway.ts"], outcome: "Rolled Back", rootCause: "Downstream service had breaking API change not reflected in test suite", mitigation: "Add contract tests for all downstream dependencies", recommendedAction: "Run integration test suite against all 7 downstream services", date: "2026-06-14" },
    { similarity: 82, mrIid: 35, title: "test-coverage-gap", files: ["src/api/gateway.ts", "src/auth/provider.ts"], outcome: "Bug Found in Production", rootCause: "Changed authentication path with no corresponding test coverage", mitigation: "Enforce 80% coverage minimum on all changed files", recommendedAction: "Add unit and integration tests for all changed modules", date: "2026-06-10" },
  ];
  d.counterfactuals = [
    { label: "Add Rollback Plan", riskAfter: 0.65, color: "#ef4444" },
    { label: "Add Integration Tests", riskAfter: 0.50, color: "#f97316" },
    { label: "Notify Downstream Teams", riskAfter: 0.42, color: "#eab308" },
    { label: "All Mitigations", riskAfter: 0.28, color: "#22c55e" },
  ];
  d.decisionCenter.deploymentStrategy = "BLOCKED — Critical risk score 88%. 7 downstream services affected. Pipeline already failed once. Do not merge without security review and rollback plan.";
  d.decisionCenter.requiredTests = ["Blocking: security review required", "Integration tests against all 7 downstream services", "Rollback plan documentation", "Pipeline must pass on retry"];
  d.summary.riskScore = "88.0%";
  d.summary.riskLevel = "CRITICAL";
  d.futureTimeline = [
    { day: 0, label: "MR Opened", description: "MR !42 — modifies API gateway and deploy config. 7 downstream services identified.", icon: "🚨" },
    { day: 1, label: "Pipeline Failed", description: "Head pipeline #149283749 failed at deploy gate. No rollback plan configured.", icon: "❌" },
    { day: 3, label: "Security Review", description: "Security review requested — 2 high-severity findings in authentication path.", icon: "🔒" },
    { day: 5, label: "Downstream Impact", description: "3 of 7 downstream services report breaking API contract changes.", icon: "💥" },
    { day: 7, label: "Predicted Outcome", description: "Merge blocked without remediation. Estimated 23min production outage if deployed as-is.", icon: "⛔" },
  ];
  return d;
})();

export const SCENARIO_SAFE: VisualizationData = (() => {
  const d = clone(DEMO_DATA);
  d.hero.mrIid = 7;
  d.summary.mrIid = 7;
  d.hero.riskScore = 0.15;
  d.hero.riskLevel = "LOW";
  d.hero.predictedOutcome = "Safe to deploy — all tests pass, reviewers approved, no downstream impact detected.";
  d.hero.recommendedAction = "Merge confidently. Monitor for 15 minutes post-deployment as standard precaution.";
  d.hero.confidence = "High (100% test pass rate, 2 reviewer approvals)";
  d.hero.confidenceFactors = [
    { label: "Test Pass Rate", value: "100% (247/247)", status: "success" as const },
    { label: "Reviewer Approvals", value: "2 of 2", status: "success" as const },
    { label: "Downstream Impact", value: "None detected", status: "success" as const },
    { label: "Prediction Confidence", value: "96%", status: "success" as const },
  ];
  d.riskData.score = 0.15;
  d.riskData.level = "LOW";
  d.riskData.breakdown = [
    { category: "Test Coverage", value: 2, maxValue: 10 },
    { category: "Pipeline Health", value: 1, maxValue: 10 },
    { category: "Review Quality", value: 1, maxValue: 10 },
    { category: "Downstream Risk", value: 2, maxValue: 10 },
    { category: "Deployment Readiness", value: 1, maxValue: 10 },
  ];
  d.evidence = [
    { queryType: "NEIGHBORS", queryName: "Orbit Graph", result: "Nodes: 12, Edges: 28\n4 node types discovered\nNo downstream services affected — change is fully isolated" },
    { queryType: "PATH_FINDING", queryName: "MR-to-Pipeline Trace", result: "MR !7 → head pipeline #149283750 (passed)\nDeployment path: 2 hops to production\nAll 2 deployment gates are GREEN" },
    { queryType: "TRAVERSAL", queryName: "Historical Similarity", result: "12 similar MRs found — all merged without incident\nNo prior failures on this file path\nAverage merge-to-deploy time: 4.2 minutes" },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: "189,000 total pipelines across the ecosystem\n43,200 failed (22.9%), 142,100 passed, 3,700 canceled\nThis file path: 0 failures in last 30 days" },
  ];
  d.incidents = [
    { similarity: 95, mrIid: 5, title: "clean-deployment-example", files: ["src/utils/format.ts"], outcome: "Merged & Deployed", rootCause: "N/A — no incidents. This is a reference example of a clean merge.", mitigation: "N/A", recommendedAction: "Use this MR as a template for future low-risk changes: isolated scope, full test coverage, early review.", date: "2026-06-16" },
    { similarity: 88, mrIid: 3, title: "routine-dependency-update", files: ["package.json", "pnpm-lock.yaml"], outcome: "Merged & Deployed", rootCause: "N/A — routine update with zero incidents", mitigation: "N/A", recommendedAction: "Standard dependency update cadence — no special action needed.", date: "2026-06-12" },
  ];
  d.counterfactuals = [
    { label: "Without Tests", riskAfter: 0.45, color: "#eab308" },
    { label: "Without Review", riskAfter: 0.50, color: "#f97316" },
    { label: "Both Missing", riskAfter: 0.72, color: "#ef4444" },
    { label: "Current (All Green)", riskAfter: 0.15, color: "#22c55e" },
  ];
  d.decisionCenter.deploymentStrategy = "Approved for deployment — risk score 15%. All checks passed, reviewers approved, downstream impact is zero. Standard deploy with monitoring.";
  d.decisionCenter.requiredTests = ["Post-deploy monitoring (15 min)", "Smoke test in production"];
  d.summary.riskScore = "15.0%";
  d.summary.riskLevel = "LOW";
  d.futureTimeline = [
    { day: 0, label: "MR Opened", description: "MR !7 — isolated change to utility module. No downstream dependencies.", icon: "📝" },
    { day: 1, label: "Pipeline Passed", description: "247/247 tests passed. All 2 deployment gates green.", icon: "✅" },
    { day: 2, label: "Review Approved", description: "2 reviewer approvals received within 4 hours.", icon: "👍" },
    { day: 3, label: "Ready to Merge", description: "All prerequisites met — safe to deploy at any time.", icon: "🚀" },
    { day: 4, label: "Predicted Outcome", description: "Deploy with confidence. Zero incidents expected based on historical patterns.", icon: "🎯" },
  ];
  return d;
})();

export interface ScenarioOption {
  id: "critical" | "medium" | "safe";
  label: string;
  icon: string;
  description: string;
  color: string;
  data: VisualizationData;
}

export const SCENARIOS: ScenarioOption[] = [
  {
    id: "critical",
    label: "Critical Risk",
    icon: "🔴",
    description: "Pipeline failed, 7 downstream services at risk, no rollback plan",
    color: "#ef4444",
    data: SCENARIO_CRITICAL,
  },
  {
    id: "medium",
    label: "Medium Risk",
    icon: "🟡",
    description: "Empty diff, no pipeline, abandoned branch pattern — needs attention",
    color: "#eab308",
    data: DEMO_DATA,
  },
  {
    id: "safe",
    label: "Low Risk",
    icon: "🟢",
    description: "All tests pass, reviewers approved, no downstream impact",
    color: "#22c55e",
    data: SCENARIO_SAFE,
  },
];
