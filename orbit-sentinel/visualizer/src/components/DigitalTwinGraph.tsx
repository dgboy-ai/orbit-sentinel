import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "../types";
import { NODE_COLORS, RISK, riskScoreToKey } from "../utils/colors";

interface Props { graph: { nodes: GraphNode[]; links: GraphLink[] } }

type DN = d3.SimulationNodeDatum & GraphNode;
type DL = d3.SimulationLinkDatum<DN> & GraphLink;

const TYPE_ICONS: Record<string, string> = {
  Project: "📦", Service: "⚙️", File: "📄", MergeRequest: "🔀",
  Pipeline: "🔄", Deployment: "🚀", Incident: "⚠️", User: "👤", Team: "👥",
  Issue: "🐛", Commit: "📝",
};

const rlk = (l?: string) => l === "critical" ? 0.9 : l === "high" ? 0.6 : l === "medium" ? 0.3 : 0.1;

export default function DigitalTwinGraph({ graph }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const w = svgRef.current.clientWidth, h = svgRef.current.clientHeight;
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    defs.append("marker").attr("id","a").attr("viewBox","0 -5 10 10").attr("refX",16).attr("refY",0).attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto")
      .append("path").attr("d","M0,-5L10,0L0,5").attr("fill","rgba(255,255,255,0.1)");

    const allColors = [...new Set(graph.nodes.map(n => {
      const k = n.riskLevel ? riskScoreToKey(rlk(n.riskLevel)) : null;
      return k ? RISK[k].hex : NODE_COLORS[n.type] ?? "#666";
    }))];
    allColors.forEach(c => {
      const g = defs.append("radialGradient").attr("id", `g-${c.replace("#","")}`);
      g.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",0.95);
      g.append("stop").attr("offset","60%").attr("stop-color",c).attr("stop-opacity",0.5);
      g.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0.2);
    });

    const g = svg.append("g");
    svg.call(d3.zoom<SVGSVGElement,unknown>().scaleExtent([0.1,8]).on("zoom",e=>g.attr("transform",e.transform)));

    const ln = graph.links.map(l=>({...l})) as unknown as DL[];
    const nd = graph.nodes.map(n=>({...n})) as unknown as DN[];

    const sim = d3.forceSimulation<DN>(nd)
      .force("link", d3.forceLink<DN,DL>(ln).id(d=>d.id).distance(d=>160/(d.value??1)))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(w/2,h/2))
      .force("collision", d3.forceCollide().radius(30));

    // Links
    const lg = g.append("g");
    const linkSel = lg.selectAll<SVGLineElement,DL>("line")
      .data(ln).join("line")
      .attr("stroke","rgba(255,255,255,0.06)").attr("stroke-width",(d:DL)=>Math.max(0.5,(d.value??1)*1.2)).attr("marker-end","url(#a)");

    // Nodes
    const ng = g.append("g");
    const node = ng.selectAll<SVGGElement,DN>("g").data(nd).join("g")
      .call(d3.drag<SVGGElement,DN>().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;})
        .on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=undefined;d.fy=undefined;}) as any);

    // Glow
    node.append("circle").attr("r",d=>{const s:{[k:string]:number}={Project:14,Service:12,File:9,MergeRequest:11,Pipeline:11,Deployment:12,Incident:10,User:10,Team:12,Issue:10,Commit:9};return (s[d.type]??9)*1.5;})
      .attr("fill",d=>{if(d.riskLevel){const k=riskScoreToKey(rlk(d.riskLevel));return RISK[k].glow}return"transparent"})
      .attr("opacity",d=>d.riskLevel==="critical"?0.25:0.08);

    // Main circle
    node.append("circle").attr("r",d=>{const s:{[k:string]:number}={Project:10,Service:9,File:5,MergeRequest:7,Pipeline:7,Deployment:8,Incident:6,User:6,Team:8,Issue:6,Commit:5};return s[d.type]??5;})
      .attr("fill",d=>{
        const c = d.riskLevel ? RISK[riskScoreToKey(rlk(d.riskLevel))].hex : NODE_COLORS[d.type]??"#666";
        return `url(#g-${c.replace("#","")})`;
      })
      .attr("stroke", d => d.id === hoveredNode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)")
      .attr("stroke-width", d => d.id === hoveredNode ? 3 : 2)
      .style("cursor","pointer").style("transition","stroke 0.15s ease")
      .on("mouseenter", (_e: any, d: DN) => setHoveredNode(d.id))
      .on("mouseleave", () => setHoveredNode(null))
      .on("click",(_e: any, d: DN) => setSelected({ id: d.id, label: d.label, type: d.type, riskLevel: d.riskLevel }));

    // Label
    node.append("text").text(d=>d.label).attr("x",d=>{const s:{[k:string]:number}={Project:10,Service:9,File:5,MergeRequest:7,Pipeline:7,Deployment:8,Incident:6,User:6,Team:8,Issue:6,Commit:5};return(s[d.type]??5)+6})
      .attr("y",3).attr("font-size", d => d.id === hoveredNode ? 11 : 10).attr("fill", d => d.id === hoveredNode ? "var(--text-primary)" : "var(--text-secondary)").attr("font-family","'Inter',sans-serif").attr("font-weight",500).style("pointer-events","none")
      .style("transition","all 0.1s ease");

    node.append("title").text(d=>`${d.type}: ${d.label}${d.riskLevel?` [${d.riskLevel.toUpperCase()}]`:""}`);

    node.filter(d=>d.riskLevel==="critical").select("circle:not(:first-child)").style("animation","glowPulse 2s ease-in-out infinite");

    sim.on("tick",()=>{
      linkSel.attr("x1",(d:DL)=>(d.source as DN).x??0).attr("y1",(d:DL)=>(d.source as DN).y??0).attr("x2",(d:DL)=>(d.target as DN).x??0).attr("y2",(d:DL)=>(d.target as DN).y??0);
      node.attr("transform",(d:DN)=>`translate(${d.x??0},${d.y??0})`);
    });

    return ()=>{sim.stop()};
  }, [graph]);

  const nodeColor = (n: GraphNode) => {
    if (!n.riskLevel) return NODE_COLORS[n.type] ?? "#666";
    return RISK[riskScoreToKey(rlk(n.riskLevel))].hex;
  };

  return (
    <div className="card" style={{ overflow:"hidden", position:"relative", height:"100%", minHeight:0, animation: "fadeSlideUp 0.5s 0.25s ease both" }}>
      <div style={{ position:"absolute", top:10, left:10, zIndex:10, display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:6, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(8px)", fontSize:10, color:"var(--text-secondary)" }}>
        <span>🌐</span> Digital Twin <span style={{color:"var(--text-tertiary)"}}>·</span> <span style={{fontWeight:600,color:"var(--text-primary)"}}>{graph.nodes.length}</span> nodes <span style={{color:"var(--text-tertiary)"}}>·</span> <span style={{fontWeight:600,color:"var(--text-primary)"}}>{graph.links.length}</span> edges
      </div>
      <div style={{ position:"absolute", bottom:10, left:10, zIndex:10, display:"flex", gap:8, padding:"4px 8px", borderRadius:6, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(4px)", fontSize:9, color:"var(--text-secondary)" }}>
        {[{c:"#22c55e",l:"Safe"},{c:"#eab308",l:"Medium"},{c:"#f97316",l:"High"},{c:"#ef4444",l:"Critical"}].map(x=>(
          <span key={x.l} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:x.c,display:"inline-block"}}/>{x.l}</span>
        ))}
      </div>

      {/* Node info panel */}
      {selected && (
        <div style={{
          position:"absolute", top:10, right:10, zIndex:20, width: 200,
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(8,9,13,0.92)", backdropFilter: "blur(16px)",
          border: `1px solid ${nodeColor(selected)}33`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${nodeColor(selected)}11`,
          animation: "fadeSlideDown 0.2s ease",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{TYPE_ICONS[selected.type] ?? "🔹"}</span>
            <button onClick={() => setSelected(null)} style={{
              background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14,
              padding: 0, lineHeight: 1,
            }}>✕</button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{selected.label}</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 6 }}>{selected.type}</div>
          {selected.riskLevel && (
            <div style={{
              display: "inline-flex", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600,
              background: `${nodeColor(selected)}22`,
              color: nodeColor(selected),
              border: `1px solid ${nodeColor(selected)}33`,
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              {selected.riskLevel} Risk
            </div>
          )}
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>
              {graph.links.filter(l => l.source === selected.id || l.target === selected.id).length} connections
            </span>
          </div>
        </div>
      )}

      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
