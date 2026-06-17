import React from "react";

const PROBLEM_SOLUTION = [
  {
    icon: "🤔",
    title: "The Problem",
    items: [
      "~45 min manual blast radius review per MR — still misses critical blockers",
      "CI checks if code builds — never asks if it <em>should</em> deploy",
      "Historical failures invisible at merge time",
    ],
    color: "#ef4444",
  },
  {
    icon: "🛰️",
    title: "Orbit Sentinel Solution",
    items: [
      "4 Orbit queries build a digital twin of every MR in seconds",
      "Predicts outcomes using repository memory, not just pipeline status",
      "Posts remediation before time is wasted on dead-end changes",
    ],
    color: "#22c55e",
  },
  {
    icon: "📊",
    title: "Quantified Impact",
    items: [
      "4 query cross-reference reduces false positives vs. CI-only alerts",
      "Historical pattern matching surfaces likely outcomes instantly",
      "Deployment blocked detected in seconds vs. ~45 min manual review",
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
          marginTop: 10, padding: "5px 12px", borderRadius: 6,
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)",
          fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>🏆</span>
          <span>Built for <strong style={{ color: "var(--text-primary)" }}>GitLab Transcend Hackathon</strong> — demonstrates all 4 Orbit query types + publishes a GitLab Duo skill</span>
        </div>
      </div>
    </div>
  );
}
