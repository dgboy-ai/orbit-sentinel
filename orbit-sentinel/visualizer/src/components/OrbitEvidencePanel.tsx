import React from "react";
import type { GraphNode, GraphLink, OrbitQueryEvidence } from "../types";

const META: Record<string, { icon: string; label: string; color: string; bg: string; glow: string }> = {
  TRAVERSAL:    { icon: "📚", label: "Historical Intelligence", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", glow: "rgba(96,165,250,0.15)" },
  AGGREGATION:  { icon: "📊", label: "Ecosystem Analysis", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", glow: "rgba(167,139,250,0.15)" },
  PATH_FINDING: { icon: "🛣", label: "Dependency Trace", color: "#f97316", bg: "rgba(249,115,22,0.1)", glow: "rgba(249,115,22,0.15)" },
  NEIGHBORS:    { icon: "🌐", label: "Orbit Graph Discovery", color: "#22c55e", bg: "rgba(34,197,94,0.1)", glow: "rgba(34,197,94,0.15)" },
};

// Helper to highlight numbers in text
function formatResultLine(text: string, color: string) {
  const clean = text.replace(/^→\s*/, "");
  // Highlight numbers, percentages, and special states
  const parts = clean.split(/(\d+%?|\bNo linked pipeline\b|\bcannot deploy\b|\bno deployment path\b)/i);
  return parts.map((part, idx) => {
    const isNum = /\d+%?/.test(part);
    const isWarn = /No linked pipeline|cannot deploy|no deployment path/i.test(part);
    if (isNum) {
      return (
        <strong key={idx} style={{ color, textShadow: `0 0 8px ${color}60`, fontSize: 18, fontWeight: 800 }}>
          {part}
        </strong>
      );
    }
    if (isWarn) {
      return (
        <strong key={idx} style={{ color: "#ef4444", textShadow: "0 0 8px rgba(239,68,68,0.5)", fontSize: 16, fontWeight: 700 }}>
          {part}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function OrbitEvidencePanel({ evidence, graph }: { evidence: OrbitQueryEvidence[]; graph?: { nodes: GraphNode[]; links: GraphLink[] } }) {
  const pf = evidence.find(e => e.queryType === "PATH_FINDING");
  const r = pf?.result.toLowerCase() ?? "";
  const isAlert = r.includes("no deployment path") || r.includes("cannot deploy") || r.includes("no linked pipeline");
  const conclusion = isAlert
    ? `This MR has no path to production. Graph: ${graph?.nodes.length ?? "?"} nodes, ${graph?.links.length ?? "?"} relationships.`
    : "Orbit analysis complete — see per-query results below.";

  const conclusionColor = isAlert ? "#ef4444" : "#22c55e";

  return (
    <div className="card" style={{
      padding: 22, display: "flex", flexDirection: "column",
      animation: "fadeSlideUp 0.5s 0.05s ease both", height: "100%", overflow: "auto", position: "relative",
      borderColor: isAlert ? "rgba(239,68,68,0.2)" : "var(--overlay-08)",
      background: "linear-gradient(180deg, var(--bg-card), rgba(8,9,13,0.95))",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%",
        background: isAlert ? "rgba(239,68,68,0.05)" : "rgba(96,165,250,0.06)",
        filter: "blur(70px)", pointerEvents: "none", transform: "translate(20%, -20%)",
        transition: "background 0.3s ease",
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{
          background: isAlert ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.12)",
          border: `1px solid ${isAlert ? "rgba(239,68,68,0.25)" : "rgba(96,165,250,0.2)"}`,
          fontSize: 20,
        }}>🛰️</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>Orbit Evidence</div>
          <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>{evidence.length} queries · no black box</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {evidence.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 8, padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 30, animation: "float 6s ease-in-out infinite" }}>🛰️</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)" }}>No evidence available</div>
            <div style={{ fontSize: 14, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 220 }}>Orbit query results have not been loaded yet. Select a component or trigger a demo to see evidence.</div>
          </div>
        )}
        {evidence.map((q, i) => {
          const m = META[q.queryType] ?? { icon: "📌", label: q.queryType, color: "#8b949e", bg: "var(--overlay-04)", glow: "none" };
          const lines = q.result.split("\n").filter(l => l.trim().length > 0);
          return (
            <div key={q.queryName} style={{
              padding: "10px 14px", borderRadius: 8,
              background: `linear-gradient(135deg, ${m.color}05, rgba(0,0,0,0.2))`,
              border: "1px solid var(--overlay-06)",
              borderLeft: `4px solid ${m.color}`,
              boxShadow: `0 4px 14px rgba(0,0,0,0.25), 0 0 10px ${m.glow}`,
              animation: `fadeSlideUp 0.4s ${0.15 + i * 0.08}s ease both`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 19 }}>{m.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: m.color, padding: "2px 8px", borderRadius: 4, background: m.bg, letterSpacing: "0.5px", textTransform: "uppercase" }}>{m.label}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {lines.map((line, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "flex-start", gap: 6,
                    fontSize: 15.5, color: "var(--text-secondary)",
                    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5,
                  }}>
                    <span style={{ color: m.color, fontWeight: 700, userSelect: "none", marginTop: 2 }}>→</span>
                    <span style={{ flex: 1 }}>{formatResultLine(line, m.color)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* CONCLUSION BANNER: GLOWING AND BIGGER */}
        <div style={{
          marginTop: "auto", padding: "12px 16px", borderRadius: 8,
          background: `linear-gradient(135deg, ${conclusionColor}10, rgba(0,0,0,0.3))`,
          border: `1px solid ${conclusionColor}35`,
          boxShadow: `0 0 16px ${conclusionColor}15, inset 0 1px 0 rgba(255,255,255,0.03)`,
          animation: "fadeSlideUp 0.4s 0.5s ease both",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Inner pulsing indicator */}
          <div style={{
            position: "absolute", top: 12, right: 12, width: 6, height: 6, borderRadius: "50%",
            background: conclusionColor,
            boxShadow: `0 0 10px ${conclusionColor}`,
            animation: "pulseGlow 2s infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: conclusionColor, marginBottom: 4 }}>Conclusion</div>
          <div style={{ fontSize: 18, color: "var(--text-primary)", fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.1px" }}>
            {conclusion}
          </div>
        </div>
      </div>
    </div>
  );
}

