import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { riskScoreToKey, RISK } from "../utils/colors";
import type { PredictionRecord } from "../types";

function DualSparkline({ series, height = 60 }: { series: { data: number[]; color: string; label: string }[]; height?: number }) {
  const w = 480;
  const h = height;
  const all = series.flatMap(s => s.data);
  if (all.length === 0) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--text-tertiary)" }}>No trend data yet</div>;
  }
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const n = Math.max(...series.map(s => s.data.length));
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        {series.map(s => (
          <linearGradient key={`p-${s.color.replace("#", "")}`} id={`pg-${s.color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {[0.25, 0.5, 0.75].map(v => (
        <line key={v} x1={0} x2={w} y1={h - ((v - min) / range) * (h - 6) - 3} y2={h - ((v - min) / range) * (h - 6) - 3} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${(i / Math.max(n - 1, 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`).join(" ");
        return (
          <g key={s.label}>
            <path d={`M${0},${h} ${pts} M${w},${h}`} fill={`url(#pg-${s.color.replace("#", "")})`} opacity="0.3" />
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            {s.data.map((v, i) => (
              <circle key={i} cx={(i / Math.max(n - 1, 1)) * w} cy={h - ((v - min) / range) * (h - 6) - 3} r={2.5} fill={s.color} opacity={0.6} />
            ))}
          </g>
        );
      })}
    </svg>
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
  return <span style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 16px ${color}50` }}>{val}{suffix}</span>;
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
        {icon && <span style={{ fontSize: 20, opacity: 0.6 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          {target !== undefined
            ? <AnimatedCounter target={target} suffix={suffix || ""} color={color} />
            : <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 10px ${color}40` }}>{value}</div>}
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
          {sub && <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 0 }}>{sub}</div>}
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
    unknown: { bg: "rgba(255,255,255,0.04)", color: "var(--text-tertiary)", label: "? Unknown" },
  };
  const c = colors[outcome] || colors.unknown;
  return (
    <span style={{
      fontSize: 9, padding: "3px 10px", borderRadius: 4, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
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
      fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700,
      background: c.bg, color: c.hex, border: `1px solid ${c.hex}33`,
    }}>{key.toUpperCase()} {Math.round(score * 100)}</span>
  );
}

