import React, { useState, useEffect } from "react";

const QUERY_TYPES = ["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"];

interface Props {
  startTime: number;
  onDone: () => void;
}

export default function LoadingNarrative({ startTime, onDone }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const e = Date.now() - startTime;
      setElapsed(e);
      if (e > 3000) setShowSkip(true);
    }, 200);
    return () => clearInterval(timer);
  }, [startTime]);

  const progress = Math.min(elapsed / 15000, 1);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8,9,13,0.92)", backdropFilter: "blur(12px)",
      opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 440, width: "92%", textAlign: "center" }}>
        <div style={{ position: "relative", width: 48, margin: "0 auto 16px" }}>
          <div style={{
            position: "absolute", inset: -12, borderRadius: "50%",
            border: "1px solid rgba(96,165,250,0.1)",
            animation: "spin 6s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: "1px dashed rgba(139,92,246,0.08)",
            animation: "spin 8s linear infinite reverse",
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12, position: "relative",
            background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(139,92,246,0.1))",
            border: "1px solid rgba(96,165,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            animation: "float 6s ease-in-out infinite",
          }}>🛰️</div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
          Analyzing MR — Querying Orbit
        </div>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
          Running {QUERY_TYPES.length} GraphQL queries against the knowledge graph
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
          {QUERY_TYPES.map((qt, i) => (
            <div key={qt} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(96,165,250,0.1)", fontSize: 10,
                animation: elapsed > i * 1000 ? "pulseDot 1.5s ease-in-out infinite" : "none",
              }}>◉</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {qt}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
                  {qt === "NEIGHBORS" && "Connected files, services, and dependencies"}
                  {qt === "PATH_FINDING" && "Deployment pathways from MR to production"}
                  {qt === "TRAVERSAL" && "Repository history for similar MRs"}
                  {qt === "AGGREGATION" && "Pipeline health and failure rates"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            width: `${progress * 100}%`, height: "100%", borderRadius: 2,
            background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
            transition: "width 0.3s ease",
          }} />
        </div>

        <div style={{ marginTop: 10, fontSize: 9, color: "var(--text-tertiary)" }}>
          {elapsed < 1000 ? "Initializing..." : `${(elapsed / 1000).toFixed(1)}s elapsed`}
        </div>

        {showSkip && (
          <button onClick={() => { setFadeOut(true); setTimeout(onDone, 500); }}
            style={{
              marginTop: 14, padding: "4px 16px", fontSize: 10, fontWeight: 600, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
              background: "transparent", color: "var(--text-tertiary)",
              animation: "fadeSlideUp 0.3s ease",
            }}
          >Skip →</button>
        )}
      </div>
    </div>
  );
}
