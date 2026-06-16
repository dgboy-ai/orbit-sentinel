import React, { useState, useCallback } from "react";
import type { VisualizationData } from "./types";
import DigitalTwinGraph from "./components/DigitalTwinGraph";
import BlastRadiusExplorer from "./components/BlastRadiusExplorer";
import RiskHeatmap from "./components/RiskHeatmap";
import SimulationPanel from "./components/SimulationPanel";
import HistoricalContext from "./components/HistoricalContext";
import ImpactReport from "./components/ImpactReport";

const DEMO_DATA: VisualizationData = {
  graph: {
    nodes: [
      { id: "p:1", label: "payment-api", type: "Project", group: "#1f77b4" },
      { id: "s:1", label: "AuthService", type: "Service", riskLevel: "critical", group: "#ff7f0e" },
      { id: "s:2", label: "UserService", type: "Service", riskLevel: "high", group: "#ff7f0e" },
      { id: "s:3", label: "PaymentService", type: "Service", riskLevel: "medium", group: "#ff7f0e" },
      { id: "s:4", label: "NotificationService", type: "Service", riskLevel: "low", group: "#ff7f0e" },
      { id: "f:1", label: "auth_service.ts", type: "File", riskLevel: "critical", group: "#2ca02c" },
      { id: "f:2", label: "auth_controller.ts", type: "File", riskLevel: "critical", group: "#2ca02c" },
      { id: "f:3", label: "user_repository.ts", type: "File", riskLevel: "high", group: "#2ca02c" },
      { id: "f:4", label: "payment_gateway.ts", type: "File", riskLevel: "medium", group: "#2ca02c" },
      { id: "f:5", label: "notification_queue.ts", type: "File", riskLevel: "low", group: "#2ca02c" },
      { id: "f:6", label: "token_validator.ts", type: "File", riskLevel: "high", group: "#2ca02c" },
      { id: "mr:1", label: "MR #184", type: "MergeRequest", group: "#9467bd" },
      { id: "pl:1", label: "Pipeline #8921", type: "Pipeline", riskLevel: "high", group: "#8c564b" },
      { id: "pl:2", label: "Pipeline #8905", type: "Pipeline", riskLevel: "medium", group: "#8c564b" },
      { id: "dep:1", label: "Production", type: "Deployment", group: "#e377c2" },
      { id: "dep:2", label: "Staging", type: "Deployment", group: "#e377c2" },
      { id: "inc:1", label: "Incident #42", type: "Incident", riskLevel: "critical", group: "#7f7f7f" },
      { id: "u:1", label: "@alice", type: "User", group: "#17becf" },
      { id: "u:2", label: "@bob", type: "User", group: "#17becf" },
      { id: "t:1", label: "Platform Team", type: "Team", group: "#bcbd22" },
    ],
    links: [
      { source: "p:1", target: "s:1", type: "CONTAINS" },
      { source: "p:1", target: "s:2", type: "CONTAINS" },
      { source: "p:1", target: "s:3", type: "CONTAINS" },
      { source: "p:1", target: "s:4", type: "CONTAINS" },
      { source: "s:1", target: "f:1", type: "DEPENDS_ON", value: 3 },
      { source: "s:1", target: "f:2", type: "DEPENDS_ON", value: 2 },
      { source: "s:2", target: "f:3", type: "DEPENDS_ON", value: 2 },
      { source: "s:3", target: "f:4", type: "DEPENDS_ON", value: 1 },
      { source: "s:4", target: "f:5", type: "DEPENDS_ON", value: 1 },
      { source: "s:1", target: "f:6", type: "DEPENDS_ON", value: 3 },
      { source: "f:1", target: "mr:1", type: "MODIFIED_IN" },
      { source: "f:2", target: "mr:1", type: "MODIFIED_IN" },
      { source: "mr:1", target: "pl:1", type: "TRIGGERED" },
      { source: "mr:1", target: "pl:2", type: "TRIGGERED" },
      { source: "pl:1", target: "dep:1", type: "DEPLOYED_BY" },
      { source: "pl:2", target: "dep:2", type: "DEPLOYED_BY" },
      { source: "f:1", target: "inc:1", type: "CAUSED_INCIDENT" },
      { source: "mr:1", target: "u:1", type: "AUTHORED_BY" },
      { source: "mr:1", target: "u:2", type: "REVIEWED_BY" },
      { source: "u:1", target: "t:1", type: "MEMBER_OF" },
      { source: "u:2", target: "t:1", type: "MEMBER_OF" },
    ],
  },
  riskData: {
    score: 0.72,
    level: "high",
    breakdown: [
      { category: "File Impact", value: 6, maxValue: 10 },
      { category: "Service Impact", value: 3, maxValue: 10 },
      { category: "Pipeline Risk", value: 4, maxValue: 10 },
      { category: "Historical Incidents", value: 3, maxValue: 10 },
      { category: "Failure Probability", value: 7, maxValue: 10 },
    ],
  },
  timelines: [
    { label: "Files Changed", value: 2, color: "#2ca02c" },
    { label: "Transitive Files", value: 6, color: "#ff7f0e" },
    { label: "Services Affected", value: 3, color: "#d62728" },
    { label: "Failure Predictions", value: 4, color: "#9467bd" },
    { label: "Risk Score (%)", value: 72, color: "#e377c2" },
  ],
  summary: {
    project: "my-org/payment-api",
    mrIid: 184,
    branch: "feat/auth-token-refactor",
    totalNodes: 20,
    totalEdges: 22,
    riskScore: "72.0%",
    riskLevel: "HIGH",
    timestamp: new Date().toISOString(),
  },
};

type View = "overview" | "blast-radius" | "risk" | "simulation" | "historical" | "report";

export default function App() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [data] = useState<VisualizationData>(DEMO_DATA);

  const renderView = useCallback(() => {
    switch (activeView) {
      case "overview":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%" }}>
            <DigitalTwinGraph graph={data.graph} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <RiskHeatmap riskData={data.riskData} />
              <SimulationPanel
                timelines={data.timelines}
                riskLevel={data.riskData.level}
                riskScore={data.riskData.score}
              />
            </div>
          </div>
        );
      case "blast-radius":
        return <BlastRadiusExplorer graph={data.graph} />;
      case "risk":
        return <RiskHeatmap riskData={data.riskData} expanded />;
      case "simulation":
        return (
          <SimulationPanel
            timelines={data.timelines}
            riskLevel={data.riskData.level}
            riskScore={data.riskData.score}
            expanded
          />
        );
      case "historical":
        return <HistoricalContext />;
      case "report":
        return <ImpactReport summary={data.summary} />;
    }
  }, [activeView, data]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "#161b22",
        borderBottom: "1px solid #30363d",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛰️</span>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#e6edf3", margin: 0 }}>
            Orbit Sentinel
          </h1>
          <span style={{
            fontSize: 12,
            color: "#8b949e",
            background: "#21262d",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid #30363d",
          }}>
            Engineering Digital Twin
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {([
            ["overview", "Overview"],
            ["blast-radius", "Blast Radius"],
            ["risk", "Risk"],
            ["simulation", "Simulation"],
            ["historical", "History"],
            ["report", "Report"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                border: "1px solid #30363d",
                borderRadius: 6,
                cursor: "pointer",
                background: activeView === key ? "#1f6feb" : "#21262d",
                color: activeView === key ? "#fff" : "#c9d1d9",
                fontWeight: activeView === key ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, padding: 16, overflow: "auto" }}>
        {renderView()}
      </main>
    </div>
  );
}