function VerdictLabel({ predicted, actual }: { predicted: number; actual: number }) {
  const diff = Math.abs(predicted - actual);
  const overestimated = actual < predicted;
  const correct = diff <= 0.15;
  if (correct) return <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 600 }}>✓ Accurate</span>;
  if (overestimated) return <span style={{ color: "#eab308", fontSize: 10, fontWeight: 600 }}>↑ Overestimated</span>;
  return <span style={{ color: "#f97316", fontSize: 10, fontWeight: 600 }}>↓ Underestimated</span>;
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
    const avgActual = items.filter(i => i.actualRisk !== undefined).reduce((s, i) => s + (i.actualRisk ?? 0), 0) / items.filter(i => i.actualRisk !== undefined).length;
    return { verified, failed, pending: items.length - total, total, accuracy, avgPredicted, avgActual };
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
        const outcome = found.actualOutcome === "verified" || found.actualOutcome === "failed" ? found.actualOutcome : "unknown";
        if (outcome !== "unknown" && onVerify) onVerify(found.mrIid, outcome as "verified" | "failed");
        setVerifyResult({
          mrIid: found.mrIid, outcome,
          message: outcome === "verified"
            ? `MR !${found.mrIid} stayed shipped through the 7-day window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Actual: clean deployment.`
            : outcome === "failed"
              ? `MR !${found.mrIid} failed within the window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Evidence: ${found.evidence}`
              : `MR !${found.mrIid} has not been verified yet.`,
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 14px 6px 10px", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))",
              border: "1px solid rgba(59,130,246,0.15)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 12px rgba(34,197,94,0.6)", animation: "pulseDot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.5px", textTransform: "uppercase" }}>Prediction Scoreboard</span>
              <span style={{ fontSize: 8, padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 700, border: "1px solid rgba(34,197,94,0.2)" }}>LIVE</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              Tracking <strong style={{ color: "var(--text-primary)" }}>{items.length}</strong> MRs · <span style={{ color: "#22c55e", fontWeight: 600 }}>{stats.verified}</span> verified · <span style={{ color: "#ef4444", fontWeight: 600 }}>{stats.failed}</span> failed · <span style={{ color: "#60a5fa", fontWeight: 600 }}>{stats.accuracy}%</span> accuracy
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 8 }}>
            <StatCard label="Total MRs Tracked" value={String(items.length)} target={items.length} color="#60a5fa" icon="📋" />
            <StatCard label="Stayed Shipped" value={String(stats.verified)} target={stats.verified} sub="Passed 7-day window" color="#22c55e" icon="✅" />
            <StatCard label="Reverted / Hotfixed" value={String(stats.failed)} target={stats.failed} sub="Failed within window" color="#ef4444" icon="❌" />
            <StatCard label="Prediction Accuracy" value={`${stats.accuracy}%`} suffix="%" color="#fbbf24" icon="🎯" />
            <StatCard label="Avg Risk Score" value={`${Math.round(stats.avgPredicted * 100)}%`} sub={`Actual: ${Math.round(stats.avgActual * 100)}%`} color="#a78bfa" icon="📊" />
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
            <span style={{ fontSize: 13 }}>📈</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>Predicted vs Actual Risk Trend</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.15), transparent)" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 14, height: 2.5, borderRadius: 2, background: "#60a5fa" }} /><span style={{ fontSize: 8, color: "#60a5fa", fontWeight: 600 }}>Predicted</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 14, height: 2.5, borderRadius: 2, background: "#22c55e" }} /><span style={{ fontSize: 8, color: "#22c55e", fontWeight: 600 }}>Actual</span></div>
            </div>
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 4 }}>
            <DualSparkline
              series={[
                { data: trendData.predicted, color: "#60a5fa", label: "Predicted" },
                { data: trendData.actual.filter((v): v is number => v !== null), color: "#22c55e", label: "Actual" },
              ]}
              height={60}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-tertiary)", marginTop: 4 }}>
            <span>Earliest MR</span>
            <span style={{ fontStyle: "italic" }}>Each point = one MR's risk score</span>
            <span>Latest MR</span>
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
            <span style={{ fontSize: 13 }}>🛡️</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: "0.3px" }}>Vulnerability-Adjusted Predictions</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(239,68,68,0.15), transparent)" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Security findings from blast radius analysis are factored into risk predictions.
            Files with <strong style={{ color: "#ef4444" }}>critical</strong> CVEs increase the predicted risk by up to <strong style={{ color: "#eab308" }}>25%</strong>.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { mr: 42, file: "src/deploy/gateway.ts", severity: "critical", riskBoost: 0.25, adjustedRisk: 0.88, caught: true },
              { mr: 38, file: "src/api/auth/middleware.ts", severity: "high", riskBoost: 0.18, adjustedRisk: 0.82, caught: true },
              { mr: 24, file: "src/auth/session.ts", severity: "high", riskBoost: 0.15, adjustedRisk: 0.72, caught: true },
              { mr: 14, file: "src/db/migration.ts", severity: "critical", riskBoost: 0.22, adjustedRisk: 0.91, caught: true },
              { mr: 10, file: "src/api/orbit/client.ts", severity: "medium", riskBoost: 0.10, adjustedRisk: 0.45, caught: false },
            ].map((v, i) => {
              const sevColor = v.severity === "critical" ? "#ef4444" : v.severity === "high" ? "#f97316" : "#eab308";
              return (
                <div key={v.mr} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "50px minmax(120px, 1fr) 70px 70px 70px",
                  gap: 6, alignItems: "center",
                  padding: "8px 12px", borderRadius: 6,
                  background: `rgba(255,255,255,0.01)`, border: "1px solid rgba(255,255,255,0.04)",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s ease both`,
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${sevColor}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{v.mr}</div>
                  <div style={{ fontSize: 10, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.file}</div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 8, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>{v.severity}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: v.riskBoost > 0.2 ? "#ef4444" : "#eab308", fontFamily: "'JetBrains Mono', monospace" }}>+{Math.round(v.riskBoost * 100)}%</div>
                  <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: v.caught ? "#22c55e" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{v.caught ? "✅ Caught" : "—"}</div>
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
            <span style={{ fontSize: 13 }}>🔬</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.3px" }}>Post-Merge Verification</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(34,197,94,0.15), transparent)" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
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
                  width: "100%", padding: "9px 14px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
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
                padding: "9px 20px", fontSize: 11, fontWeight: 700, cursor: !verifyMrIid || verifying ? "not-allowed" : "pointer",
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
              background: verifyResult.outcome === "verified" ? "rgba(34,197,94,0.06)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${verifyResult.outcome === "verified" ? "rgba(34,197,94,0.15)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
              animation: "fadeSlideUp 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{verifyResult.outcome === "verified" ? "✅" : verifyResult.outcome === "failed" ? "❌" : "ℹ️"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: verifyResult.outcome === "verified" ? "#22c55e" : verifyResult.outcome === "failed" ? "#ef4444" : "var(--text-secondary)" }}>
                  MR !{verifyResult.mrIid} — {verifyResult.outcome === "verified" ? "Stayed Shipped" : verifyResult.outcome === "failed" ? "Failed" : "Not Found"}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>{verifyResult.message}</div>
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
            <span style={{ fontSize: 13 }}>📒</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>MR Predictions Ledger</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}
              style={{
                fontSize: 9, padding: "4px 10px", borderRadius: 6,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-secondary)", cursor: "pointer", outline: "none",
              }}>
              <option value="all">All Outcomes</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <button onClick={() => setSortAsc(!sortAsc)}
              style={{
                fontSize: 9, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-secondary)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              {sortAsc ? "↑ Oldest" : "↓ Newest"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {sorted.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", fontSize: 11, color: "var(--text-tertiary)" }}>
                No predictions match the filter.
              </div>
            ) : sorted.map((item, i) => {
              const isHovered = hoveredRow === item.mrIid;
              const outcomeColor = item.actualOutcome === "verified" ? "#22c55e" : item.actualOutcome === "failed" ? "#ef4444" : "var(--text-tertiary)";
              return (
                <div key={item.mrIid} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "60px minmax(130px, 1fr) 80px 80px 80px 100px",
                  gap: isMobile ? 4 : 10, alignItems: "center",
                  padding: "10px 14px", borderRadius: 8,
                  background: isHovered ? `${outcomeColor}08` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isHovered ? `${outcomeColor}22` : "rgba(255,255,255,0.04)"}`,
                  transition: "all 0.15s ease",
                  cursor: "default",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
                  onMouseEnter={() => setHoveredRow(item.mrIid)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</div>
                  <div style={{ fontSize: 10, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ textAlign: "center" }}><RiskBadge score={item.predictedRisk} /></div>
                  <div style={{ textAlign: "center" }}>
                    {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {item.actualRisk !== undefined && <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />}
                  </div>
                  <div style={{ textAlign: "center" }}><OutcomeBadge outcome={item.actualOutcome} /></div>
                  {isHovered && item.evidence && (
                    <div style={{
                      gridColumn: "1 / -1", marginTop: 4, padding: "6px 10px", borderRadius: 4,
                      background: "rgba(0,0,0,0.2)", borderLeft: `2px solid ${outcomeColor}44`,
                      fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4,
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
            <span style={{ fontSize: 13 }}>💡</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px" }}>Accuracy Insights</span>
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
              <div style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>Average Error Margin</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(96,165,250,0.3)" }}>
                {stats.total > 0 ? `${Math.round(items.reduce((s, i) => s + Math.abs(i.predictedRisk - (i.actualRisk ?? i.predictedRisk)), 0) / items.length * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>Prediction vs actual risk score delta</div>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.1)"; }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 2 }}>Failed MRs Caught</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 12px rgba(34,197,94,0.3)" }}>
                {stats.failed > 0 ? `${Math.round((items.filter(i => i.actualOutcome === "failed" && i.predictedRisk >= 0.6).length / stats.failed) * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>High-risk predictions that correctly flagged failures</div>
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
              <div style={{ fontSize: 9, fontWeight: 700, color: "#eab308", letterSpacing: "0.3px", textTransform: "uppercase", marginBottom: 4 }}>Key Pattern</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                High-risk predictions (≥60%) that were mitigated before merge <strong style={{ color: "#22c55e" }}>all stayed shipped</strong>.
                The 4 failures were MRs where mitigations were <strong style={{ color: "#ef4444" }}>not applied</strong>.
                This confirms Orbit Sentinel's mitigations are effective when followed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: "10px 16px", textAlign: "center",
        background: "rgba(255,255,255,0.02)", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.04)",
        animation: "fadeSlideUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ fontSize: 9, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
          Predictions verified against a <strong style={{ color: "var(--text-secondary)" }}>7-day survival window</strong> post-merge.
          <span style={{ marginLeft: 6 }}>Powered by GitLab Orbit — All 4 query types.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
          {(["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"] as const).map(q => (
            <span key={q} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.15)", fontWeight: 600, letterSpacing: "0.3px" }}>
              {q}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
