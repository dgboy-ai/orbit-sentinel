import React, { useEffect, useRef, useState } from "react";
import { RISK, riskScoreToKey } from "../utils/colors";

function AnimatedValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    const fn = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      ref.current = value * e;
      setDisplay(ref.current);
      if (p < 1) requestAnimationFrame(fn);
    };
    requestAnimationFrame(fn);
  }, [value]);
  return <>{display.toFixed(0)}{suffix}</>;
}

export default function HeroSection({
  mrIid, riskLevel, riskScore, predictedOutcome, recommendedAction, confidence, generatedUsing,
}: {
  mrIid: number; riskLevel: string; riskScore: number; predictedOutcome: string;
  recommendedAction: string; confidence: string; generatedUsing: string;
}) {
  const rk = riskScoreToKey(riskScore);
  const r = RISK[rk];
  const circ = 2 * Math.PI * 54;
  const offset = circ - riskScore * circ;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative", animation: "fadeSlideDown 0.5s ease" }}>
      {/* Scan line effect */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden", opacity: 0.04,
      }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, var(--accent-blue), transparent)",
          animation: "scanLine 4s linear infinite",
        }} />
      </div>

      {/* Glow border */}
      <div style={{ height: 4, background: r.gradient, backgroundSize: "200% 200%", animation: "gradientShift 3s ease infinite" }} />
      <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 32, position: "relative", zIndex: 2 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>MR</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>!{mrIid}</span>
            </div>
            <div style={{ padding: "3px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", background: `${r.rgba}0.15)`, color: r.hex, border: `1px solid ${r.rgba}0.25)` }}>
              {riskLevel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {confidence}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.4px", marginBottom: 2, textTransform: "uppercase" }}>Deployment Failure Probability</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: r.hex, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: 14, textShadow: `0 0 40px ${r.glow}` }}>
            <AnimatedValue value={riskScore * 100} suffix="%" />
          </div>

          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.4px", marginBottom: 3, textTransform: "uppercase" }}>Predicted Outcome</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.4 }}>{predictedOutcome}</div>

          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.4px", marginBottom: 3, textTransform: "uppercase" }}>Recommended Action</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", fontSize: 13, fontWeight: 600, color: "var(--accent-blue)" }}>
            <span>🎯</span> {recommendedAction}
          </div>

          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic", marginTop: 10 }}>{generatedUsing}</div>
        </div>

        {/* Animated Gauge */}
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
          {/* Outer glow ring */}
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            background: `conic-gradient(from 0deg, transparent 0%, ${r.hex}22 50%, transparent 100%)`,
            animation: "spin 6s linear infinite",
            filter: `blur(8px)`,
          }} />
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Ripple effect */}
            <circle cx="65" cy="65" r="60" fill="none" stroke={r.hex} strokeWidth="1" opacity="0.08"
              style={{ animation: "ripple 3s ease-out infinite" }} />
            <circle cx="65" cy="65" r="60" fill="none" stroke={r.hex} strokeWidth="1" opacity="0.05"
              style={{ animation: "ripple 3s ease-out 0.5s infinite" }} />

            {/* Background ring */}
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            {/* Value arc */}
            <circle cx="65" cy="65" r="54" fill="none" stroke={r.hex} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 8px ${r.glow})` }} />
            {/* Glow underlay */}
            <circle cx="65" cy="65" r="54" fill="none" stroke={r.glow} strokeWidth="14" opacity="0.12"
              strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)" }} />
            {/* Center value */}
            <text x="65" y="58" textAnchor="middle" fill={r.hex} fontSize="26" fontWeight="800" fontFamily="'JetBrains Mono', monospace" style={{ textShadow: `0 0 20px ${r.glow}` }}>
              <AnimatedValue value={riskScore * 100} />
            </text>
            <text x="65" y="74" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="600">{riskLevel}</text>
            {/* Pulsing dot */}
            <circle cx="65" cy="17" r="2.5" fill={r.hex} opacity="0.5" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
          </svg>
        </div>
      </div>
    </div>
  );
}
