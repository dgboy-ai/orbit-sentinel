import React from "react";
import type { RiskBreakdown } from "../types";
import { riskScoreToColor } from "../utils/colors";

interface Props {
  riskData: {
    score: number;
    level: string;
    breakdown: RiskBreakdown[];
  };
  expanded?: boolean;
}

export default function RiskHeatmap({ riskData, expanded }: Props) {
  const scoreColor = riskScoreToColor(riskData.score);

  return (
    <div style={{
      background: "#161b22",
      borderRadius: 8,
      border: "1px solid #30363d",
      padding: expanded ? 24 : 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color: "#e6edf3", margin: 0 }}>Risk Assessment</h3>
        <span style={{
          padding: "2px 10px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          background: `${scoreColor}22`,
          color: scoreColor,
          border: `1px solid ${scoreColor}44`,
        }}>
          {riskData.level.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#8b949e",
          marginBottom: 4,
        }}>
          <span>Risk Score</span>
          <span>{(riskData.score * 100).toFixed(0)}%</span>
        </div>
        <div style={{
          height: 8,
          background: "#21262d",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          <div style={{
            width: `${riskData.score * 100}%`,
            height: "100%",
            background: scoreColor,
            borderRadius: 4,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {riskData.breakdown.map((item) => (
          <div key={item.category}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#8b949e",
              marginBottom: 2,
            }}>
              <span>{item.category}</span>
              <span>{item.value}/{item.maxValue}</span>
            </div>
            <div style={{
              height: 4,
              background: "#21262d",
              borderRadius: 2,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${(item.value / item.maxValue) * 100}%`,
                height: "100%",
                background: riskScoreToColor(item.value / item.maxValue),
                borderRadius: 2,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
