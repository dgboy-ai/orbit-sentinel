import React, { useState, useEffect } from "react";

const QUERY_STEPS = [
  { id: "NEIGHBORS", label: "Blast Radius", icon: "🌐", desc: "Scanning connected files, services, and dependencies affected by this MR" },
  { id: "PATH_FINDING", label: "Dependency Trace", icon: "🧭", desc: "Tracing deployment path from MR through pipeline to production" },
  { id: "TRAVERSAL", label: "Historical Context", icon: "📜", desc: "Matching against past MRs and incidents on the same files" },
  { id: "AGGREGATION", label: "Ecosystem Analysis", icon: "📊", desc: "Analyzing pipeline health and failure patterns across the project" },
];

interface StepState {
  status: "pending" | "active" | "done";
}

export default function LoadingNarrative({ startTime, onDone }: { startTime: number; onDone: () => void }) {
  const [stepStates, setStepStates] = useState<StepState[]>(
    QUERY_STEPS.map((_, i) => ({ status: i === 0 ? "active" as const : "pending" as const }))
  );
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const delays = [400, 900, 1400, 1900];
    const timers: number[] = [];

    QUERY_STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => {
        setStepStates(prev => prev.map((s, j) => ({
          status: j < i + 1 ? "done" as const : j === i + 1 ? "active" as const : "pending" as const,
        })));
      }, delays[i]));
    });

    timers.push(window.setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 500);
    }, 2400));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8,9,13,0.92)", backdropFilter: "blur(12px)",
      opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 440, width: "92%", textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
          background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(139,92,246,0.1))",
          border: "1px solid rgba(96,165,250,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          animation: "float 6s ease-in-out infinite",
        }}>🛰️</div>

        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
          Building Digital Twin
        </div>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
          Querying GitLab Orbit knowledge graph across all 4 query types
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
          {QUERY_STEPS.map((step, i) => {
            const state = stepStates[i];
            const isDone = state.status === "done";
            const isActive = state.status === "active";
            return (
              <div key={step.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8,
                background: isDone ? "rgba(34,197,94,0.06)" : isActive ? "rgba(96,165,250,0.06)" : "transparent",
                border: `1px solid ${
                  isDone ? "rgba(34,197,94,0.15)" : isActive ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)"
                }`,
                transition: "all 0.3s ease",
                opacity: state.status === "pending" ? 0.4 : 1,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDone ? "rgba(34,197,94,0.15)" : isActive ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.04)",
                  fontSize: 10,
                }}>
                  {isDone ? "✓" : isActive ? "◉" : "○"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isDone ? "#22c55e" : isActive ? "#60a5fa" : "var(--text-secondary)" }}>
                    {step.icon} {step.id}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-tertiary)", lineHeight: 1.3 }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, fontSize: 9, color: "var(--text-tertiary)" }}>
          All 4 Orbit query types · No black box · Real graph data
        </div>
        <button onClick={onDone}
          style={{
            marginTop: 14, padding: "4px 16px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
            background: "transparent", color: "var(--text-tertiary)",
            transition: "all 0.15s ease",
            animation: "fadeSlideUp 0.5s 1s ease both",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >Skip →</button>
      </div>
    </div>
  );
}
