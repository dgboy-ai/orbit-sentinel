import React from "react";

const DATA = [
  { mrIid: 184, title: "Update auth token validation to support JWT", outcome: "failure" as const, similarity: 87, summary: "An almost identical authentication change caused production failures in three downstream services due to incompatible token format.", date: "2026-03-15" },
  { mrIid: 156, title: "Refactor AuthService.authenticate method", outcome: "success" as const, similarity: 72, summary: "Similar refactor completed successfully with proper feature flag gating.", date: "2026-02-28" },
  { mrIid: 142, title: "Add token refresh endpoint", outcome: "rollback" as const, similarity: 65, summary: "Token refresh endpoint was rolled back after integration tests failed in staging.", date: "2026-02-10" },
  { mrIid: 118, title: "Migrate auth to OAuth 2.0", outcome: "incident" as const, similarity: 58, summary: "OAuth migration caused incident #42 — all API calls failed for 12 minutes due to missing scope validation.", date: "2026-01-20" },
];

function oc(outcome: string): { icon: string; color: string; bg: string } {
  const m: Record<string, { icon: string; color: string; bg: string }> = {
    success: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    failure: { icon: "🚨", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    rollback: { icon: "🔙", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    incident: { icon: "⚠️", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  };
  return m[outcome] ?? { icon: "❓", color: "#8b949e", bg: "rgba(255,255,255,0.04)" };
}

export default function HistoricalContext() {
  return (
    <div className="card" style={{ padding: 24, animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>📜</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Repository Memory</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Similar changes found in repository history</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DATA.map((item, i) => {
          const c = oc(item.outcome);
          return (
            <div key={item.mrIid} style={{
              padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${c.color}`,
              animation: `fadeSlideUp 0.4s ${0.1 + i * 0.06}s ease both`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{c.icon}</span>
                  <span style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</span>
                  <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{item.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: c.bg, color: c.color, fontWeight: 600 }}>{c.icon} {item.outcome}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)", fontWeight: 600 }}>{item.similarity}% match</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{item.summary}</p>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6 }}>{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
