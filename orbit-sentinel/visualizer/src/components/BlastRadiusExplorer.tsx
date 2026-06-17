import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "../types";
import { findConnectedComponents, filterNodesByType } from "../utils/graph";
import { NODE_COLORS, riskLevelToColor, riskLevelToGlow } from "../utils/colors";
import { useAnimatedValue } from "../hooks/useAnimatedValue";

interface Props { graph: { nodes: GraphNode[]; links: GraphLink[] } }

type DN = d3.SimulationNodeDatum & GraphNode;
type DL = d3.SimulationLinkDatum<DN> & GraphLink;

const NODE_SIZES: Record<string, number> = {
  Project: 14, Service: 11, File: 7, MergeRequest: 9,
  Pipeline: 9, Deployment: 10, Incident: 8, User: 8, Team: 10,
  Issue: 8, Commit: 7,
};

function GlowOrb({ color, top, left, right, bottom, size }: { color: string; top?: string; left?: string; right?: string; bottom?: string; size: number }) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom, width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size * 0.35}px)`, pointerEvents: "none",
      opacity: 0.4, animation: "float 8s ease-in-out infinite",
    }} />
  );
}

function StatPill({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 8, textAlign: "center",
      background: `linear-gradient(135deg, ${color}10, ${color}04)`,
      border: `1px solid ${color}20`,
      boxShadow: `0 0 12px ${color}10`,
      animation: "fadeSlideUp 0.4s ease both",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${color}30`, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: "var(--text-tertiary)", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function BlastRadiusGraph({ nodes, links, selectedId, onNodeClick, highlight }: { nodes: GraphNode[]; links: GraphLink[]; selectedId: string | null; onNodeClick: (id: string) => void; highlight: string | null }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onClickRef = useRef(onNodeClick);
  onClickRef.current = onNodeClick;

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    const w = svgRef.current.clientWidth, h = svgRef.current.clientHeight;
    if (!w || !h) return;
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    defs.append("pattern").attr("id","br-grid").attr("width",24).attr("height",24).attr("patternUnits","userSpaceOnUse")
      .append("path").attr("d","M 24 0 L 0 0 0 24").attr("fill","none").attr("stroke","rgba(255,255,255,0.03)").attr("stroke-width",0.5);

    const colors = [...new Set(nodes.map(n => {
      return n.riskLevel ? riskLevelToColor(n.riskLevel) : NODE_COLORS[n.type] ?? "#666";
    }))];
    colors.forEach(c => {
      const sc = c.replace("#","");
      const g = defs.append("radialGradient").attr("id",`brg-${sc}`);
      g.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",1);
      g.append("stop").attr("offset","50%").attr("stop-color",c).attr("stop-opacity",0.6);
      g.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0.1);
    });
    colors.forEach(c => {
      const sc = c.replace("#","");
      const g = defs.append("radialGradient").attr("id",`brglow-${sc}`);
      g.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",0.25);
      g.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0);
    });

    svg.append("rect").attr("width","100%").attr("height","100%").attr("fill","url(#br-grid)");
    const g = svg.append("g");
    svg.call(d3.zoom<SVGSVGElement,unknown>().scaleExtent([0.2,8]).on("zoom",e=>g.attr("transform",e.transform)));

    const ln = links.map(l=>({...l})) as unknown as DL[];
    const nd = nodes.map(n=>({...n})) as unknown as DN[];

    const rootNode = nd.find(n => n.id === selectedId);
    if (rootNode) {
      rootNode.fx = w/2;
      rootNode.fy = h/2;
    }

    const sim = d3.forceSimulation<DN>(nd)
      .force("link", d3.forceLink<DN,DL>(ln).id(d=>d.id).distance(d=>200/(d.value??1)).strength(0.25))
      .force("charge", d3.forceManyBody().strength(d=>-(NODE_SIZES[(d as DN).type]??6) * 30))
      .force("center", d3.forceCenter(w/2,h/2))
      .force("collision", d3.forceCollide().radius(d=>(NODE_SIZES[(d as DN).type]??6) + 30))
      .alphaDecay(0.08)
      .velocityDecay(0.6);

    const linkSel = g.append("g").selectAll<SVGLineElement,DL>("line")
      .data(ln).join("line")
      .attr("stroke",d=>{
        const srcId = typeof d.source === "string" ? d.source : (d.source as DN).id;
        const tgtId = typeof d.target === "string" ? d.target : (d.target as DN).id;
        const isHl = highlight && (srcId === highlight || tgtId === highlight);
        return isHl ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.06)";
      })
      .attr("stroke-width",(d:DL)=>Math.max(0.5,(d.value??1)*1.5))
      .attr("stroke-dasharray",(d:DL)=>{
        const srcId = typeof d.source === "string" ? d.source : (d.source as DN).id;
        const tgtId = typeof d.target === "string" ? d.target : (d.target as DN).id;
        return highlight && (srcId === highlight || tgtId === highlight) ? "none" : "3,3";
      });

    const nodeSel = g.append("g").selectAll<SVGGElement,DN>("g").data(nd).join("g")
      .call(d3.drag<SVGGElement,DN>().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(0.1).restart();d.fx=d.x;d.fy=d.y;})
        .on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=undefined;d.fy=undefined;}) as any);

    nodeSel.append("circle").attr("class","br-glow")
      .attr("r",d=>(NODE_SIZES[d.type]??6) * 2.2)
      .attr("fill",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return `url(#brglow-${c.replace("#","")})`;
      })
      .attr("opacity",d => d.id === selectedId ? 1 : 0.3);

    nodeSel.append("circle").attr("class","br-rim")
      .attr("r",d=>(NODE_SIZES[d.type]??6)+2)
      .attr("fill","none")
      .attr("stroke",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return c;
      })
      .attr("stroke-width",d => d.id === selectedId ? 1.5 : 0.5)
      .attr("opacity",d => d.id === selectedId ? 0.6 : 0.2);

    nodeSel.append("circle").attr("class","br-core")
      .attr("r",d=>NODE_SIZES[d.type]??6)
      .attr("fill",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return `url(#brg-${c.replace("#","")})`;
      })
      .attr("stroke","rgba(0,0,0,0.4)").attr("stroke-width",1.5)
      .style("cursor","pointer")
      .on("click",(_e:any,d:DN)=>{onClickRef.current(d.id);})
      .on("mouseenter",function(_e:any,d:DN){
        const isRoot = d.id === selectedId;
        d3.select(this).attr("stroke","rgba(255,255,255,0.5)").attr("stroke-width",2.5);
        d3.select(this.parentNode!.querySelector("text")!).attr("font-size",10).attr("fill","var(--text-primary)");
        linkSel.attr("stroke",(ld:DL)=>{
          const src=(ld.source as DN).id;const tgt=(ld.target as DN).id;
          return (src===d.id||tgt===d.id)?"rgba(96,165,250,0.3)":"rgba(255,255,255,0.04)";
        }).attr("stroke-dasharray",(ld:DL)=>{
          const src=(ld.source as DN).id;const tgt=(ld.target as DN).id;
          return (src===d.id||tgt===d.id)?"none":"3,3";
        }).attr("stroke-width",(ld:DL)=>{
          const src=(ld.source as DN).id;const tgt=(ld.target as DN).id;
          return (src===d.id||tgt===d.id)?2:0.5;
        });
        if (!isRoot) {
          d3.select(this.parentNode!.querySelector(".br-glow")!).attr("opacity",0.7);
          d3.select(this.parentNode!.querySelector(".br-rim")!).attr("stroke-width",1.5).attr("opacity",0.8);
        }
      })
      .on("mouseleave",function(_e:any,d:DN){
        const isRoot = d.id === selectedId;
        d3.select(this).attr("stroke","rgba(0,0,0,0.4)").attr("stroke-width",1.5);
        d3.select(this.parentNode!.querySelector("text")!).attr("font-size",8).attr("fill","var(--text-secondary)");
        if (!isRoot) {
          d3.select(this.parentNode!.querySelector(".br-glow")!).attr("opacity",0.3);
          d3.select(this.parentNode!.querySelector(".br-rim")!).attr("stroke-width",0.5).attr("opacity",0.2);
        }
        linkSel.attr("stroke","rgba(255,255,255,0.06)")
          .attr("stroke-dasharray","3,3")
          .attr("stroke-width",(d:DL)=>Math.max(0.5,(d.value??1)*1.5));
      });

    nodeSel.append("text").text(d=>d.label)
      .attr("x",d=>(NODE_SIZES[d.type]??6)+5).attr("y",3)
      .attr("font-size",8)
      .attr("fill","var(--text-secondary)")
      .attr("font-family","'Inter',sans-serif").attr("font-weight",500)
      .style("pointer-events","none");

    nodeSel.append("title").text(d=>`${d.type}: ${d.label}${d.riskLevel?` [${d.riskLevel.toUpperCase()}]`:""}`);

    sim.alpha(1).restart();
    sim.on("tick",()=>{
      linkSel.attr("x1",(d:DL)=>(d.source as DN).x??0).attr("y1",(d:DL)=>(d.source as DN).y??0)
        .attr("x2",(d:DL)=>(d.target as DN).x??0).attr("y2",(d:DL)=>(d.target as DN).y??0);
      nodeSel.attr("transform",(d:DN)=>`translate(${d.x??0},${d.y??0})`);
    });

    return () => { sim.stop(); };
  }, [nodes, links, selectedId]);

  return (
    <svg ref={svgRef} width="100%" height="100%" style={{ display:"block", borderRadius:8 }} />
  );
}

