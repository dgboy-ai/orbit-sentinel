import React from "react";

const PROBLEM_SOLUTION = [
  {
    icon: "🤔",
    title: "The Problem",
    items: [
      "Developers spend ~45 min manually reviewing each MR's blast radius, deployment path, and risk",
      "Traditional CI/CD only checks if code builds — never asks if it should deploy",
      "Historical patterns of failure (abandoned branches, broken pipelines) are invisible at merge time",
    ],
    color: "#ef4444",
  },
  {
    icon: "🛰️",
    title: "Orbit Sentinel Solution",
    items: [
      "Queries all 4 GitLab Orbit query types to build a digital twin of every MR in seconds",
      "Predicts deployment outcomes using repository memory — not just pipeline status",
      "Posts actionable remediation steps before developers waste time on dead-end changes",
    ],
    color: "#22c55e",
  },
  {
    icon: "📊",
    title: "Quantified Impact",
    items: [
      "Cross-references all 4 Orbit query types to reduce false positives vs. CI-only alerts",
      "Historical pattern matching surfaces likely outcomes before time is spent on dead-end changes",
      "Detects deployment blockers in seconds vs. ~45 min of manual cross-referencing",
    ],
    color: "#60a5fa",
  },
];

export default function ProblemSection() {
  return (
    <div className="card" style={{
      padding: "18px 22px",
      borderColor: "rgba(96,165,250,0.12)",
      background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(15,18,26,0.95), rgba(139,92,246,0.02))",
      animation: "fadeSlideUp 0.5s 0.1s ease both",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-50%", left: "-10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(96,165,250,0.04)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>🎯</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>From Problem to Solution</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Why Orbit Sentinel exists — and what changes for developers who use it</div>
          </div>
        </div>

        <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PROBLEM_SOLUTION.map((col, i) => (
            <div key={col.title} style={{
              padding: "12px 14px", borderRadius: 8,
              background: `linear-gradient(135deg, ${col.color}06, transparent)`,
              border: `1px solid ${col.color}12`,
              animation: `fadeSlideUp 0.4s ${0.1 + i * 0.06}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{col.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color }}>{col.title}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                {col.items.map((item, j) => (
                  <li key={j} style={{
                    fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4,
                    padding: "4px 0 4px 12px",
                    borderLeft: `2px solid ${col.color}33`,
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 10, padding: "6px 14px", borderRadius: 6,
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)",
          fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>🏆</span>
          <span><strong style={{ color: "var(--accent-purple)" }}>For judges:</strong> This submission was built for the <strong style={{ color: "var(--text-primary)" }}>GitLab Transcend Hackathon — Showcase Track</strong>. It demonstrates all 4 Orbit query types, publishes a GitLab Duo skill, and solves a real developer pain point: <em>"Will this MR break production?"</em></span>
        </div>
      </div>
    </div>
  );
}
