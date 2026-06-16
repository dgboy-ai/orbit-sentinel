import React, { useState } from "react";
import type { GraphNode, GraphLink } from "../types";
import { findConnectedComponents, filterNodesByType } from "../utils/graph";
import { getNodeColor, riskScoreToColor } from "../utils/colors";

interface Props {
  graph: { nodes: GraphNode[]; links: GraphLink[] };
}

export default function BlastRadiusExplorer({ graph }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [depth, setDepth] = useState(3);

  const services = filterNodesByType(graph.nodes, ["Service", "Project"]);
  const selectedComponent = selectedNode
    ? graph.nodes.find((n) => n.id === selectedNode)
    : null;

  const blastRadius = selectedNode
    ? findConnectedComponents(graph.nodes, graph.links, selectedNode, depth)
    : null;

  return (
    <div style={{ display: "flex", gap: 16, height: "100%" }}>
      <div style={{
        width: 280,
        background: "#161b22",
        borderRadius: 8,
        border: "1px solid #30363d",
        padding: 16,
        flexShrink: 0,
      }}>
        <h3 style={{ fontSize: 14, color: "#e6edf3", marginBottom: 12 }}>
          Select Component
        </h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 4 }}>
            Blast Radius Depth
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <span style={{ fontSize: 11, color: "#8b949e" }}>{depth} hops</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {services.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNode(n.id)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${selectedNode === n.id ? "#1f6feb" : "#30363d"}`,
                borderRadius: 6,
                cursor: "pointer",
                background: selectedNode === n.id ? "#1f6feb22" : "#21262d",
                color: "#e6edf3",
                textAlign: "left",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: n.riskLevel ? riskScoreToColor(
                  n.riskLevel === "critical" ? 0.9 : n.riskLevel === "high" ? 0.6 : n.riskLevel === "medium" ? 0.3 : 0.1,
                ) : getNodeColor(n.type),
                display: "inline-block",
              }} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1,
        background: "#161b22",
        borderRadius: 8,
        border: "1px solid #30363d",
        padding: 16,
        overflow: "auto",
      }}>
        {blastRadius ? (
          <>
            <h3 style={{ fontSize: 14, color: "#e6edf3", marginBottom: 12 }}>
              Blast Radius: {selectedComponent?.label}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 12, color: "#8b949e", marginBottom: 8 }}>
                  Affected Nodes ({blastRadius.nodes.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {blastRadius.nodes.map((n) => (
                    <div key={n.id} style={{
                      padding: "6px 10px",
                      background: "#21262d",
                      borderRadius: 4,
                      border: "1px solid #30363d",
                      fontSize: 12,
                      color: "#c9d1d9",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: getNodeColor(n.type),
                        display: "inline-block",
                      }} />
                      <span style={{ color: "#8b949e", marginRight: 4 }}>{n.type}:</span>
                      {n.label}
                      {n.riskLevel && (
                        <span style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: n.riskLevel === "critical" ? "#8b1a1a44" : n.riskLevel === "high" ? "#d1242f44" : n.riskLevel === "medium" ? "#d2992244" : "#2ea04344",
                          color: n.riskLevel === "critical" ? "#ff7b72" : n.riskLevel === "high" ? "#ffa657" : n.riskLevel === "medium" ? "#d29922" : "#7ee787",
                        }}>
                          {n.riskLevel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: 12, color: "#8b949e", marginBottom: 8 }}>
                  Dependency Chains ({blastRadius.links.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {blastRadius.links.slice(0, 20).map((link, i) => {
                    const sourceLabel = typeof link.source === "string"
                      ? graph.nodes.find((n) => n.id === link.source)?.label ?? link.source
                      : (link.source as GraphNode).label;
                    const targetLabel = typeof link.target === "string"
                      ? graph.nodes.find((n) => n.id === link.target)?.label ?? link.target
                      : (link.target as GraphNode).label;
                    return (
                      <div key={i} style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        color: "#8b949e",
                        fontFamily: "monospace",
                      }}>
                        {sourceLabel} <span style={{ color: "#30363d" }}>──{link.type}──▶</span> {targetLabel}
                      </div>
                    );
                  })}
                  {blastRadius.links.length > 20 && (
                    <div style={{ fontSize: 11, color: "#8b949e", padding: 4 }}>
                      ... and {blastRadius.links.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#8b949e",
            fontSize: 14,
          }}>
            Select a component to explore its blast radius
          </div>
        )}
      </div>
    </div>
  );
}
