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
  properties?: Record<string, unknown>;
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

export interface OrbitQueryEvidence {
  queryType: string;
  queryName: string;
  result: string;
}

export interface DecisionCenterData {
  deploymentStrategy: string;
  reviewers: { name: string; role: string }[];
  requiredTests: string[];
  rollbackStrategy: string;
  riskReduction: {
    current: number;
    afterRecommendation: number;
  };
}

export interface CounterfactualScenario {
  label: string;
  riskAfter: number;
  color: string;
}

export interface HistoricalIncident {
  similarity: number;
  mrIid: number;
  title: string;
  files: string[];
  outcome: string;
  rootCause: string;
  mitigation: string;
  recommendedAction: string;
  date: string;
}

export interface Summary {
  project: string;
  mrIid: number;
  branch: string;
  totalNodes: number;
  totalEdges: number;
  riskScore: string;
  riskLevel: string;
  timestamp: string;
}

export interface FutureTimelineEvent {
  day: number;
  label: string;
  description: string;
  icon: string;
}

export interface QueryTimingInfo {
  queryType: string;
  queryName: string;
  durationMs: number;
  nodeCount: number;
  edgeCount: number;
  status: "success" | "error";
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
  summary: Summary;
  hero: {
    mrIid: number;
    riskLevel: string;
    riskScore: number;
    predictedOutcome: string;
    recommendedAction: string;
    confidence: string;
    generatedUsing: string;
    confidenceFactors: { label: string; value: string; status: "success" | "warning" | "error" }[];
  };
  evidence: OrbitQueryEvidence[];
  futureTimeline: FutureTimelineEvent[];
  decisionCenter: DecisionCenterData;
  counterfactuals: CounterfactualScenario[];
  incidents: HistoricalIncident[];
  queryTimings?: QueryTimingInfo[];
  fallback?: boolean;
}
