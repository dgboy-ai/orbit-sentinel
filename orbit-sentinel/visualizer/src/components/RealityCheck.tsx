import React from "react";

interface CheckItem {
  signal: string;
  traditional: boolean;
  orbit: boolean;
  detail: string;
}

const CHECKS: CheckItem[] = [
  { signal: "Empty Diff Detected", traditional: true, orbit: true, detail: "Basic file diff check" },
  { signal: "No Pipeline Triggered", traditional: true, orbit: true, detail: "CI status check" },
  { signal: "Branch Abandonment Pattern", traditional: false, orbit: true, detail: "Requires historical TRAVERSAL query across 10 MRs" },
  { signal: "Historical Merge Behavior", traditional: false, orbit: true, detail: "9 of 10 prior MRs from this branch were closed — requires repository memory" },
  { signal: "Deployment Path Integrity", traditional: false, orbit: true, detail: "Requires Orbit PATH_FINDING through dependency graph" },
  { signal: "Counterfactual Simulation", traditional: false, orbit: true, detail: "What-if scenarios simulate mitigation outcomes before action" },
  { signal: "Cross-Query Confidence", traditional: false, orbit: true, detail: "All 4 Orbit query types independently validate each finding" },
];

export default function RealityCheck() {
  const orbitOnly = CHECKS.filter(c => !c.traditional).length;
  const traditionalOnly = CHECKS.filter(c => !c.orbit).length;
  const bothCount = CHECKS.filter(c => c.traditional && c.orbit).length;

  return (
    <div className="card" style={{
      padding: "20px", position: "relative", overflow: "hidden",
      borderColor: "rgba(139,92,246,0.25)",
      background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(15,18,26,0.96), rgba(59,130,246,0.04))",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.08)",
      animation: "fadeSlideUp 0.5s 0.08s ease both",
    }}>
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 220, height: 220, borderRadius: "50%", background: "rgba(139,92,246,0.08)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div className="card-header-icon" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", fontSize: 19 }}>⚡</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>
              Why Orbit Sentinel Wins
              <span style={{ marginLeft: 8, fontSize: 13, color: "var(--text-tertiary)", fontWeight: 400, fontStyle: "italic" }}>
                — Traditional CI/CD vs. Digital Twin Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS WITH GLOW */}
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(239,68,68,0.03)",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow: "0 0 15px rgba(239,68,68,0.1)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ef4444", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Traditional CI/CD Misses</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 10px rgba(239,68,68,0.3)" }}>{orbitOnly}/{CHECKS.length}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>critical signals undetected</div>
          </div>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(34,197,94,0.03)",
            border: "1px solid rgba(34,197,94,0.25)",
            boxShadow: "0 0 15px rgba(34,197,94,0.1)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Orbit Sentinel Advantage</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 10px rgba(34,197,94,0.3)" }}>{orbitOnly + bothCount}/{CHECKS.length}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>signals detected via 4 query types</div>
          </div>
        </div>

        {/* COMPARISON GRID TABLE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Header Row - Explicit Grid, No Global Overrides */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.8fr 100px 100px 2.2fr", gap: 10, alignItems: "center",
            padding: "4px 10px", marginBottom: 2, borderBottom: "1px solid var(--overlay-05)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Signal</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Traditional</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Orbit</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Why It Matters</span>
          </div>

          {/* Table Rows - Explicit Grid, No Global Overrides */}
          {CHECKS.map((c, i) => (
            <div key={c.signal} style={{
              display: "grid", gridTemplateColumns: "1.8fr 100px 100px 2.2fr", gap: 10, alignItems: "center",
              padding: "8px 10px", borderRadius: 6,
              background: "var(--overlay-02)", border: "1px solid var(--overlay-04)",
              animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
              transition: "all 0.15s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(139,92,246,0.04)";
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--overlay-02)";
                e.currentTarget.style.borderColor = "var(--overlay-04)";
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{c.signal}</span>
              
              {/* Traditional Badge */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: "2px 10px", borderRadius: 12,
                  background: c.traditional ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: c.traditional ? "#22c55e" : "#ef4444",
                  border: `1px solid ${c.traditional ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  minWidth: 56, display: "inline-block", textAlign: "center",
                }}>
                  {c.traditional ? "✓ Yes" : "✗ No"}
                </span>
              </div>

              {/* Orbit Badge (Glowing & Winning!) */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{
                  fontSize: 14, fontWeight: 800, padding: "2px 10px", borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                  color: "#60a5fa",
                  border: "1px solid rgba(139,92,246,0.35)",
                  boxShadow: "0 0 8px rgba(139,92,246,0.25)",
                  textShadow: "0 0 6px rgba(96,165,250,0.5)",
                  minWidth: 68, display: "inline-block", textAlign: "center",
                }}>
                  Orbit ✓
                </span>
              </div>

              <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.3 }}>{c.detail}</span>
            </div>
          ))}
        </div>

        {/* BOTTOM BANNER: WINNING */}
        <div style={{
          marginTop: 12, padding: "8px 14px", borderRadius: 6,
          background: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(139,92,246,0.06))",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 10px rgba(139,92,246,0.05)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <span style={{ fontSize: 14, color: "var(--accent-blue)", fontWeight: 600, lineHeight: 1.3 }}>
            The difference: Orbit Sentinel uses <strong>repository memory + graph intelligence</strong>, not just pipeline status.
            Traditional CI/CD tells you if it builds. Orbit Sentinel tells you if it <span style={{ color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.3)" }}>breaks</span>.
          </span>
        </div>
      </div>
    </div>
  );
}

