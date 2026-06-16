import React from "react";

const HISTORICAL_DATA = [
  {
    mrIid: 184,
    title: "Update auth token validation to support JWT",
    outcome: "failure" as const,
    similarity: 87,
    summary: "An almost identical authentication change was introduced in MR #184 and caused production failures in three downstream services due to incompatible token format.",
    date: "2026-03-15",
  },
  {
    mrIid: 156,
    title: "Refactor AuthService.authenticate method",
    outcome: "success" as const,
    similarity: 72,
    summary: "Similar refactor completed successfully with proper feature flag gating.",
    date: "2026-02-28",
  },
  {
    mrIid: 142,
    title: "Add token refresh endpoint",
    outcome: "rollback" as const,
    similarity: 65,
    summary: "Token refresh endpoint was rolled back after integration tests failed in staging. Missing backwards compatibility for existing sessions.",
    date: "2026-02-10",
  },
  {
    mrIid: 118,
    title: "Migrate auth to OAuth 2.0",
    outcome: "incident" as const,
    similarity: 58,
    summary: "OAuth migration caused incident #42 — all API calls failed for 12 minutes due to missing scope validation.",
    date: "2026-01-20",
  },
];

function outcomeIcon(outcome: string) {
  switch (outcome) {
    case "success": return "✅";
    case "failure": return "🚨";
    case "rollback": return "🔙";
    case "incident": return "⚠️";
    default: return "❓";
  }
}

function outcomeColor(outcome: string) {
  switch (outcome) {
    case "success": return "#7ee787";
    case "failure": return "#ff7b72";
    case "rollback": return "#ffa657";
    case "incident": return "#d29922";
    default: return "#8b949e";
  }
}

export default function HistoricalContext() {
  return (
    <div style={{
      background: "#161b22",
      borderRadius: 8,
      border: "1px solid #30363d",
      padding: 24,
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, color: "#e6edf3", marginBottom: 4 }}>
          Repository Memory
        </h3>
        <p style={{ fontSize: 12, color: "#8b949e" }}>
          Similar changes found in repository history. The system learns from past outcomes.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {HISTORICAL_DATA.map((item) => (
          <div key={item.mrIid} style={{
            padding: 16,
            background: "#0d1117",
            borderRadius: 8,
            border: "1px solid #30363d",
            borderLeft: `3px solid ${outcomeColor(item.outcome)}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 13, color: "#58a6ff", fontWeight: 500 }}>
                  !{item.mrIid}
                </span>
                <span style={{ fontSize: 13, color: "#e6edf3", marginLeft: 8 }}>
                  {item.title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: `${outcomeColor(item.outcome)}22`,
                  color: outcomeColor(item.outcome),
                }}>
                  {outcomeIcon(item.outcome)} {item.outcome}
                </span>
                <span style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "#1f6feb22",
                  color: "#58a6ff",
                }}>
                  {item.similarity}% match
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#c9d1d9", lineHeight: 1.5, margin: 0 }}>
              {item.summary}
            </p>
            <div style={{ fontSize: 11, color: "#8b949e", marginTop: 8 }}>
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
