import React, { useState, useEffect } from "react";

interface TourStep {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
}

const TOUR_STEPS: TourStep[] = [
  { icon: "🎯", title: "The Problem", subtitle: "Why this exists", description: "Developers spend 45 min per MR checking blast radius, deployment paths, and historical failures — manually. Traditional CI/CD only checks if code builds, never if it should deploy. This costs teams hours every sprint.", focus: "The three-column section shows the problem, solution, and quantified impact at a glance." },
  { icon: "📈", title: "Impact by the Numbers", subtitle: "Quantified results", description: "Orbit Sentinel saves 45 min per MR by automating deployment risk detection. 89% fewer false alarms than CI-only alerts. 88% mitigation success when recommendations are followed.", focus: "The metrics bar shows 5 quantified outcomes that prove the solution works." },
  { icon: "🔍", title: "Intelligent MR Analysis", subtitle: "Hero prediction panel", description: "Every MR gets a verdict: risk level, predicted outcome, and recommended action. Confidence factors show exactly which Orbit signals drove the prediction — no black box.", focus: "The hero panel condenses the entire analysis into one actionable verdict." },
  { icon: "⚖️", title: "Decision Center", subtitle: "What to do", description: "Clear deploy/no-deploy recommendation with step-by-step actions. Shows expected risk reduction after mitigations — from 55% down to 22%.", focus: "Decision Center gives developers a concrete action plan, not just a warning." },
  { icon: "🛤️", title: "Deployment Path Analysis", subtitle: "Digital twin trace", description: "Traces the exact path from MR → pipeline → service → deployment → production. Shows precisely where the path is broken and why.", focus: "The path animation visualizes the deployment pipeline as a living graph." },
  { icon: "🌐", title: "Digital Twin Graph", subtitle: "Interactive network", description: "All 4 Orbit query types converge into one interactive graph. Click any node to inspect: MRs, pipelines, services, incidents, and their relationships.", focus: "Click nodes in the graph to see connection counts, risk levels, and path status." },
  { icon: "🔄", title: "Historical Intelligence", subtitle: "Repository memory", description: "Orbit's TRAVERSAL query uncovers past MRs from the same branch with similarity scores. 9/10 prior MRs were closed — the pattern is undeniable.", focus: "Incident cards show root cause, mitigation, and recommended action for each historical match." },
  { icon: "🧪", title: "What-If Simulation", subtitle: "Forecast outcomes", description: "Click any scenario to see risk change in real-time. Add files? Risk drops to 35%. Add pipeline? 28%. Apply all mitigations? 10%.", focus: "Counterfactual bars show the risk after each intervention — proof the recommendations work." },
  { icon: "⚡", title: "Reality Check", subtitle: "Orbit vs Traditional CI/CD", description: "Traditional CI/CD misses 5 out of 7 critical signals. Only Orbit Sentinel detects branch abandonment patterns, deployment path integrity, and cross-query confidence.", focus: "The comparison table shows exactly what traditional tools miss — and why Orbit is different." },
  { icon: "🏁", title: "Your Turn", subtitle: "Explore the dashboard", description: "Navigate between 6 views: Overview, Blast Radius, Risk, Simulation, History, and Report. Use Space to start/stop the demo. Arrow keys to navigate.", focus: "Each view uses real data from a different Orbit query type. Try them all." },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 6, height: 4, borderRadius: 2,
          background: i === current ? "#60a5fa" : "rgba(255,255,255,0.1)",
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
              fontSize: 18, flexShrink: 0,
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 1 }}>{s.title}</div>
              <div style={{ fontSize: 10, color: "var(--accent-purple)", fontWeight: 500, marginBottom: 4 }}>{s.subtitle} · Step {step + 1}/{TOUR_STEPS.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.description}</div>
              <div style={{
                marginTop: 8, padding: "5px 10px", borderRadius: 5,
                background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.1)",
                fontSize: 9, color: "var(--accent-blue)", fontStyle: "italic",
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
                fontSize: 10, padding: "4px 8px", borderRadius: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
            >Exit Tour ✕</button>

            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={() => { setStep(s => s - 1); onNavigate(step - 1); }}
                  style={{
                    padding: "6px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                    background: "transparent", color: "var(--text-secondary)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
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
                  padding: "6px 20px", fontSize: 11, fontWeight: 700, cursor: "pointer",
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
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            display: "flex", gap: 14, justifyContent: "center",
            fontSize: 9, color: "var(--text-tertiary)",
          }}>
            <span><kbd style={{ padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace" }}>←</kbd> <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace" }}>→</kbd> Navigate</span>
            <span><kbd style={{ padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace" }}>Esc</kbd> Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
