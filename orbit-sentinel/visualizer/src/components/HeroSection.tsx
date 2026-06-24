import React from "react";
import { RISK, riskScoreToKey } from "../utils/colors";
import { useMediaQuery } from "../hooks/useMediaQuery";

function ConfidenceFactor({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "error" }) {
  const colors = { success: { dot: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.15)" }, warning: { dot: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.15)" }, error: { dot: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.15)" } };
  const c = colors[status];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, boxShadow: `0 0 6px ${c.dot}66`, flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: c.dot, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ icon, label, good, warn }: { icon: string; label: string; good?: boolean; warn?: boolean }) {
  const color = good ? "#22c55e" : warn ? "#eab308" : "#ef4444";
  const bg = good ? "rgba(34,197,94,0.08)" : warn ? "rgba(234,179,8,0.08)" : "rgba(239,68,68,0.08)";
  const bd = good ? "rgba(34,197,94,0.15)" : warn ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: bg, border: `1px solid ${bd}`, fontSize: 13, color, fontWeight: 600 }}>
      {icon} {label}
    </span>
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
  const isHigh = rk === "critical" || rk === "high" || rk === "medium";
  const isSmall = useMediaQuery("(max-width: 480px)");

  return (
    <div className="card" style={{
      padding: 0, overflow: "hidden", position: "relative", animation: "fadeSlideDown 0.5s ease", height: "auto", minHeight: "100%",
      boxShadow: isHigh ? `0 0 40px ${r.glow}` : undefined,
      transition: "box-shadow 1s ease",
    }}>
      {!confidenceFactors || confidenceFactors.length === 0 ? (
        <div style={{
          margin: "12px 20px 0 20px",
          padding: "12px 16px",
          borderRadius: 8,
          background: "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(251,146,60,0.02))",
          border: "1px solid rgba(251,146,60,0.2)",
          boxShadow: "0 0 16px rgba(251,146,60,0.08)",
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--text-secondary)",
          position: "relative",
          zIndex: 2
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
            <div>
              <strong style={{ color: "#fb923c" }}>Demo Mode Active</strong> — This overview shows representative demo data.
              <br />
              <span style={{ color: "#fb923c" }}>
                Try <strong>Live Analysis</strong> for real Orbit data:
              </span>
              <br />
              • Paste any public GitLab MR URL above and click "Analyze Live"
              • Or use <strong>MR #12</strong> (gitlab-ai-hackathon/transcend/39251857) for instant live demo
              • For private repos, add a GitLab PAT token above
            </div>
          </div>
        </div>
      ) : null}
      <div style={{ height: 4, background: r.gradient, backgroundSize: "200% 200%", animation: "gradientShift 3s ease infinite" }} />
      <div className="resp-hero-column" style={{ padding: "20px 24px", position: "relative", zIndex: 2, display: "flex", gap: 20 }}>
        {/* LEFT: Narrative */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: MR badge, risk level, confidence */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "var(--overlay-04)", borderRadius: 6, border: "1px solid var(--overlay-06)" }}>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}>MR</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>!{mrIid}</span>
            </div>
            <div style={{ padding: "3px 12px", borderRadius: 6, fontSize: 15, fontWeight: 700, letterSpacing: "0.8px", background: `${r.rgba}0.15)`, color: r.hex, border: `1px solid ${r.rgba}0.25)`, boxShadow: `0 0 12px ${r.glow}` }}>
              {riskLevel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 13, color: "var(--text-secondary)", background: "var(--overlay-04)", border: "1px solid var(--overlay-06)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
              {confidence}
            </div>
          </div>

          {/* Predicted Outcome */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 3, textTransform: "uppercase" }}>Predicted Outcome</div>
              <div style={{ fontSize: isSmall ? 16 : 18, fontWeight: 800, color: r.hex, lineHeight: 1.35, textShadow: `0 0 20px ${r.glow}` }}>
                {predictedOutcome}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Risk</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: r.hex, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 14px ${r.glow}` }}>
                {(riskScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Status tags */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {(() => {
              const rl = riskLevel?.toLowerCase() ?? "";
              if (rl === "low") return <>
                <StatusBadge good icon="✓" label="Pipeline passing" />
                <StatusBadge good icon="✓" label="All tests pass" />
                <StatusBadge good icon="✓" label="No downstream impact" />
              </>;
              if (rl === "critical") return <>
                <StatusBadge icon="✗" label="Pipeline failed" />
                <StatusBadge icon="✗" label="7 downstream services" />
                <StatusBadge icon="✗" label="No rollback plan" />
              </>;
              return <>
                <StatusBadge icon="✗" label="Empty diff" />
                <StatusBadge icon="✗" label="No pipeline" />
                <StatusBadge warn icon="⚠" label="9 historical matches" />
              </>;
            })()}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--overlay-05)", margin: "0 0 10px 0" }} />

          {/* Recommended Action */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 4, textTransform: "uppercase" }}>Recommended Action</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", fontSize: 18, fontWeight: 600, color: "var(--accent-blue)" }}>
              🎯 {recommendedAction}
            </div>
          </div>

          {/* Footer — generated using */}
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontStyle: "italic", borderTop: "1px solid var(--overlay-04)", paddingTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-tertiary)", opacity: 0.5, display: "inline-block" }} />
            {generatedUsing}
          </div>
        </div>

        {/* RIGHT: Confidence Card */}
        <div style={{
          width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8,
          padding: "12px 14px", borderRadius: 10,
          background: "var(--overlay-03)", border: "1px solid var(--overlay-06)",
          animation: "fadeSlideDown 0.5s 0.15s ease both",
          boxShadow: `0 0 20px ${r.glow}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)" }}>Orbit</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Confidence</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {confidenceFactors.map(f => <ConfidenceFactor key={f.label} {...f} />)}
          </div>

          {/* Gauge */}
          <div style={{ marginTop: "auto", textAlign: "center", paddingTop: 6, borderTop: "1px solid var(--overlay-06)" }}>
            <svg width="100" height="60" viewBox="0 0 100 60">
              <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="var(--overlay-06)" strokeWidth="8" strokeLinecap="round" />
              <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={r.hex} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={Math.PI * 40} strokeDashoffset={(Math.PI * 40) - (riskScore * Math.PI * 40)}
                style={{ filter: `drop-shadow(0 0 6px ${r.glow})`, transition: "stroke-dashoffset 1.4s ease" }} />
              <text x="50" y="52" textAnchor="middle" fontSize="15" fontWeight="800" fill={r.hex} fontFamily="'JetBrains Mono', monospace">{(riskScore * 100).toFixed(0)}%</text>
            </svg>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: -2 }}>Risk Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
