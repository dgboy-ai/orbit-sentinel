import React, { useEffect, useState, useMemo } from "react";
import type { OrbitQueryEvidence } from "../types";

interface Step { label: string; icon: string; desc: string; broken?: boolean }

function parseEvidence(evidence?: OrbitQueryEvidence[]) {
  const pf = evidence?.find(e => e.queryType === "PATH_FINDING")?.result || "";
  const hasPipeline = /pipeline found/i.test(pf);
  const depCount = parseInt(pf.match(/(\d+)\s*deployment\s*path/i)?.[1] ?? "0");
  const hasDeployments = depCount > 0;
  return { hasPipeline, hasDeployments, depCount };
}

function makeSteps(mrIid: number, evidence?: OrbitQueryEvidence[]): Step[] {
  const { hasPipeline, hasDeployments, depCount } = parseEvidence(evidence);
  return [
    { label: `MR !${mrIid}`, icon: "🔀", desc: "Merge Request opened" },
    { label: "Pipeline", icon: "🔄", desc: hasPipeline ? "Pipeline detected" : "No head pipeline", broken: !hasPipeline },
    { label: "Service", icon: "⚙️", desc: hasPipeline ? "Dependency chain mapped" : "ci-validate-items" },
    { label: "Deployment", icon: "🚀", desc: hasDeployments ? `${depCount} deployment path${depCount > 1 ? "s" : ""} found` : "Deploy blocked", broken: !hasDeployments },
    { label: "Production", icon: "🌐", desc: hasDeployments ? "Reachable" : "Cannot reach", broken: !hasDeployments },
  ];
}

function FlowArrow({ broken }: { broken?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0", opacity: 0.5 }}>
      <svg width="14" height="22" viewBox="0 0 14 22">
        <line x1="7" y1="0" x2="7" y2="16" stroke={broken ? "#ef4444" : "var(--overlay-15)"} strokeWidth="2" strokeDasharray={broken ? "3,3" : "none"} />
        <polygon points="7,20 3,12 11,12" fill={broken ? "#ef4444" : "var(--overlay-15)"} />
      </svg>
    </div>
  );
}

