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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0", opacity: 0.6 }}>
      <svg width="16" height="24" viewBox="0 0 16 24">
        <line x1="8" y1="0" x2="8" y2="18" stroke={broken ? "#ef4444" : "var(--overlay-20)"} strokeWidth="2" strokeDasharray={broken ? "3,3" : "none"} />
        <polygon points="8,22 4,14 12,14" fill={broken ? "#ef4444" : "var(--overlay-20)"} />
      </svg>
    </div>
  );
}

export default function PathBrokenAnimation({ mrIid = 10, evidence }: { mrIid?: number; evidence?: OrbitQueryEvidence[] }) {
  const STEPS = useMemo(() => makeSteps(mrIid, evidence), [mrIid, evidence]);
  const { hasPipeline, hasDeployments } = useMemo(() => parseEvidence(evidence), [evidence]);
  const conclusion = !hasPipeline ? "No path to production detected." : hasDeployments ? "Deployment path intact." : "Path exists but no active deployments.";
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
      padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
      height: "100%", position: "relative", overflow: "hidden",
      animation: "fadeSlideUp 0.5s ease",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: "rgba(239,68,68,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, width: "100%" }}>
        <div className="card-header-icon" style={{ background: "rgba(239,68,68,0.12)" }}>🛤️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Deployment Path Analysis</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Digital twin path tracing</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flex: 1, justifyContent: "center", padding: "10px 0" }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div style={{ opacity: visible >= i ? 1 : 0, transform: visible >= i ? "translateY(0)" : "translateY(-8px)", transition: "all 0.5s ease" }}>
                <FlowArrow broken={step.broken} />
              </div>
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 20px", borderRadius: 10,
              opacity: visible > i ? 1 : 0,
              transform: visible > i ? "scale(1)" : "scale(0.9)",
              transition: `all 0.5s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1)`,
              background: step.broken && visible > i ? "rgba(239,68,68,0.08)" : visible > i ? "var(--overlay-03)" : "transparent",
              border: step.broken && visible > i ? "1px solid rgba(239,68,68,0.2)" : visible > i ? "1px solid var(--overlay-06)" : "1px solid transparent",
              width: "100%", maxWidth: 320,
              animation: step.broken && showBroken ? "shake 0.5s ease" : undefined,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                background: step.broken ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.12)",
                border: step.broken ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(96,165,250,0.2)",
                            boxShadow: step.broken ? "0 0 20px rgba(239,68,68,0.3)" : "none",
                animation: step.broken && showBroken ? "pulseDot 1s ease-in-out infinite" : undefined,
              }}>
                {step.broken ? "✗" : step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: step.broken ? "#ef4444" : "var(--text-primary)" }}>
                  {step.label}
                  {step.broken && <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 700 }}>MISSING</span>}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{step.desc}</div>
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* PATH BROKEN banner */}
        <div style={{
          marginTop: 14, padding: "12px 28px", borderRadius: 10,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 0 40px rgba(239,68,68,0.2), 0 0 80px rgba(239,68,68,0.08)",
          opacity: showBroken ? 1 : 0, transform: showBroken ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          textAlign: "center",
          animation: showBroken ? "fadeSlideUp 0.5s ease, pulseGlow 4s ease-in-out infinite" : undefined,
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "3px", textShadow: "0 0 30px rgba(239,68,68,0.6)" }}>
            ⚠ PATH BROKEN
          </div>
        </div>

        {/* Conclusion */}
        <div style={{
          marginTop: 10,
          opacity: showConclusion ? 1 : 0, transform: showConclusion ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s 0.2s ease",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 2 }}>Orbit Conclusion</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>{conclusion}</div>
        </div>
      </div>
    </div>
  );
}
