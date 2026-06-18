import React from "react";
import { RISK, riskScoreToKey } from "../utils/colors";

function ConfidenceFactor({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "error" }) {
  const colors = { success: { dot: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.15)" }, warning: { dot: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.15)" }, error: { dot: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.15)" } };
  const c = colors[status];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, boxShadow: `0 0 6px ${c.dot}66`, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: c.dot, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

export default function HeroSection({
  mrIid, riskLevel, riskScore, predictedOutcome, recommendedAction, confidence, generatedUsing, confidenceFactors,
}: {
  mrIid: number; riskLevel: string; riskScore: number; predictedOutcome: string;
  recommendedAction: string; confidence: string; generatedUsing: string;
  confidenceFactors: { label: string; value: string; status: "success" | "warning" | "error" }[];
}) {
  const rk = riskScoreToKey(riskScore);
  const r = RISK[rk];
  const circ = 2 * Math.PI * 44;
  const offset = circ - riskScore * circ;

  const isHigh = rk === "critical" || rk === "high" || rk === "medium";

  return (
    <div className="card" style={{
      padding: 0, overflow: "hidden", position: "relative", animation: "fadeSlideDown 0.5s ease", height: "auto", minHeight: "100%",
      boxShadow: isHigh ? `0 0 40px ${r.glow}` : undefined,
      transition: "box-shadow 1s ease",
    }}>
      <div style={{ height: 4, background: r.gradient, backgroundSize: "200% 200%", animation: "gradientShift 3s ease infinite" }} />
      <div className="resp-hero-column" style={{ padding: "20px 24px", position: "relative", zIndex: 2, display: "flex", gap: 20 }}>
        {/* LEFT: Narrative */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>MR</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>!{mrIid}</span>
            </div>
            <div style={{ padding: "3px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", background: `${r.rgba}0.15)`, color: r.hex, border: `1px solid ${r.rgba}0.25)`, boxShadow: `0 0 12px ${r.glow}` }}>
              {riskLevel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {confidence}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.5px", marginBottom: 4, textTransform: "uppercase" }}>Predicted Outcome</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: r.hex, lineHeight: 1.3, marginBottom: 10, textShadow: `0 0 20px ${r.glow}` }}>
            {predictedOutcome}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {(() => {
              const rl = riskLevel?.toLowerCase() ?? "";
              if (rl === "low") return <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", fontSize: 10, color: "#22c55e", fontWeight: 600 }}>
                  ✓ Pipeline passing
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", fontSize: 10, color: "#22c55e", fontWeight: 600 }}>
                  ✓ All tests pass
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", fontSize: 10, color: "#22c55e", fontWeight: 600 }}>
                  ✓ No downstream impact
                </div>
              </>;
              if (rl === "critical") return <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 10, color: "#ef4444", fontWeight: 600 }}>
                  ✗ Pipeline failed
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 10, color: "#ef4444", fontWeight: 600 }}>
                  ✗ 7 downstream services
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 10, color: "#ef4444", fontWeight: 600 }}>
                  ✗ No rollback plan
                </div>
              </>;
              return <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 10, color: "#ef4444", fontWeight: 600 }}>
                  ✗ Empty diff
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 10, color: "#ef4444", fontWeight: 600 }}>
                  ✗ No pipeline
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)", fontSize: 10, color: "#eab308", fontWeight: 600 }}>
                  ⚠ 9 historical matches
                </div>
              </>;
            })()}
          </div>

          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.5px", marginBottom: 3, textTransform: "uppercase" }}>Recommended Action</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", fontSize: 13, fontWeight: 600, color: "var(--accent-blue)" }}>
            🎯 {recommendedAction}
          </div>

          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic", marginTop: 10 }}>{generatedUsing}</div>
        </div>

        {/* RIGHT: Confidence Card */}
        <div style={{
          width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8,
          padding: "12px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          animation: "fadeSlideDown 0.5s 0.15s ease both",
          boxShadow: `0 0 20px ${r.glow}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)" }}>Orbit</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Confidence</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {confidenceFactors.map(f => <ConfidenceFactor key={f.label} {...f} />)}
          </div>

          {/* Gauge */}
          <div style={{ marginTop: "auto", textAlign: "center", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="100" height="60" viewBox="0 0 100 60">
              <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
              <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={r.hex} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${circ * 0.55} ${circ}`} strokeDashoffset={circ * 0.45}
                style={{ filter: `drop-shadow(0 0 6px ${r.glow})`, transition: "stroke-dashoffset 1.4s ease" }} />
              <text x="50" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill={r.hex} fontFamily="'JetBrains Mono', monospace">{(riskScore * 100).toFixed(0)}%</text>
            </svg>
            <div style={{ fontSize: 8, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: -2 }}>Risk Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
