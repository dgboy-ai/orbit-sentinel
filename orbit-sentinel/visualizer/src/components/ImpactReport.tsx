import React from "react";
import type { VisualizationData } from "../types";
import { riskScoreToColor, riskScoreToGlow } from "../utils/colors";

interface Props { data: VisualizationData }

function scoreFromSummary(riskScore: string): number {
  return Number(riskScore.replace("%", "")) / 100;
}

export default function ImpactReport({ data }: Props) {
  const { summary, hero, evidence, decisionCenter, incidents, counterfactuals } = data;
  const score = scoreFromSummary(summary.riskScore);
  const color = riskScoreToColor(score);

  const sections = [
    {
      title: "Executive Summary",
      content: hero.predictedOutcome,
    },
    {
      title: "Engineering Digital Twin",
      content: `Digital twin constructed from GitLab Orbit: ${summary.totalNodes} nodes, ${summary.totalEdges} edges across the project graph. Used traversal, aggregation, path_finding, and neighbors queries against project ${summary.project}.`,
    },
    {
      title: "Blast Radius",
      content: evidence[0]?.result ?? "No blast radius data available.",
    },
    {
      title: "Failure Predictions",
      content: evidence.slice(1).map(e => `• ${e.queryName} (${e.queryType}): ${e.result.split("\n")[0]}`).join("\n"),
    },
    {
      title: "Historical Context",
      content: incidents.length > 0
        ? incidents.map(i => `• !${i.mrIid} — ${i.title} (${i.similarity}% similarity, ${i.outcome})`).join("\n")
        : "No similar historical incidents found.",
    },
    {
      title: "Reviewer Recommendations",
      content: decisionCenter.reviewers.map(r => `• ${r.name} — ${r.role}`).join("\n"),
    },
    {
      title: "Deployment Strategy",
      content: decisionCenter.deploymentStrategy,
    },
    {
      title: "Rollback Plan",
      content: decisionCenter.rollbackStrategy,
    },
    {
      title: "Test Plan",
      content: decisionCenter.requiredTests.map(t => `• ${t}`).join("\n"),
    },
    {
      title: "Remediations",
      content: counterfactuals.map(c => `• ${c.label}: reduces risk to ${(c.riskAfter * 100).toFixed(0)}%`).join("\n"),
    },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="card" style={{ padding: 20, animation: "fadeSlideDown 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div className="card-header-icon" style={{ background: `${color}18` }}>🛰️</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Orbit Sentinel Report — MR !{summary.mrIid}</h2>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Project: {summary.project} · Branch: {summary.branch}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${riskScoreToGlow(score)}` }}>{summary.riskScore}</div>
            <div style={{ padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", background: `${color}18`, color, border: `1px solid ${color}25`, display: "inline-block" }}>{summary.riskLevel}</div>
          </div>
        </div>
      </div>

      {sections.map((sec, i) => (
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
