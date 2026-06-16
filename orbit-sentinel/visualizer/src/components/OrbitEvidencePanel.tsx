import React from "react";
import type { OrbitQueryEvidence } from "../types";

const META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  TRAVERSAL:    { icon: "🔍", label: "Traversal",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  AGGREGATION:  { icon: "📊", label: "Aggregation",  color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  PATH_FINDING: { icon: "🔗", label: "Path Finding", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  NEIGHBORS:    { icon: "🌐", label: "Neighbors",    color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

export default function OrbitEvidencePanel({ evidence }: { evidence: OrbitQueryEvidence[] }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.05s ease both", height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>🛰️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Evidence</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{evidence.length} queries · no black box</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {evidence.map((q, i) => {
          const m = META[q.queryType] ?? { icon: "📌", label: q.queryType, color: "#8b949e", bg: "rgba(255,255,255,0.04)" };
          return (
            <div key={q.queryType} style={{
              padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${m.color}`,
              animation: `fadeSlideUp 0.4s ${0.15 + i * 0.08}s ease both`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span>{m.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: m.color, padding: "1px 7px", borderRadius: 4, background: m.bg, letterSpacing: "0.4px" }}>{m.label}</span>
                <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{q.queryName}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, whiteSpace: "pre-line" }}>{q.result}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
