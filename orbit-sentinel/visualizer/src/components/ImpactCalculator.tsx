import React, { useState, useEffect, useMemo } from "react";
import type { CounterfactualScenario, PredictionRecord, ROIMetrics } from "../types";
import { computeROI } from "../utils/predictions";

interface Props {
  riskScore: number;
  evidenceCount: number;
  counterfactuals: CounterfactualScenario[];
  predictions?: PredictionRecord[];
}

function Slider({ label, value, min, max, step, unit, onChange, color, icon }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; color: string; icon: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{
      padding: "8px 10px 6px", borderRadius: 8,
      border: `1px solid ${color}18`,
      background: `linear-gradient(135deg, ${color}06, transparent)`,
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.boxShadow = `0 0 16px ${color}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}18`; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>{icon}</span> {label}
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 10px ${color}44` }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 14, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: "var(--overlay-06)" }} />
        <div style={{
          width: `${pct}%`, height: 6, borderRadius: "3px 0 0 3px",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: "width 0.15s ease",
          boxShadow: `0 0 10px ${color}33`,
        }} />
        <div style={{
          position: "absolute", left: `calc(${pct}% - 8px)`, width: 16, height: 16, borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          boxShadow: `0 0 10px ${color}66, 0 2px 6px rgba(0,0,0,0.3)`,
          border: `2px solid ${color}44`,
          transition: "left 0.15s ease",
          pointerEvents: "none",
        }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", inset: "-6px 0", width: "100%", height: "calc(100% + 12px)",
            opacity: 0, cursor: "grab", margin: 0, padding: 0,
          }}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function AnimatedValue({ value, prefix, suffix, color, delay = 0, decimals = 0, large = false }: {
  value: number; prefix?: string; suffix?: string; color: string; delay?: number; decimals?: number; large?: boolean;
}) {
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
  const fmt = value >= 10000
    ? (display / 1000).toFixed(1) + "k"
    : display.toLocaleString("en-US", { maximumFractionDigits: decimals });
  const size = large ? 28 : 24;
  return (
    <span style={{ fontSize: size, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${color}33` }}>
      {prefix}{fmt}{suffix}
    </span>
  );
}

const TEAL = "#2dd4bf";

