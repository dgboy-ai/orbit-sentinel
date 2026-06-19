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
    bg: "rgba(239,68,68,0.04)",
    border: "rgba(239,68,68,0.12)",
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
    bg: "rgba(34,197,94,0.04)",
    border: "rgba(34,197,94,0.12)",
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
    bg: "rgba(96,165,250,0.04)",
    border: "rgba(96,165,250,0.12)",
  },
];

export default function ProblemSection() {
  return (
    <div className="card" style={{
      padding: 0, overflow: "hidden",
      background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(15,18,26,0.98))",
      animation: "fadeSlideUp 0.5s 0.1s ease both",
      position: "relative",
      border: "1px solid rgba(139,92,246,0.1)",
    }}>
      <div style={{ position: "absolute", top: -120, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Hero Header */}
      <div style={{
        padding: "20px 20px 0 20px", position: "relative", zIndex: 1,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              border: "1px solid rgba(139,92,246,0.15)",
            }}>🎯</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>From Problem to Solution</div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 1 }}>
                4 Orbit queries · 8-step Duo flow · Digital twin in seconds
              </div>
            </div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 12px", borderRadius: 20,
          background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))",
          border: "1px solid rgba(139,92,246,0.15)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12 }}>🏆</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>GitLab Transcend Hackathon</span>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div style={{
        padding: "14px 20px 16px 20px", position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
      }}>
        {PROBLEM_SOLUTION.map((col, i) => (
          <div key={col.title} style={{
            padding: "14px 14px", borderRadius: 10,
            background: col.bg,
            border: `1px solid ${col.border}`,
            animation: `fadeSlideUp 0.4s ${0.15 + i * 0.06}s cubic-bezier(0.16,1,0.3,1) both`,
            display: "flex", flexDirection: "column", gap: 8,
            transition: "transform 0.2s, border-color 0.2s",
            boxShadow: `0 0 0 1px ${col.color}08`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${col.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = col.border; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: `${col.color}12`, border: `1px solid ${col.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>{col.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: col.color, letterSpacing: "0.3px", textTransform: "uppercase" }}>{col.title}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {col.items.map((item, j) => (
                <div key={j} style={{
                  fontSize: 10.5, color: "var(--text-secondary)", lineHeight: 1.4,
                  padding: "3px 0 3px 9px",
                  borderLeft: `2px solid ${col.color}25`,
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats Bar */}
      <div style={{
        padding: "8px 20px", position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(139,92,246,0.06)",
        background: "rgba(139,92,246,0.02)",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        {[
          { label: "Orbit Query Types", value: "4", color: "#a78bfa" },
          { label: "Digital Twin Nodes", value: "23", color: "#60a5fa" },
          { label: "Engine Tests", value: "124", color: "#34d399" },
          { label: "Time per MR", value: "~5m", color: "#fbbf24" },
        ].map(stat => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</span>
            <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 500 }}>{stat.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-tertiary)" }}>
          Built with TypeScript · React · Express · GitLab Orbit API
        </div>
      </div>
    </div>
  );
}
