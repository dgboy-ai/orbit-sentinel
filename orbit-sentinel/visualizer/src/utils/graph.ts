import type { GraphNode, GraphLink } from "../types";

export function computeGraphStats(nodes: GraphNode[], links: GraphLink[]) {
  const nodeTypeCounts: Record<string, number> = {};
  for (const node of nodes) {
    nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] ?? 0) + 1;
  }

  const linkTypeCounts: Record<string, number> = {};
  for (const link of links) {
    linkTypeCounts[link.type] = (linkTypeCounts[link.type] ?? 0) + 1;
  }

  const highRiskNodes = nodes.filter(
    (n) => n.riskLevel === "high" || n.riskLevel === "critical",
  ).length;

  return {
    totalNodes: nodes.length,
    totalLinks: links.length,
    nodeTypeCounts,
    linkTypeCounts,
    highRiskNodes,
    nodeTypes: Object.keys(nodeTypeCounts).length,
    linkTypes: Object.keys(linkTypeCounts).length,
  };
}

export function filterNodesByType(
  nodes: GraphNode[],
  types: string[],
): GraphNode[] {
  return nodes.filter((n) => types.includes(n.type));
}

export function findConnectedComponents(
  nodes: GraphNode[],
  links: GraphLink[],
  nodeId: string,
  maxDepth = 3,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const visited = new Set<string>();
  const resultNodes: GraphNode[] = [];
  const resultLinks: GraphLink[] = [];

  function traverse(currentId: string, depth: number) {
    if (depth > maxDepth || visited.has(currentId)) return;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (node) resultNodes.push(node);

    for (const link of links) {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;

      if (sourceId === currentId) {
        resultLinks.push(link);
        traverse(targetId, depth + 1);
      } else if (targetId === currentId) {
        resultLinks.push(link);
        traverse(sourceId, depth + 1);
      }
    }
  }

  traverse(nodeId, 0);
  return { nodes: resultNodes, links: resultLinks };
}
