import React, { useState, useEffect, useMemo } from "react";
import type { CounterfactualScenario, PredictionRecord, ROIMetrics } from "../types";
import { computeROI } from "../utils/predictions";

interface Props {
  riskScore: number;
  evidenceCount: number;
  counterfactuals: CounterfactualScenario[];
  predictions?: PredictionRecord[];
}

function Slider({ label, value, min, max, step, unit, onChange, color }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ flex: 1, minWidth: 140, padding: "4px 6px", borderRadius: 6, border: "1px solid transparent", transition: "border-color 0.2s", cursor: "pointer" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}44`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 8px ${color}44` }}>{value}{unit}</span>
      </div>
      <div style={{ position: "relative", height: 10 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 5, background: "var(--overlay-06)", boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)" }} />
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 0.2s ease", boxShadow: `0 0 12px ${color}55, 0 0 4px ${color}88` }} />
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

function AnimatedValue({ value, prefix, suffix, color, delay = 0, decimals = 0 }: { value: number; prefix?: string; suffix?: string; color: string; delay?: number; decimals?: number }) {
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
    ? "$" + (display / 1000).toFixed(1) + "k"
    : value >= 1000
      ? (display).toLocaleString("en-US", { maximumFractionDigits: decimals })
      : display.toFixed(decimals);
  return (
    <span style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${color}33` }}>
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
  const [hourlyRate, setHourlyRate] = useState(80);
  const [manualHours, setManualHours] = useState(2.5);
  const [incidentCost, setIncidentCost] = useState(15000);

  const roi: ROIMetrics = useMemo(() => computeROI(predictions, mrsPerWeek, hourlyRate, manualHours, incidentCost), [predictions, mrsPerWeek, hourlyRate, manualHours, incidentCost]);

  const WEEKS_PER_YEAR = 48;
  const sentinelHours = 0.08;
  const hoursPerMR = manualHours - sentinelHours;
  const hoursPerYear = hoursPerMR * mrsPerWeek * WEEKS_PER_YEAR;
  const costPerYear = hoursPerYear * hourlyRate;
  const mrsPerYear = mrsPerWeek * WEEKS_PER_YEAR;

  const incidentRate = riskScore * 0.42;
  const incidentsIdentifiedEstimate = Math.round(incidentRate * mrsPerYear * 0.78);

  const successRate = counterfactuals.length > 0 ? Math.round((1 - Math.min(...counterfactuals.map(c => c.riskAfter))) * 100) : 72;

  const confusion = [
    { label: "True Positive", key: "truePositives" as const, value: roi.truePositives, color: "#22c55e", desc: "High risk → failed (caught)" },
    { label: "True Negative", key: "trueNegatives" as const, value: roi.trueNegatives, color: "#60a5fa", desc: "Low risk → shipped (all clear)" },
    { label: "False Positive", key: "falsePositives" as const, value: roi.falsePositives, color: "#eab308", desc: "High risk → shipped (overcautious)" },
    { label: "False Negative", key: "falseNegatives" as const, value: roi.falseNegatives, color: "#ef4444", desc: "Low risk → failed (missed)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Closed-Loop ROI Header */}
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
              <div style={{ fontSize: 18, fontWeight: 700, color: TEAL }}>Closed-Loop ROI Calculator</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Dollar impact based on real prediction accuracy</div>
            </div>
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 14,
            background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))",
            border: "1px solid rgba(139,92,246,0.12)",
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
            marginBottom: 6, padding: "6px 12px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(139,92,246,0.06))",
            border: "1px solid rgba(45,212,191,0.2)",
            boxShadow: "0 0 12px rgba(45,212,191,0.08), 0 0 30px rgba(45,212,191,0.04)",
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)",
            animation: "pulseGlow 2s ease-in-out infinite",
          }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span><strong style={{ color: TEAL }}>Drag these sliders</strong> to match your team's metrics — all numbers update live</span>
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14, ...s(0.04) }}>
            <Slider label="MRs per Week" value={mrsPerWeek} min={2} max={80} step={1} unit="" onChange={setMrsPerWeek} color="#60a5fa" />
            <Slider label="Developer $/hr" value={hourlyRate} min={30} max={250} step={5} unit="" onChange={setHourlyRate} color="#22c55e" />
            <Slider label="Manual Analysis (h)" value={manualHours} min={0.5} max={8} step={0.25} unit="h" onChange={setManualHours} color="#a78bfa" />
            <Slider label="Avg Incident Cost" value={incidentCost / 1000} min={2} max={100} step={1} unit="k" onChange={v => setIncidentCost(v * 1000)} color="#ef4444" />
          </div>

          {/* Bottom divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.15), transparent)", marginBottom: 12 }} />

          {/* Primary metrics: 3 columns */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
              animation: "fadeSlideUp 0.3s 0.08s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>⏱️</div>
              <AnimatedValue value={hoursPerMR} prefix="" suffix="h" color="#60a5fa" decimals={1} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Saved per MR</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>Configurable estimate per MR</div>
            </div>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
              animation: "fadeSlideUp 0.3s 0.1s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>💰</div>
              <AnimatedValue value={costPerYear} prefix="$" suffix="" color="#22c55e" />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Time Cost Saved / Year</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>{hoursPerYear.toLocaleString()}h at ${hourlyRate}/h</div>
            </div>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
              animation: "fadeSlideUp 0.3s 0.12s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>📈</div>
              <AnimatedValue value={roi.netROI} prefix="" suffix="%" color="#a78bfa" />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Net ROI</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>{roi.totalPredictions} verified predictions</div>
            </div>
          </div>

          {/* Second row: incident avoidance */}
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>🛡️</div>
              <AnimatedValue value={roi.incidentsIdentified} prefix="" suffix="" color="#22c55e" />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Incidents Identified (TP)</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>High-risk caught before failure</div>
            </div>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>⚠️</div>
              <AnimatedValue value={roi.falseNegativeCost} prefix="$" suffix="" color="#ef4444" />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Missed Incident Cost (FN)</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>{roi.falseNegatives} missed × ${incidentCost.toLocaleString()}</div>
            </div>
            <div style={{
              padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 1 }}>🎯</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 16px rgba(96,165,250,0.2)" }}>{roi.accuracyPercent}%</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>Prediction Accuracy</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>From {roi.totalPredictions} verified MRs</div>
            </div>
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
              <span style={{ fontSize: 19 }}>📈</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <strong style={{ color: TEAL }}>Your Team:</strong>{" "}
                {mrsPerWeek} MRs/wk × {WEEKS_PER_YEAR} wks = <strong style={{ color: "var(--text-primary)" }}>{mrsPerYear} MRs/year</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ color: "#ef4444" }}>Manual</span>: {(manualHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
              </span>
              <span style={{ fontSize: 14, color: "var(--text-tertiary)" }}>→</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ color: TEAL }}>Orbit</span>: {(sentinelHours * mrsPerYear).toLocaleString("en-US", { maximumFractionDigits: 0 })}h
              </span>
              <div style={{
                padding: "2px 10px", borderRadius: 4,
                background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.2)",
                fontSize: 13, fontWeight: 700, color: TEAL, whiteSpace: "nowrap",
              }}>
                {(hoursPerYear / (manualHours * mrsPerYear) * 100).toFixed(0)}% faster
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="card" style={{
        padding: "18px 22px", position: "relative", overflow: "hidden",
        borderColor: "rgba(96,165,250,0.15)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(15,18,26,0.95))",
        ...s(0.06),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 19 }}>📊</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>Prediction Confusion Matrix</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Every verified MR is categorized — the model learns from each outcome</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {confusion.map(c => (
              <div key={c.key} style={{
                padding: "12px 14px", borderRadius: 8, textAlign: "center",
                background: `${c.color}06`, border: `1px solid ${c.color}18`,
                animation: "fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
                transition: "border-color 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}35`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}18`; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: c.color,
                  }}>{c.label}</div>
                  <div style={{
                    fontSize: 13, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                    background: `${c.color}15`, color: c.color,
                  }}>{c.key === "truePositives" ? "TP" : c.key === "trueNegatives" ? "TN" : c.key === "falsePositives" ? "FP" : "FN"}</div>
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: c.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${c.color}30` }}>
                  {c.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Closed-loop explanation */}
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginTop: 2,
            background: "rgba(45,212,191,0.04)", border: "1px solid rgba(45,212,191,0.1)",
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: TEAL }}>The closed loop:</strong> Predicted risk → shipped → 7-day survival check →
              {roi.truePositives + roi.trueNegatives > 0 ? ` ${roi.accuracyPercent}% accurate so far` : " waiting for verification"} →
              every result sharpens the next prediction.
            </span>
            <div style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700,
              background: roi.accuracyPercent >= 80 ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
              color: roi.accuracyPercent >= 80 ? "#22c55e" : "#eab308",
              border: `1px solid ${roi.accuracyPercent >= 80 ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`,
              whiteSpace: "nowrap",
            }}>
              {roi.accuracyPercent >= 80 ? "✓ Learning" : "⋯ Training"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
