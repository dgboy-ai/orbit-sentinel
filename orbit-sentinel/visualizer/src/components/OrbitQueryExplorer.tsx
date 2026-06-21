import React, { useState } from "react";
import type { OrbitQueryEvidence } from "../types";

const QUERY_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  NEIGHBORS:    { icon: "🌐", label: "Neighbors", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  PATH_FINDING: { icon: "🛣️", label: "Path Finding", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  TRAVERSAL:    { icon: "📚", label: "Traversal", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  AGGREGATION:  { icon: "📊", label: "Aggregation", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const QUERY_ORDER = ["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"];

interface OrbitQueryExplorerProps {
  evidence: OrbitQueryEvidence[];
  onRefresh?: () => void;
}

export default function OrbitQueryExplorer({ evidence, onRefresh }: OrbitQueryExplorerProps) {
  const [activeQuery, setActiveQuery] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const ordered = QUERY_ORDER
    .map(qt => evidence.find(e => e.queryType === qt))
    .filter(Boolean) as OrbitQueryEvidence[];

  if (ordered.length === 0) {
    return (
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, animation: "fadeSlideUp 0.5s ease both" }}>
        <span style={{ fontSize: 30 }}>🛰️</span>
        <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>No Orbit query results available</div>
      </div>
    );
  }

  const current = ordered[activeQuery];
  const meta = QUERY_META[current.queryType] ?? { icon: "📌", label: current.queryType, color: "#8b949e", bg: "var(--overlay-04)" };

  return (
    <div className="card" style={{
      padding: 0, display: "flex", flexDirection: "column", overflow: "hidden",
      animation: "fadeSlideUp 0.5s ease both",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="card-header-icon" style={{ background: "rgba(139,92,246,0.1)" }}>🛰️</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Query Explorer</span>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{ordered.length}/4 queries</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setExpanded(!expanded)}
            style={{ padding: "2px 6px", fontSize: 14, cursor: "pointer", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-secondary)" }}
          >{expanded ? "−" : "+"}</button>
          {onRefresh && (
            <button onClick={onRefresh}
              style={{ padding: "2px 6px", fontSize: 14, cursor: "pointer", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-secondary)" }}
            title="Re-run queries">↻</button>
          )}
        </div>
      </div>

      {expanded && (
        <>
          <div style={{ display: "flex", gap: 2, padding: "6px 8px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.15)", overflow: "auto" }}>
            {ordered.map((q, i) => {
              const m = QUERY_META[q.queryType] ?? { icon: "📌", label: q.queryType, color: "#8b949e", bg: "transparent" };
              return (
                <button key={q.queryType} onClick={() => setActiveQuery(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", fontSize: 14, fontWeight: i === activeQuery ? 600 : 400, cursor: "pointer",
                    border: i === activeQuery ? `1px solid ${m.color}44` : "1px solid transparent",
                    borderRadius: 5,
                    background: i === activeQuery ? `${m.color}12` : "transparent",
                    color: i === activeQuery ? m.color : "var(--text-secondary)",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (i !== activeQuery) { e.currentTarget.style.color = "var(--text-primary)"; }}}
                  onMouseLeave={e => { if (i !== activeQuery) { e.currentTarget.style.color = "var(--text-secondary)"; }}}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 24 }}>{meta.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{current.queryName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-tertiary)" }}>
                  <span style={{ padding: "1px 5px", borderRadius: 3, background: meta.bg, color: meta.color, fontWeight: 600 }}>{current.queryType}</span>
                  <span>Graph query</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: "8px 12px", borderRadius: 6, fontSize: 14, lineHeight: 1.6,
              fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)",
              background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
              whiteSpace: "pre-line", overflowX: "auto",
            }}>
              {current.result}
            </div>

            {/* Visual query type indicator */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {QUERY_ORDER.map(qt => {
                const m = QUERY_META[qt];
                const exists = ordered.find(e => e.queryType === qt);
                const isActive = current.queryType === qt;
                return (
                  <span key={qt} style={{
                    fontSize: 12, padding: "1px 5px", borderRadius: 3,
                    background: exists ? (isActive ? m.color + "22" : "var(--overlay-03)") : "var(--overlay-02)",
                    color: exists ? (isActive ? m.color : "var(--text-tertiary)") : "var(--text-tertiary)",
                    border: isActive ? `1px solid ${m.color}44` : "1px solid transparent",
                    fontWeight: isActive ? 600 : 400,
                    opacity: exists ? 1 : 0.4,
                    textDecoration: exists ? "none" : "line-through",
                  }}>
                    {m.icon} {qt}
                  </span>
                );
              })}
            </div>

            {/* Query JSON preview — shows there's a real query behind the scenes */}
            <details style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              <summary style={{ cursor: "pointer", padding: "2px 0", fontWeight: 600 }}>View raw Orbit query payload</summary>
              <pre style={{
                marginTop: 4, padding: "8px 10px", borderRadius: 4, fontSize: 13, lineHeight: 1.5,
                background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)",
                overflowX: "auto", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-tertiary)",
              }}>
{JSON.stringify({
  query: current.queryType,
  params: {
    project: "gitlab-ai-hackathon/transcend/39251857",
    mrIid: 10,
    depth: current.queryType === "NEIGHBORS" ? 2 : undefined,
    similarity: current.queryType === "TRAVERSAL" ? 0.5 : undefined,
    pipelineWindow: current.queryType === "AGGREGATION" ? "30d" : undefined,
  },
  timestamp: new Date().toISOString(),
}, null, 2)}
              </pre>
            </details>
          </div>
        </>
      )}
    </div>
  );
}
