import React, { useState, useEffect } from "react";

interface Step {
  icon: string;
  title: string;
  desc: string;
  detail: string;
}

const STEPS: Step[] = [
  { icon: "🛰️", title: "Welcome to Orbit Sentinel", desc: "Engineering Decision Intelligence", detail: "Orbit Sentinel is the first digital twin for GitLab merge requests. It queries all 4 GitLab Orbit query types to simulate your MR's future — before you deploy." },
  { icon: "🔍", title: "Intelligent MR Analysis", desc: "Powered by GitLab Orbit", detail: "Every MR is analyzed against NEIGHBORS, PATH_FINDING, TRAVERSAL, and AGGREGATION queries. No black box — every prediction traces back to specific graph evidence." },
  { icon: "🧪", title: "What-If Simulation", desc: "Predict outcomes before they happen", detail: "Click any scenario in the Forecast Engine to simulate 'what if we add a pipeline?' or 'what if we assign a reviewer?' See risk change in real-time." },
  { icon: "📊", title: "All 4 Query Types", desc: "No gaps. No stubs.", detail: "Blast Radius (NEIGHBORS) · Dependency Trace (PATH_FINDING) · Historical Context (TRAVERSAL) · Ecosystem Analysis (AGGREGATION). Every view uses real query data." },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 8, height: 5, borderRadius: 3,
          background: i === current ? "var(--accent-blue)" : "rgba(255,255,255,0.1)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

export default function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShow(false); setTimeout(onDismiss, 300); }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else { setShow(false); setTimeout(onDismiss, 300); }
      }
      if (e.key === "ArrowRight" && step < STEPS.length - 1) setStep(s => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep(s => s - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onDismiss]);

  const s = STEPS[step];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      animation: show ? "fadeSlideUp 0.3s ease" : "fadeSlideUp 0.3s ease reverse",
      fontFamily: "'Inter', sans-serif",
    }}
      role="dialog" aria-modal="true" aria-label="Onboarding: Welcome to Orbit Sentinel"
    >
      <div className="card" style={{
        width: 460, maxWidth: "90vw", padding: 0, overflow: "hidden",
        boxShadow: "0 0 60px rgba(59,130,246,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}>
        <div style={{
          height: 3, background: "linear-gradient(90deg, #60a5fa, #a78bfa, #22c55e)",
          backgroundSize: "200% 100%",
          animation: "gradientShift 3s ease infinite",
        }} />
        <div style={{ padding: "28px 32px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.1))",
              border: "1px solid rgba(96,165,250,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
              animation: "float 6s ease-in-out infinite",
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "var(--accent-blue)", fontWeight: 500, marginBottom: 6 }}>{s.desc}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.detail}</div>
            </div>
          </div>

          <ProgressDots current={step} total={STEPS.length} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <button onClick={() => { setShow(false); setTimeout(onDismiss, 300); }}
              style={{
                background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer",
                fontSize: 10, padding: "4px 8px", borderRadius: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
            >Skip →</button>

            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
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
                if (step < STEPS.length - 1) setStep(s => s + 1);
                else { setShow(false); setTimeout(onDismiss, 300); }
              }}
                style={{
                  padding: "6px 20px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  borderRadius: 6,
                  background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.15))",
                  color: "var(--accent-blue)",
                  border: "1px solid rgba(96,165,250,0.25)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.2))"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.15))"; }}
              >{step < STEPS.length - 1 ? "Next →" : "Get Started 🚀"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
