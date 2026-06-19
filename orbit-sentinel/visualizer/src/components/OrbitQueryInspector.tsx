import React, { useState, useMemo } from "react";
import type { OrbitQueryEvidence, QueryTimingInfo } from "../types";

const QUERY_COLORS: Record<string, string> = {
  NEIGHBORS: "#22c55e",
  PATH_FINDING: "#f97316",
  TRAVERSAL: "#60a5fa",
  AGGREGATION: "#a78bfa",
};

const QUERY_ICONS: Record<string, string> = {
  NEIGHBORS: "🌐",
  PATH_FINDING: "🛣️",
  TRAVERSAL: "📚",
  AGGREGATION: "📊",
};

interface Props {
  evidence: OrbitQueryEvidence[];
  timings?: QueryTimingInfo[];
}

function parseMetrics(result: string): { nodes: number | null; edges: number | null } {
  const n = result.match(/Nodes:\s*(\d+)/);
  const e = result.match(/Edges:\s*(\d+)/);
  return {
    nodes: n ? Number(n[1]) : null,
    edges: e ? Number(e[1]) : null,
  };
}

export default function OrbitQueryInspector({ evidence, timings }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const timingMap = useMemo(() => {
    const m = new Map<string, QueryTimingInfo>();
    if (timings) timings.forEach(t => m.set(t.queryType, t));
    return m;
  }, [timings]);

  return (
    <div className="card" style={{ overflow: "hidden", animation: "fadeSlideUp 0.5s ease both" }}>
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(96,165,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔍</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Query Inspector</div>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>Raw GraphQL query results from all 4 Orbit query types</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setShowRaw(!showRaw)} style={{
              padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600,
              background: showRaw ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)",
              color: showRaw ? "#60a5fa" : "var(--text-secondary)",
              border: `1px solid ${showRaw ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer", fontFamily: "inherit",
            }}>Raw JSON</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {evidence.map((ev, i) => {
          const isOpen = expanded === ev.queryType;
          const t = timingMap.get(ev.queryType);
          const metrics = parseMetrics(ev.result);
          const color = QUERY_COLORS[ev.queryType] ?? "#8b949e";

          return (
            <div key={ev.queryType} style={{
              borderBottom: i < evidence.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <button onClick={() => setExpanded(isOpen ? null : ev.queryType)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", background: "none", border: "none",
                cursor: "pointer", color: "var(--text-primary)", fontFamily: "inherit",
                fontSize: 11, textAlign: "left",
              }}>
                <span style={{ fontSize: 14 }}>{QUERY_ICONS[ev.queryType] ?? "📌"}</span>
                <span style={{
                  padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 700,
                  background: `${color}18`, color,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.3px",
                }}>{ev.queryType}</span>
                <span style={{ flex: 1, fontSize: 10, fontWeight: 500, color: "var(--text-secondary)" }}>{ev.queryName}</span>

                {metrics.nodes !== null && (
                  <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {metrics.nodes}n · {metrics.edges}e
                  </span>
                )}
                {t && (
                  <span style={{
                    padding: "1px 5px", borderRadius: 3, fontSize: 8, fontWeight: 600,
                    background: t.durationMs > 400 ? "rgba(249,115,22,0.1)" : "rgba(34,197,94,0.1)",
                    color: t.durationMs > 400 ? "#fb923c" : "#22c55e",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{t.durationMs}ms</span>
                )}
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▾</span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 12px" }}>
                  <div style={{
                    padding: 10, borderRadius: 6, background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    color: "var(--text-secondary)", lineHeight: 1.6,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {showRaw ? JSON.stringify(ev, null, 2) : ev.result}
                  </div>

                  {t && (
                    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 9, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                      <span>Duration: <span style={{ color: "#22c55e", fontWeight: 600 }}>{t.durationMs}ms</span></span>
                      {t.nodeCount > 0 && <span>Nodes: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{t.nodeCount}</span></span>}
                      {t.edgeCount > 0 && <span>Edges: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{t.edgeCount}</span></span>}
                      <span>Status: <span style={{ color: t.status === "success" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{t.status}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {evidence.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", fontSize: 10, color: "var(--text-tertiary)" }}>
          No Orbit query data available
        </div>
      )}
    </div>
  );
}