export default function ImpactCalculator({ riskScore, evidenceCount, counterfactuals, predictions = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const [mrsPerWeek, setMrsPerWeek] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(85);
  const [manualHours, setManualHours] = useState(2.5);
  const [incidentCost, setIncidentCost] = useState(15000);

  const roi: ROIMetrics = useMemo(() => computeROI(predictions, mrsPerWeek, hourlyRate, manualHours, incidentCost), [predictions, mrsPerWeek, hourlyRate, manualHours, incidentCost]);

  const WEEKS_PER_YEAR = 48;
  const sentinelHours = 0.08;
  const hoursPerMR = manualHours - sentinelHours;
  const hoursPerYear = hoursPerMR * mrsPerWeek * WEEKS_PER_YEAR;
  const costPerYear = hoursPerYear * hourlyRate;
  const mrsPerYear = mrsPerWeek * WEEKS_PER_YEAR;

  const confusion = [
    { label: "True Positive", key: "truePositives" as const, value: roi.truePositives, color: "#22c55e", short: "TP", desc: "High risk → failed (caught)" },
    { label: "True Negative", key: "trueNegatives" as const, value: roi.trueNegatives, color: "#60a5fa", short: "TN", desc: "Low risk → shipped (all clear)" },
    { label: "False Positive", key: "falsePositives" as const, value: roi.falsePositives, color: "#eab308", short: "FP", desc: "High risk → shipped (overcautious)" },
    { label: "False Negative", key: "falseNegatives" as const, value: roi.falseNegatives, color: "#ef4444", short: "FN", desc: "Low risk → failed (missed)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Closed-Loop ROI Header */}
      <div className="card" style={{
        padding: "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(45,212,191,0.25)",
        background: "linear-gradient(135deg, rgba(45,212,191,0.06), rgba(var(--bg-card-rgb),0.95), rgba(96,165,250,0.04))",
        boxShadow: "0 0 30px rgba(45,212,191,0.06)",
        ...s(0),
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 300, height: 300, borderRadius: "50%", background: "rgba(45,212,191,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🧮</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEAL, textShadow: "0 0 12px rgba(45,212,191,0.2)" }}>Closed-Loop ROI Calculator</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Dollar impact based on real prediction accuracy</div>
            </div>
          </div>

          {/* Description banner */}
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 14,
            background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.04))",
            border: "1px solid rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            ...s(0.02),
          }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>
              <strong style={{ color: "#a78bfa" }}>Predict and verify</strong> — risk assessment before merge, then tracked through a{" "}
              <strong style={{ color: "var(--text-primary)" }}>7-day survival window</strong> post-merge. Actual outcomes update the model, making every future prediction smarter.
            </span>
          </div>

          {/* Sliders */}
          <div style={{
            marginBottom: 10, padding: "6px 12px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(45,212,191,0.1), rgba(139,92,246,0.06))",
            border: "1px solid rgba(45,212,191,0.25)",
            boxShadow: "0 0 16px rgba(45,212,191,0.08), 0 0 40px rgba(45,212,191,0.03)",
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)",
          }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span><strong style={{ color: TEAL }}>Drag these sliders</strong> to match your team's metrics — all numbers update live</span>
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14, ...s(0.04) }}>
            <Slider label="MRs per Week" value={mrsPerWeek} min={2} max={80} step={1} unit="" onChange={setMrsPerWeek} color="#60a5fa" icon="↔" />
            <Slider label="Developer $/hr" value={hourlyRate} min={30} max={250} step={5} unit="" onChange={setHourlyRate} color="#22c55e" icon="$" />
            <Slider label="Manual Analysis (h)" value={manualHours} min={0.5} max={8} step={0.25} unit="h" onChange={setManualHours} color="#a78bfa" icon="⏱" />
            <Slider label="Avg Incident Cost" value={incidentCost / 1000} min={2} max={100} step={1} unit="k" onChange={v => setIncidentCost(v * 1000)} color="#ef4444" icon="⚠" />
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.2), transparent)", marginBottom: 12 }} />

          {/* Primary metrics: 3 columns */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
            {[
              { icon: "⏱️", value: hoursPerMR, label: "Saved per MR", sub: "Configurable estimate per MR", color: "#60a5fa", decimals: 1, suffix: "h" },
              { icon: "💰", value: costPerYear, label: "Time Cost Saved / Year", sub: `${hoursPerYear.toLocaleString()}h at $${hourlyRate}/h`, color: "#22c55e", prefix: "$" },
              { icon: "📈", value: roi.netROI, label: "Net ROI", sub: `${roi.totalPredictions} verified predictions`, color: "#a78bfa", suffix: "%" },
            ].map((c, i) => (
              <div key={c.label} style={{
                padding: "12px 14px", borderRadius: 8, textAlign: "center", position: "relative", overflow: "hidden",
                background: `linear-gradient(145deg, ${c.color}0c, ${c.color}04)`,
                border: `1px solid ${c.color}20`,
                boxShadow: `0 0 20px ${c.color}06`,
                ...s(0.08 + i * 0.02),
                transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}40`; e.currentTarget.style.boxShadow = `0 0 30px ${c.color}12`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}20`; e.currentTarget.style.boxShadow = `0 0 20px ${c.color}06`; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 26, marginBottom: 2 }}>{c.icon}</div>
                <AnimatedValue value={c.value} suffix={c.suffix || ""} prefix={c.prefix || ""} color={c.color} decimals={c.decimals ?? 0} large />
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 3 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: `${c.color}aa`, marginTop: 1, fontWeight: 500 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Second row: incident avoidance */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { icon: "🛡️", value: roi.incidentsIdentified, label: "Incidents Identified (TP)", sub: "High-risk caught before failure", color: "#22c55e" },
              { icon: "⚠️", value: roi.falseNegativeCost, label: "Missed Incident Cost (FN)", sub: `${roi.falseNegatives} missed × $${incidentCost.toLocaleString()}`, color: "#ef4444", prefix: "$" },
              { icon: "🎯", value: roi.accuracyPercent, label: "Prediction Accuracy", sub: `From ${roi.totalPredictions} verified MRs`, color: "#60a5fa", suffix: "%", isPercent: true },
            ].map((c, i) => (
              <div key={c.label} style={{
                padding: "10px 12px", borderRadius: 8, textAlign: "center", position: "relative", overflow: "hidden",
                background: `linear-gradient(145deg, ${c.color}0c, ${c.color}04)`,
                border: `1px solid ${c.color}20`,
                boxShadow: `0 0 20px ${c.color}06`,
                ...s(0.14 + i * 0.02),
                transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}40`; e.currentTarget.style.boxShadow = `0 0 30px ${c.color}12`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}20`; e.currentTarget.style.boxShadow = `0 0 20px ${c.color}06`; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 22, marginBottom: 1 }}>{c.icon}</div>
                {"isPercent" in c && c.isPercent ? (
                  <div style={{ fontSize: 26, fontWeight: 900, color: c.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${c.color}33` }}>{c.value}%</div>
                ) : (
                  <AnimatedValue value={c.value} prefix={c.prefix || ""} color={c.color} decimals={0} large />
                )}
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: `${c.color}aa`, marginTop: 1, fontWeight: 500 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Summary bar */}
          <div style={{
            padding: "8px 14px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(96,165,250,0.04))",
            border: "1px solid rgba(45,212,191,0.15)",
            boxShadow: "0 0 16px rgba(45,212,191,0.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
            ...s(0.18),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 19 }}>📈</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <strong style={{ color: TEAL }}>Your Team:</strong>{" "}
                {mrsPerWeek} MRs/wk × {WEEKS_PER_YEAR} wks = <strong style={{ color: "var(--text-primary)" }}>{mrsPerYear} MRs/year</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>Manual</span>: {(manualHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
              </span>
              <span style={{ fontSize: 14, color: "var(--overlay-08)" }}>→</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ color: TEAL, fontWeight: 700 }}>Orbit</span>: {(sentinelHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
              </span>
              <div style={{
                padding: "2px 10px", borderRadius: 4,
                background: "rgba(45,212,191,0.15)", border: "1px solid rgba(45,212,191,0.25)",
                fontSize: 13, fontWeight: 700, color: TEAL, whiteSpace: "nowrap",
                boxShadow: "0 0 10px rgba(45,212,191,0.1)",
              }}>
                {(hoursPerYear / (manualHours * mrsPerYear) * 100).toFixed(0)}% faster
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="card" style={{
        padding: "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.2)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(var(--bg-card-rgb),0.95))",
        boxShadow: "0 0 24px rgba(96,165,250,0.04)",
        ...s(0.06),
      }}>
        <div style={{ position: "absolute", top: -40, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "rgba(96,165,250,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa", textShadow: "0 0 10px rgba(96,165,250,0.15)" }}>Prediction Confusion Matrix</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Every verified MR is categorized — the model learns from each outcome</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {confusion.map(c => (
              <div key={c.key} style={{
                padding: "14px 16px", borderRadius: 8, textAlign: "center", position: "relative", overflow: "hidden",
                background: `linear-gradient(145deg, ${c.color}0a, ${c.color}03)`,
                border: `1px solid ${c.color}22`,
                boxShadow: `0 0 20px ${c.color}08`,
                transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}50`; e.currentTarget.style.boxShadow = `0 0 28px ${c.color}18`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}22`; e.currentTarget.style.boxShadow = `0 0 20px ${c.color}08`; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.label}</span>
                  <span style={{
                    fontSize: 12, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30`,
                  }}>{c.short}</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: c.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${c.color}40`, lineHeight: 1.1 }}>
                  {c.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3, lineHeight: 1.3 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Closed-loop explanation */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "linear-gradient(135deg, rgba(45,212,191,0.06), rgba(45,212,191,0.02))",
            border: "1px solid rgba(45,212,191,0.12)",
            boxShadow: "0 0 12px rgba(45,212,191,0.03)",
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 20 }}>🔄</span>
            <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>
              <strong style={{ color: TEAL }}>The closed loop:</strong> Predicted risk → shipped → 7-day survival check →
              {roi.truePositives + roi.trueNegatives > 0 ? ` ${roi.accuracyPercent}% accurate so far` : " waiting for verification"} →
              every result sharpens the next prediction.
            </span>
            <div style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
              background: roi.accuracyPercent >= 80 ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
              color: roi.accuracyPercent >= 80 ? "#22c55e" : "#eab308",
              border: `1px solid ${roi.accuracyPercent >= 80 ? "rgba(34,197,94,0.25)" : "rgba(234,179,8,0.25)"}`,
              boxShadow: roi.accuracyPercent >= 80 ? "0 0 12px rgba(34,197,94,0.12)" : "0 0 12px rgba(234,179,8,0.12)",
            }}>
              {roi.accuracyPercent >= 80 ? "✓ Learning" : "✓ Calibrating"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
