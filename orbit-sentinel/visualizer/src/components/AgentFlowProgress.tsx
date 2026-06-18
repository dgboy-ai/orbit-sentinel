import React, { useState, useEffect, useRef, useCallback } from "react";

const FLOW_STEPS = [
  { id: "schema",    label: "get_graph_schema",       desc: "Discovering Orbit ontology",    icon: "📐", group: "query" },
  { id: "neighbors",  label: "NEIGHBORS",              desc: "Finding connected entities",    icon: "🔗", group: "query" },
  { id: "path",       label: "PATH_FINDING",           desc: "Tracing dependency chains",     icon: "🛤️", group: "query" },
  { id: "traversal",  label: "TRAVERSAL",              desc: "Scanning historical matches",  icon: "📜", group: "query" },
  { id: "aggregation",label: "AGGREGATION",            desc: "Aggregating pipeline signals",  icon: "📊", group: "query" },
  { id: "compose",    label: "Compose Report",          desc: "Building impact analysis",     icon: "📋", group: "report" },
  { id: "post",       label: "Post MR Note",            desc: "Writing to the merge request", icon: "💬", group: "report" },
  { id: "complete",   label: "Analysis Complete",       desc: "Digital twin ready",           icon: "✅", group: "done" },
];

interface AgentFlowProgressProps {
  active: boolean;
  onComplete: () => void;
}

export default function AgentFlowProgress({ active, onComplete }: AgentFlowProgressProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const timerRef = useRef<number | null>(null);
  const completed = useRef(false);

  const advance = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= FLOW_STEPS.length) {
        if (!completed.current) {
          completed.current = true;
          setTimeout(onComplete, 600);
        }
        return FLOW_STEPS.length - 1;
      }
      return next;
    });
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setCurrentStep(-1);
      completed.current = false;
      return;
    }

    if (currentStep < 0) {
      setCurrentStep(0);
    }

    timerRef.current = window.setTimeout(() => {
      advance();
    }, 650);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, currentStep, advance]);

  if (!active) return null;

  return (
    <div className="card" style={{
      padding: "16px 20px", marginBottom: 12,
      background: "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(15,15,30,0.95) 50%, rgba(59,130,246,0.03) 100%)",
      border: "1px solid rgba(139,92,246,0.15)",
      animation: "fadeSlideUp 0.4s ease both",
      overflow: "hidden", position: "relative",
    }}>
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(139,92,246,0.04) 1px, transparent 1px)",
        backgroundSize: "20px 20px", opacity: 0.3, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, animation: "spin 2s linear infinite", display: "inline-block" }}>🔄</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>Building Digital Twin</span>
          <span style={{
            marginLeft: "auto", fontSize: 9, fontWeight: 600,
            padding: "3px 10px", borderRadius: 20,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
            color: "#a78bfa",
          }}>
            Step {Math.min(currentStep + 1, FLOW_STEPS.length)}/{FLOW_STEPS.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FLOW_STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isPending = i > currentStep;

            return (
              <div key={step.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "5px 10px", borderRadius: 6,
                background: isActive ? "rgba(139,92,246,0.08)" : "transparent",
                border: isActive ? "1px solid rgba(139,92,246,0.15)" : "1px solid transparent",
                transition: "all 0.3s ease",
              }}>
                {/* Status icon */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: isDone
                    ? "rgba(34,197,94,0.15)"
                    : isActive
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: isDone
                    ? "1px solid rgba(34,197,94,0.3)"
                    : isActive
                    ? "1px solid rgba(139,92,246,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: isDone ? "#22c55e" : isActive ? "#a78bfa" : "var(--text-tertiary)",
                }}>
                  {isDone ? "✓" : (isActive ? "●" : i + 1)}
                </div>

                {/* Icon */}
                <span style={{
                  fontSize: 14, opacity: isPending ? 0.25 : 1,
                  transition: "opacity 0.3s",
                }}>{step.icon}</span>

                {/* Label + desc */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: isActive || isDone ? 700 : 400,
                    color: isDone ? "#22c55e" : isActive ? "#a78bfa" : "var(--text-secondary)",
                    fontFamily: isActive || isDone ? "'JetBrains Mono', monospace" : "inherit",
                    transition: "color 0.3s",
                  }}>
                    {step.label}
                  </span>
                  <span style={{
                    fontSize: 9, color: isActive ? "var(--text-secondary)" : "var(--text-tertiary)",
                  }}>
                    {step.desc}
                  </span>
                </div>

                {/* Active pulse */}
                {isActive && (
                  <span style={{
                    marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                    background: "#a78bfa", flexShrink: 0,
                    boxShadow: "0 0 8px rgba(139,92,246,0.6)",
                    animation: "pulseDot 1s ease-in-out infinite",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