function DependencyChain({ links, allNodes, rootId }: { links: GraphLink[]; allNodes: GraphNode[]; rootId: string | null }) {
  const resolve = (id: string | GraphNode): string => typeof id === "string" ? id : id.id;
  const getNode = (id: string) => allNodes.find(n => n.id === id);

  const chains = useMemo(() => {
    if (!rootId) return [];
    const visited = new Set<string>();
    const paths: { from: string; to: string; type: string }[] = [];
    function walk(id: string) {
      if (visited.has(id)) return;
      visited.add(id);
      for (const link of links) {
        const src = resolve(link.source);
        const tgt = resolve(link.target);
        if (src === id && !visited.has(tgt)) {
          paths.push({ from: src, to: tgt, type: link.type });
          walk(tgt);
        }
      }
    }
    walk(rootId);
    return paths;
  }, [links, rootId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {chains.length === 0 && (
        <div style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", padding: 6 }}>No dependencies found</div>
      )}
      {chains.slice(0, 15).map((c, i) => {
        const fromNode = getNode(c.from);
        const toNode = getNode(c.to);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 8px", borderRadius: 5,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            animation: `fadeSlideUp 0.3s ${i * 0.03}s ease both`,
            transition: "all 0.15s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.06)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: NODE_COLORS[fromNode?.type ?? ""] ?? "#666", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "var(--text-primary)", fontWeight: 500 }}>{fromNode?.label ?? c.from}</span>
            <span style={{ fontSize: 7, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>→</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: NODE_COLORS[toNode?.type ?? ""] ?? "#666", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "var(--text-primary)", fontWeight: 500 }}>{toNode?.label ?? c.to}</span>
            <span style={{ marginLeft: "auto", fontSize: 7, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{c.type}</span>
          </div>
        );
      })}
      {chains.length > 15 && (
        <div style={{ fontSize: 9, color: "var(--text-tertiary)", padding: "2px 4px" }}>... and {chains.length - 15} more</div>
      )}
    </div>
  );
}

export default function BlastRadiusExplorer({ graph }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [depth, setDepth] = useState(3);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [renderErr, setRenderErr] = useState<string | null>(null);

  useEffect(() => { setRenderErr(null); }, [graph]);

  const services = useMemo(() => filterNodesByType(graph.nodes, ["Service", "Project", "File", "Pipeline"]), [graph]);
  const sel = useMemo(() => selectedNode ? graph.nodes.find(n => n.id === selectedNode) ?? null : null, [graph, selectedNode]);
  const br = useMemo(() => selectedNode ? findConnectedComponents(graph.nodes, graph.links, selectedNode, depth) : null, [graph, selectedNode, depth]);

  const riskCount = useMemo(() => br ? br.nodes.filter(n => n.riskLevel === "high" || n.riskLevel === "critical").length : 0, [br]);
  const serviceCount = useMemo(() => br ? br.nodes.filter(n => n.type === "Service").length : 0, [br]);
  const fileCount = useMemo(() => br ? br.nodes.filter(n => n.type === "File").length : 0, [br]);

  const animNodes = useAnimatedValue(br?.nodes.length ?? 0, 1000, 50);
  const animLinks = useAnimatedValue(br?.links.length ?? 0, 1000, 100);
  const animRisk = useAnimatedValue(riskCount, 1000, 150);
  const animDepth = useAnimatedValue(depth, 600, 200);

  const filteredServices = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();
    return services.filter(n => n.label.toLowerCase().includes(q) || n.type.toLowerCase().includes(q));
  }, [services, search]);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  if (renderErr) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: 12, flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 24 }}>⚠️</span>
        <span>Something went wrong: {renderErr}</span>
        <button onClick={() => setRenderErr(null)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 11 }}>Retry</button>
      </div>
    );
  }

  try {
    return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0, animation: "fadeSlideUp 0.4s ease" }}>
      {/* HEADER STATS */}
      <div className="card" style={{
        padding: "14px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(249,115,22,0.25)",
        background: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(15,18,26,0.95), rgba(59,130,246,0.04))",
        boxShadow: "0 0 20px rgba(249,115,22,0.08)",
        animation: "fadeSlideUp 0.4s ease",
      }}>
        <GlowOrb color="rgba(249,115,22,0.15)" top="-40%" left="-10%" size={180} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div className="card-header-icon" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.2)" }}>💥</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Blast Radius Explorer</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>NEIGHBORS query — digital twin impact analysis</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <StatPill label="Affected Nodes" value={String(Math.round(animNodes))} color="#60a5fa" sub={br ? `${fileCount} files, ${serviceCount} services` : undefined} />
            <StatPill label="Dependency Edges" value={String(Math.round(animLinks))} color="#a78bfa" sub="Direct + indirect" />
            <StatPill label="High / Critical Risk" value={String(Math.round(animRisk))} color="#ef4444" sub={br ? `${((riskCount / Math.max(br.nodes.length, 1)) * 100).toFixed(0)}% of affected` : undefined} />
            <StatPill label="Search Depth" value={String(Math.round(animDepth))} color="#f97316" sub="hops from root" />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flex: 1, minHeight: 0 }}>
        {/* LEFT: Component Picker */}
        <div className="card" style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden", height: "100%", width: 220, flexShrink: 0 }}>
          <GlowOrb color="rgba(96,165,250,0.1)" top="-20%" left="-30%" size={120} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Components</div>
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "5px 8px", borderRadius: 6, fontSize: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.2)", color: "var(--text-primary)", outline: "none", width: "100%",
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", borderRadius: 6, flexShrink: 0,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 8, color: "var(--text-tertiary)", fontWeight: 600 }}>Depth</span>
              <input type="range" min={1} max={5} value={depth} onChange={e => setDepth(Number(e.target.value))}
                style={{ flex: 1, accentColor: "#f97316", height: 2 }} />
              <span style={{ fontSize: 9, color: "#f97316", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{depth}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflow: "auto" }}>
              {filteredServices.map(n => {
                const riskColor = n.riskLevel ? riskLevelToColor(n.riskLevel) : NODE_COLORS[n.type] ?? "#666";
                const isActive = selectedNode === n.id;
                return (
                  <button key={n.id} onClick={() => handleNodeClick(n.id)}
                    onMouseEnter={e => { setHighlight(n.id); if (!isActive) { e.currentTarget.style.background = "rgba(96,165,250,0.08)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)"; } }}
                    onMouseLeave={e => { setHighlight(null); if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                    style={{
                      padding: "5px 8px", borderRadius: 6, cursor: "pointer", textAlign: "left", fontSize: 10,
                      background: isActive ? "rgba(249,115,22,0.1)" : "transparent",
                      border: isActive ? "1px solid rgba(249,115,22,0.25)" : "1px solid transparent",
                      color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.12s ease",
                    }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: riskColor, display: "inline-block", flexShrink: 0,
                      boxShadow: n.riskLevel === "critical" || n.riskLevel === "high" ? `0 0 6px ${riskColor}` : undefined,
                    }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
                    <span style={{ fontSize: 7, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{n.type === "Service" ? "⚙️" : n.type === "File" ? "📄" : n.type === "Pipeline" ? "🔄" : "📦"}</span>
                  </button>
                );
              })}
              {filteredServices.length === 0 && (
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", padding: 8 }}>No matches</div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Graph */}
        <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: 0, height: "100%", flex: 1 }}>
          {br ? (
            <BlastRadiusGraph
              nodes={br.nodes}
              links={br.links}
              selectedId={selectedNode}
              onNodeClick={handleNodeClick}
              highlight={highlight}
            />
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8,
              color: "var(--text-secondary)", fontSize: 12,
            }}>
              <span style={{ fontSize: 28, opacity: 0.3 }}>💥</span>
              <span>Select a component to explore blast radius</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Click any node in the sidebar or graph</span>
            </div>
          )}
        </div>

        {/* RIGHT: Details Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto", height: "100%", width: 260, flexShrink: 0 }}>
          {br && sel ? (
            <>
              {/* Selected Node Info */}
              <div className="card" style={{ padding: "10px 12px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                <GlowOrb color={`${riskLevelToColor(sel.riskLevel ?? "low")}15`} top="-30%" right="-20%" size={100} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: riskLevelToColor(sel.riskLevel ?? "low"),
                      boxShadow: sel.riskLevel ? `0 0 8px ${riskLevelToGlow(sel.riskLevel)}` : undefined,
                    }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{sel.type}</span>
                    {sel.riskLevel && (
                      <span style={{
                        marginLeft: "auto", fontSize: 8, padding: "1px 5px", borderRadius: 3,
                        background: `${riskLevelToColor(sel.riskLevel)}18`, color: riskLevelToColor(sel.riskLevel),
                        border: `1px solid ${riskLevelToColor(sel.riskLevel)}22`,
                        fontWeight: 700,
                      }}>{sel.riskLevel}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{sel.label}</div>
                  <div style={{ fontSize: 9, color: "var(--text-secondary)" }}>{br.nodes.length} nodes in blast radius</div>
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className="card" style={{ padding: "10px 12px", flexShrink: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>Impact Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[
                    { label: "Services Affected", value: serviceCount, color: "#fb923c" },
                    { label: "Files Changed", value: fileCount, color: "#4ade80" },
                    { label: "Critical Risk", value: br.nodes.filter(n => n.riskLevel === "critical").length, color: "#ef4444" },
                    { label: "High Risk", value: br.nodes.filter(n => n.riskLevel === "high").length, color: "#f97316" },
                    { label: "Medium Risk", value: br.nodes.filter(n => n.riskLevel === "medium").length, color: "#eab308" },
                    { label: "Low Risk", value: br.nodes.filter(n => n.riskLevel === "low").length, color: "#22c55e" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px" }}>
                      <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>{s.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependency Chain */}
              <div className="card" style={{ padding: "10px 12px", flex: 1, overflow: "auto", minHeight: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>Dependency Chain</div>
                <DependencyChain links={br.links} allNodes={graph.nodes} rootId={selectedNode} />
              </div>
            </>
          ) : (
            <div className="card" style={{
              padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, flex: 1,
              color: "var(--text-secondary)", fontSize: 11,
            }}>
              <span style={{ fontSize: 24, opacity: 0.2 }}>🔍</span>
              <span>No component selected</span>
              <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>Click a component in the sidebar or use the depth slider</span>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[BlastRadiusExplorer]", e);
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: 12, flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 24, opacity: 0.5 }}>⚠️</span>
        <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>{msg}</span>
        <button onClick={() => window.location.reload()} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 11 }}>Reload</button>
      </div>
    );
  }
}
