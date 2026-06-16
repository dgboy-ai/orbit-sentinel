import React from "react";
import { riskScoreToColor, riskScoreToGlow, riskScoreToGradient } from "../utils/colors";

interface Props { summary: Record<string, string | number> }

const SECTIONS = [
  { title: "🚨 Executive Summary", content: "Change to auth_service.ts introduces HIGH risk (72.0%) of production impact. 4 failure modes predicted. 3 historical incidents found." },
  { title: "🔄 Engineering Digital Twin", content: "Digital twin constructed from GitLab Orbit: 20 nodes, 22 edges across 8 entity types. Used traversal, aggregation, path_finding, and neighbors queries." },
  { title: "💥 Blast Radius", content: "3 services affected (AuthService, UserService, PaymentService). 6 transitive files impacted. 2 pipelines at risk. 2 deployment targets (Production, Staging)." },
  { title: "🔮 Failure Predictions", content: "1. 🔴 Downstream breakage — AuthService changes may break 3 consumers (72% probability)\n2. 🟠 Pipeline failure — Pipeline #8921 has 4 recent failures (45% probability)\n3. 🟠 Historical incident recurrence — MR #184 caused incident #42 (60% probability)\n4. 🟡 Merge conflict — 2 open MRs touch overlapping files (25% probability)" },
  { title: "📜 Historical Context", content: "MR #184: Auth token validation change caused production failures in 3 downstream services (87% similarity).\nMR #156: Similar refactor succeeded with feature flag gating (72% similarity).\nMR #118: OAuth migration caused incident #42 (58% similarity)." },
  { title: "👥 Reviewer Recommendations", content: "1. @alice — AuthService expert, authored 12 related MRs\n2. @bob — Reviewed 8 auth-related changes, low workload\n3. @charlie — Pipeline reliability specialist" },
  { title: "🔙 Rollback Plan", content: "Strategy: Feature Flag Gating\n1. Deploy with feature flag (default: off)\n2. Enable for 5% traffic → 10 min observation\n3. Ramp to 25% → 50% → 100% over 1 hour\n4. Disable flag immediately if error rate increases\nEstimated time: 1-2 hours" },
  { title: "🧪 Test Plan", content: "Unit: tests/unit/test_auth_service.py, tests/unit/test_token_validator.py\nIntegration: tests/integration/test_auth_service_integration.py\nE2E: cypress/e2e/auth_workflow.cy.ts\nCoverage: 100% of changed files, 80% integration paths" },
  { title: "🔧 Remediations", content: "1. 🚩 Feature flag — Wrap auth changes behind a flag (critical)\n2. 🔧 Fix MR — Prepare downstream fix for UserService\n3. 🧪 Test — Add regression tests for JWT token validation\n4. ⚙️ Config — Add canary deployment stage" },
];

function scoreFromSummary(summary: Record<string, string | number>): number {
  const v = summary.riskScore;
  return typeof v === "string" ? Number(v.replace("%", "")) / 100 : (v as number);
}

export default function ImpactReport({ summary }: Props) {
  const score = scoreFromSummary(summary);
  const color = riskScoreToColor(score);
  const level = String(summary.riskLevel);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="card" style={{ padding: 20, animation: "fadeSlideDown 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div className="card-header-icon" style={{ background: `${color}18` }}>🛰️</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Orbit Sentinel Report — MR !{summary.mrIid}</h2>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Project: {String(summary.project)} · Branch: {String(summary.branch)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${riskScoreToGlow(score)}` }}>{summary.riskScore}</div>
            <div style={{ padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", background: `${color}18`, color, border: `1px solid ${color}25`, display: "inline-block" }}>{level}</div>
          </div>
        </div>
      </div>

      {SECTIONS.map((sec, i) => (
        <div key={sec.title} className="card" style={{ padding: 16, animation: `fadeSlideUp 0.4s ${0.05 + i * 0.03}s ease both`, transition: "all 0.2s ease" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{sec.title}</h3>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{sec.content}</div>
        </div>
      ))}

      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-tertiary)", fontSize: 13, fontWeight: 500, letterSpacing: "0.3px" }}>
        Predicted before merge. Prevented before production.
      </div>
    </div>
  );
}
