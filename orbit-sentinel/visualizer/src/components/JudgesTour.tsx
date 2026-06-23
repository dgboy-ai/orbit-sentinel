import React, { useState, useEffect } from "react";

interface TourStep {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
}

const TOUR_STEPS: TourStep[] = [
  { icon: "🎯", title: "The Problem", subtitle: "This is what we solve", description: "Developers manually check blast radius, deployment paths, and historical failures per MR — and CI/CD alone doesn't assess deployment safety. This creates costly blind spots every sprint.", focus: "Three columns: Problem → Solution → Quantified Impact. Reads left to right." },
  { icon: "📈", title: "Impact by the Numbers", subtitle: "Quantified results", description: "Orbit Sentinel reduces manual analysis time per MR. Context-rich alerts with cross-referenced graph evidence. Actionable remediation for every risk found. Cross-references all 4 Orbit query types. (Tip: press D or click ☀️ to toggle light theme.)", focus: "Five quantified metrics — each driven by Orbit graph data." },
  { icon: "🔍", title: "The Verdict (per MR)", subtitle: "Hero prediction panel", description: "Every MR gets a verdict: risk level, predicted outcome, and recommended action. Confidence factors trace back to specific Orbit signals — no black box. The gauge shows failure probability at a glance.", focus: "Left side: prediction + action. Right side: 4 confidence factors + risk gauge." },
  { icon: "💥", title: "Orbit Graph Explorer", subtitle: "NEIGHBORS query", description: "Powered by Orbit's NEIGHBORS query. Shows everything connected to the changed files — downstream services, upstream dependencies, related MRs, and incidents. Interactive D3 force-directed graph.", focus: "Click any node to inspect. Use depth slider to control how far the blast radius extends. Red nodes = high risk." },
  { icon: "⚠️", title: "Risk Investigation", subtitle: "AGGREGATION query", description: "Powered by Orbit's AGGREGATION query. Five risk dimensions scored from pipeline failure rates, historical abandonment patterns, deployment path integrity, code review status, and diff health.", focus: "Each bar shows a risk dimension. Click a mitigation to see risk animate downward in real-time." },
  { icon: "🛤️", title: "Deployment Path Analysis", subtitle: "Digital twin trace", description: "Traces MR → Pipeline → Service → Deployment → Production. The pipeline step shows MISSING — the deployment path is broken. No path to production detected.", focus: "Animated flow with shake effect on the broken link. Red 'PATH BROKEN' warning at the bottom." },
  { icon: "🌐", title: "Digital Twin Graph", subtitle: "All 4 queries converge", description: "23 nodes, 43 relationships across 9 node types. Every Orbit query type contributes data: NEIGHBORS finds connections, PATH_FINDING traces dependencies, TRAVERSAL links history, AGGREGATION scores pipeline risk.", focus: "Interactive D3 graph. Hover nodes to highlight connections. Drag to rearrange." },
  { icon: "🧪", title: "What-If Simulation", subtitle: "Forecast outcomes", description: "Click any scenario to see risk change in real-time. Add actual file changes? Risk drops from 55% to 35%. Add pipeline? 28%. Assign reviewers? 30%. Apply ALL mitigations? 10% — near-eliminated.", focus: "Click each scenario card to animate risk down. The result panel explains the outcome of each choice." },
  { icon: "📜", title: "Historical Intelligence", subtitle: "TRAVERSAL query", description: "Orbit's TRAVERSAL query found 9 prior MRs from the same branch — all closed. 90% match similarity. Root cause: repeated abandoned iterations with no pipeline and no reviewers.", focus: "Each incident card shows similarity score, root cause, and recommended action. Left border color = severity." },
  { icon: "🎯", title: "Closed-Loop Predictions", subtitle: "Post-merge verification + ROI", description: "Every prediction is tracked through a 7-day survival window after merge — TP/TN/FP/FN confusion matrix shows real accuracy. The ROI calculator translates this into estimated dollar impact with configurable parameters (MR volume, hourly rate, incident cost).", focus: "Stat cards show accuracy, failures caught, and MRs tracked. Confusion matrix is color-coded. Closed-loop banner explains Predict → Ship → Verify → Learn." },
  { icon: "🛠️", title: "Duo Agent Platform Integration", subtitle: "Flow + Skill + AI Catalog", description: "The orbit-sentinel flow (orbit-sentinel-flow.yaml) defines a 6-step autonomous workflow: schema discovery → NEIGHBORS blast radius → PATH_FINDING dependency chain → TRAVERSAL historical matches → AGGREGATION pipeline risk → compose & post report. The skill (skills/orbit-sentinel/) provides 6 ready-to-use Orbit query recipes. Published to AI Catalog via glab skills publish. MCP server config in .gitlab/duo/mcp.json.", focus: "Flow runs on MR open/commit. Agent is single-threaded, 300s timeout. Skill install: glab skills install --global orbit-sentinel." },
  { icon: "⚡", title: "Setup Wizard", subtitle: "4-step guided journey", description: "The Setup Wizard walks through Mission → Architecture → Setup → Launch. Copy commands directly, explore the Devpost checklist, and see the one-click quick start. Every step has animated transitions and error-boundary safety.", focus: "Cards with copy-to-clipboard buttons. Quick start commands. Devpost-ready launch checklist at the end." },
  { icon: "🏁", title: "You've Seen Every View", subtitle: "All 8 views, all 4 queries", description: "You just walked through: Problem → Impact → Verdict → Orbit Graph (NEIGHBORS) → Risk (AGGREGATION) → Path Trace → Digital Twin → Simulation → History (TRAVERSAL) → Closed-Loop Predictions → Duo Agent → Setup Wizard → Export. Every Orbit query type powers a live view. Not one line of CI changed.", focus: "Press Space for auto-demo. Arrow keys navigate. D toggles dark/light theme. ⬇ exports a full HTML report. 👑 restarts this tour. Share the link with ?judge=true." },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 6, height: 4, borderRadius: 2,
          background: i === current ? "#60a5fa" : "var(--overlay-10)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

export default function JudgesTour({ onDismiss, onNavigate }: { onDismiss: () => void; onNavigate: (stepIndex: number) => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (step < TOUR_STEPS.length - 1) {
          setStep(s => s + 1);
          onNavigate(step + 1);
        } else onDismiss();
      }
      if (e.key === "ArrowRight" && step < TOUR_STEPS.length - 1) {
        setStep(s => s + 1);
        onNavigate(step + 1);
      }
      if (e.key === "ArrowLeft" && step > 0) {
        setStep(s => s - 1);
        onNavigate(step - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onDismiss, onNavigate]);

  const s = TOUR_STEPS[step];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
      fontFamily: "'Inter', sans-serif",
    }}
      role="dialog" aria-modal="true" aria-label="Judge's Tour: Guided walkthrough"
    >
      <div className="card" style={{
        width: 520, maxWidth: "92vw", padding: 0, overflow: "hidden",
        boxShadow: "0 0 80px rgba(139,92,246,0.12), 0 20px 60px rgba(0,0,0,0.5)",
        border: "1px solid rgba(139,92,246,0.15)",
      }}>
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, #60a5fa, #a78bfa, #22c55e, #eab308, #ef4444)",
          backgroundSize: "300% 100%",
          animation: "gradientShift 4s ease infinite",
        }} />

        <div style={{ padding: "24px 28px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(96,165,250,0.1))",
              border: "1px solid rgba(139,92,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 1 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: "var(--accent-purple)", fontWeight: 500, marginBottom: 4 }}>{s.subtitle} · Step {step + 1}/{TOUR_STEPS.length}</div>
              <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.description}</div>
              <div style={{
                marginTop: 8, padding: "5px 10px", borderRadius: 5,
                background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.1)",
                fontSize: 13, color: "var(--accent-blue)", fontStyle: "italic",
              }}>
                👆 {s.focus}
              </div>
            </div>
          </div>

          <ProgressDots current={step} total={TOUR_STEPS.length} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <button onClick={onDismiss}
              style={{
                background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer",
                fontSize: 14, padding: "4px 8px", borderRadius: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
            >Exit Tour ✕</button>

            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={() => { setStep(s => s - 1); onNavigate(step - 1); }}
                  style={{
                    padding: "6px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                    border: "1px solid var(--overlay-10)", borderRadius: 6,
                    background: "transparent", color: "var(--text-secondary)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >← Back</button>
              )}
              <button onClick={() => {
                if (step < TOUR_STEPS.length - 1) {
                  setStep(s => s + 1);
                  onNavigate(step + 1);
                } else onDismiss();
              }}
                style={{
                  padding: "6px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  borderRadius: 6,
                  background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(139,92,246,0.15))",
                  color: "var(--accent-blue)",
                  border: "1px solid rgba(96,165,250,0.25)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(96,165,250,0.3), rgba(139,92,246,0.2))"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(139,92,246,0.15))"; }}
              >{step < TOUR_STEPS.length - 1 ? "Next →" : "Explore Dashboard 🚀"}</button>
            </div>
          </div>

          <div style={{
            marginTop: 12, padding: "6px 12px", borderRadius: 5,
            background: "var(--overlay-02)", border: "1px solid var(--overlay-04)",
            display: "flex", gap: 14, justifyContent: "center",
            fontSize: 13, color: "var(--text-tertiary)",
          }}>
            <span><kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--overlay-06)", fontFamily: "'JetBrains Mono', monospace" }}>←</kbd> <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--overlay-06)", fontFamily: "'JetBrains Mono', monospace" }}>→</kbd> Navigate</span>
            <span><kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--overlay-06)", fontFamily: "'JetBrains Mono', monospace" }}>Esc</kbd> Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
