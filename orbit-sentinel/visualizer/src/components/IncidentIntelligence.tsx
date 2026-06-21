import React from "react";
import type { HistoricalIncident } from "../types";

function oc(outcome: string): { icon: string; color: string; bg: string } {
  const m: Record<string, { icon: string; color: string; bg: string }> = {
    "Production Outage": { icon: "🚨", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    Rollback: { icon: "🔙", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    Incident: { icon: "⚠️", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    Closed: { icon: "🔒", color: "#8b949e", bg: "rgba(139,148,158,0.1)" },
    Merged: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  };
  return m[outcome] ?? { icon: "❓", color: "#8b949e", bg: "var(--overlay-04)" };
}

export default function IncidentIntelligence({ incidents }: { incidents: HistoricalIncident[] }) {
  if (!incidents.length) return (
    <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeSlideUp 0.5s 0.2s ease both" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 34, marginBottom: 6 }}>✅</div><div style={{ fontSize: 18, color: "var(--text-secondary)" }}>No similar historical incidents found</div></div>
    </div>
  );

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", animation: "fadeSlideUp 0.5s 0.2s ease both", height: "100%", overflow: "auto", position: "relative" }}>
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: "rgba(239,68,68,0.05)", filter: "blur(60px)", pointerEvents: "none", transform: "translate(20%, 20%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="card-header-icon" style={{ background: "rgba(239,68,68,0.12)" }}>📜</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Incident Intelligence</div>
          <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>{incidents.length} historical match{incidents.length > 1 ? "es" : ""}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflow: "auto", paddingRight: 4 }}>
        {incidents.map((inc, i) => {
          const c = oc(inc.outcome);
          return (
            <div key={inc.mrIid}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.background = `${c.bg}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--overlay-06)"; e.currentTarget.style.background = "var(--overlay-03)"; }}
            style={{
              padding: 12, borderRadius: 10, background: "var(--overlay-03)", border: "1px solid var(--overlay-06)", borderLeft: `3px solid ${c.color}`,
              animation: `fadeSlideUp 0.4s ${0.35 + i * 0.08}s ease both`, transition: "all 0.2s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{c.icon}</span>
                  <span style={{ fontSize: 16, color: "var(--accent-blue)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>!{inc.mrIid}</span>
                  <span style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 500 }}>{inc.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: c.bg, border: `1px solid ${c.bg}` }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, display: "inline-block", animation: "pulseDot 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{inc.similarity}%</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 5 }}>
                {inc.files.map(f => (
                  <span key={f} style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)", background: "var(--overlay-04)", padding: "1px 6px", borderRadius: 3, border: "1px solid var(--overlay-06)" }}>{f}</span>
                ))}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", borderRadius: 3, background: c.bg, color: c.color, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.icon} {inc.outcome}</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 3, lineHeight: 1.5 }}><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Root:</span> {inc.rootCause}</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4, lineHeight: 1.5 }}><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Fix:</span> {inc.mitigation}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-blue)", padding: "3px 8px", borderRadius: 5, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>→ {inc.recommendedAction}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
