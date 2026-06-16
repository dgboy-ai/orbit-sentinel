import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "../types";
import { getNodeColor, riskScoreToColor } from "../utils/colors";

interface Props {
  graph: { nodes: GraphNode[]; links: GraphLink[] };
}

export default function DigitalTwinGraph({ graph }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<GraphNode>(graph.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(graph.links)
        .id((d) => d.id)
        .distance((d) => 150 / (d.value ?? 1))
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = g.append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(graph.links)
      .join("line")
      .attr("stroke", "#30363d")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.max(1, (d.value ?? 1) * 1.5));

    const node = g.append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(graph.nodes)
      .join("g")
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as unknown as d3.DragBehavior<SVGGElement, GraphNode, GraphNode>,
      );

    node.append("circle")
      .attr("r", (d) => {
        const sizes: Record<string, number> = { Project: 12, Service: 10, File: 6, MergeRequest: 8, Pipeline: 8, Deployment: 9, Incident: 7, User: 7, Team: 9 };
        return sizes[d.type] ?? 6;
      })
      .attr("fill", (d) => {
        if (d.riskLevel) return riskScoreToColor(d.riskLevel === "critical" ? 0.9 : d.riskLevel === "high" ? 0.6 : d.riskLevel === "medium" ? 0.3 : 0.1);
        return getNodeColor(d.type);
      })
      .attr("stroke", "#0d1117")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d) => d.label)
      .attr("x", 10)
      .attr("y", 4)
      .attr("font-size", 11)
      .attr("fill", "#e6edf3")
      .attr("font-family", "monospace");

    node.append("title")
      .text((d) => `${d.type}: ${d.label}${d.riskLevel ? ` [Risk: ${d.riskLevel}]` : ""}`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graph]);

  return (
    <div style={{
      background: "#0d1117",
      borderRadius: 8,
      border: "1px solid #30363d",
      overflow: "hidden",
      position: "relative",
      height: "100%",
    }}>
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        fontSize: 12,
        color: "#8b949e",
        background: "rgba(13,17,23,0.8)",
        padding: "6px 12px",
        borderRadius: 4,
        border: "1px solid #30363d",
      }}>
        Digital Twin — {graph.nodes.length} nodes, {graph.links.length} edges
      </div>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
