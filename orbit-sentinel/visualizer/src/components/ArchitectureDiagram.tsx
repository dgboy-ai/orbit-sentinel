import React, { useState, useEffect } from "react";

interface ArchNode {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  detail: string;
  subItems: string[];
}

const NODES: ArchNode[] = [
  { id: "mr", icon: "🔀", title: "GitLab MR", subtitle: "Trigger", color: "#fc6d26",
    detail: "A developer opens a merge request or @mentions @ai-orbit-sentinel. Changed files and branch name are sent to the Duo Agent Platform.",
    subItems: ["MR opened event triggers flow", "Changed files + branch extracted", "Developer @mention starts analysis"] },
  { id: "flow", icon: "🔄", title: "Duo Agent Flow", subtitle: "8-Step Workflow", color: "#a78bfa",
    detail: "The 8-step Duo Agent Platform workflow executes autonomously: schema discovery, all 4 Orbit queries, report composition, MR note posting.",
    subItems: ["get_graph_schema → discover ontology", "NEIGHBORS → blast radius", "PATH_FINDING → dependencies", "TRAVERSAL → history", "AGGREGATION → pipeline risk", "Compose report → Post MR note"] },
  { id: "orbit", icon: "🛰️", title: "Orbit API", subtitle: "4 Query Types", color: "#818cf8",
    detail: "GitLab Orbit is the knowledge graph powering every prediction. All four query types converge to build a complete picture.",
    subItems: ["NEIGHBORS: connected nodes", "PATH_FINDING: deployment chains", "TRAVERSAL: historical matches", "AGGREGATION: failure counts"] },
  { id: "engine", icon: "🧠", title: "Sentinel Engine", subtitle: "TypeScript · Express", color: "#2dd4bf",
    detail: "The engine builds a digital twin from Orbit graph data, scores risk across 5 dimensions, plans remediation, and generates structured visualization data.",
    subItems: ["Digital twin construction", "5-dimension risk scoring", "Remediation planning", "Visualization data generation"] },
  { id: "visualizer", icon: "📊", title: "Dashboard", subtitle: "React · D3 · Vite", color: "#60a5fa",
    detail: "Interactive 7-view React dashboard with auto-play demo, what-if simulation, impact calculator, and guided judge's tour.",
    subItems: ["7 interactive views", "Impact Calculator with sliders", "Setup Wizard with 4-step guide", "What-if counterfactual simulation"] },
  { id: "deploy", icon: "🚀", title: "Vercel + Render", subtitle: "Live Deployment", color: "#22c55e",
    detail: "Visualizer deployed on Vercel with CDN caching. Engine on Render with auto-fallback to demo data when Orbit is unreachable.",
    subItems: ["Visualizer: orbit-sentinel.vercel.app", "Engine: Render (auto-scaling)", "Demo fallback when Orbit offline", "One-click deploy.sh script"] },
];

function ArchNodeCard({ node, index, selected, onSelect }: {
  node: ArchNode; index: number; selected: string | null; onSelect: (id: string) => void;
}) {
  const isOpen = selected === node.id;
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0,
      animation: mounted ? `fadeSlideUp 0.35s ${index * 0.05}s cubic-bezier(0.16,1,0.3,1) both` : "none",
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14, cursor: "pointer",
        background: isOpen
          ? `linear-gradient(135deg, ${node.color}22, ${node.color}0a, rgba(15,18,26,0.6))`
          : hovered
          ? `linear-gradient(135deg, ${node.color}0e, rgba(15,18,26,0.5))`
          : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(15,18,26,0.4))",
        border: isOpen
          ? `1.5px solid ${node.color}55`
          : hovered
          ? `1px solid ${node.color}33`
          : "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 19, flexShrink: 0,
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: isOpen ? "scale(1.06) translateY(-2px)" : hovered ? "scale(1.04) translateY(-1px)" : "scale(1)",
        boxShadow: isOpen
          ? `0 6px 24px ${node.color}22, 0 0 0 1px ${node.color}22, inset 0 1px 0 ${node.color}22`
          : hovered
          ? `0 4px 16px ${node.color}14, 0 0 0 1px ${node.color}0e`
          : "0 2px 6px rgba(0,0,0,0.25)",
        position: "relative",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
        onClick={() => onSelect(isOpen ? "" : node.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`Click for details: ${node.title}`}
      >
        {/* Inner grid dots */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", pointerEvents: "none",
          opacity: 0.3,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }} />
        <span style={{ position: "relative", zIndex: 1 }}>{node.icon}</span>
        {isOpen && (
          <>
            {/* Double ring glow */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: 17,
              border: `1px solid ${node.color}28`,
              animation: "pulseGlow 4s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", inset: -7, borderRadius: 21,
              border: `1px solid ${node.color}0c`,
              animation: "pulseGlow 4s ease-in-out infinite 0.3s",
            }} />
          </>
        )}
        {/* Top highlight */}
        <div style={{
          position: "absolute", top: 0, left: 2, right: 2, height: "40%",
          borderRadius: "14px 14px 0 0",
          background: `linear-gradient(180deg, ${isOpen ? `${node.color}18` : "rgba(255,255,255,0.03)"}, transparent)`,
          pointerEvents: "none",
        }} />
      </div>
      <span style={{
        fontSize: 9, fontWeight: 600,
        color: isOpen ? node.color : hovered ? "var(--text-primary)" : "var(--text-secondary)",
        textAlign: "center", lineHeight: 1.15, maxWidth: 54,
        transition: "color 0.2s",
      }}>{node.title}</span>
      <span style={{
        fontSize: 7, color: "var(--text-tertiary)", textAlign: "center",
        lineHeight: 1.15, maxWidth: 52, textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}>{node.subtitle}</span>
    </div>
  );
}

