import React, { useMemo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "../types";
import { NODE_COLORS, riskLevelToColor } from "../utils/colors";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import { DEMO_DATA } from "../data/demoData";

interface Props { graph: { nodes: GraphNode[]; links: GraphLink[] } }

type DN = d3.SimulationNodeDatum & GraphNode;
type DL = d3.SimulationLinkDatum<DN> & GraphLink;

const TYPE_ICONS: Record<string, string> = {
  Project: "📦", Service: "⚙️", File: "📄", MergeRequest: "🔀",
  Pipeline: "🔄", Deployment: "🚀", Incident: "⚠️", User: "👤", Team: "👥",
  Issue: "🐛", Commit: "📝",
};

const NODE_SIZES: Record<string, number> = {
  Project: 12, Service: 10, File: 6, MergeRequest: 8,
  Pipeline: 8, Deployment: 9, Incident: 7, User: 7, Team: 9,
  Issue: 7, Commit: 6,
};

function DigitalTwinStatus({ graph }: { graph: { nodes: GraphNode[]; links: GraphLink[] } }) {
  const highRiskCount = useMemo(() => graph.nodes.filter(n => n.riskLevel === "high" || n.riskLevel === "critical").length, [graph]);
  const serviceCount = useMemo(() => graph.nodes.filter(n => n.type === "Service" || n.type === "File").length, [graph]);
  const animNodes = useAnimatedValue(graph.nodes.length, 1200, 100);
  const animLinks = useAnimatedValue(graph.links.length, 1200, 200);
  const animServices = useAnimatedValue(serviceCount, 1200, 300);
  const animFailures = useAnimatedValue(highRiskCount, 1200, 400);
  return (
    <div className="resp-graph-status" style={{ display: "flex", gap: 6, padding: "6px 12px", background: "var(--overlay-02)", borderBottom: "1px solid var(--overlay-05)" }}>
      <Stat icon="🔗" label="Nodes" value={Math.round(animNodes)} />
      <div style={{ width: 1, background: "var(--overlay-06)" }} />
      <Stat icon="🔀" label="Relationships" value={Math.round(animLinks)} />
      <div style={{ width: 1, background: "var(--overlay-06)" }} />
      <Stat icon="⚙️" label="Systems" value={Math.round(animServices)} />
      <div style={{ width: 1, background: "var(--overlay-06)" }} />
      <Stat icon="🚨" label="Failures" value={Math.round(animFailures)} color="#ef4444" />
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color?: string }) {
  return (
    <div className="resp-stat" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: color ?? "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

export default function DigitalTwinGraph({ graph: propGraph }: Props) {
  const isEmpty = !propGraph.nodes || propGraph.nodes.length === 0;
  const graph = isEmpty ? DEMO_DATA.graph : propGraph;
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(false);
  const zoomBehaviorRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const w = svgRef.current.clientWidth, h = svgRef.current.clientHeight;
    svg.selectAll("*").remove();
    settledRef.current = false;

    const defs = svg.append("defs");

    defs.append("marker").attr("id","a").attr("viewBox","0 -5 10 10").attr("refX",16).attr("refY",0)
      .attr("markerWidth",4).attr("markerHeight",4).attr("orient","auto")
      .append("path").attr("d","M0,-5L10,0L0,5").attr("fill","var(--overlay-12)");

    const allColors = [...new Set(graph.nodes.map(n => {
      return n.riskLevel ? riskLevelToColor(n.riskLevel) : NODE_COLORS[n.type] ?? "#666";
    }))];
    allColors.forEach(c => {
      const safeC = c.replace("#","");
      const g = defs.append("radialGradient").attr("id", `g-${safeC}`);
      g.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",1);
      g.append("stop").attr("offset","50%").attr("stop-color",c).attr("stop-opacity",0.7);
      g.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0.1);
    });

    defs.append("pattern").attr("id","grid").attr("width",32).attr("height",32).attr("patternUnits","userSpaceOnUse")
      .append("path").attr("d","M 32 0 L 0 0 0 32").attr("fill","none").attr("stroke","var(--overlay-03)").attr("stroke-width",0.5);

    const bg = svg.append("rect").attr("width","100%").attr("height","100%").attr("fill","url(#grid)");
    const g = svg.append("g");
    
    const zoomBehavior = d3.zoom<SVGSVGElement,unknown>()
      .scaleExtent([0.15,6])
      .on("zoom",e=>g.attr("transform",e.transform));
      
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    const ln = graph.links.map(l=>({...l})) as unknown as DL[];
    const nd = graph.nodes.map(n=>({...n})) as unknown as DN[];

    const sim = d3.forceSimulation<DN>(nd)
      .force("link", d3.forceLink<DN,DL>(ln).id(d=>d.id).distance(d=>250/(d.value??1)).strength(0.3))
      .force("charge", d3.forceManyBody().strength(d=>-(NODE_SIZES[(d as DN).type]??6) * 40))
      .force("center", d3.forceCenter(w/2,h/2))
      .force("collision", d3.forceCollide().radius(d=>(NODE_SIZES[(d as DN).type]??6) + 40))
      .alphaDecay(0.05)
      .velocityDecay(0.5);

    const lg = g.append("g");
    const linkSel = lg.selectAll<SVGLineElement,DL>("line")
      .data(ln).join("line")
      .attr("stroke","var(--overlay-06)").attr("stroke-width",(d:DL)=>Math.max(0.5,(d.value??1)*1.2)).attr("marker-end","url(#a)");

    const ng = g.append("g");

    let clickPos: {x:number;y:number}|null = null;
    const dragBehavior = d3.drag<SVGGElement,DN>()
      .on("start",(e,d)=>{clickPos={x:e.x,y:e.y};if(!e.active)sim.alphaTarget(0.1).restart();d.fx=d.x;d.fy=d.y;})
      .on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;})
      .on("end",(e,d)=>{
        if(!e.active)sim.alphaTarget(0);
        if(clickPos && Math.abs(e.x-clickPos.x)<5 && Math.abs(e.y-clickPos.y)<5) {
          setSelected({id:d.id,label:d.label,type:d.type,riskLevel:d.riskLevel});
        }
        clickPos=null;
        d.fx=undefined;d.fy=undefined;
      });
    const node = ng.selectAll<SVGGElement,DN>("g").data(nd).join("g")
      .call(dragBehavior);

    const riskColors = allColors.filter(c => graph.nodes.some(n => n.riskLevel && riskLevelToColor(n.riskLevel) === c));
    riskColors.forEach(c => {
      const safeC = c.replace("#","");
      const g2 = defs.append("radialGradient").attr("id", `glow-${safeC}`);
      g2.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",0.3);
      g2.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0);
    });

    node.append("circle").attr("class","node-glow")
      .attr("r",d=>{return (NODE_SIZES[d.type]??6) * 2.5;})
      .attr("fill",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return `url(#glow-${c.replace("#","")})`;
      })
      .attr("opacity",0.4);

    node.append("circle").attr("class","node-rim")
      .attr("r",d=>{return (NODE_SIZES[d.type]??6)+2;})
      .attr("fill","none")
      .attr("stroke",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return c;
      })
      .attr("stroke-width",0.5)
      .attr("opacity",0.3);

    node.append("circle").attr("class","node-core")
      .attr("r",d=>NODE_SIZES[d.type]??6)
      .attr("fill",d=>{
        const c = d.riskLevel ? riskLevelToColor(d.riskLevel) : NODE_COLORS[d.type]??"#666";
        return `url(#g-${c.replace("#","")})`;
      })
      .attr("stroke","rgba(0,0,0,0.5)")
      .attr("stroke-width",1.5)
      .style("cursor","pointer")
      .on("mouseenter",function(_e:any,d:DN){
        d3.select(this).attr("stroke","var(--overlay-60)").attr("stroke-width",3);
        d3.select(this.parentNode!.querySelector("text")!).attr("font-size",11).attr("fill","var(--text-primary)");
        linkSel.attr("stroke",(ld:DL)=>{const src=(ld.source as DN).id;const tgt=(ld.target as DN).id;return (src===d.id||tgt===d.id)?"rgba(96,165,250,0.25)":"var(--overlay-06)";});
      })
      .on("mouseleave",function(){
        d3.select(this).attr("stroke","rgba(0,0,0,0.5)").attr("stroke-width",1.5);
        d3.select(this.parentNode!.querySelector("text")!).attr("font-size",9).attr("fill","var(--text-secondary)");
        linkSel.attr("stroke","var(--overlay-06)");
      });

    node.append("text").text(d=>d.label)
      .attr("x",d=>{return (NODE_SIZES[d.type]??6)+6;}).attr("y",3)
      .attr("font-size",9)
      .attr("fill","var(--text-secondary)")
      .attr("font-family","'Inter',sans-serif").attr("font-weight",500)
      .style("pointer-events","none")
      .style("transition","all 0.1s ease");

    node.append("title").text(d=>`${d.type}: ${d.label}${d.riskLevel?` [${d.riskLevel.toUpperCase()}]`:""}`);

    sim.alpha(1).restart();

    let tickCount = 0;
    sim.on("tick",()=>{
      tickCount++;
      linkSel.attr("x1",(d:DL)=>(d.source as DN).x??0).attr("y1",(d:DL)=>(d.source as DN).y??0)
        .attr("x2",(d:DL)=>(d.target as DN).x??0).attr("y2",(d:DL)=>(d.target as DN).y??0);
      node.attr("transform",(d:DN)=>`translate(${d.x??0},${d.y??0})`);

      if (tickCount > 200 && !settledRef.current) {
        settledRef.current = true;
        node.select(".node-glow")
          .transition().duration(800)
          .attr("opacity",1);
      }
    });

    return ()=>{sim.stop();cancelAnimationFrame(rafRef.current);};
  }, [graph]);

  const nodeColor = (n: GraphNode) => {
    if (!n.riskLevel) return NODE_COLORS[n.type] ?? "#666";
    return riskLevelToColor(n.riskLevel);
  };

  return (
    <div className="card" style={{ overflow:"hidden", position:"relative", height:"100%", minHeight:0, animation:"fadeSlideUp 0.5s 0.25s ease both", display:"flex", flexDirection:"column" }}>
      {isEmpty && (
        <div style={{
          position: "absolute", top: 40, left: 16, right: 16, zIndex: 30,
          padding: "8px 14px", borderRadius: 8, fontSize: 13,
          background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)",
          color: "#fbbf24", display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          animation: "fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <span style={{ fontSize: 15 }}>⚠️</span>
          <span><strong>Showing sample twin:</strong> Add a GitLab token or select a demo scenario to load live graph data.</span>
        </div>
      )}
      <DigitalTwinStatus graph={graph} />
      <div className="resp-graph-info-text" style={{ position:"absolute", bottom:8, left:8, zIndex:10, display:"flex", gap:6, padding:"3px 8px", borderRadius:6, background:"rgba(0,0,0,0.6)", border:"1px solid var(--overlay-06)", backdropFilter:"blur(4px)", fontSize: 13, color:"var(--text-secondary)" }}>
        {[{c:"#22c55e",l:"Safe"},{c:"#eab308",l:"Medium"},{c:"#f97316",l:"High"},{c:"#ef4444",l:"Critical"}].map(x=>(
          <span key={x.l} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:4,height:4,borderRadius:"50%",background:x.c,display:"inline-block",boxShadow:`0 0 4px ${x.c}`}}/>{x.l}</span>
        ))}
      </div>

      {/* Floating zoom and pan controls */}
      <div style={{
        position: "absolute", bottom: 12, right: 12, zIndex: 10,
        display: "flex", gap: 4,
        background: "rgba(15,18,26,0.92)", backdropFilter: "blur(12px)",
        border: "1px solid var(--overlay-08)", borderRadius: 8,
        padding: "4px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}>
        <button onClick={handleZoomIn} title="Zoom In" style={{
          background: "transparent", border: "none", color: "var(--text-primary)",
          width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, cursor: "pointer", transition: "all 0.15s",
        }}>➕</button>
        <button onClick={handleZoomOut} title="Zoom Out" style={{
          background: "transparent", border: "none", color: "var(--text-primary)",
          width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, cursor: "pointer", transition: "all 0.15s",
        }}>➖</button>
        <button onClick={handleResetZoom} title="Reset View" style={{
          background: "transparent", border: "none", color: "var(--text-primary)",
          width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, cursor: "pointer", transition: "all 0.15s",
        }}>🎯</button>
      </div>

      <div className="resp-graph-info" style={{
        position:"absolute", top:8, right:8, zIndex:20, width: 210,
        padding: "8px 12px", borderRadius: 8,
        background: "rgba(8,9,13,0.92)", backdropFilter: "blur(16px)",
        border: `1px solid ${selected ? nodeColor(selected) + "44" : "var(--overlay-06)"}`,
        boxShadow: selected ? `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${nodeColor(selected)}11` : "none",
        animation: "fadeSlideDown 0.2s ease",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}>
        {selected ? (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 19 }}>{TYPE_ICONS[selected.type] ?? "🔹"}</span>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.3px", textTransform: "uppercase" }}>Node</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{selected.label}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background:"none", border:"none", color:"var(--text-tertiary)", cursor:"pointer", fontSize: 16,
                padding:0, lineHeight:1, opacity:0.6,
              }}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 3 }}>{selected.type}</div>
            {selected.riskLevel && (
              <div style={{ display:"flex", gap:3 }}>
                <div style={{
                  padding:"1px 6px", borderRadius:3, fontSize: 12, fontWeight:600,
                  background:`${nodeColor(selected)}22`, color:nodeColor(selected),
                  border:`1px solid ${nodeColor(selected)}33`,
                  textTransform:"uppercase", letterSpacing:"0.3px",
                }}>{selected.riskLevel} Risk</div>
                <div style={{ padding:"1px 6px", borderRadius:3, fontSize: 12, fontWeight:600, background:"rgba(96,165,250,0.1)", color:"var(--accent-blue)", border:"1px solid rgba(96,165,250,0.15)" }}>
                  {graph.links.filter(l => l.source === selected.id || l.target === selected.id).length} connections
                </div>
              </div>
            )}
            {selected.type === "MergeRequest" && (
              <div style={{ padding:"5px 8px", borderRadius:5, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", marginTop:4 }}>
                <div style={{ fontSize: 11, fontWeight:700, letterSpacing:"0.3px", textTransform:"uppercase", color:"#ef4444", marginBottom:2 }}>Path Status</div>
                <div style={{ fontSize: 13, color:"#ef4444", fontWeight:600 }}>⚠ No deployment path</div>
                <div style={{ fontSize: 12, color:"var(--text-secondary)", marginTop:1 }}>{selected.label} → Pipeline missing</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:6 }}>
              <span style={{ fontSize: 16 }}>🌐</span>
              <div>
                <div style={{ fontSize: 13, fontWeight:600, color:"var(--text-primary)" }}>Digital Twin</div>
                <div style={{ fontSize: 12, color:"var(--text-secondary)" }}>Click a node for details</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {[
                {l:"Risk Propagation",v:"Active",c:"#eab308"},
                {l:"Affected Systems",v:String(graph.nodes.filter(n=>n.type==="Service"||n.type==="File").length),c:"var(--text-primary)"},
                {l:"Predicted Failures",v:String(graph.nodes.filter(n=>n.riskLevel==="high"||n.riskLevel==="critical").length),c:"#ef4444"},
              ].map(x=>(
                <div key={x.l} style={{ display:"flex", justifyContent:"space-between", fontSize: 12, color:"var(--text-secondary)", padding:"1px 4px" }}>
                  <span>{x.l}</span>
                  <span style={{ fontWeight:600, color:x.c }}>{x.v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {graph.nodes.length === 0 || graph.links.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:8 }}>
          <span style={{ fontSize: 30, opacity:0.3 }}>🌐</span>
          <div style={{ fontSize: 16, fontWeight:600, color:"var(--text-secondary)" }}>No graph data yet</div>
          <div style={{ fontSize: 14, color:"var(--text-tertiary)", maxWidth:260, textAlign:"center" }}>Orbit data will populate the digital twin once project activity is detected.</div>
        </div>
      ) : (
        <>
          <div style={{
            position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
            overflow: "hidden", clip: "rect(0,0,0,0)", border: 0
          }}>
            Digital twin knowledge graph visualization representing the repository ecosystem. It contains {graph.nodes.length} nodes and {graph.links.length} connections. Node types present include: {Array.from(new Set(graph.nodes.map(n => n.type))).join(", ")}.
          </div>
          <svg ref={svgRef} width="100%" height="100%" role="img" aria-label="Digital twin knowledge graph showing connected nodes and edges across the ecosystem" style={{ flex:1, display:"block" }} />
        </>
      )}
    </div>
  );
}
