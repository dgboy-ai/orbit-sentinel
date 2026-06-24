import React from "react";

interface ProblemCol {
  icon: string;
  title: string;
  isHero?: boolean;
  items: React.ReactNode[];
  color: string;
  bg: string;
  border: string;
}

const PROBLEM_SOLUTION: ProblemCol[] = [
  {
    icon: "🤔",
    title: "The Problem",
    items: [
      <span key={1}><strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Manual review</strong> per MR takes hours — still misses critical blockers</span>,
      <span key={2}>CI checks if code builds — <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>never asks if it should deploy</strong></span>,
      <span key={3}><strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Historical failures invisible</strong> at merge time, repeating past incidents</span>,
    ],
    color: "#ef4444",
    bg: "rgba(239,68,68,0.02)",
    border: "rgba(239,68,68,0.12)",
  },
  {
    icon: "🛰️",
    title: "Orbit Sentinel",
    isHero: true,
    items: [
      <span key={1}><strong style={{ color: "#c084fc", fontWeight: 700 }}>4 Orbit queries</strong> automatically build a digital twin of every MR in seconds</span>,
      <span key={2}>Predicts outcomes using <strong style={{ color: "#c084fc", fontWeight: 700 }}>repository memory</strong>, not just pipeline status</span>,
      <span key={3}>Posts <strong style={{ color: "#c084fc", fontWeight: 700 }}>proactive remediation</strong> before engineering time is wasted</span>,
    ],
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.3)",
  },
  {
    icon: "📊",
    title: "Quantified Impact",
    items: [
      <span key={1}><strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Context-rich alerts</strong> with cross-referenced graph evidence</span>,
      <span key={2}><strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Actionable remediation</strong> for every risk found</span>,
      <span key={3}>Deployment blocks detected in <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>seconds</strong> vs. traditional manual review</span>,
    ],
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.02)",
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
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              border: "1px solid rgba(139,92,246,0.15)",
            }}>🎯</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>From Problem to Solution</div>
              <div style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 1 }}>
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
          <span style={{ fontSize: 16 }}>🏆</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>GitLab Transcend Hackathon</span>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="resp-grid-3" style={{
        padding: "14px 20px 16px 20px", position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
      }}>
        {PROBLEM_SOLUTION.map((col, i) => {
          const isHero = col.isHero;
          return (
            <div key={col.title} style={{
              padding: "16px 16px", borderRadius: 10,
              background: col.bg,
              border: `1px solid ${col.border}`,
              animation: `fadeSlideUp 0.4s ${0.15 + i * 0.06}s cubic-bezier(0.16,1,0.3,1) both`,
              display: "flex", flexDirection: "column", gap: 8,
              transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: isHero 
                ? "0 0 30px rgba(139,92,246,0.15), inset 0 0 10px rgba(139,92,246,0.05)" 
                : `0 0 0 1px ${col.color}08`,
              position: "relative",
              transform: isHero ? "scale(1.02)" : "none",
              zIndex: isHero ? 2 : 1,
            }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = isHero ? "scale(1.04) translateY(-2px)" : "translateY(-2px)"; 
                e.currentTarget.style.borderColor = isHero ? "rgba(139,92,246,0.5)" : `${col.color}30`;
                if (isHero) e.currentTarget.style.boxShadow = "0 0 40px rgba(139,92,246,0.25)";
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = isHero ? "scale(1.02)" : "none"; 
                e.currentTarget.style.borderColor = col.border; 
                if (isHero) e.currentTarget.style.boxShadow = "0 0 30px rgba(139,92,246,0.15)";
              }}
            >
              {isHero && (
                <div style={{
                  position: "absolute", top: -8, right: 12,
                  padding: "2px 8px", borderRadius: 10,
                  background: "var(--accent-purple)", color: "#111827",
                  fontSize: 11.5, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.5px", boxShadow: "0 2px 10px rgba(167,139,250,0.4)"
                }}>
                  Recommended Solution
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: `${col.color}12`, border: `1px solid ${col.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                }}>{col.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: col.color, letterSpacing: "0.3px", textTransform: "uppercase" }}>{col.title}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {col.items.map((item, j) => (
                  <div key={j} style={{
                    fontSize: 15,
                    color: isHero ? "rgba(255,255,255,0.85)" : "var(--text-secondary)",
                    lineHeight: 1.45,
                    padding: "4px 0 4px 10px",
                    borderLeft: `2px solid ${isHero ? "rgba(167,139,250,0.4)" : `${col.color}25`}`,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar — tech stack only */}
      <div style={{
        padding: "8px 20px", position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(139,92,246,0.06)",
        background: "rgba(139,92,246,0.02)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Built with TypeScript · React · Express · GitLab Orbit API
        </span>
      </div>
    </div>
  );
}
