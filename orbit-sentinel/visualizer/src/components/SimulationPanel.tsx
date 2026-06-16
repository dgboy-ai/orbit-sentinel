import React from "react";
import type { TimelineItem } from "../types";
import { riskScoreToColor } from "../utils/colors";

interface Props {
  timelines: TimelineItem[];
  riskLevel: string;
  riskScore: number;
  expanded?: boolean;
}

export default function SimulationPanel({ timelines, riskLevel, riskScore, expanded }: Props) {
  return (
    <div style={{
      background: "#161b22",
      borderRadius: 8,
      border: "1px solid #30363d",
      padding: expanded ? 24 : 16,
      flex: expanded ? undefined : 1,
    }}>
      <h3 style={{ fontSize: 14, color: "#e6edf3", marginBottom: 16 }}>
        Change Simulation
      </h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          padding: 12,
          background: "#0d1117",
          borderRadius: 6,
          border: "1px solid #30363d",
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 4 }}>SIMULATION: What happens if</div>
          <div style={{ fontSize: 14, color: "#e6edf3", fontWeight: 500 }}>
            auth_service.ts is modified?
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 12,
        }}>
          {["Current System", "→ Proposed Change", "→ Predicted State"].map((label, i) => (
            <div key={label} style={{
              flex: 1,
              padding: "8px 12px",
              background: "#0d1117",
              borderRadius: 6,
              border: "1px solid #30363d",
              textAlign: "center",
              fontSize: 11,
              color: i === 2 ? riskScoreToColor(riskScore) : "#8b949e",
              fontWeight: i === 2 ? 600 : 400,
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {timelines.map((item) => (
          <div key={item.label}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#c9d1d9",
              marginBottom: 2,
            }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{item.value}</span>
            </div>
            <div style={{
              height: 6,
              background: "#21262d",
              borderRadius: 3,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.min(item.value, 100)}%`,
                height: "100%",
                background: item.color,
                borderRadius: 3,
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
