import React from "react";
import type { GraphNode, GraphLink, OrbitQueryEvidence } from "../types";

const META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  TRAVERSAL:    { icon: "📚", label: "Historical Intelligence", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  AGGREGATION:  { icon: "📊", label: "Ecosystem Analysis", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  PATH_FINDING: { icon: "🛣", label: "Dependency Trace", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  NEIGHBORS:    { icon: "🌐", label: "Orbit Graph Discovery", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

export default function OrbitEvidencePanel({ evidence, graph }: { evidence: OrbitQueryEvidence[]; graph?: { nodes: GraphNode[]; links: GraphLink[] } }) {
  const pf = evidence.find(e => e.queryType === "PATH_FINDING");
  const r = pf?.result.toLowerCase() ?? "";
  const conclusion = r.includes("no deployment path") || r.includes("cannot deploy")
    ? `This MR has no path to production. Graph: ${graph?.nodes.length ?? "?"} nodes, ${graph?.links.length ?? "?"} relationships.`
    : "Orbit analysis complete — see per-query results below.";

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.05s ease both", height: "100%", overflow: "auto", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, borderRadius: "50%", background: "rgba(96,165,250,0.06)", filter: "blur(60px)", pointerEvents: "none", transform: "translate(20%, -20%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>🛰️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Evidence</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{evidence.length} queries · no black box</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {evidence.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 6, padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 18 }}>🛰️</span>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>No evidence available</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.4 }}>Orbit query results have not been loaded yet. Select a component or trigger a demo to see evidence.</div>
          </div>
        )}
        {evidence.map((q, i) => {
          const m = META[q.queryType] ?? { icon: "📌", label: q.queryType, color: "#8b949e", bg: "rgba(255,255,255,0.04)" };
          return (
            <div key={q.queryName} style={{
              padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${m.color}`,
              animation: `fadeSlideUp 0.4s ${0.15 + i * 0.08}s ease both`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span>{m.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: m.color, padding: "1px 7px", borderRadius: 4, background: m.bg, letterSpacing: "0.3px" }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5, whiteSpace: "pre-line" }}>{q.result}</div>
            </div>
          );
        })}
        <div style={{
          marginTop: "auto", padding: "10px 14px", borderRadius: 8,
          background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
          animation: "fadeSlideUp 0.4s 0.5s ease both",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 3 }}>Conclusion</div>
          <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.4 }}>
            {conclusion}
          </div>
        </div>
      </div>
    </div>
  );
}
