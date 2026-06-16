import React, { useState } from "react";
import type { GraphNode, GraphLink } from "../types";
import { findConnectedComponents, filterNodesByType } from "../utils/graph";
import { NODE_COLORS, riskScoreToColor, riskScoreToGlow } from "../utils/colors";
import { RISK } from "../utils/colors";

interface Props { graph: { nodes: GraphNode[]; links: GraphLink[] } }

export default function BlastRadiusExplorer({ graph }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [depth, setDepth] = useState(3);
  const services = filterNodesByType(graph.nodes, ["Service", "Project"]);
  const sel = selectedNode ? graph.nodes.find(n => n.id === selectedNode) : null;
  const br = selectedNode ? findConnectedComponents(graph.nodes, graph.links, selectedNode, depth) : null;

  return (
    <div className="card" style={{ padding: 20, display: "flex", gap: 16, height: "100%", animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Select Component</div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 2 }}>Blast Radius Depth</div>
          <input type="range" min={1} max={5} value={depth} onChange={e => setDepth(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent-blue)" }} />
          <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{depth} hops</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, overflow: "auto" }}>
          {services.map(n => {
            const riskColor = n.riskLevel ? riskScoreToColor(n.riskLevel === "critical" ? 0.9 : n.riskLevel === "high" ? 0.6 : n.riskLevel === "medium" ? 0.3 : 0.1) : NODE_COLORS[n.type] ?? "#666";
            const isActive = selectedNode === n.id;
            return (
              <button key={n.id} onClick={() => setSelectedNode(n.id)}
                style={{
                  padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 12,
                  background: isActive ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s ease",
                }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: riskColor, display: "inline-block",
                  boxShadow: n.riskLevel === "critical" ? `0 0 6px ${riskScoreToGlow(0.9)}` : undefined }} />
                {n.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 4px", overflow: "auto" }}>
        {br ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div className="card-header-icon" style={{ background: "rgba(249,115,22,0.12)" }}>💥</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Blast Radius: {sel?.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{br.nodes.length} nodes · {br.links.length} edges</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>Affected Nodes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {br.nodes.map(n => {
                    const rc = n.riskLevel ? riskScoreToColor(n.riskLevel === "critical" ? 0.9 : n.riskLevel === "high" ? 0.6 : 0.3) : NODE_COLORS[n.type] ?? "#666";
                    return (
                      <div key={n.id} style={{ padding: "5px 8px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: NODE_COLORS[n.type] ?? "#666", display: "inline-block" }} />
                        <span style={{ color: "var(--text-secondary)", marginRight: 2 }}>{n.type}:</span> {n.label}
                        {n.riskLevel && (
                          <span style={{ marginLeft: "auto", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: `${rc}22`, color: rc, fontWeight: 600 }}>{n.riskLevel}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>Dependency Chains</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {br.links.slice(0, 20).map((link, i) => {
                    const sl = typeof link.source === "string" ? graph.nodes.find(n => n.id === link.source)?.label ?? link.source : (link.source as GraphNode).label;
                    const tl = typeof link.target === "string" ? graph.nodes.find(n => n.id === link.target)?.label ?? link.target : (link.target as GraphNode).label;
                    return (
                      <div key={i} style={{ padding: "3px 6px", fontSize: 10, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {sl} <span style={{ color: "var(--text-tertiary)" }}>→</span> {tl}
                      </div>
                    );
                  })}
                  {br.links.length > 20 && <div style={{ fontSize: 10, color: "var(--text-tertiary)", padding: 2 }}>... and {br.links.length - 20} more</div>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: 13 }}>
            Select a component to explore its blast radius
          </div>
        )}
      </div>
    </div>
  );
}
