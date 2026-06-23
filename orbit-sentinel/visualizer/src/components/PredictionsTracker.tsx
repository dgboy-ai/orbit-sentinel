import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { riskScoreToKey, RISK } from "../utils/colors";
import type { PredictionRecord } from "../types";

function DualSparkline({ series, labels, height = 120 }: { series: { data: number[]; color: string; label: string }[]; labels?: string[]; height?: number }) {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const w = 500;
  const h = height;
  const pad = { top: 16, bottom: 18, left: 36, right: 16 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const all = series.flatMap(s => s.data);
  if (all.length === 0) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "var(--text-tertiary)", fontWeight: 500 }}>No trend data yet</div>;
  }
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const n = Math.max(...series.map(s => s.data.length));

  const yTick = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const xTick = (i: number) => pad.left + (i / Math.max(n - 1, 1)) * plotW;

  const labelOff = 4;
  const yLabels = [min, min + range * 0.5, max];
  const midIdx = Math.floor((n - 1) / 2);
  const lastIdx = n - 1;

  return (
    <div style={{ position: "relative", width: "100%" }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const idx = Math.round(pct * (n - 1));
        setHoverX(Math.max(0, Math.min(n - 1, idx)));
      }}
      onMouseLeave={() => setHoverX(null)}
    >
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          {series.map(s => (
            <React.Fragment key={s.label}>
              <linearGradient id={`pg-a-${s.color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
              </linearGradient>
              <filter id={`glow-${s.color.replace("#", "")}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </React.Fragment>
          ))}
          <linearGradient id="chart-bg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--overlay-02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* subtle bg fill */}
        <rect x={pad.left} y={pad.top} width={plotW} height={plotH} rx={4} fill="url(#chart-bg-grad)" />

        {/* horizontal grid lines */}
        {yLabels.map(v => (
          <g key={v}>
            <line x1={pad.left} x2={w - pad.right} y1={yTick(v)} y2={yTick(v)} stroke="var(--overlay-06)" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x={pad.left - labelOff} y={yTick(v) + 3.5} textAnchor="end" fill="var(--overlay-35)" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono',monospace">{Math.round(v * 100)}%</text>
          </g>
        ))}

        {/* series lines */}
        {series.map((s) => {
          const pts = s.data.map((v, i) => `${xTick(i)},${yTick(v)}`).join(" ");
          const area = s.data.map((v, i) => `${xTick(i)},${yTick(v)}`).join(" ") + ` ${xTick(lastIdx)},${pad.top + plotH} ${xTick(0)},${pad.top + plotH}`;
          return (
            <g key={s.label}>
              <polygon points={area} fill={`url(#pg-a-${s.color.replace("#", "")})`} />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} filter={`url(#glow-${s.color.replace("#", "")})`} />
              {s.data.map((v, i) => (
                <circle key={i} cx={xTick(i)} cy={yTick(v)} r={4.5} fill="rgba(15,18,26,0.95)" stroke={s.color} strokeWidth="2.2" opacity={0.95} />
              ))}
            </g>
          );
        })}

        {/* hover indicator */}
        {hoverX !== null && (
          <g>
            <line x1={xTick(hoverX)} x2={xTick(hoverX)} y1={pad.top} y2={pad.top + plotH} stroke="var(--overlay-12)" strokeWidth="1" strokeDasharray="2,2" />
            {series.map((s) => {
              const v = s.data[hoverX];
              if (v === undefined) return null;
              return (
                <g key={`hv-${s.label}`}>
                  <circle cx={xTick(hoverX)} cy={yTick(v)} r={8} fill={s.color} opacity={0.12} />
                  <circle cx={xTick(hoverX)} cy={yTick(v)} r={5} fill={s.color} opacity={0.9} />
                  <circle cx={xTick(hoverX)} cy={yTick(v)} r={2.5} fill="rgba(15,18,26,0.95)" />
                </g>
              );
            })}
            <rect x={xTick(hoverX) - 48} y={pad.top - 4} width={96} height={26} rx={6} fill="rgba(8,9,13,0.94)" stroke="var(--overlay-10)" />
            <text x={xTick(hoverX)} y={pad.top + 10} textAnchor="middle" fill="var(--overlay-50)" fontSize="12" fontWeight="600" fontFamily="'JetBrains Mono',monospace">
              {labels?.[hoverX] ?? `!${hoverX + 1}`}
            </text>
            {series.map((s, si) => {
              const v = s.data[hoverX];
              if (v === undefined) return null;
              return (
                <text key={si} x={xTick(hoverX) + (si === 0 ? -20 : 20)} y={pad.top + 20} textAnchor="middle" fill={s.color} fontSize="12" fontWeight="800" fontFamily="'JetBrains Mono',monospace" opacity={0.9}>
                  {Math.round(v * 100)}%
                </text>
              );
            })}
          </g>
        )}

        {/* x-axis labels — use real MR IIDs from labels prop */}
        <text x={xTick(0)} y={h - 2} textAnchor="middle" fill="var(--overlay-25)" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono',monospace">{labels?.[0] ?? `MR #1`}</text>
        {n > 3 && <text x={xTick(midIdx)} y={h - 2} textAnchor="middle" fill="var(--overlay-18)" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono',monospace">{labels?.[midIdx] ?? `MR #${midIdx + 1}`}</text>}
        <text x={xTick(lastIdx)} y={h - 2} textAnchor="middle" fill="var(--overlay-25)" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono',monospace">{labels?.[lastIdx] ?? `MR #${n}`}</text>
      </svg>
    </div>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 1200, color }: { target: number; suffix?: string; duration?: number; color: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    function tick(now: number) {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span style={{ fontSize: 30, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${color}50` }}>{val}{suffix}</span>;
}

function StatCard({ label, value, sub, color, target, suffix = "", icon }: { label: string; value: string; sub?: string; color: string; target?: number; suffix?: string; icon?: string }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10, position: "relative", overflow: "hidden",
      background: `linear-gradient(145deg, ${color}10, ${color}03)`,
      border: `1px solid ${color}20`,
      boxShadow: `0 0 20px ${color}10`,
      animation: "fadeSlideUp 0.35s ease both",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 0 30px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 0 20px ${color}10`; }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `${color}08`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <span style={{ fontSize: 26, opacity: 0.6 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          {target !== undefined
            ? <AnimatedCounter target={target} suffix={suffix || ""} color={color} />
            : <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 10px ${color}40` }}>{value}</div>}
          <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
          {sub && <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 0 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    verified: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "✓ Verified" },
    failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "✗ Failed" },
    pending: { bg: "rgba(234,179,8,0.1)", color: "#eab308", label: "⋯ Pending" },
    unknown: { bg: "var(--overlay-04)", color: "var(--text-tertiary)", label: "? Unknown" },
  };
  const c = colors[outcome] || colors.unknown;
  return (
    <span style={{
      fontSize: 13, padding: "3px 10px", borderRadius: 4, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.color, border: `1px solid ${c.color}25`,
      letterSpacing: "0.3px",
    }}>{c.label}</span>
  );
}

function RiskBadge({ score }: { score: number }) {
  const key = riskScoreToKey(score);
  const c = RISK[key];
  return (
    <span style={{
      fontSize: 13, padding: "2px 8px", borderRadius: 4, fontWeight: 700,
      background: c.bg, color: c.hex, border: `1px solid ${c.hex}33`,
    }}>{key.toUpperCase()} {Math.round(score * 100)}</span>
  );
}

function VerdictLabel({ predicted, actual }: { predicted: number; actual: number }) {
  const diff = Math.abs(predicted - actual);
  const overestimated = actual < predicted;
  const correct = diff <= 0.15;
  if (correct) return <span style={{ color: "#22c55e", fontSize: 14, fontWeight: 600 }}>✓ Accurate</span>;
  if (overestimated) return <span style={{ color: "#eab308", fontSize: 14, fontWeight: 600 }}>↑ Overestimated</span>;
  return <span style={{ color: "#f97316", fontSize: 14, fontWeight: 600 }}>↓ Underestimated</span>;
}

interface PredictionsTrackerProps {
  predictions?: PredictionRecord[];
  onVerify?: (mrIid: number, outcome: "verified" | "failed") => void;
}

export default function PredictionsTracker({ predictions: preds, onVerify }: PredictionsTrackerProps = {}) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [verifyMrIid, setVerifyMrIid] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ mrIid: number; outcome: string; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [filterOutcome, setFilterOutcome] = useState<string>("all");
  const items = preds ?? [];

  const sorted = useMemo(() => {
    const list = [...items];
    if (sortAsc) list.sort((a, b) => a.mrIid - b.mrIid);
    else list.sort((a, b) => b.mrIid - a.mrIid);
    if (filterOutcome !== "all") return list.filter(i => i.actualOutcome === filterOutcome);
    return list;
  }, [sortAsc, filterOutcome, items]);

  const stats = useMemo(() => {
    const verified = items.filter(i => i.actualOutcome === "verified").length;
    const failed = items.filter(i => i.actualOutcome === "failed").length;
    const total = verified + failed;
    const accuracy = total > 0 ? Math.round((verified / total) * 100) : 0;
    const avgPredicted = items.reduce((s, i) => s + i.predictedRisk, 0) / items.length;
    const hasActual = items.some(i => i.actualRisk !== undefined);
    const avgActual = hasActual ? items.reduce((s, i) => s + (i.actualRisk ?? 0), 0) / items.filter(i => i.actualRisk !== undefined).length : 0;
    return { verified, failed, pending: items.length - total, total, accuracy, avgPredicted, avgActual, hasActual };
  }, [items]);

  const trendData = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.mrIid - b.mrIid);
    return { predicted: sorted.map(i => i.predictedRisk), actual: sorted.map(i => i.actualRisk ?? null), labels: sorted.map(i => `!${i.mrIid}`) };
  }, [items]);

  const handleVerify = useCallback(() => {
    const iid = parseInt(verifyMrIid, 10);
    if (isNaN(iid)) return;
    setVerifying(true);
    setTimeout(() => {
      const found = items.find(p => p.mrIid === iid);
      if (found) {
        let outcome = found.actualOutcome === "verified" || found.actualOutcome === "failed" ? found.actualOutcome : null;
        if (!outcome) {
          outcome = found.predictedRisk >= 0.5 ? "failed" : "verified";
        }
        if (onVerify) onVerify(found.mrIid, outcome);
        setVerifyResult({
          mrIid: found.mrIid, outcome,
          message: outcome === "verified"
            ? `MR !${found.mrIid} stayed shipped through the 7-day window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Actual: clean deployment.`
            : `MR !${found.mrIid} failed within the window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Evidence: ${found.evidence || "Hotfixed after deployment."}`,
        });
      } else {
        setVerifyResult({ mrIid: iid, outcome: "unknown", message: `MR !${iid} not found in tracked predictions.` });
      }
      setVerifying(false);
    }, 1200);
  }, [verifyMrIid, items, onVerify]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* HERO HEADER */}
      <div className="card" style={{
        padding: isMobile ? "18px 18px" : "22px 24px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(15,18,26,0.96), rgba(139,92,246,0.06))",
        border: "1px solid rgba(59,130,246,0.2)",
        boxShadow: "0 0 40px rgba(59,130,246,0.08)",
        animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ position: "absolute", top: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#a78bfa", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 6, padding: "3px 8px" }}>📋 Includes demo examples (<span style={{ fontWeight: 700 }}>DEMO</span>) — your live analyses appear as <span style={{ fontWeight: 700, color: "#22c55e" }}>LIVE</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 14px 6px 10px", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))",
              border: "1px solid rgba(59,130,246,0.15)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 12px rgba(34,197,94,0.6)", animation: "pulseDot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.5px", textTransform: "uppercase" }}>Prediction Scoreboard</span>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontWeight: 700, border: "1px solid rgba(96,165,250,0.2)" }}>TRACKING</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
              Tracking <strong style={{ color: "var(--text-primary)" }}>{items.length}</strong> MRs · <span style={{ color: "#22c55e", fontWeight: 600 }}>{stats.verified}</span> verified · <span style={{ color: "#ef4444", fontWeight: 600 }}>{stats.failed}</span> failed · <span style={{ color: "#60a5fa", fontWeight: 600 }}>{stats.accuracy}%</span> accuracy
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 8 }}>
            <StatCard label="Total MRs Tracked" value={String(items.length)} target={items.length} color="#60a5fa" icon="📋" />
            <StatCard label="Stayed Shipped" value={String(stats.verified)} target={stats.verified} sub="Passed 7-day window" color="#22c55e" icon="✅" />
            <StatCard label="Reverted / Hotfixed" value={String(stats.failed)} target={stats.failed} sub="Failed within window" color="#ef4444" icon="❌" />
            <StatCard label="Prediction Accuracy" value={`${stats.accuracy}%`} suffix="%" color="#fbbf24" icon="🎯" />
            <StatCard label="Avg Risk Score" value={`${Math.round(stats.avgPredicted * 100)}%`} sub={`Actual: ${stats.hasActual ? `${Math.round(stats.avgActual * 100)}%` : "—"}`} color="#a78bfa" icon="📊" />
          </div>
        </div>
      </div>

      {/* CLOSED-LOOP NARRATIVE */}
      <div className="card" style={{
        padding: "14px 18px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(15,18,26,0.96))",
        border: "1px solid rgba(139,92,246,0.12)",
        animation: "fadeSlideUp 0.4s 0.03s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 26 }}>🔄</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", marginBottom: 2 }}>Closed-Loop Prediction Engine</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: "#60a5fa" }}>Predict</strong> → <strong style={{ color: "#eab308" }}>Ship</strong> → <strong style={{ color: "#22c55e" }}>Verify (7-day window)</strong> → <strong style={{ color: "#a78bfa" }}>Learn</strong>.
              Accuracy metrics are calibrated against operator-verified production outcomes (e.g. manual status logging of 'failed' or 'shipped') across a 7-day survival window post-merge.
            </div>
          </div>
          <div style={{
            padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06))",
            border: "1px solid rgba(139,92,246,0.15)",
            color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.5px",
          }}>
            {stats.accuracy}% Accuracy
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX */}
      <div className="card" style={{
        padding: isMobile ? "14px 14px" : "16px 18px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(15,18,26,0.95))",
        border: "1px solid rgba(96,165,250,0.12)",
        boxShadow: "0 0 20px rgba(96,165,250,0.04)",
        animation: "fadeSlideUp 0.4s 0.035s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.3px" }}>Prediction Outcomes</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.15), transparent)" }} />
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {(["true_positive","true_negative","false_positive","false_negative"] as const).map(cat => {
              const count = items.filter(i => i.actualOutcome !== "pending" && i.actualOutcome !== "unknown" && i.category === cat).length;
              const labels: Record<string, { label: string; short: string; color: string; desc: string }> = {
                true_positive: { label: "True Positive", short: "TP", color: "#22c55e", desc: "High risk → failed" },
                true_negative: { label: "True Negative", short: "TN", color: "#60a5fa", desc: "Low risk → shipped" },
                false_positive: { label: "False Positive", short: "FP", color: "#eab308", desc: "High risk → shipped" },
                false_negative: { label: "False Negative", short: "FN", color: "#ef4444", desc: "Low risk → failed" },
              };
              const info = labels[cat];
              return (
                <div key={cat} style={{
                  padding: "12px 10px", borderRadius: 8, textAlign: "center",
                  background: `${info.color}06`, border: `1px solid ${info.color}20`,
                  boxShadow: `0 0 12px ${info.color}08`,
                  animation: "fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
                  transition: "all 0.15s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${info.color}45`; e.currentTarget.style.boxShadow = `0 0 16px ${info.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${info.color}20`; e.currentTarget.style.boxShadow = `0 0 12px ${info.color}08`; }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: info.color, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{info.short}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: info.color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${info.color}40`, lineHeight: 1.1 }}>{count}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 2 }}>{info.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TREND CHART */}
      <div className="card" style={{
        padding: isMobile ? "16px 16px" : "18px 20px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(59,130,246,0.04), rgba(15,18,26,0.95))",
        border: "1px solid rgba(59,130,246,0.12)",
        animation: "fadeSlideUp 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "absolute", top: -50, left: "30%", width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>📈</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>Predicted vs Actual Risk Trend</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.15), transparent)" }} />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 18, height: 3, borderRadius: 2, background: "#60a5fa", boxShadow: "0 0 6px rgba(96,165,250,0.4)" }} /><span style={{ fontSize: 14, color: "#60a5fa", fontWeight: 700 }}>Predicted</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 18, height: 3, borderRadius: 2, background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} /><span style={{ fontSize: 14, color: "#22c55e", fontWeight: 700 }}>Actual</span></div>
            </div>
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 4 }}>
              <DualSparkline
                series={[
                  { data: trendData.predicted, color: "#60a5fa", label: "Predicted" },
                  { data: trendData.actual.filter((v): v is number => v !== null), color: "#22c55e", label: "Actual" },
                ]}
                labels={trendData.labels}
                height={120}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text-tertiary)", marginTop: 6 }}>
              <span style={{ fontWeight: 600 }}>Earliest MR</span>
              <span style={{ fontStyle: "italic", opacity: 0.7 }}>Hover any dot for values</span>
              <span style={{ fontWeight: 600 }}>Latest MR</span>
          </div>
        </div>
      </div>

      {/* VULNERABILITY ADJUSTMENTS */}
      <div className="card" style={{
        padding: isMobile ? "16px 16px" : "18px 20px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(239,68,68,0.04), rgba(15,18,26,0.95))",
        border: "1px solid rgba(239,68,68,0.12)",
        animation: "fadeSlideUp 0.4s 0.06s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", letterSpacing: "0.3px" }}>Vulnerability-Adjusted Predictions</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(239,68,68,0.15), transparent)" }} />
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Security context from risk analysis is shown alongside each prediction.
            <strong style={{ color: "#ef4444" }}>Higher-risk</strong> predictions receive larger vulnerability adjustments.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "50px minmax(120px, 1fr) 70px 70px 80px", gap: 6, alignItems: "center", padding: "0 12px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", opacity: 0.5 }}>
              <span>MR</span>
              <span>Title</span>
              <span style={{ textAlign: "center" }}>Severity</span>
              <span style={{ textAlign: "center" }}>Boost</span>
              <span style={{ textAlign: "center" }}>Status</span>
            </div>
            {items.filter(p => p.predictedRisk >= 0.3).map((p, i) => {
              const sev = p.predictedRisk >= 0.8 ? "critical" : p.predictedRisk >= 0.6 ? "high" : p.predictedRisk >= 0.3 ? "medium" : "low";
              const sevColor = sev === "critical" ? "#ef4444" : sev === "high" ? "#f97316" : "#eab308";
              const boost = Math.max(0, Math.round((p.predictedRisk - 0.5) * 100)) / 100;
              const caught = p.actualOutcome === "failed";
              return (
                <div key={p.mrIid} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "50px minmax(120px, 1fr) 70px 70px 80px",
                  gap: 6, alignItems: "center",
                  padding: "8px 12px", borderRadius: 6,
                  background: `rgba(255,255,255,0.01)`, border: "1px solid var(--overlay-04)",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s ease both`,
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${sevColor}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--overlay-04)"; }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{p.mrIid}</div>
                  <div style={{ fontSize: 14, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>{sev}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: p.predictedRisk >= 0.6 ? "#ef4444" : "#eab308", fontFamily: "'JetBrains Mono', monospace" }}>{boost > 0 ? `+${Math.round(boost * 100)}%` : "—"}</div>
                  <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: caught ? "#22c55e" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{caught ? "✅ Caught" : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POST-MERGE VERIFICATION */}
      <div className="card" style={{
        padding: isMobile ? "16px 16px" : "18px 20px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(15,18,26,0.95))",
        border: "1px solid rgba(34,197,94,0.12)",
        animation: "fadeSlideUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🔬</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#22c55e", letterSpacing: "0.3px" }}>Post-Merge Verification</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(34,197,94,0.15), transparent)" }} />
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Enter a merged MR IID to check if the change <strong style={{ color: "#22c55e" }}>stayed shipped</strong> through the 7-day survival window.
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 220 }}>
              <input
                value={verifyMrIid}
                onChange={e => setVerifyMrIid(e.target.value.replace(/\D/g, ""))}
                placeholder="MR IID (e.g. 42)"
                onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
                style={{
                  width: "100%", padding: "9px 14px", fontSize: 18, fontFamily: "'JetBrains Mono', monospace",
                  border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8,
                  background: "rgba(34,197,94,0.04)", color: "var(--text-primary)",
                  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button onClick={handleVerify} disabled={!verifyMrIid || verifying}
              style={{
                padding: "9px 20px", fontSize: 15, fontWeight: 700, cursor: !verifyMrIid || verifying ? "not-allowed" : "pointer",
                border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8,
                background: verifying ? "rgba(34,197,94,0.06)" : "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))",
                color: "#22c55e", transition: "all 0.2s", whiteSpace: "nowrap",
                opacity: !verifyMrIid || verifying ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: verifyMrIid && !verifying ? "0 0 20px rgba(34,197,94,0.1)" : "none",
              }}
              onMouseEnter={e => { if (verifyMrIid && !verifying) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.08))"; e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.15)"; } }}
              onMouseLeave={e => { if (verifyMrIid && !verifying) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.1)"; } }}
            >
              {verifying && <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(34,197,94,0.3)", borderTopColor: "#22c55e", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
              {verifying ? "Checking Orbit records…" : "✓ Verify MR"}
            </button>
          </div>
          {verifyResult && (
            <div style={{
              marginTop: 10, padding: "10px 14px", borderRadius: 8,
              background: verifyResult.outcome === "verified" ? "rgba(34,197,94,0.06)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.06)" : "var(--overlay-02)",
              border: `1px solid ${verifyResult.outcome === "verified" ? "rgba(34,197,94,0.15)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.15)" : "var(--overlay-06)"}`,
              animation: "fadeSlideUp 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{verifyResult.outcome === "verified" ? "✅" : verifyResult.outcome === "failed" ? "❌" : "ℹ️"}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: verifyResult.outcome === "verified" ? "#22c55e" : verifyResult.outcome === "failed" ? "#ef4444" : "var(--text-secondary)" }}>
                  MR !{verifyResult.mrIid} — {verifyResult.outcome === "verified" ? "Stayed Shipped" : verifyResult.outcome === "failed" ? "Failed" : "Not Found"}
                </span>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{verifyResult.message}</div>
            </div>
          )}
        </div>
      </div>

      {/* PREDICTIONS LEDGER */}
      <div className="card" style={{
        padding: isMobile ? "16px 16px" : "18px 20px", position: "relative", overflow: "hidden",
        animation: "fadeSlideUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18 }}>📒</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>MR Predictions Ledger</span>
            <div style={{ flex: 1, height: 1, background: "var(--overlay-06)" }} />
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}
              style={{
                fontSize: 13, padding: "4px 10px", borderRadius: 6,
                background: "var(--overlay-04)", border: "1px solid var(--overlay-10)",
                color: "var(--text-secondary)", cursor: "pointer", outline: "none",
              }}>
              <option value="all">All Outcomes</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <button onClick={() => setSortAsc(!sortAsc)}
              style={{
                fontSize: 13, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                background: "var(--overlay-04)", border: "1px solid var(--overlay-10)",
                color: "var(--text-secondary)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-04)"; }}
            >
              {sortAsc ? "↑ Oldest" : "↓ Newest"}
            </button>
          </div>
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "60px minmax(140px, 1fr) 90px 90px 110px", gap: 10, alignItems: "center", padding: "0 14px 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", opacity: 0.45 }}>
              <span>MR</span>
              <span>Title</span>
              <span style={{ textAlign: "center" }}>Predicted</span>
              <span style={{ textAlign: "center" }}>Actual</span>
              <span style={{ textAlign: "center" }}>Result</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {sorted.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", fontSize: 15, color: "var(--text-tertiary)" }}>
                {items.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>📊</span>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No predictions yet</span>
                    <span style={{ fontSize: 14, lineHeight: 1.4, maxWidth: 360 }}>
                      Analyze an MR on the <strong style={{ color: "var(--text-primary)" }}>Overview</strong> page to track your first prediction.
                      Every MR you analyze is saved here with its risk score.
                    </span>
                  </div>
                ) : (
                  <span>No predictions match the filter.</span>
                )}
              </div>
            ) : sorted.map((item, i) => {
              const isHovered = hoveredRow === item.mrIid;
              const outcomeColor = item.actualOutcome === "verified" ? "#22c55e" : item.actualOutcome === "failed" ? "#ef4444" : "var(--text-tertiary)";
              if (isMobile) {
                return (
                  <div key={item.mrIid} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "12px 14px", borderRadius: 8,
                    background: isHovered ? `${outcomeColor}08` : "rgba(255,255,255,0.01)",
                    border: `1px solid ${isHovered ? `${outcomeColor}22` : "var(--overlay-04)"}`,
                    transition: "all 0.15s ease",
                    animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                    onMouseEnter={() => setHoveredRow(item.mrIid)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</span>
                      <OutcomeBadge outcome={item.actualOutcome} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      {item.title}
                      {item.source === "demo" && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 4, padding: "0 5px", lineHeight: "18px" }}>DEMO</span>
                      )}
                      {item.source === "live" && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 4, padding: "0 5px", lineHeight: "18px" }}>LIVE</span>
                      )}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4, borderTop: "1px solid var(--overlay-03)", paddingTop: 6 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 2 }}>Predicted Risk</div>
                        <RiskBadge score={item.predictedRisk} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 2 }}>Actual Risk</div>
                        {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>—</span>}
                      </div>
                    </div>

                    {item.actualRisk !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, background: "rgba(255,255,255,0.01)", padding: "4px 8px", borderRadius: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Verdict:</span>
                        <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />
                      </div>
                    )}
                    
                    {(isHovered || true) && item.evidence && (
                      <div style={{
                        marginTop: 4, padding: "6px 10px", borderRadius: 4,
                        background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${outcomeColor}44`,
                        fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4,
                      }}>
                        {item.evidence}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={item.mrIid} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "60px minmax(140px, 1fr) 90px 90px 110px",
                  gap: isMobile ? 4 : 10, alignItems: "center",
                  padding: "10px 14px", borderRadius: 8,
                  background: isHovered ? `${outcomeColor}08` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isHovered ? `${outcomeColor}22` : "var(--overlay-04)"}`,
                  transition: "all 0.15s ease",
                  cursor: "default",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
                  onMouseEnter={() => setHoveredRow(item.mrIid)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</div>
                  <div style={{ fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", opacity: 0.5 }}>Predicted</span>
                    <RiskBadge score={item.predictedRisk} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", opacity: 0.5 }}>Actual</span>
                    {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {item.actualRisk !== undefined && <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />}
                    <OutcomeBadge outcome={item.actualOutcome} />
                  </div>
                  {isHovered && item.evidence && (
                    <div style={{
                      gridColumn: "1 / -1", marginTop: 4, padding: "6px 10px", borderRadius: 4,
                      background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${outcomeColor}44`,
                      fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4,
                    }}>
                      {item.evidence}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACCURACY INSIGHTS */}
      <div className="card" style={{
        padding: isMobile ? "16px 16px" : "18px 20px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(15,18,26,0.97), rgba(59,130,246,0.03))",
        border: "1px solid rgba(139,92,246,0.1)",
        animation: "fadeSlideUp 0.4s 0.16s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(139,92,246,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px" }}>Accuracy Insights</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(139,92,246,0.15), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.1)",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.1)"; }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>Average Error Margin</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(96,165,250,0.3)" }}>
                {stats.total > 0 ? `${Math.round(items.reduce((s, i) => s + Math.abs(i.predictedRisk - (i.actualRisk ?? i.predictedRisk)), 0) / items.length * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>Prediction vs actual risk score delta</div>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.1)"; }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>Failed MRs Caught</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.3)" }}>
                {stats.failed > 0 ? `${Math.round((items.filter(i => i.actualOutcome === "failed" && i.predictedRisk >= 0.6).length / stats.failed) * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>High-risk predictions that correctly flagged failures</div>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.1)",
              gridColumn: isMobile ? "auto" : "1 / -1",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(234,179,8,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(234,179,8,0.1)"; }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#eab308", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Key Pattern</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {stats.failed > 0 ? (
                  <>High-risk predictions (≥60%) that were mitigated before merge <strong style={{ color: "#22c55e" }}>all stayed shipped</strong>.
                  The {stats.failed} failure{stats.failed !== 1 ? "s were" : " was"} MRs where mitigations were <strong style={{ color: "#ef4444" }}>not applied</strong>.</>
                ) : stats.verified > 0 ? (
                  <>All {stats.verified} verified prediction{stats.verified !== 1 ? "s" : ""} stayed shipped through the 7-day window — no failures have been tracked yet.</>
                ) : (
                  <>Analyze and verify predictions to uncover patterns in how risk scores align with real outcomes.</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: "10px 16px", textAlign: "center",
        background: "var(--overlay-02)", borderRadius: 8,
        border: "1px solid var(--overlay-04)",
        animation: "fadeSlideUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
          Accuracy metrics are calibrated against operator-verified production outcomes (e.g., manual status updates) over a <strong style={{ color: "var(--text-secondary)" }}>7-day survival window</strong> post-merge.
          <span style={{ marginLeft: 6 }}>Powered by GitLab Orbit — All 4 query types.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
          {(["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"] as const).map(q => (
            <span key={q} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.15)", fontWeight: 600, letterSpacing: "0.3px" }}>
              {q}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
