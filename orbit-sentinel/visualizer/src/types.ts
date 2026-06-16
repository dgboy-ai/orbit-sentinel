export interface GraphNode {
  id: string;
  label: string;
  type: string;
  riskLevel?: string;
  group?: string;
  fx?: number;
  fy?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  value?: number;
}

export interface RiskBreakdown {
  category: string;
  value: number;
  maxValue: number;
}

export interface TimelineItem {
  label: string;
  value: number;
  color: string;
}

export interface VisualizationData {
  graph: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  riskData: {
    score: number;
    level: string;
    breakdown: RiskBreakdown[];
  };
  timelines: TimelineItem[];
  summary: Record<string, string | number>;
}
