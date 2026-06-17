import React, { useState, useEffect, useCallback } from "react";
import type { CounterfactualScenario } from "../types";

interface Props {
  riskScore: number;
  evidenceCount: number;
  counterfactuals: CounterfactualScenario[];
  incidentsCount: number;
}

function Slider({ label, value, min, max, step, unit, onChange, color }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}{unit}</span>
      </div>
      <div style={{ position: "relative", height: 6 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 0.15s ease", boxShadow: `0 0 6px ${color}33` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0, padding: 0,
          }}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function AnimatedValue({ value, suffix, color, delay = 0 }: { value: number; suffix?: string; color: string; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t0 = performance.now() + delay;
    let raf: number;
    function tick(now: number) {
      const p = Math.max(0, Math.min((now - t0) / 900, 1));
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(eased * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  const fmt = value >= 1000 ? display.toLocaleString("en-US", { maximumFractionDigits: 0 }) : display.toFixed(1);
  return (
    <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${color}33` }}>
      {fmt}{suffix}
    </span>
  );
}

const TEAL = "#2dd4bf";

export default function ImpactCalculator({ riskScore, evidenceCount, counterfactuals, incidentsCount }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const [mrsPerWeek, setMrsPerWeek] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(80);
  const [manualHours, setManualHours] = useState(2.5);

  const WEEKS_PER_YEAR = 48;
  const sentinelHours = 0.08;

  const hoursPerMR = manualHours - sentinelHours;
  const hoursPerYear = hoursPerMR * mrsPerWeek * WEEKS_PER_YEAR;
  const costPerYear = hoursPerYear * hourlyRate;
  const mrsPerYear = mrsPerWeek * WEEKS_PER_YEAR;

  const incidentRate = riskScore * 0.42;
  const incidentsPrevented = Math.round(incidentRate * mrsPerYear * 0.78);
  const successRate = counterfactuals.length > 0 ? Math.round((1 - Math.min(...counterfactuals.map(c => c.riskAfter))) * 100) : 72;

  const metrics = [
    { icon: "⏱️", value: hoursPerMR, suffix: "h", label: "Saved per MR", detail: `${manualHours}h manual → ${(sentinelHours * 60).toFixed(0)}m auto`, color: "#60a5fa" },
    { icon: "📅", value: hoursPerYear, suffix: "h", label: "Saved per Year", detail: `Based on ${mrsPerWeek} MRs/week × ${WEEKS_PER_YEAR} weeks`, color: TEAL },
    { icon: "💰", value: costPerYear, suffix: "", label: "Cost Savings / Year", detail: `At $${hourlyRate}/h developer rate`, color: "#22c55e" },
    { icon: "🛡️", value: incidentsPrevented, suffix: "", label: "Incidents Prevented", detail: `${(incidentRate * 100).toFixed(0)}% incident rate × ${(mrsPerYear * 0.78).toFixed(0)} flagged MRs`, color: "#a78bfa" },
    { icon: "🎯", value: successRate, suffix: "%", label: "Mitigation Success", detail: `When ${evidenceCount} query recommendations followed`, color: "#f97316" },
    { icon: "📊", value: evidenceCount * 4, suffix: "×", label: "Cross-Reference", detail: `${evidenceCount} query types validate each finding`, color: "#22d3ee" },
  ];

  return (
    <div className="card" style={{
      padding: "18px 22px", position: "relative", overflow: "hidden",
      borderColor: "rgba(45,212,191,0.18)",
      background: "linear-gradient(135deg, rgba(45,212,191,0.04), rgba(15,18,26,0.95), rgba(96,165,250,0.03))",
      ...s(0),
    }}>
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "rgba(45,212,191,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div className="card-header-icon" style={{ background: "rgba(45,212,191,0.12)" }}>🧮</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>Impact Calculator</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Adjust parameters to see your team's savings with Orbit Sentinel</div>
          </div>
        </div>

        {/* Sliders */}
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14, ...s(0.04) }}>
          <Slider label="MRs per Week" value={mrsPerWeek} min={2} max={80} step={1} unit="" onChange={setMrsPerWeek} color="#60a5fa" />
          <Slider label="Developer $/hr" value={hourlyRate} min={30} max={250} step={5} unit="" onChange={setHourlyRate} color="#22c55e" />
          <Slider label="Manual Analysis (h)" value={manualHours} min={0.5} max={8} step={0.25} unit="h" onChange={setManualHours} color="#a78bfa" />
        </div>

        {/* Bottom divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.15), transparent)", marginBottom: 12 }} />

        {/* Results */}
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {metrics.slice(0, 3).map((m, i) => (
            <div key={m.label} style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: `${m.color}06`, border: `1px solid ${m.color}15`,
              animation: `fadeSlideUp 0.3s ${0.08 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              <div style={{ fontSize: 18, marginBottom: 1 }}>{m.icon}</div>
              <AnimatedValue value={m.value} suffix={m.suffix} color={m.color} delay={100 + i * 60} />
              <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 1 }}>{m.detail}</div>
            </div>
          ))}
        </div>
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
          {metrics.slice(3).map((m, i) => (
            <div key={m.label} style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: `${m.color}06`, border: `1px solid ${m.color}15`,
              animation: `fadeSlideUp 0.3s ${0.12 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              <div style={{ fontSize: 18, marginBottom: 1 }}>{m.icon}</div>
              <AnimatedValue value={m.value} suffix={m.suffix} color={m.color} delay={200 + i * 60} />
              <div style={{ fontSize: 8, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 1 }}>{m.detail}</div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div style={{
          padding: "8px 14px", borderRadius: 6,
          background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(96,165,250,0.04))",
          border: "1px solid rgba(45,212,191,0.12)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          animation: "fadeSlideUp 0.3s 0.2s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>📈</span>
            <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>
              <strong style={{ color: TEAL }}>Your Team:</strong>{" "}
              {mrsPerWeek} MRs/wk × {WEEKS_PER_YEAR} wks = <strong style={{ color: "var(--text-primary)" }}>{mrsPerYear} MRs/year</strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>
              <span style={{ color: "#ef4444" }}>Manual</span>: {(manualHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
            </span>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>
              <span style={{ color: TEAL }}>Orbit</span>: {(sentinelHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
            </span>
            <div style={{
              padding: "2px 10px", borderRadius: 4,
              background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.2)",
              fontSize: 9, fontWeight: 700, color: TEAL, whiteSpace: "nowrap",
            }}>
              {(hoursPerYear / (manualHours * mrsPerYear) * 100).toFixed(0)}% faster
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
