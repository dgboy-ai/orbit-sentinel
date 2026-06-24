import React from "react";
import type { FutureTimelineEvent } from "../types";

function TimelineDot({ active, color }: { active: boolean; color?: string }) {
  const c = color || (active ? "var(--accent-blue)" : "var(--overlay-08)");
  return (
    <div style={{
      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
      background: active ? c : "var(--overlay-04)",
      border: active ? `2px solid ${c}88` : "2px solid var(--overlay-08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.3s ease",
      boxShadow: active ? `0 0 12px ${c}44` : "none",
      zIndex: 1,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#fff" : "transparent" }} />
    </div>
  );
}

const DAY_COLORS = [
  { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", dot: "#60a5fa" },
  { bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.15)", dot: "#a78bfa" },
  { bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.15)", dot: "#fbbf24" },
  { bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.15)", dot: "#f97316" },
  { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", dot: "#ef4444" },
];

export default function FutureTimeline({ events, confidence }: { events: FutureTimelineEvent[]; confidence?: string }) {
  return (
    <div className="card" style={{
      padding: 20, display: "flex", flexDirection: "column",
      height: "100%", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(15,18,26,0.98))",
      borderColor: "var(--overlay-06)",
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(96,165,250,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(167,139,250,0.04)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.05))",
            border: "1px solid rgba(96,165,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🔮</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" }}>Predicted Future</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Digital twin forecast · {confidence ?? "High"}</div>
          </div>
        </div>

        {events.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 15 }}>No predictions available — insufficient data</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, position: "relative", paddingLeft: 2 }}>
            {events.map((ev, i) => {
              const dayColor = DAY_COLORS[Math.min(i, DAY_COLORS.length - 1)];
              return (
                <div key={ev.day} style={{
                  display: "flex", gap: 12, position: "relative",
                  animation: `fadeSlideUp 0.4s ${0.1 + i * 0.08}s ease both`,
                }}>
                  {/* Timeline track */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative", paddingTop: 3 }}>
                    <TimelineDot active={i === 0} color={dayColor.dot} />
                    {i < events.length - 1 && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 24,
                        background: `linear-gradient(to bottom, ${dayColor.dot}88, var(--overlay-04))`,
                        boxShadow: i === 0 ? `0 0 6px ${dayColor.dot}44` : "none",
                      }} />
                    )}
                  </div>

                  {/* Event card */}
                  <div style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8, marginBottom: 3,
                    background: i === 0 ? dayColor.bg : "var(--overlay-02)",
                    border: i === 0 ? `1px solid ${dayColor.border}` : "1px solid var(--overlay-04)",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = dayColor.dot + "66"; e.currentTarget.style.background = dayColor.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? dayColor.border : "var(--overlay-04)"; e.currentTarget.style.background = i === 0 ? dayColor.bg : "var(--overlay-02)"; }}
                  >
                    {/* Day badge */}
                    <div style={{
                      position: "absolute", top: 6, right: 8,
                      padding: "1px 6px", borderRadius: 3,
                      background: `${dayColor.dot}15`, border: `1px solid ${dayColor.dot}25`,
                      fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      color: dayColor.dot, letterSpacing: "0.3px",
                    }}>
                      D+{ev.day}
                    </div>

                    {i === 0 && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                        background: dayColor.dot,
                        boxShadow: `0 0 8px ${dayColor.dot}66`,
                      }} />
                    )}

                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 17 }}>{ev.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? dayColor.dot : "var(--text-primary)", letterSpacing: "0.2px" }}>{ev.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4, marginLeft: 0 }}>{ev.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