function ArchDetail({ node }: { node: ArchNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 10, marginTop: 8,
      background: `linear-gradient(135deg, ${node.color}08, transparent)`,
      border: `1px solid ${node.color}18`,
      boxShadow: `inset 0 1px 0 ${node.color}0a`,
      animation: mounted ? "fadeSlideUp 0.25s cubic-bezier(0.16,1,0.3,1) both" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${node.color}18, ${node.color}08)`,
          border: `1px solid ${node.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
        }}>{node.icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: node.color, letterSpacing: "0.2px" }}>{node.title}</span>
        <span style={{ fontSize: 8, color: "var(--text-tertiary)", marginLeft: "auto", padding: "2px 7px", borderRadius: 4, background: `${node.color}08`, border: `1px solid ${node.color}0c` }}>{node.subtitle}</span>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 7 }}>
        {node.detail}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
        {node.subItems.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 8.5, color: "var(--text-primary)", lineHeight: 1.4,
            animation: mounted ? `fadeSlideUp 0.2s ${0.03 + i * 0.015}s cubic-bezier(0.16,1,0.3,1) both` : "none",
            whiteSpace: "nowrap",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: node.color, flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArchitectureDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const selectedNode = selected ? NODES.find(n => n.id === selected) ?? null : null;

  return (
    <div className="card" style={{
      padding: "16px 20px",
      borderColor: "rgba(139,92,246,0.08)",
      background: "linear-gradient(135deg, rgba(139,92,246,0.03), rgba(15,18,26,0.95))",
      animation: mounted ? "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both" : "none",
      position: "relative", overflow: "hidden",
    }}>
      {/* Glowing orbs */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(139,92,246,0.04)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, left: "30%", width: 120, height: 120, borderRadius: "50%", background: "rgba(99,102,241,0.03)", filter: "blur(40px)", pointerEvents: "none" }} />
      {/* Circuit grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.12,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))", border: "1px solid rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🏗️</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.2px" }}>System Architecture</span>
          <span style={{ fontSize: 8, color: "var(--text-tertiary)", marginLeft: "auto" }}>Click a node to explore</span>
        </div>

        {/* Pipeline flow */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, flexWrap: "nowrap",
          padding: "4px 0 4px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none", msOverflowStyle: "none",
          position: "relative",
        }}>
          {NODES.map((node, i) => (
            <React.Fragment key={node.id}>
              <ArchNodeCard node={node} index={i} selected={selected} onSelect={setSelected} />
              {i < NODES.length - 1 && (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0,
                  opacity: selected === node.id || selected === NODES[i + 1].id ? 0.7 : 0.35,
                  transition: "opacity 0.3s",
                  marginTop: -12,
                }}>
                  <div style={{ width: 14, height: 1.5, background: `linear-gradient(90deg, ${node.color}66, ${NODES[i + 1].color}66)`, borderRadius: 1 }} />
                  <div style={{ width: 0, height: 0, borderLeft: "2.5px solid transparent", borderRight: "2.5px solid transparent", borderTop: `2.5px solid ${NODES[i + 1].color}44` }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Selected detail */}
        {selectedNode && <ArchDetail node={selectedNode} />}

        {/* Hint */}
        {!selected && (
          <div style={{
            textAlign: "center", fontSize: 8.5, color: "var(--text-tertiary)",
            marginTop: 6, opacity: mounted ? 1 : 0,
            transition: "opacity 0.4s ease 0.6s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <span style={{ opacity: 0.6 }}>💡</span>
            Click any node for details
          </div>
        )}
      </div>
    </div>
  );
}
