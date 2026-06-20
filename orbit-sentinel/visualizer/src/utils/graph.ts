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
  const minDepth = new Map<string, number>();
  minDepth.set(nodeId, 0);

  const queue: { id: string; depth: number }[] = [{ id: nodeId, depth: 0 }];
  const resultNodes = new Map<string, GraphNode>();
  const resultLinks: GraphLink[] = [];
  const seenLinks = new Set<string>();

  function linkKey(sourceId: string, targetId: string, type: string) {
    const a = sourceId < targetId ? sourceId : targetId;
    const b = sourceId < targetId ? targetId : sourceId;
    return `${a}|${b}|${type}`;
  }

  while (queue.length > 0) {
    const { id: currentId, depth } = queue.shift()!;
    if (depth > maxDepth) continue;

    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      resultNodes.set(currentId, node);
    }

    for (const link of links) {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;

      if (sourceId === currentId) {
        const nextDepth = depth + 1;
        if (nextDepth <= maxDepth) {
          const prev = minDepth.get(targetId);
          if (prev === undefined || nextDepth < prev) {
            minDepth.set(targetId, nextDepth);
            queue.push({ id: targetId, depth: nextDepth });
          }
          if (!seenLinks.has(linkKey(sourceId, targetId, link.type))) {
            seenLinks.add(linkKey(sourceId, targetId, link.type));
            resultLinks.push(link);
          }
        }
      } else if (targetId === currentId) {
        const nextDepth = depth + 1;
        if (nextDepth <= maxDepth) {
          const prev = minDepth.get(sourceId);
          if (prev === undefined || nextDepth < prev) {
            minDepth.set(sourceId, nextDepth);
            queue.push({ id: sourceId, depth: nextDepth });
          }
          if (!seenLinks.has(linkKey(sourceId, targetId, link.type))) {
            seenLinks.add(linkKey(sourceId, targetId, link.type));
            resultLinks.push(link);
          }
        }
      }
    }
  }

  const nodeIds = new Set(resultNodes.keys());
  return {
    nodes: Array.from(resultNodes.values()),
    links: resultLinks.filter(l => {
      const src = typeof l.source === "string" ? l.source : l.source.id;
      const tgt = typeof l.target === "string" ? l.target : l.target.id;
      return nodeIds.has(src) && nodeIds.has(tgt);
    }),
  };
}

