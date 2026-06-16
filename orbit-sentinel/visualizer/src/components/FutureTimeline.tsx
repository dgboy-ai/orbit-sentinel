import React from "react";
import type { FutureTimelineEvent } from "../types";

function TimelineDot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%",
      background: active ? "var(--accent-blue)" : "rgba(255,255,255,0.08)",
      border: active ? "2px solid rgba(59,130,246,0.5)" : "2px solid rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "all 0.3s ease",
    }}>
      <div style={{
        width: 4, height: 4, borderRadius: "50%",
        background: active ? "#fff" : "transparent",
      }} />
    </div>
  );
}

export default function FutureTimeline({ events }: { events: FutureTimelineEvent[] }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, borderRadius: "50%", background: "rgba(96,165,250,0.05)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)" }}>🔮</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Predicted Future</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Engineering digital twin forecast · 78% confidence</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, position: "relative", paddingLeft: 6 }}>
        {events.map((ev, i) => (
          <div key={ev.day} style={{
            display: "flex", gap: 14, position: "relative",
            animation: `fadeSlideUp 0.4s ${0.1 + i * 0.08}s ease both`,
            paddingBottom: i < events.length - 1 ? 0 : 0,
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative", paddingTop: 2 }}>
              <TimelineDot active={i === 0} />
              {i < events.length - 1 && (
                <div style={{
                  width: 1, flex: 1, minHeight: 28,
                  background: `linear-gradient(to bottom, ${i === 0 ? "var(--accent-blue)" : "rgba(255,255,255,0.08)"}, rgba(255,255,255,0.04))`,
                }} />
              )}
            </div>
            <div style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, marginBottom: 2,
              background: i === 0 ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
              border: i === 0 ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(255,255,255,0.04)",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)"; e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.background = i === 0 ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "var(--accent-blue)" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>D+{ev.day}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{ev.icon} {ev.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>{ev.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