export default function PathBrokenAnimation({ mrIid = 10, evidence }: { mrIid?: number; evidence?: OrbitQueryEvidence[] }) {
  const STEPS = useMemo(() => makeSteps(mrIid, evidence), [mrIid, evidence]);
  const { hasPipeline, hasDeployments } = useMemo(() => parseEvidence(evidence), [evidence]);
  const conclusion = !hasPipeline
    ? { text: "No path to production detected.", short: "BLOCKED", color: "#ef4444" }
    : hasDeployments
    ? { text: "Deployment path intact.", short: "CLEAR", color: "#22c55e" }
    : { text: "Path exists but no active deployments.", short: "INCOMPLETE", color: "#eab308" };
  const isBroken = !hasPipeline || !hasDeployments;

  const [visible, setVisible] = useState(0);
  const [showBroken, setShowBroken] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);

  useEffect(() => {
    if (visible >= STEPS.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 500 + (visible === 1 ? 800 : 0));
    return () => clearTimeout(t);
  }, [visible, STEPS.length]);

  useEffect(() => {
    if (visible >= 2) { const t = setTimeout(() => setShowBroken(true), 300); return () => clearTimeout(t); }
  }, [visible]);

  useEffect(() => {
    if (showBroken) { const t = setTimeout(() => setShowConclusion(true), 600); return () => clearTimeout(t); }
  }, [showBroken]);

  return (
    <div className="card" style={{
      padding: 20, display: "flex", flexDirection: "column",
      height: "100%", position: "relative", overflow: "hidden",
      animation: "fadeSlideUp 0.5s ease",
      background: `linear-gradient(135deg, ${isBroken ? "rgba(239,68,68,0.03)" : "rgba(34,197,94,0.03)"}, rgba(15,18,26,0.98))`,
      borderColor: isBroken ? "rgba(239,68,68,0.1)" : "var(--overlay-06)",
    }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: isBroken ? "rgba(239,68,68,0.05)" : "rgba(34,197,94,0.04)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(96,165,250,0.03)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${isBroken ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}, ${isBroken ? "rgba(239,68,68,0.05)" : "rgba(34,197,94,0.05)"})`,
            border: `1px solid ${isBroken ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🛤️</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" }}>Deployment Path Analysis</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Digital twin path tracing</div>
          </div>
        </div>

        {/* Flow steps */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flex: 1, justifyContent: "center", padding: "6px 0" }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <div style={{ opacity: visible >= i ? 1 : 0, transform: visible >= i ? "translateY(0)" : "translateY(-8px)", transition: "all 0.5s ease" }}>
                  <FlowArrow broken={step.broken} />
                </div>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 18px", borderRadius: 10,
                opacity: visible > i ? 1 : 0,
                transform: visible > i ? "scale(1)" : "scale(0.92)",
                transition: `all 0.5s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1)`,
                background: step.broken && visible > i
                  ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))"
                  : visible > i
                  ? "linear-gradient(135deg, var(--overlay-02), rgba(15,18,26,0.9))"
                  : "transparent",
                border: step.broken && visible > i
                  ? "1px solid rgba(239,68,68,0.25)"
                  : visible > i
                  ? "1px solid var(--overlay-06)"
                  : "1px solid transparent",
                width: "100%", maxWidth: 300,
                boxShadow: step.broken && visible > i ? "0 0 20px rgba(239,68,68,0.1)" : "none",
                animation: step.broken && showBroken ? "shake 0.5s ease" : undefined,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  background: step.broken ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.1)",
                  border: step.broken ? "1.5px solid rgba(239,68,68,0.35)" : "1px solid rgba(96,165,250,0.2)",
                  boxShadow: step.broken ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 8px rgba(96,165,250,0.15)",
                  animation: step.broken && showBroken ? "pulseDot 1s ease-in-out infinite" : undefined,
                }}>
                  {step.broken ? "✗" : step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: step.broken ? "#ef4444" : "var(--text-primary)",
                    display: "flex", alignItems: "center", gap: 5,
                    textShadow: step.broken ? "0 0 8px rgba(239,68,68,0.3)" : "none",
                  }}>
                    {step.label}
                    {step.broken && (
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 3,
                        background: "rgba(239,68,68,0.15)", color: "#ef4444",
                        fontWeight: 700, letterSpacing: "0.3px",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}>MISSING</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>{step.desc}</div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* PATH BROKEN banner */}
          {isBroken && (
            <div style={{
              marginTop: 12, padding: "10px 24px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 0 40px rgba(239,68,68,0.15), 0 0 80px rgba(239,68,68,0.06)",
              opacity: showBroken ? 1 : 0, transform: showBroken ? "scale(1)" : "scale(0.85)",
              transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
              textAlign: "center",
              animation: showBroken ? "fadeSlideUp 0.5s ease, pulseGlow 4s ease-in-out infinite" : undefined,
            }}>
              <div style={{
                fontSize: 24, fontWeight: 900, color: "#ef4444",
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "2px",
                textShadow: "0 0 30px rgba(239,68,68,0.5)",
              }}>
                ⚠ PATH BROKEN
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                {!hasPipeline ? "No CI pipeline linked to this MR" : "No active deployments found"}
              </div>
            </div>
          )}

          {/* Conclusion */}
          {isBroken ? (
            <div style={{
              marginTop: 8,
              opacity: showConclusion ? 1 : 0, transform: showConclusion ? "translateY(0)" : "translateY(8px)",
              transition: "all 0.5s 0.2s ease",
              textAlign: "center",
              padding: "8px 14px", borderRadius: 6,
              background: `${conclusion.color}10`, border: `1px solid ${conclusion.color}20`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: conclusion.color, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 1 }}>
                <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: conclusion.color, marginRight: 5, verticalAlign: "middle" }} />
                Orbit Conclusion
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{conclusion.text}</div>
            </div>
          ) : (
            <div style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 8,
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.2)",
              opacity: showConclusion ? 1 : 0, transform: showConclusion ? "translateY(0)" : "translateY(8px)",
              transition: "all 0.5s 0.2s ease",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 1 }}>
                <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#22c55e", marginRight: 5, verticalAlign: "middle" }} />
                Orbit Conclusion
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{conclusion.text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
