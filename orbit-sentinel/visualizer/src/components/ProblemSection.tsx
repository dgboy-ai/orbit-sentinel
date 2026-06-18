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
    bg: "rgba(239,68,68,0.03)",
    border: "rgba(239,68,68,0.1)",
  },
  {
    icon: "🛰️",
    title: "Orbit Sentinel",
    items: [
      "4 Orbit queries build a digital twin of every MR in seconds",
      "Predicts outcomes using repository memory, not just pipeline status",
      "Posts remediation before time is wasted on dead-end changes",
    ],
    color: "#22c55e",
    bg: "rgba(34,197,94,0.03)",
    border: "rgba(34,197,94,0.1)",
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
    bg: "rgba(96,165,250,0.03)",
    border: "rgba(96,165,250,0.1)",
  },
];

export default function ProblemSection() {
  return (
    <div className="card" style={{
      padding: "14px 16px",
      borderColor: "rgba(139,92,246,0.08)",
      background: "linear-gradient(135deg, rgba(139,92,246,0.03), rgba(15,18,26,0.95))",
      animation: "fadeSlideUp 0.5s 0.1s ease both",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 250, height: 250, borderRadius: "50%", background: "rgba(139,92,246,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🎯</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>From Problem to Solution</div>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginLeft: "auto" }}>Why Orbit Sentinel exists</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PROBLEM_SOLUTION.map((col, i) => (
            <div key={col.title} style={{
              padding: "10px 12px", borderRadius: 8,
              background: col.bg,
              border: `1px solid ${col.border}`,
              animation: `fadeSlideUp 0.35s ${0.1 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{col.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: col.color, letterSpacing: "0.2px" }}>{col.title}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {col.items.map((item, j) => (
                  <div key={j} style={{
                    fontSize: 9.5, color: "var(--text-secondary)", lineHeight: 1.35,
                    padding: "3px 0 3px 8px",
                    borderLeft: `1.5px solid ${col.color}22`,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 8, padding: "4px 10px", borderRadius: 6,
          background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.06)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ fontSize: 10 }}>🏆</span>
          <span style={{ fontSize: 8.5, color: "var(--text-tertiary)", lineHeight: 1.35 }}>
            Built for <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>GitLab Transcend Hackathon</span> — 4 Orbit query types + Duo skill
          </span>
        </div>
      </div>
    </div>
  );
}
