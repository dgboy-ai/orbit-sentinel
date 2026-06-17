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
  {
    id: "mr",
    icon: "🔀",
    title: "GitLab MR",
    subtitle: "Trigger",
    color: "#fc6d26",
    detail: "A developer opens a merge request or @mentions @ai-orbit-sentinel in a comment. The changed files list and branch name are sent to the Duo Agent Platform.",
    subItems: ["MR opened event triggers flow", "Changed files + branch extracted", "Developer @mention starts analysis"],
  },
  {
    id: "flow",
    icon: "🔄",
    title: "Duo Agent Flow",
    subtitle: "8-Step Workflow",
    color: "#a78bfa",
    detail: "The 8-step Duo Agent Platform workflow executes autonomously: schema discovery, all 4 Orbit queries, report composition, MR note posting.",
    subItems: ["get_graph_schema → discover ontology", "NEIGHBORS → blast radius", "PATH_FINDING → dependencies", "TRAVERSAL → history", "AGGREGATION → pipeline risk", "Compose report → Post MR note"],
  },
  {
    id: "orbit",
    icon: "🛰️",
    title: "GitLab Orbit API",
    subtitle: "4 Query Types",
    color: "#6366f1",
    detail: "GitLab Orbit is the knowledge graph powering every prediction. All four query types converge to build a complete picture.",
    subItems: ["NEIGHBORS: connected nodes", "PATH_FINDING: deployment chains", "TRAVERSAL: historical matches", "AGGREGATION: failure counts"],
  },
  {
    id: "engine",
    icon: "🧠",
    title: "Sentinel Engine",
    subtitle: "TypeScript · Express",
    color: "#2dd4bf",
    detail: "The engine builds a digital twin from Orbit graph data, scores risk across 5 dimensions, plans remediation, and generates structured visualization data.",
    subItems: ["Digital twin construction", "5-dimension risk scoring", "Remediation planning", "Visualization data generation"],
  },
  {
    id: "visualizer",
    icon: "📊",
    title: "Visualizer Dashboard",
    subtitle: "React · D3 · Vite",
    color: "#60a5fa",
    detail: "Interactive 7-view React dashboard with auto-play demo, what-if simulation, impact calculator, and guided judge's tour. Responsive mobile layout.",
    subItems: ["7 interactive views", "Impact Calculator with sliders", "Setup Wizard with 4-step guide", "What-if counterfactual simulation"],
  },
  {
    id: "deploy",
    icon: "🚀",
    title: "Vercel + Render",
    subtitle: "Live Deployment",
    color: "#22c55e",
    detail: "Visualizer deployed on Vercel with CDN caching. Engine on Render with auto-fallback to demo data when Orbit is unreachable.",
    subItems: ["Visualizer: orbit-sentinel.vercel.app", "Engine: Render (auto-scaling)", "Demo fallback when Orbit offline", "One-click deploy.sh script"],
  },
];

function ArchNodeCard({ node, index, selected, onSelect }: {
  node: ArchNode; index: number; selected: string | null; onSelect: (id: string) => void;
}) {
  const isOpen = selected === node.id;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      animation: mounted ? `fadeSlideUp 0.4s ${index * 0.06}s cubic-bezier(0.16,1,0.3,1) both` : "none",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12, cursor: "pointer",
        background: isOpen
          ? `linear-gradient(135deg, ${node.color}22, ${node.color}11)`
          : "rgba(255,255,255,0.03)",
        border: isOpen
          ? `1.5px solid ${node.color}55`
          : "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: isOpen ? "scale(1.08)" : "scale(1)",
        boxShadow: isOpen ? `0 0 20px ${node.color}22` : "none",
      }}
        onClick={() => onSelect(isOpen ? "" : node.id)}
        onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.background = `${node.color}11`; e.currentTarget.style.borderColor = `${node.color}33`; e.currentTarget.style.transform = "scale(1.04)"; } }}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "scale(1)"; } }}
        title={`Click for details: ${node.title}`}
      >
        {node.icon}
      </div>
      <div style={{
        fontSize: 9, fontWeight: 600, color: isOpen ? node.color : "var(--text-secondary)",
        textAlign: "center", maxWidth: 64, lineHeight: 1.2,
        transition: "color 0.2s ease",
      }}>{node.title}</div>
      <div style={{
        fontSize: 8, color: "var(--text-tertiary)", textAlign: "center",
        maxWidth: 72, lineHeight: 1.2,
      }}>{node.subtitle}</div>
    </div>
  );
}

function ArchDetail({ node }: { node: ArchNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 8, marginTop: 8,
      background: `${node.color}06`, border: `1px solid ${node.color}18`,
      animation: mounted ? "fadeSlideUp 0.25s cubic-bezier(0.16,1,0.3,1) both" : "none",
    }}>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
        {node.detail}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {node.subItems.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 9, color: "var(--text-primary)", lineHeight: 1.3,
            animation: mounted ? `fadeSlideUp 0.2s ${0.04 + i * 0.02}s cubic-bezier(0.16,1,0.3,1) both` : "none",
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
      padding: "18px 22px",
      borderColor: "rgba(96,165,250,0.12)",
      background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(15,18,26,0.95))",
      animation: mounted ? "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>🏗️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)" }}>System Architecture</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Click any node to learn how the system works end-to-end</div>
        </div>
      </div>

      {/* Horizontal flow */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        gap: 0, flexWrap: "nowrap",
        padding: "12px 0",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {NODES.map((node, i) => (
          <React.Fragment key={node.id}>
            <ArchNodeCard node={node} index={i} selected={selected} onSelect={setSelected} />
            {i < NODES.length - 1 && (
              <div style={{
                width: 20, height: 1, flexShrink: 0, margin: "26px 2px 0 2px",
                background: "rgba(255,255,255,0.08)",
                transition: "background 0.3s ease",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Selected detail */}
      {selectedNode && <ArchDetail node={selectedNode} />}

      {/* Hint */}
      {!selected && (
        <div style={{
          textAlign: "center", fontSize: 9, color: "var(--text-tertiary)",
          padding: "4px 0 0 0",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease 0.6s",
        }}>
          💡 Click a node above to explore the architecture
        </div>
      )}
    </div>
  );
}
