import React, { useState, useEffect, useRef, useCallback } from "react";

const FLOW_STEPS = [
  { id: "schema",    label: "Schema",    full: "get_graph_schema",    desc: "Discovering ontology",     icon: "📐" },
  { id: "neighbors",  label: "Neighbors", full: "NEIGHBORS",           desc: "Finding connections",      icon: "🔗" },
  { id: "path",       label: "Path",      full: "PATH_FINDING",        desc: "Tracing dependencies",     icon: "🛤️" },
  { id: "traversal",  label: "Traversal", full: "TRAVERSAL",           desc: "Scanning history",         icon: "📜" },
  { id: "aggregation",label: "Aggregate", full: "AGGREGATION",         desc: "Pipeline signals",         icon: "📊" },
  { id: "compose",    label: "Report",    full: "Compose Report",       desc: "Building analysis",        icon: "📋" },
  { id: "post",       label: "MR Note",   full: "Post MR Note",         desc: "Writing to MR",            icon: "💬" },
  { id: "complete",   label: "Ready",     full: "Analysis Complete",    desc: "Digital twin ready",       icon: "✅" },
];

interface AgentFlowProgressProps {
  active: boolean;
  onComplete: () => void;
}

export default function AgentFlowProgress({ active, onComplete }: AgentFlowProgressProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const timerRef = useRef<number | null>(null);
  const completed = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
    if (currentStep < 0) setCurrentStep(0);
    timerRef.current = window.setTimeout(() => { advance(); }, 650);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, currentStep, advance]);

  // Auto-scroll to keep active step visible
  useEffect(() => {
    if (!active || currentStep < 0 || !scrollRef.current) return;
    const el = scrollRef.current.children[currentStep] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentStep, active]);

  if (!active) return null;

  const isComplete = completed.current;

  return (
    <div className="card" style={{
      padding: "14px 18px", marginBottom: 12,
      background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(15,15,30,0.95) 50%, rgba(59,130,246,0.04) 100%)",
      border: isComplete
        ? "1px solid rgba(34,197,94,0.2)"
        : "1px solid rgba(139,92,246,0.15)",
      animation: "fadeSlideUp 0.35s ease both",
      overflow: "hidden", position: "relative",
      transition: "border-color 0.5s ease",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(139,92,246,0.04) 1px, transparent 1px)",
        backgroundSize: "20px 20px", opacity: 0.25, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            fontSize: 20, display: "inline-block",
            animation: isComplete ? "none" : "spin 2s linear infinite",
          }}>{isComplete ? "✅" : "🔄"}</span>
          <span style={{
            fontSize: 18, fontWeight: 700,
            color: isComplete ? "#22c55e" : "var(--text-primary)",
            letterSpacing: "0.2px",
            transition: "color 0.5s",
          }}>
            {isComplete ? "Digital Twin Ready" : "Building Digital Twin"}
          </span>

          {/* Status badge */}
          <span style={{
            marginLeft: "auto", fontSize: 13, fontWeight: 700, letterSpacing: "0.3px",
            padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
            background: isComplete
              ? "rgba(34,197,94,0.12)"
              : "rgba(139,92,246,0.1)",
            border: isComplete
              ? "1px solid rgba(34,197,94,0.25)"
              : "1px solid rgba(139,92,246,0.2)",
            color: isComplete ? "#22c55e" : "#a78bfa",
            transition: "all 0.5s",
          }}>
            {isComplete
              ? "✓ Complete"
              : `Step ${Math.min(currentStep + 1, FLOW_STEPS.length)}/${FLOW_STEPS.length}`}
          </span>
        </div>

        {/* Horizontal step strip */}
        <div ref={scrollRef} style={{
          display: "flex", gap: 0, alignItems: "stretch",
          justifyContent: "center",
          overflowX: "auto", overflowY: "hidden",
          paddingBottom: 4,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}>
          {FLOW_STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isPending = i > currentStep;

            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {/* Step node */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "6px 4px", minWidth: 68, maxWidth: 72,
                  borderRadius: 8, cursor: "default",
                  background: isActive
                    ? "rgba(139,92,246,0.07)"
                    : isDone
                    ? "rgba(34,197,94,0.04)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(139,92,246,0.2)"
                    : "1px solid transparent",
                  transition: "all 0.35s ease",
                  position: "relative",
                }}>
                  {/* Dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                    background: isDone
                      ? "rgba(34,197,94,0.15)"
                      : isActive
                      ? "rgba(139,92,246,0.2)"
                      : "var(--overlay-03)",
                    border: isDone
                      ? "1.5px solid #22c55e"
                      : isActive
                      ? "1.5px solid #a78bfa"
                      : "1px solid var(--overlay-08)",
                    color: isDone ? "#22c55e" : isActive ? "#a78bfa" : "var(--text-tertiary)",
                    boxShadow: isActive ? "0 0 12px rgba(139,92,246,0.35)" : "none",
                    transition: "all 0.35s",
                  }}>
                    {isDone ? "✓" : (isActive ? "◉" : "")}
                  </div>

                  {/* Icon */}
                  <span style={{
                    fontSize: 18, lineHeight: 1,
                    opacity: isPending ? 0.25 : 1,
                    filter: isPending ? "grayscale(1)" : "none",
                    transition: "all 0.3s",
                  }}>{step.icon}</span>

                  {/* Short label */}
                  <span style={{
                    fontSize: 12, fontWeight: isActive || isDone ? 700 : 500,
                    color: isDone ? "#22c55e" : isActive ? "#c4b5fd" : "var(--text-tertiary)",
                    textAlign: "center", lineHeight: 1.15,
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    transition: "color 0.3s",
                  }}>
                    {step.label}
                  </span>

                  {/* Active indicator line */}
                  {isActive && (
                    <div style={{
                      position: "absolute", bottom: -1, left: 4, right: 4, height: 2,
                      borderRadius: 1,
                      background: "linear-gradient(90deg, transparent, #a78bfa, transparent)",
                      animation: "shimmer 1.5s ease-in-out infinite",
                      backgroundSize: "200% 100%",
                    }} />
                  )}
                </div>

                {/* Connector line between steps */}
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{
                    width: 16, height: 1.5, flexShrink: 0,
                    background: isDone
                      ? "#22c55e"
                      : isActive
                      ? "linear-gradient(90deg, #a78bfa, rgba(139,92,246,0.15))"
                      : "var(--overlay-04)",
                    transition: "background 0.4s",
                    margin: "0 1px", alignSelf: "flex-start", marginTop: 11,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Active step full name + description */}
        {currentStep >= 0 && currentStep < FLOW_STEPS.length && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 6,
            background: isComplete
              ? "rgba(34,197,94,0.06)"
              : "rgba(139,92,246,0.05)",
            border: isComplete
              ? "1px solid rgba(34,197,94,0.12)"
              : "1px solid rgba(139,92,246,0.08)",
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.4s",
            animation: "fadeSlideUp 0.25s ease",
          }}>
            <span style={{
              fontSize: 22, flexShrink: 0,
              filter: isComplete ? "none" : "none",
            }}>{FLOW_STEPS[currentStep].icon}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: 16, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: isComplete ? "#22c55e" : "#c4b5fd",
                letterSpacing: "0.2px",
              }}>
                {isComplete ? "Analysis Complete" : FLOW_STEPS[currentStep].full}
              </span>
              <span style={{
                fontSize: 14, color: "var(--text-secondary)",
                fontWeight: 500,
              }}>
                {isComplete
                  ? "All 4 Orbit query types executed. Digital twin is ready."
                  : FLOW_STEPS[currentStep].desc}
              </span>
            </div>
            {!isComplete && (
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#a78bfa", flexShrink: 0,
                boxShadow: "0 0 10px rgba(139,92,246,0.5)",
                animation: "pulseDot 1s ease-in-out infinite",
              }} />
            )}
            {isComplete && (
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#22c55e",
                padding: "2px 8px", borderRadius: 10,
                background: "rgba(34,197,94,0.1)",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                14 nodes · 13 edges
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
