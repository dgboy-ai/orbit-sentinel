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
  { signal: "Historical Merge Behavior", traditional: false, orbit: true, detail: "90% closure rate on same branch — requires repository memory" },
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
      padding: "16px 20px", position: "relative", overflow: "hidden",
      borderColor: "rgba(139,92,246,0.15)",
      background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(15,18,26,0.95), rgba(59,130,246,0.03))",
      animation: "fadeSlideUp 0.5s 0.08s ease both",
    }}>
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div className="card-header-icon" style={{ background: "rgba(139,92,246,0.12)" }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Why Orbit Sentinel Wins
              <span style={{ marginLeft: 6, fontSize: 8, color: "var(--text-tertiary)", fontWeight: 400, fontStyle: "italic" }}>
                — Traditional CI/CD vs. Digital Twin Intelligence
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", marginBottom: 2, whiteSpace: "nowrap" }}>Traditional CI/CD Misses</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>{orbitOnly}/{CHECKS.length}</div>
            <div style={{ fontSize: 8, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>critical signals undetected</div>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", marginBottom: 2, whiteSpace: "nowrap" }}>Orbit Sentinel Advantage</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>{orbitOnly + bothCount}/{CHECKS.length}</div>
            <div style={{ fontSize: 8, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>signals detected via 4 query types</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.8fr 70px 80px 1.5fr", gap: 8, alignItems: "center",
            padding: "2px 8px", marginBottom: 2,
          }}>
            <span style={{ fontSize: 7, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Signal</span>
            <span style={{ fontSize: 7, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Traditional</span>
            <span style={{ fontSize: 7, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Orbit</span>
            <span style={{ fontSize: 7, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Why It Matters</span>
          </div>
          {CHECKS.map((c, i) => (
            <div key={c.signal} style={{
              display: "grid", gridTemplateColumns: "1.8fr 70px 80px 1.5fr", gap: 8, alignItems: "center",
              padding: "5px 8px", borderRadius: 5,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{c.signal}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, textAlign: "center",
                color: c.traditional ? "#22c55e" : "#ef4444",
              }}>
                {c.traditional ? "✓ Yes" : "✗ No"}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, textAlign: "center",
                color: c.orbit ? "var(--accent-blue)" : "#ef4444",
              }}>
                Orbit {c.orbit ? "✓" : "✗"}
              </span>
              <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontStyle: "italic", lineHeight: 1.3 }}>{c.detail}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 8, padding: "6px 12px", borderRadius: 5,
          background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(139,92,246,0.04))",
          border: "1px solid rgba(96,165,250,0.12)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>🏆</span>
          <span style={{ fontSize: 9, color: "var(--accent-blue)", fontWeight: 600 }}>
            The difference: Orbit Sentinel uses <strong>repository memory + graph intelligence</strong>, not just pipeline status.
            Traditional CI/CD tells you if it builds. Orbit Sentinel tells you if it <em>breaks</em>.
          </span>
        </div>
      </div>
    </div>
  );
}
