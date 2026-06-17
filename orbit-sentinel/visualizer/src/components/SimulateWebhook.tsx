import React, { useState, useEffect, useRef } from "react";

const WEBHOOK_STEPS = [
  { icon: "🔀", label: "MR Opened", desc: "Merge Request !10 detected on test-sentinel branch", color: "#22c55e" },
  { icon: "🛰️", label: "Orbit Queried", desc: "NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION dispatched", color: "#60a5fa" },
  { icon: "🧠", label: "Digital Twin Built", desc: "22 nodes, 40 edges, 4 query types across ecosystem", color: "#a78bfa" },
  { icon: "🔍", label: "Analysis Complete", desc: "Empty diff, no pipeline, 9/10 historical closures detected", color: "#eab308" },
  { icon: "📋", label: "Report Posted", desc: "Full impact analysis with remediation steps generated", color: "#22c55e" },
  { icon: "🎯", label: "Verdict: DO NOT DEPLOY", desc: "Risk score 55%, deployment path broken, 90% abandonment rate", color: "#ef4444" },
];

export default function SimulateWebhook() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (interval.current) clearInterval(interval.current); };
  }, []);

  function start() {
    setRunning(true);
    setStep(0);
    setCompleted(false);
    interval.current = window.setInterval(() => {
      setStep(prev => {
        if (prev >= WEBHOOK_STEPS.length - 1) {
          if (interval.current) clearInterval(interval.current);
          setCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
  }

  function reset() {
    if (interval.current) clearInterval(interval.current);
    setRunning(false);
    setStep(-1);
    setCompleted(false);
  }

  return (
    <div className="card" style={{
      padding: "14px 18px", position: "relative", overflow: "hidden",
      borderColor: running ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.06)",
      background: running ? "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(15,18,26,0.95))" : undefined,
      animation: "fadeSlideUp 0.5s 0.1s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div className="card-header-icon" style={{ background: "rgba(34,197,94,0.12)" }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Simulate MR Webhook</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            {running ? "Orchestrating Orbit query pipeline..." : "Trigger a live simulation of Orbit Sentinel's analysis flow"}
          </div>
        </div>
        <button onClick={running ? reset : start} aria-label={running ? "Stop webhook simulation" : "Run webhook simulation"}
          style={{
            padding: "6px 18px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            border: running ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(34,197,94,0.3)",
            borderRadius: 6,
            background: running ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            color: running ? "#ef4444" : "#22c55e",
            transition: "all 0.15s ease",
            display: "flex", alignItems: "center", gap: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = running ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = running ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)"; }}
        >
          <span style={{ fontSize: 14 }}>{running ? "■" : "▶"}</span>
          {running ? "Stop" : "Run Flow"}
        </button>
      </div>

      {running || completed ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {WEBHOOK_STEPS.map((s, i) => {
            const status = i < step ? "done" : i === step ? "active" : "pending";
            return (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px", borderRadius: 5,
                background: status === "active" ? `${s.color}12` : "transparent",
                border: status === "active" ? `1px solid ${s.color}22` : "1px solid transparent",
                transition: "all 0.3s ease",
                opacity: status === "pending" ? 0.3 : 1,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
                  background: status === "done" ? `${s.color}18` : status === "active" ? `${s.color}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${status === "done" ? s.color + "44" : status === "active" ? s.color + "66" : "rgba(255,255,255,0.08)"}`,
                  animation: status === "active" ? "pulseDot 1s ease-in-out infinite" : undefined,
                }}>
                  {status === "done" ? "✓" : status === "active" ? "●" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: status === "active" ? s.color : "var(--text-primary)" }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: "var(--text-tertiary)" }}>{s.desc}</div>
                </div>
                {status === "done" && <span style={{ fontSize: 8, color: s.color, fontWeight: 600 }}>done</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: "8px 12px", borderRadius: 6,
          background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.1)",
          fontSize: 9, color: "var(--text-tertiary)", lineHeight: 1.4,
        }}>
          <strong style={{ color: "var(--accent-blue)" }}>What happens:</strong> Click "Run Flow" to simulate a real GitLab MR webhook triggering Orbit Sentinel. The visualizer walks through: receiving the webhook → querying all 4 Orbit query types → building the digital twin → analyzing signals → posting the verdict. This is what happens automatically when integrated with GitLab Duo Flow.
        </div>
      )}

      {completed && (
        <div style={{
          marginTop: 8, padding: "6px 12px", borderRadius: 5,
          background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05))",
          border: "1px solid rgba(34,197,94,0.15)",
          display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "var(--text-secondary)",
          animation: "fadeSlideUp 0.3s ease",
        }}>
          <span style={{ fontSize: 13 }}>✅</span>
          <span>Flow complete in <strong style={{ color: "#22c55e" }}>{(WEBHOOK_STEPS.length * 0.7).toFixed(1)}s</strong> — compared to <strong style={{ color: "#ef4444" }}>~45 min</strong> manual review. <strong style={{ color: "var(--accent-blue)" }}>Navigate the tabs above</strong> to explore the full analysis.</span>
        </div>
      )}
    </div>
  );
}
