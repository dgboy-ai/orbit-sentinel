import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { riskScoreToKey, RISK } from "../utils/colors";
import { categorizePrediction } from "../utils/predictions";
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

        <rect x={pad.left} y={pad.top} width={plotW} height={plotH} rx={4} fill="url(#chart-bg-grad)" />

        {yLabels.map(v => (
          <g key={v}>
            <line x1={pad.left} x2={w - pad.right} y1={yTick(v)} y2={yTick(v)} stroke="var(--overlay-06)" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x={pad.left - labelOff} y={yTick(v) + 3.5} textAnchor="end" fill="var(--overlay-35)" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono',monospace">{Math.round(v * 100)}%</text>
          </g>
        ))}

        {series.map((s) => {
          const pts = s.data.map((v, i) => `${xTick(i)},${yTick(v)}`).join(" ");
          const area = s.data.map((v, i) => `${xTick(i)},${yTick(v)}`).join(" ") + ` ${xTick(lastIdx)},${pad.top + plotH} ${xTick(0)},${pad.top + plotH}`;
          return (
            <g key={s.label}>
              <polygon points={area} fill={`url(#pg-a-${s.color.replace("#", "")})`} />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} filter={`url(#glow-${s.color.replace("#", "")})`} />
              {s.data.map((v, i) => (
                <circle key={i} cx={xTick(i)} cy={yTick(v)} r={4.5} fill="rgba(var(--bg-card-rgb),0.95)" stroke={s.color} strokeWidth="2.2" opacity={0.95} />
              ))}
            </g>
          );
        })}

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
                  <circle cx={xTick(hoverX)} cy={yTick(v)} r={2.5} fill="rgba(var(--bg-card-rgb),0.95)" />
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
  return <span style={{ fontSize: 30, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 24px ${color}60, 0 0 60px ${color}20` }}>{val}{suffix}</span>;
}

function StatCard({ label, value, sub, color, target, suffix = "", icon, badge, bars }: { label: string; value: string; sub?: string; color: string; target?: number; suffix?: string; icon?: string; badge?: string; bars?: { label: string; value: number; color: string }[] }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10, position: "relative", overflow: "hidden",
      background: `linear-gradient(145deg, ${color}15, ${color}05)`,
      border: `1px solid ${color}40`,
      boxShadow: `0 0 30px ${color}15, inset 0 0 20px ${color}06`,
      animation: "fadeSlideUp 0.35s ease both",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 45px ${color}25, inset 0 0 25px ${color}10`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 0 30px ${color}15, inset 0 0 20px ${color}06`; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: `${color}06`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {icon && <span style={{ fontSize: 22, opacity: 0.5, display: "block", marginBottom: 2 }}>{icon}</span>}
        {target !== undefined
          ? <AnimatedCounter target={target} suffix={suffix || ""} color={color} />
          : <div style={{ fontSize: 28, fontWeight: 800, color: `${color}dd`, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 20px ${color}50, 0 0 50px ${color}20` }}>{value}</div>}
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: `${color}bb`, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
        {badge && (
          <div style={{ marginTop: 4, display: "inline-flex", padding: "1px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: `${color}20`, color, border: `1px solid ${color}35`, letterSpacing: "0.3px", textShadow: `0 0 8px ${color}40` }}>{badge}</div>
        )}
        {bars && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {bars.map(b => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", minWidth: 20 }}>{b.label}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: `${b.color}12`, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(b.value * 100, 100)}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${b.color}, ${b.color}77)`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}
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
  const [showOnlyLive, setShowOnlyLive] = useState(false);
  const items = preds ?? [];

  const displayItems = useMemo(() => {
    if (!showOnlyLive) return items;
    return items.filter(i => i.source === "live");
  }, [showOnlyLive, items]);

  const sorted = useMemo(() => {
    const list = [...displayItems];
    if (sortAsc) list.sort((a, b) => a.mrIid - b.mrIid);
    else list.sort((a, b) => b.mrIid - a.mrIid);
    if (filterOutcome !== "all") return list.filter(i => i.actualOutcome === filterOutcome);
    return list;
  }, [sortAsc, filterOutcome, displayItems]);

  const stats = useMemo(() => {
    const verified = displayItems.filter(i => i.actualOutcome === "verified").length;
    const failed = displayItems.filter(i => i.actualOutcome === "failed").length;
    const totalVerified = verified + failed;
    const withCat = displayItems.map(p => ({ ...p, category: p.category || categorizePrediction(p) }));
    const classified = withCat.filter(p => p.category !== "pending");
    const tp = classified.filter(p => p.category === "true_positive").length;
    const tn = classified.filter(p => p.category === "true_negative").length;
    const fp = classified.filter(p => p.category === "false_positive").length;
    const fn = classified.filter(p => p.category === "false_negative").length;
    const classTotal = tp + tn + fp + fn;
    const classificationAccuracy = classTotal > 0 ? Math.round(((tp + tn) / classTotal) * 100) : 0;
    const avgPredicted = displayItems.length > 0 ? displayItems.reduce((s, i) => s + i.predictedRisk, 0) / displayItems.length : 0;
    const hasActual = displayItems.some(i => i.actualRisk !== undefined);
    const avgActual = hasActual ? displayItems.reduce((s, i) => s + (i.actualRisk ?? 0), 0) / displayItems.filter(i => i.actualRisk !== undefined).length : 0;
    const liveCount = displayItems.filter(i => i.source === "live").length;
    const demoCount = displayItems.filter(i => i.source === "demo").length;
    return { verified, failed, pending: displayItems.length - totalVerified, total: totalVerified, accuracy: classificationAccuracy, avgPredicted, avgActual, hasActual, liveCount, demoCount, tp, tn, fp, fn };
  }, [displayItems]);

  const trendData = useMemo(() => {
    const sorted = [...displayItems].sort((a, b) => a.mrIid - b.mrIid);
    return { predicted: sorted.map(i => i.predictedRisk), actual: sorted.map(i => i.actualRisk ?? null), labels: sorted.map(i => `!${i.mrIid}`) };
  }, [displayItems]);

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

  const fadeIn = (delay: number) => ({
    animation: `fadeSlideUp 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* HERO HEADER */}
      <div className="card" style={{
        padding: isMobile ? "18px 18px" : "22px 24px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(var(--bg-card-rgb),0.96), rgba(139,92,246,0.06))",
        border: "1px solid rgba(59,130,246,0.2)",
        boxShadow: "0 0 40px rgba(59,130,246,0.08)",
        ...fadeIn(0),
      }}>
        <div style={{ position: "absolute", top: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(59,130,246,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 16px 6px 10px", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))",
              border: "1px solid rgba(59,130,246,0.18)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 14px rgba(34,197,94,0.7)", animation: "pulseDot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.5px", textTransform: "uppercase" }}>Prediction Scoreboard</span>
              <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 10, background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontWeight: 700, border: "1px solid rgba(96,165,250,0.25)" }}>TRACKING</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <span>Tracking <strong style={{ color: "var(--text-primary)" }}>{displayItems.length}</strong> MRs</span>
              {stats.liveCount > 0 && stats.demoCount === 0 && <>
                <span style={{ color: "var(--overlay-08)" }}>·</span>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>{stats.liveCount} live</span>
              </>}
              <span style={{ color: "var(--overlay-08)" }}>·</span>
              <span style={{ color: "#22c55e", fontWeight: 600 }}>{stats.verified} shipped</span>
              <span style={{ color: "var(--overlay-08)" }}>·</span>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>{stats.failed} failed</span>
            </div>
            <button onClick={() => setShowOnlyLive(!showOnlyLive)}
              style={{
                padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", borderRadius: 4,
                border: `1px solid ${showOnlyLive ? "rgba(34,197,94,0.35)" : "var(--overlay-08)"}`,
                background: showOnlyLive ? "rgba(34,197,94,0.1)" : "transparent",
                color: showOnlyLive ? "#22c55e" : "var(--text-tertiary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = showOnlyLive ? "rgba(34,197,94,0.15)" : "var(--overlay-04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = showOnlyLive ? "rgba(34,197,94,0.1)" : "transparent"; }}
            >{showOnlyLive ? "● Live Only" : "○ All Predictions"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 8 }}>
            <StatCard label="Total MRs Tracked" value={String(displayItems.length)} target={displayItems.length} color="#60a5fa" icon="📋" badge="Live + Demo" sub={stats.liveCount > 0 ? `${stats.liveCount} live · ${stats.demoCount} demo` : undefined} />
            <StatCard label="Stayed Shipped" value={String(stats.verified)} target={stats.verified} sub="Passed 7-day window" color="#22c55e" icon="✅" bars={stats.verified > 0 ? [{ label: "Live", value: displayItems.filter(i => i.actualOutcome === "verified" && i.source === "live").length / Math.max(stats.verified, 1), color: "#22c55e" }, { label: "Demo", value: displayItems.filter(i => i.actualOutcome === "verified" && i.source === "demo").length / Math.max(stats.verified, 1), color: "#a78bfa" }] : undefined} />
            <StatCard label="Reverted / Hotfixed" value={String(stats.failed)} target={stats.failed} sub="Failed within window" color="#ef4444" icon="❌" />
            <StatCard label="Prediction Accuracy" value={`${stats.accuracy}%`} suffix="%" color="#fbbf24" icon="🎯" badge={stats.accuracy >= 70 ? "Reliable" : "Needs data"} bars={[{ label: "TP", value: stats.tp / Math.max(stats.tp + stats.fp + stats.tn + stats.fn, 1), color: "#22c55e" }, { label: "TN", value: stats.tn / Math.max(stats.tp + stats.fp + stats.tn + stats.fn, 1), color: "#60a5fa" }, { label: "FP", value: stats.fp / Math.max(stats.tp + stats.fp + stats.tn + stats.fn, 1), color: "#eab308" }, { label: "FN", value: stats.fn / Math.max(stats.tp + stats.fp + stats.tn + stats.fn, 1), color: "#ef4444" }]} />
            <StatCard label="Avg Risk Score" value={`${Math.round(stats.avgPredicted * 100)}%`} sub={`Actual: ${stats.hasActual ? `${Math.round(stats.avgActual * 100)}%` : "Pending verification"}`} color="#a78bfa" icon="📊" />
          </div>
        </div>
      </div>

      {/* Closed-Loop Engine */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, ...fadeIn(0.02) }}>

        {/* CLOSED-LOOP ENGINE */}
        <div style={{
          padding: "12px 16px", borderRadius: 8, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(var(--bg-card-rgb),0.96))",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 0 30px rgba(139,92,246,0.08), inset 0 0 20px rgba(139,92,246,0.03)",
        }}>
          <div style={{ position: "absolute", bottom: -30, right: 40, width: 140, height: 140, borderRadius: "50%", background: "rgba(139,92,246,0.04)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🔄</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>Closed-Loop Prediction Engine</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>Predict → Ship → Verify → Learn</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "3px 14px", borderRadius: 16, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${stats.accuracy >= 70 ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)"}, ${stats.accuracy >= 70 ? "rgba(34,197,94,0.04)" : "rgba(234,179,8,0.04)"})`, border: `1px solid ${stats.accuracy >= 70 ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`, color: stats.accuracy >= 70 ? "#22c55e" : "#eab308" }}>
                {stats.accuracy}% Accuracy
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { step: "Predict", icon: "🔮", color: "#60a5fa", desc: "Risk score via Orbit graph" },
                { step: "Ship", icon: "🚀", color: "#eab308", desc: "MR merged to target branch" },
                { step: "Verify", icon: "✅", color: "#22c55e", desc: "7-day survival window" },
                { step: "Learn", icon: "🧠", color: "#a78bfa", desc: "Calibrate accuracy model" },
              ].map((s, i) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, background: `${s.color}10`, border: `1px solid ${s.color}25`, boxShadow: `0 0 12px ${s.color}08`, flex: 1, minWidth: 100 }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textShadow: `0 0 8px ${s.color}40` }}>{s.step}</div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{s.desc}</div>
                  </div>
                  {i < 3 && <span style={{ color: "var(--overlay-08)", fontSize: 12, marginLeft: "auto" }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX + TREND CHART — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.8fr", gap: 10, ...fadeIn(0.04) }}>
        {/* CONFUSION MATRIX — 2x2 grid */}
        <div className="card" style={{
          padding: "14px 16px", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, rgba(96,165,250,0.03), rgba(var(--bg-card-rgb),0.95))",
          border: "1px solid rgba(96,165,250,0.12)",
          boxShadow: "0 0 20px rgba(96,165,250,0.04)",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>📊</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.3px" }}>Prediction Outcomes</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.15), transparent)" }} />
            </div>
            {/* 2x2 grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
              position: "relative",
            }}>
              {/* Row header: Predicted */}
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginBottom: 2 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
                  color: "var(--text-secondary)", opacity: 0.8, padding: "1px 10px",
                  background: "var(--overlay-03)", borderRadius: 4,
                }}>Predicted</div>
              </div>
              {/* Column sub-headers */}
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", opacity: 0.7 }}>High Risk</div>
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", opacity: 0.7 }}>Low Risk</div>
              {/* TP */}
              <div style={{
                padding: "12px 10px", borderRadius: 8, textAlign: "center",
                background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 20px rgba(34,197,94,0.1), inset 0 0 15px rgba(34,197,94,0.04)",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>TP</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(34,197,94,0.5), 0 0 50px rgba(34,197,94,0.2)", lineHeight: 1.1 }}>{stats.tp}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Failed as predicted</div>
              </div>
              {/* FP */}
              <div style={{
                padding: "12px 10px", borderRadius: 8, textAlign: "center",
                background: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.03))",
                border: "1px solid rgba(234,179,8,0.3)",
                boxShadow: "0 0 20px rgba(234,179,8,0.1), inset 0 0 15px rgba(234,179,8,0.04)",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#eab308", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 0 8px rgba(234,179,8,0.3)" }}>FP</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#eab308", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(234,179,8,0.5), 0 0 50px rgba(234,179,8,0.2)", lineHeight: 1.1 }}>{stats.fp}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Shipped anyway</div>
              </div>
              {/* FN */}
              <div style={{
                padding: "12px 10px", borderRadius: 8, textAlign: "center",
                background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))",
                border: "1px solid rgba(239,68,68,0.3)",
                boxShadow: "0 0 20px rgba(239,68,68,0.1), inset 0 0 15px rgba(239,68,68,0.04)",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>FN</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(239,68,68,0.5), 0 0 50px rgba(239,68,68,0.2)", lineHeight: 1.1 }}>{stats.fn}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Missed prediction</div>
              </div>
              {/* TN */}
              <div style={{
                padding: "12px 10px", borderRadius: 8, textAlign: "center",
                background: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(96,165,250,0.03))",
                border: "1px solid rgba(96,165,250,0.3)",
                boxShadow: "0 0 20px rgba(96,165,250,0.1), inset 0 0 15px rgba(96,165,250,0.04)",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 0 8px rgba(96,165,250,0.3)" }}>TN</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(96,165,250,0.5), 0 0 50px rgba(96,165,250,0.2)", lineHeight: 1.1 }}>{stats.tn}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Shipped as predicted</div>
              </div>
              {/* Row header: Actual */}
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: 2 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
                  color: "var(--text-secondary)", opacity: 0.8, padding: "1px 10px",
                  background: "var(--overlay-03)", borderRadius: 4,
                }}>Actual</div>
              </div>
            </div>
            {/* Summary line */}
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.5, fontWeight: 500 }}>
              Accuracy = <strong style={{ color: "#22c55e", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>TP + TN</strong> / TP + TN + FP + FN = <strong style={{ color: stats.accuracy >= 70 ? "#22c55e" : "#eab308", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, textShadow: `0 0 12px ${stats.accuracy >= 70 ? "rgba(34,197,94,0.4)" : "rgba(234,179,8,0.4)"}` }}>{stats.accuracy}%</strong>
            </div>
          </div>
        </div>

        {/* TREND CHART */}
        <div className="card" style={{
          padding: "14px 16px", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(var(--bg-card-rgb),0.95))",
          border: "1px solid rgba(59,130,246,0.25)",
          boxShadow: "0 0 30px rgba(59,130,246,0.08), inset 0 0 20px rgba(59,130,246,0.03)",
        }}>
          <div style={{ position: "absolute", top: -50, left: "30%", width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>📈</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>Risk Trend</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.15), transparent)" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 16, height: 3, borderRadius: 2, background: "#60a5fa", boxShadow: "0 0 6px rgba(96,165,250,0.4)" }} /><span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>Predicted</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 16, height: 3, borderRadius: 2, background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} /><span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>Actual</span></div>
              </div>
            </div>
            <div style={{ overflowX: "auto", paddingBottom: 4 }}>
              <DualSparkline
                series={[
                  { data: trendData.predicted, color: "#60a5fa", label: "Predicted" },
                  { data: trendData.actual.filter((v): v is number => v !== null), color: "#22c55e", label: "Actual" },
                ]}
                labels={trendData.labels}
                height={110}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACCURACY INSIGHTS */}
      <div className="card" style={{
        padding: "16px 18px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(var(--bg-card-rgb),0.97), rgba(59,130,246,0.04))",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: "inset 0 0 40px rgba(139,92,246,0.04)",
        ...fadeIn(0.06),
      }}>
        <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.05)", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(59,130,246,0.04)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05))",
              border: "1px solid rgba(167,139,250,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>💡</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px" }}>Accuracy Insights</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(139,92,246,0.2), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 2.2fr", gap: 8 }}>
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(96,165,250,0.03))",
                border: "1px solid rgba(96,165,250,0.3)",
                boxShadow: "0 0 24px rgba(96,165,250,0.08), inset 0 0 20px rgba(96,165,250,0.03)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>📏</span>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.5px", textTransform: "uppercase" }}>Avg Error Margin</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 24px rgba(96,165,250,0.6), 0 0 60px rgba(96,165,250,0.2)" }}>
                  {stats.total > 0 ? `${Math.round(displayItems.reduce((s, i) => s + Math.abs(i.predictedRisk - (i.actualRisk ?? i.predictedRisk)), 0) / displayItems.length * 100)}%` : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1, borderTop: "1px solid rgba(96,165,250,0.12)", paddingTop: 4, fontWeight: 500 }}>Prediction vs actual risk score delta</div>
              </div>
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 24px rgba(34,197,94,0.08), inset 0 0 20px rgba(34,197,94,0.03)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", textTransform: "uppercase" }}>Failures Caught</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 24px rgba(34,197,94,0.6), 0 0 60px rgba(34,197,94,0.2)" }}>
                  {stats.failed > 0 ? `${Math.round((displayItems.filter(i => i.actualOutcome === "failed" && i.predictedRisk >= 0.6).length / stats.failed) * 100)}%` : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1, borderTop: "1px solid rgba(34,197,94,0.12)", paddingTop: 4, fontWeight: 500 }}>High-risk predictions that correctly flagged failures</div>
              </div>
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.03))",
                border: "1px solid rgba(234,179,8,0.3)",
                boxShadow: "0 0 24px rgba(234,179,8,0.08), inset 0 0 20px rgba(234,179,8,0.03)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>🔍</span>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#eab308", letterSpacing: "0.5px", textTransform: "uppercase" }}>Key Pattern</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                  {stats.failed > 0 ? (
                    <><span style={{ color: "#22c55e", fontWeight: 700, textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>High-risk (≥60%)</span> mitigated before merge — all stayed shipped. The <span style={{ color: "#ef4444", fontWeight: 700, textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>{stats.failed} failure{stats.failed !== 1 ? "s" : ""}</span> {stats.failed !== 1 ? "were" : "was"} MRs where mitigations were <span style={{ color: "#ef4444", fontWeight: 700, textShadow: "0 0 8px rgba(239,68,68,0.3)" }}>not applied</span>.</>
                  ) : stats.verified > 0 ? (
                    <>All <span style={{ color: "#22c55e", fontWeight: 700, textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>{stats.verified}</span> verified prediction{stats.verified !== 1 ? "s" : ""} stayed shipped through the 7-day window — no failures have been tracked yet.</>
                  ) : (
                    <>Analyze and verify predictions to uncover patterns in how risk scores align with real outcomes.</>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* VULNERABILITY-ADJUSTED PREDICTIONS */}
      <div className="card" style={{
        padding: "14px 16px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(var(--bg-card-rgb),0.95))",
        border: "1px solid rgba(239,68,68,0.2)",
        boxShadow: "0 0 24px rgba(239,68,68,0.06), inset 0 0 15px rgba(239,68,68,0.03)",
        ...fadeIn(0.07),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", letterSpacing: "0.3px" }}>Vulnerability-Adjusted Predictions</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(239,68,68,0.15), transparent)" }} />
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>{displayItems.filter(p => p.predictedRisk >= 0.3).length} flagged</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6 }}>
            {displayItems.filter(p => p.predictedRisk >= 0.3).map((p, i) => {
              const sev = p.predictedRisk >= 0.8 ? "critical" : p.predictedRisk >= 0.6 ? "high" : p.predictedRisk >= 0.3 ? "medium" : "low";
              const sevColor = sev === "critical" ? "#ef4444" : sev === "high" ? "#f97316" : "#eab308";
              const boost = Math.max(0, Math.round((p.predictedRisk - 0.5) * 100)) / 100;
              const caught = p.actualOutcome === "failed";
              return (
                <div key={p.mrIid} style={{
                  padding: "10px 12px", borderRadius: 6,
                  background: `linear-gradient(135deg, ${sevColor}08, rgba(255,255,255,0.01))`,
                  border: `1px solid ${sevColor}20`,
                  animation: `fadeSlideUp 0.3s ${0.05 + i * 0.02}s ease both`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{p.mrIid}</span>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700, background: `${sevColor}20`, color: sevColor, border: `1px solid ${sevColor}30`, textShadow: `0 0 6px ${sevColor}30` }}>{sev}</span>
                    {caught && <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginLeft: "auto", textShadow: "0 0 8px rgba(34,197,94,0.3)" }}>✅ Caught</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${sevColor}10`, paddingTop: 5 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 1 }}>Risk Score</div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: sevColor, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${sevColor}40` }}>{Math.round(p.predictedRisk * 100)}%</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 1 }}>Vuln. Boost</div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: p.predictedRisk >= 0.6 ? "#ef4444" : "#eab308", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(239,68,68,0.3)" }}>{boost > 0 ? `+${Math.round(boost * 100)}%` : "—"}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 1 }}>Outcome</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: caught ? "#22c55e" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{caught ? "FAILED" : "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POST-MERGE VERIFICATION */}
      <div className="card" style={{
        padding: "14px 16px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(var(--bg-card-rgb),0.95))",
        border: "1px solid rgba(34,197,94,0.2)",
        boxShadow: "0 0 24px rgba(34,197,94,0.06), inset 0 0 15px rgba(34,197,94,0.03)",
        ...fadeIn(0.08),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🔬</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", letterSpacing: "0.3px" }}>Post-Merge Verification</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(34,197,94,0.15), transparent)" }} />
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>{displayItems.filter(i => i.actualOutcome !== "pending").length} verified</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4, marginBottom: 10, maxWidth: 480 }}>
            Check an MR's actual production outcome after it ships. Results are logged to the <strong style={{ color: "var(--text-secondary)" }}>prediction accuracy model</strong> for continuous calibration.
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "100%" : 240 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, pointerEvents: "none" }}>!</span>
              <input
                value={verifyMrIid}
                onChange={e => setVerifyMrIid(e.target.value.replace(/\D/g, ""))}
                placeholder="MR IID (e.g. 42)"
                onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
                style={{
                  width: "100%", padding: "9px 12px 9px 26px", fontSize: 15, fontFamily: "'JetBrains Mono', monospace",
                  border: "1px solid rgba(34,197,94,0.25)", borderRadius: 6,
                  background: "rgba(34,197,94,0.04)", color: "var(--text-primary)",
                  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.08)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button onClick={handleVerify} disabled={!verifyMrIid || verifying}
              style={{
                padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: !verifyMrIid || verifying ? "not-allowed" : "pointer",
                border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6,
                background: verifying ? "rgba(34,197,94,0.06)" : "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.07))",
                color: "#22c55e", transition: "all 0.2s", whiteSpace: "nowrap",
                opacity: !verifyMrIid || verifying ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={e => { if (verifyMrIid && !verifying) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))"; e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.15)"; } }}
              onMouseLeave={e => { if (verifyMrIid && !verifying) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.07))"; e.currentTarget.style.boxShadow = "none"; } }}
            >
              {verifying && <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(34,197,94,0.3)", borderTopColor: "#22c55e", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
              {verifying ? "Checking…" : "✓ Verify MR"}
            </button>
          </div>
          {verifyResult && (
            <div style={{
              marginTop: 8, padding: "10px 14px", borderRadius: 6,
              background: verifyResult.outcome === "verified" ? "rgba(34,197,94,0.06)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.06)" : "var(--overlay-02)",
              border: `1px solid ${verifyResult.outcome === "verified" ? "rgba(34,197,94,0.15)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.15)" : "var(--overlay-06)"}`,
              animation: "fadeSlideUp 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 20 }}>{verifyResult.outcome === "verified" ? "✅" : verifyResult.outcome === "failed" ? "❌" : "ℹ️"}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: verifyResult.outcome === "verified" ? "#22c55e" : verifyResult.outcome === "failed" ? "#ef4444" : "var(--text-secondary)" }}>
                  MR !{verifyResult.mrIid} — {verifyResult.outcome === "verified" ? "Stayed Shipped" : verifyResult.outcome === "failed" ? "Failed" : "Not Found"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{verifyResult.message}</div>
            </div>
          )}
          {/* Recent verifications */}
          {displayItems.filter(i => i.actualOutcome !== "pending").length > 0 && (
            <div style={{ marginTop: 10, borderTop: "1px solid rgba(34,197,94,0.08)", paddingTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Recent Verifications</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {displayItems.filter(i => i.actualOutcome !== "pending").slice(-3).reverse().map(v => (
                  <div key={v.mrIid} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 10px", borderRadius: 4,
                    background: "rgba(255,255,255,0.01)", border: "1px solid var(--overlay-04)",
                    fontSize: 13,
                  }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", minWidth: 40 }}>!{v.mrIid}</span>
                    <span style={{ flex: 1, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, fontWeight: 700, background: v.actualOutcome === "verified" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: v.actualOutcome === "verified" ? "#22c55e" : "#ef4444", border: `1px solid ${v.actualOutcome === "verified" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                      {v.actualOutcome === "verified" ? "✓ Shipped" : "✗ Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MR PREDICTIONS LEDGER */}
      <div className="card" style={{
        padding: "16px 18px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(var(--bg-card-rgb),0.95))",
        border: "1px solid rgba(96,165,250,0.15)",
        boxShadow: "0 0 24px rgba(96,165,250,0.05), inset 0 0 15px rgba(96,165,250,0.02)",
        ...fadeIn(0.1),
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16 }}>📒</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>MR Predictions Ledger</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.15), transparent)" }} />
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}
              style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 4,
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
                fontSize: 12, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                background: "var(--overlay-04)", border: "1px solid var(--overlay-10)",
                color: "var(--text-secondary)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-04)"; }}
            >
              {sortAsc ? "↑ Oldest" : "↓ Newest"}
            </button>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>{sorted.length} MR{sorted.length !== 1 ? "s" : ""}</span>
          </div>
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "55px 1fr 90px 90px 130px", gap: 8, alignItems: "center", padding: "0 12px 7px", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-secondary)", opacity: 0.6, borderBottom: "1px solid var(--overlay-03)" }}>
              <span>MR</span>
              <span>Title</span>
              <span style={{ textAlign: "center" }}>Predicted</span>
              <span style={{ textAlign: "center" }}>Actual</span>
              <span style={{ textAlign: "center" }}>Result</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {sorted.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 14, color: "var(--text-tertiary)" }}>
                {displayItems.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>📊</span>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No predictions yet</span>
                    <span style={{ fontSize: 13, lineHeight: 1.4, maxWidth: 320 }}>
                      Analyze an MR on the <strong style={{ color: "var(--text-primary)" }}>Overview</strong> page to track your first prediction.
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
                    display: "flex", flexDirection: "column", gap: 4,
                    padding: "10px 12px", borderRadius: 6,
                    background: isHovered ? `${outcomeColor}12` : "rgba(255,255,255,0.01)",
                    border: `1px solid ${isHovered ? `${outcomeColor}30` : "var(--overlay-04)"}`,
                    boxShadow: isHovered ? `0 0 20px ${outcomeColor}10` : "none",
                    transition: "all 0.15s ease",
                    animation: `fadeSlideUp 0.3s ${0.1 + i * 0.02}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                    onMouseEnter={() => setHoveredRow(item.mrIid)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</span>
                      </div>
                      <OutcomeBadge outcome={item.actualOutcome} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, borderTop: "1px solid var(--overlay-03)", paddingTop: 4 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 1 }}>Predicted</div>
                        <RiskBadge score={item.predictedRisk} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 1 }}>Actual</div>
                        {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>—</span>}
                      </div>
                    </div>
                    {item.actualRisk !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.01)", padding: "3px 8px", borderRadius: 3 }}>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Verdict:</span>
                        <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />
                      </div>
                    )}
                    {(isHovered || true) && item.evidence && (
                      <div style={{
                        padding: "5px 8px", borderRadius: 3,
                        background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${outcomeColor}44`,
                        fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4,
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
                  gridTemplateColumns: "55px 1fr 90px 90px 130px",
                  gap: 8, alignItems: "center",
                  padding: "7px 12px", borderRadius: 5,
                  background: isHovered ? `linear-gradient(135deg, ${outcomeColor}10, transparent)` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isHovered ? `${outcomeColor}28` : "transparent"}`,
                  boxShadow: isHovered ? `0 0 16px ${outcomeColor}08` : "none",
                  transition: "all 0.15s ease", cursor: "default",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.02}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
                  onMouseEnter={() => setHoveredRow(item.mrIid)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 4 }}>{item.title}</div>
                  <div style={{ textAlign: "center" }}>
                    <RiskBadge score={item.predictedRisk} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {item.actualRisk !== undefined && <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />}
                    <OutcomeBadge outcome={item.actualOutcome} />
                  </div>
                  {isHovered && item.evidence && (
                    <div style={{
                      gridColumn: "1 / -1", marginTop: 3, padding: "5px 8px", borderRadius: 3,
                      background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${outcomeColor}44`,
                      fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4,
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

      {/* FOOTER */}
      <div style={{
        padding: "14px 18px", textAlign: "center", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(var(--bg-card-rgb),0.96), rgba(139,92,246,0.03))",
        borderRadius: 8, border: "1px solid rgba(96,165,250,0.1)",
        ...fadeIn(0.12),
      }}>
        <div style={{ position: "absolute", top: -30, left: "40%", width: 120, height: 120, borderRadius: "50%", background: "rgba(96,165,250,0.04)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            Accuracy metrics are calibrated against operator-verified production outcomes over a <strong style={{ color: "var(--text-secondary)" }}>7-day survival window</strong> post-merge.
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.3px" }}>Powered by GitLab Orbit</span>
            <span style={{ color: "var(--overlay-08)", fontSize: 11 }}>·</span>
            <div style={{ display: "flex", gap: 4 }}>
              {(["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"] as const).map((q, i) => {
                const qColors: Record<string, string> = { NEIGHBORS: "#22c55e", PATH_FINDING: "#60a5fa", TRAVERSAL: "#a78bfa", AGGREGATION: "#f97316" };
                return (
                  <span key={q} style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    background: `${qColors[q]}12`, color: qColors[q],
                    border: `1px solid ${qColors[q]}20`,
                    fontWeight: 700, letterSpacing: "0.5px", fontFamily: "'JetBrains Mono', monospace",
                    transition: "transform 0.15s",
                    display: "inline-flex", alignItems: "center", gap: 3,
                    animation: `fadeSlideUp 0.3s ${0.13 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: qColors[q], display: "inline-block" }} />
                    {q}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
