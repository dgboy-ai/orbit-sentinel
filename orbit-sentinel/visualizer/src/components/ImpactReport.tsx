import React from "react";
import { riskScoreToColor } from "../utils/colors";

interface Props {
  summary: Record<string, string | number>;
}

export default function ImpactReport({ summary }: Props) {
  const reportSections = [
    {
      title: "🚨 Executive Summary",
      content: `Change to auth_service.ts introduces HIGH risk (72.0%) of production impact. 4 failure modes predicted. 3 historical incidents found.`,
    },
    {
      title: "🔄 Engineering Digital Twin",
      content: `Digital twin constructed from GitLab Orbit: 20 nodes, 22 edges across 8 entity types. Used traversal, aggregation, path_finding, and neighbors queries.`,
    },
    {
      title: "💥 Blast Radius",
      content: `3 services affected (AuthService, UserService, PaymentService). 6 transitive files impacted. 2 pipelines at risk. 2 deployment targets (Production, Staging).`,
    },
    {
      title: "🔮 Failure Predictions",
      content: `1. 🔴 Downstream breakage — AuthService changes may break 3 consumers (72% probability)\n2. 🟠 Pipeline failure — Pipeline #8921 has 4 recent failures (45% probability)\n3. 🟠 Historical incident recurrence — MR #184 caused incident #42 (60% probability)\n4. 🟡 Merge conflict — 2 open MRs touch overlapping files (25% probability)`,
    },
    {
      title: "📜 Historical Context",
      content: `MR #184: Auth token validation change caused production failures in 3 downstream services (87% similarity).\nMR #156: Similar refactor succeeded with feature flag gating (72% similarity).\nMR #118: OAuth migration caused incident #42 (58% similarity).`,
    },
    {
      title: "👥 Reviewer Recommendations",
      content: `1. @alice — AuthService expert, authored 12 related MRs\n2. @bob — Reviewed 8 auth-related changes, low workload\n3. @charlie — Pipeline reliability specialist`,
    },
    {
      title: "🔙 Rollback Plan",
      content: `Strategy: Feature Flag Gating\n1. Deploy with feature flag (default: off)\n2. Enable for 5% traffic → 10 min observation\n3. Ramp to 25% → 50% → 100% over 1 hour\n4. Disable flag immediately if error rate increases\nEstimated time: 1-2 hours`,
    },
    {
      title: "🧪 Test Plan",
      content: `Unit: tests/unit/test_auth_service.py, tests/unit/test_token_validator.py\nIntegration: tests/integration/test_auth_service_integration.py\nE2E: cypress/e2e/auth_workflow.cy.ts\nCoverage: 100% of changed files, 80% integration paths`,
    },
    {
      title: "🔧 Remediations",
      content: `1. 🚩 Feature flag — Wrap auth changes behind a flag (critical)\n2. 🔧 Fix MR — Prepare downstream fix for UserService\n3. 🧪 Test — Add regression tests for JWT token validation\n4. ⚙️ Config — Add canary deployment stage`,
    },
  ];

  return (
    <div style={{
      maxWidth: 800,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{
        background: "#161b22",
        borderRadius: 8,
        border: "1px solid #30363d",
        padding: 20,
        marginBottom: 4,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18, color: "#e6edf3", margin: 0 }}>
              Orbit Sentinel Report — MR !{summary.mrIid}
            </h2>
            <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>
              Project: {String(summary.project)} | Branch: {String(summary.branch)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: riskScoreToColor(
                typeof summary.riskScore === "string"
                  ? Number(summary.riskScore.replace("%", "")) / 100
                  : (summary.riskScore as number),
              ),
            }}>
              {summary.riskScore}
            </div>
            <div style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 4,
              background: `${riskScoreToColor(
                typeof summary.riskScore === "string"
                  ? Number(summary.riskScore.replace("%", "")) / 100
                  : (summary.riskScore as number),
              )}22`,
              color: riskScoreToColor(
                typeof summary.riskScore === "string"
                  ? Number(summary.riskScore.replace("%", "")) / 100
                  : (summary.riskScore as number),
              ),
            }}>
              {String(summary.riskLevel)}
            </div>
          </div>
        </div>
      </div>

      {reportSections.map((section) => (
        <div key={section.title} style={{
          background: "#161b22",
          borderRadius: 8,
          border: "1px solid #30363d",
          padding: 16,
        }}>
          <h3 style={{ fontSize: 14, color: "#e6edf3", marginBottom: 8 }}>
            {section.title}
          </h3>
          <div style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {section.content}
          </div>
        </div>
      ))}

      <div style={{
        textAlign: "center",
        padding: 24,
        color: "#8b949e",
        fontSize: 14,
        fontWeight: 500,
      }}>
        Predicted before merge. Prevented before production.
      </div>
    </div>
  );
}
