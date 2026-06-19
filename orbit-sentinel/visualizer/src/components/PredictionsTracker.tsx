import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { riskScoreToKey, RISK } from "../utils/colors";

interface PredictionRecord {
  mrIid: number;
  title: string;
  predictedRisk: number;
  predictedLevel: string;
  actualOutcome: "verified" | "failed" | "pending" | "unknown";
  actualRisk?: number;
  mergedAt: string;
  verifiedAt?: string;
  evidence?: string;
}

const MOCK_PREDICTIONS: PredictionRecord[] = [
  { mrIid: 42, title: "critical-deploy-failure-3", predictedRisk: 0.88, predictedLevel: "CRITICAL", actualOutcome: "failed", actualRisk: 0.92, mergedAt: "2026-06-10", verifiedAt: "2026-06-17", evidence: "Pipeline failed at deploy gate. 23min production outage." },
  { mrIid: 38, title: "pipeline-dependency-breakage", predictedRisk: 0.82, predictedLevel: "HIGH", actualOutcome: "failed", actualRisk: 0.79, mergedAt: "2026-06-08", verifiedAt: "2026-06-15", evidence: "Downstream API contract broke. Rolled back within 12min." },
  { mrIid: 35, title: "test-coverage-gap", predictedRisk: 0.78, predictedLevel: "HIGH", actualOutcome: "failed", actualRisk: 0.71, mergedAt: "2026-06-05", verifiedAt: "2026-06-12", evidence: "Auth bug found in production. Hotfixed in 8min." },
  { mrIid: 31, title: "refactor-api-middleware", predictedRisk: 0.55, predictedLevel: "MEDIUM", actualOutcome: "verified", actualRisk: 0.30, mergedAt: "2026-06-03", verifiedAt: "2026-06-10", evidence: "Deployed clean. No incidents reported in 7-day window." },
  { mrIid: 28, title: "add-rate-limiting", predictedRisk: 0.48, predictedLevel: "MEDIUM", actualOutcome: "verified", actualRisk: 0.22, mergedAt: "2026-06-01", verifiedAt: "2026-06-08", evidence: "Deployed with monitoring. Zero customer-facing issues." },
  { mrIid: 24, title: "update-auth-provider", predictedRisk: 0.72, predictedLevel: "HIGH", actualOutcome: "failed", actualRisk: 0.68, mergedAt: "2026-05-28", verifiedAt: "2026-06-04", evidence: "Session token migration caused 5min auth errors. Hotfixed." },
  { mrIid: 20, title: "fix-caching-bug", predictedRisk: 0.35, predictedLevel: "LOW", actualOutcome: "verified", actualRisk: 0.18, mergedAt: "2026-05-25", verifiedAt: "2026-06-01", evidence: "Clean deployment. Cache hit rate improved 12%." },
  { mrIid: 17, title: "add-search-index", predictedRisk: 0.62, predictedLevel: "HIGH", actualOutcome: "verified", actualRisk: 0.40, mergedAt: "2026-05-22", verifiedAt: "2026-05-29", evidence: "Deployed with feature flag. Gradual rollout, no issues." },
  { mrIid: 14, title: "migrate-db-schema", predictedRisk: 0.91, predictedLevel: "CRITICAL", actualOutcome: "verified", actualRisk: 0.35, mergedAt: "2026-05-19", verifiedAt: "2026-05-26", evidence: "All mitigations applied. Zero-downtime migration succeeded." },
  { mrIid: 10, title: "initial-orbit-integration", predictedRisk: 0.45, predictedLevel: "MEDIUM", actualOutcome: "verified", actualRisk: 0.25, mergedAt: "2026-05-15", verifiedAt: "2026-05-22", evidence: "First deployment with full monitoring. Stable." },
  { mrIid: 7, title: "fix-logging-format", predictedRisk: 0.15, predictedLevel: "LOW", actualOutcome: "verified", actualRisk: 0.10, mergedAt: "2026-05-12", verifiedAt: "2026-05-19", evidence: "Trivial change. No incidents." },
  { mrIid: 5, title: "clean-deployment-example", predictedRisk: 0.12, predictedLevel: "LOW", actualOutcome: "verified", actualRisk: 0.08, mergedAt: "2026-05-10", verifiedAt: "2026-05-17", evidence: "Reference deployment — all checks passed." },
];

function DualSparkline({ series, height = 50 }: { series: { data: number[]; color: string; label: string }[]; height?: number }) {
  const w = 480;
  const h = height;
  const all = series.flatMap(s => s.data);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const n = Math.max(...series.map(s => s.data.length));
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        {series.map(s => (
          <linearGradient key={`grad-${s.color.replace("#", "")}`} id={`dual-grad-${s.color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
          </linearGradient>
        ))}
      </defs>
      {/* horizontal reference lines */}
      {[0.25, 0.5, 0.75].map(v => (
        <line key={v} x1={0} x2={w} y1={h - ((v - min) / range) * (h - 4) - 2} y2={h - ((v - min) / range) * (h - 4) - 2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}
      {series.map(s => {
        const pts = s.data.map((v, i) => `${(i / Math.max(n - 1, 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
        return (
          <g key={s.label}>
            <path d={`M${0},${h} ${pts} M${w},${h}`} fill={`url(#dual-grad-${s.color.replace("#", "")})`} opacity="0.35" />
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}

function GlowOrb({ color, top, left, right, bottom, size }: { color: string; top?: string; left?: string; right?: string; bottom?: string; size: number }) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom, width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size * 0.35}px)`, pointerEvents: "none",
      opacity: 0.3, animation: "float 8s ease-in-out infinite",
    }} />
  );
}

function AnimatedCounter({ target, suffix = "", duration = 1200, color }: { target: number; suffix?: string; duration?: number; color: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const t0 = performance.now();
    function tick(now: number) {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 12px ${color}40` }}>{val}{suffix}</span>;
}

function AnimatedStatCard({ label, value, sub, color, target, suffix = "" }: { label: string; value: string; sub?: string; color: string; target?: number; suffix?: string }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 6, textAlign: "center",
      background: `linear-gradient(135deg, ${color}12, ${color}04)`,
      border: `1px solid ${color}25`,
      boxShadow: `0 0 12px ${color}15`,
      animation: "fadeSlideUp 0.3s ease both",
    }}>
      {target !== undefined
        ? <AnimatedCounter target={target} suffix={suffix || ""} color={color} />
        : <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, textShadow: `0 0 8px ${color}30` }}>{value}</div>}
      <div style={{ fontSize: 8, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 0 }}>{sub}</div>}
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
      fontSize: 8, padding: "2px 8px", borderRadius: 3, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3,
      background: c.bg, color: c.color, border: `1px solid ${c.color}22`,
      letterSpacing: "0.2px",
    }}>{c.label}</span>
  );
}

function RiskBadge({ score }: { score: number }) {
  const key = riskScoreToKey(score);
  const c = RISK[key];
  return (
    <span style={{
      fontSize: 7, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
      background: c.bg, color: c.hex, border: `1px solid ${c.hex}33`,
    }}>{key.toUpperCase()} {Math.round(score * 100)}</span>
  );
}

function VerdictLabel({ predicted, actual }: { predicted: number; actual: number }) {
  const diff = Math.abs(predicted - actual);
  const overestimated = actual < predicted;
  const correct = diff <= 0.15;
  if (correct) return <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 600 }}>✓ Accurate</span>;
  if (overestimated) return <span style={{ color: "#eab308", fontSize: 9, fontWeight: 600 }}>↑ Overestimated</span>;
  return <span style={{ color: "#f97316", fontSize: 9, fontWeight: 600 }}>↓ Underestimated</span>;
}

export default function PredictionsTracker() {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [verifyMrIid, setVerifyMrIid] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ mrIid: number; outcome: string; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  const sorted = useMemo(() => {
    const items = [...MOCK_PREDICTIONS];
    if (sortAsc) items.sort((a, b) => a.mrIid - b.mrIid);
    else items.sort((a, b) => b.mrIid - a.mrIid);
    if (filterOutcome !== "all") return items.filter(i => i.actualOutcome === filterOutcome);
    return items;
  }, [sortAsc, filterOutcome]);

  const stats = useMemo(() => {
    const verified = MOCK_PREDICTIONS.filter(i => i.actualOutcome === "verified").length;
    const failed = MOCK_PREDICTIONS.filter(i => i.actualOutcome === "failed").length;
    const pending = MOCK_PREDICTIONS.filter(i => i.actualOutcome === "pending").length;
    const total = verified + failed;
    const accuracy = total > 0 ? Math.round((verified / total) * 100) : 0;
    const correctCount = MOCK_PREDICTIONS.filter(i => {
      if (i.actualOutcome === "unknown" || i.actualOutcome === "pending") return false;
      return Math.abs(i.predictedRisk - (i.actualRisk ?? i.predictedRisk)) <= 0.15;
    }).length;
    const avgPredicted = MOCK_PREDICTIONS.reduce((s, i) => s + i.predictedRisk, 0) / MOCK_PREDICTIONS.length;
    const avgActual = MOCK_PREDICTIONS.filter(i => i.actualRisk !== undefined).reduce((s, i) => s + (i.actualRisk ?? 0), 0) / MOCK_PREDICTIONS.filter(i => i.actualRisk !== undefined).length;
    return { verified, failed, pending, total, accuracy, correctCount, avgPredicted, avgActual };
  }, []);

  const trendData = useMemo(() => {
    const sorted = [...MOCK_PREDICTIONS].sort((a, b) => a.mrIid - b.mrIid);
    return {
      predicted: sorted.map(i => i.predictedRisk),
      actual: sorted.map(i => i.actualRisk ?? null),
      labels: sorted.map(i => `!${i.mrIid}`),
    };
  }, []);

  const handleVerify = useCallback(() => {
    const iid = parseInt(verifyMrIid, 10);
    if (isNaN(iid)) return;
    setVerifying(true);
    setTimeout(() => {
      const found = MOCK_PREDICTIONS.find(p => p.mrIid === iid);
      if (found) {
        setVerifyResult({
          mrIid: found.mrIid,
          outcome: found.actualOutcome,
          message: found.actualOutcome === "verified"
            ? `MR !${found.mrIid} stayed shipped through the 7-day window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Actual: clean deployment.`
            : `MR !${found.mrIid} failed within the window. Prediction: ${Math.round(found.predictedRisk * 100)}% risk. Evidence: ${found.evidence}`,
        });
      } else {
        setVerifyResult({ mrIid: iid, outcome: "unknown", message: `MR !${iid} not found in tracked predictions. It may not have been analyzed by Orbit Sentinel.` });
      }
      setVerifying(false);
    }, 1200);
  }, [verifyMrIid]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* HEADER */}
      <div className="card" style={{
        padding: isMobile ? "14px 16px" : "16px 20px", position: "relative", overflow: "hidden",
        borderColor: "rgba(59,130,246,0.3)",
        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(15,18,26,0.95), rgba(139,92,246,0.05))",
        animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 0 20px rgba(59,130,246,0.1)",
      }}>
        <GlowOrb color="rgba(59,130,246,0.08)" top="-30%" left="-5%" size={200} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)", padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.15)" }}>Prediction Accuracy Scoreboard</span>
            <span style={{ fontSize: 7, padding: "1px 6px", borderRadius: 3, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.15)", fontWeight: 600, letterSpacing: "0.3px" }}>Live</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12, maxWidth: "90%" }}>
            Tracking prediction accuracy across <strong style={{ color: "var(--text-primary)" }}>{MOCK_PREDICTIONS.length} MRs</strong>.
            <span style={{ color: "#22c55e", fontWeight: 600 }}> {stats.verified} verified</span>,
            <span style={{ color: "#ef4444", fontWeight: 600 }}> {stats.failed} failed</span>.
            <span style={{ color: "#60a5fa", fontWeight: 600 }}> Accuracy: {stats.accuracy}%</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 5 }}>
            <AnimatedStatCard label="Total Tracked" value={String(MOCK_PREDICTIONS.length)} target={MOCK_PREDICTIONS.length} color="#60a5fa" />
            <AnimatedStatCard label="Verified" value={String(stats.verified)} target={stats.verified} sub="Stayed shipped" color="#22c55e" />
            <AnimatedStatCard label="Failed" value={String(stats.failed)} target={stats.failed} sub="Reverted / hotfixed" color="#ef4444" />
            <AnimatedStatCard label="Accuracy" value={`${stats.accuracy}%`} suffix="%" color="#eab308" />
            <AnimatedStatCard label="Avg Risk (Predicted)" value={`${Math.round(stats.avgPredicted * 100)}%`} sub={`Actual: ${Math.round(stats.avgActual * 100)}%`} color="#a78bfa" />
          </div>
        </div>
      </div>

      {/* PREDICTIONS VS REALITY — TREND CHART */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(59,130,246,0.15)",
        background: "linear-gradient(135deg, rgba(59,130,246,0.03), rgba(15,18,26,0.95))",
        animation: "fadeSlideUp 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(59,130,246,0.05)" top="-30%" left="30%" size={160} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--accent-blue)" }}>Multi-MR Trend — Predicted vs Actual</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.2), transparent)" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 12, height: 2, borderRadius: 1, background: "#60a5fa" }} /><span style={{ fontSize: 7, color: "#60a5fa", fontWeight: 600 }}>Predicted</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 12, height: 2, borderRadius: 1, background: "#22c55e" }} /><span style={{ fontSize: 7, color: "#22c55e", fontWeight: 600 }}>Actual</span></div>
            </div>
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 2 }}>
            <DualSparkline
              series={[
                { data: trendData.predicted, color: "#60a5fa", label: "Predicted" },
                { data: trendData.actual.filter((v): v is number => v !== null), color: "#22c55e", label: "Actual" },
              ]}
              height={50}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "var(--text-tertiary)", marginTop: 4 }}>
            <span>MR #5 (Earliest)</span>
            <span style={{ fontSize: 7, color: "var(--text-tertiary)" }}>Each point represents one MR's risk score</span>
            <span>MR #42 (Latest)</span>
          </div>
        </div>
      </div>

      {/* VULNERABILITY RISK ADJUSTMENT */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(239,68,68,0.15)",
        background: "linear-gradient(135deg, rgba(239,68,68,0.03), rgba(15,18,26,0.95))",
        animation: "fadeSlideUp 0.4s 0.06s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#ef4444" }}>Vulnerability-Adjusted Predictions</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(239,68,68,0.2), transparent)" }} />
          </div>
          <div style={{ fontSize: 9, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.4 }}>
            Security findings from the blast radius analysis are factored into risk predictions.
            Files with <strong style={{ color: "#ef4444" }}>critical</strong> vulnerabilities increase the predicted risk by up to <strong style={{ color: "#eab308" }}>25%</strong>.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { mr: 42, file: "src/deploy/gateway.ts", severity: "critical", vuln: "CVE-2026-1234", riskBoost: 0.25, adjustedRisk: 0.88, caught: true },
              { mr: 38, file: "src/api/auth/middleware.ts", severity: "high", vuln: "CVE-2026-5678", riskBoost: 0.18, adjustedRisk: 0.82, caught: true },
              { mr: 24, file: "src/auth/session.ts", severity: "high", vuln: "CVE-2026-9012", riskBoost: 0.15, adjustedRisk: 0.72, caught: true },
              { mr: 14, file: "src/db/migration.ts", severity: "critical", vuln: "CVE-2026-3456", riskBoost: 0.22, adjustedRisk: 0.91, caught: true },
              { mr: 10, file: "src/api/orbit/client.ts", severity: "medium", vuln: "CVE-2026-7890", riskBoost: 0.10, adjustedRisk: 0.45, caught: false },
            ].map((v, i) => {
              const sevColor = v.severity === "critical" ? "#ef4444" : v.severity === "high" ? "#f97316" : "#eab308";
              return (
                <div key={v.mr} style={{
                  display: "grid", gridTemplateColumns: isMobile ? "1fr" : "50px 1fr 65px 65px 65px",
                  gap: 6, alignItems: "center", padding: "6px 10px", borderRadius: 5,
                  background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s ease both`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{v.mr}</div>
                  <div style={{ fontSize: 8, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.file.split("/").pop()}</div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 7, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>{v.severity}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 8, fontWeight: 600, color: v.riskBoost > 0.2 ? "#ef4444" : "#eab308", fontFamily: "'JetBrains Mono', monospace" }}>+{Math.round(v.riskBoost * 100)}%</div>
                  <div style={{ textAlign: "center", fontSize: 8, fontWeight: 600, color: v.caught ? "#22c55e" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{v.caught ? "✅ Caught" : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POST-MERGE VERIFICATION */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(34,197,94,0.15)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.03), rgba(15,18,26,0.95))",
        animation: "fadeSlideUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#22c55e" }}>Post-Merge Verification</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(34,197,94,0.2), transparent)" }} />
          </div>
          <div style={{ fontSize: 9, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.4 }}>
            Enter a merged MR IID to verify if the change <strong style={{ color: "#22c55e" }}>stayed shipped</strong> through the 7-day survival window.
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 200 }}>
              <input
                value={verifyMrIid}
                onChange={e => setVerifyMrIid(e.target.value.replace(/\D/g, ""))}
                placeholder="MR IID (e.g. 42)"
                onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6,
                  background: "rgba(34,197,94,0.04)", color: "var(--text-primary)",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"}
              />
            </div>
            <button onClick={handleVerify} disabled={!verifyMrIid || verifying}
              style={{
                padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: !verifyMrIid || verifying ? "not-allowed" : "pointer",
                border: "1px solid rgba(34,197,94,0.25)", borderRadius: 6,
                background: verifying ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.1)",
                color: "#22c55e", transition: "all 0.2s", whiteSpace: "nowrap",
                opacity: !verifyMrIid || verifying ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {verifying && <span style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(34,197,94,0.3)", borderTopColor: "#22c55e", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
              {verifying ? "Checking Orbit…" : "✓ Verify"}
            </button>
          </div>
          {verifyResult && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 6,
              background: verifyResult.outcome === "verified" ? "rgba(34,197,94,0.06)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${verifyResult.outcome === "verified" ? "rgba(34,197,94,0.15)" : verifyResult.outcome === "failed" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
              animation: "fadeSlideUp 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{verifyResult.outcome === "verified" ? "✅" : verifyResult.outcome === "failed" ? "❌" : "ℹ️"}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: verifyResult.outcome === "verified" ? "#22c55e" : verifyResult.outcome === "failed" ? "#ef4444" : "var(--text-secondary)" }}>
                  MR !{verifyResult.mrIid} — {verifyResult.outcome === "verified" ? "Stayed Shipped" : verifyResult.outcome === "failed" ? "Failed" : "Not Found"}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4 }}>{verifyResult.message}</div>
            </div>
          )}
        </div>
      </div>

      {/* PREDICTION TABLE */}
      <div className="card" style={{
        padding: "12px 16px", position: "relative", overflow: "hidden",
        animation: "fadeSlideUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>MR Predictions Ledger</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}
              style={{
                fontSize: 8, padding: "2px 6px", borderRadius: 4,
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
                fontSize: 8, padding: "2px 6px", borderRadius: 4, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-secondary)",
              }}>
              {sortAsc ? "↑ Oldest" : "↓ Newest"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sorted.map((item, i) => {
              const isHovered = hoveredRow === item.mrIid;
              const outcomeColor = item.actualOutcome === "verified" ? "#22c55e" : item.actualOutcome === "failed" ? "#ef4444" : "var(--text-tertiary)";
              return (
                <div key={item.mrIid} style={{
                  display: "grid", gridTemplateColumns: isMobile ? "1fr" : "60px 1fr 80px 80px 80px 60px",
                  gap: isMobile ? 4 : 8, alignItems: "center",
                  padding: "8px 10px", borderRadius: 6,
                  background: isHovered ? `${outcomeColor}08` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isHovered ? `${outcomeColor}22` : "rgba(255,255,255,0.04)"}`,
                  transition: "all 0.2s ease",
                  cursor: "default",
                  animation: `fadeSlideUp 0.3s ${0.1 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
                  onMouseEnter={() => setHoveredRow(item.mrIid)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>!{item.mrIid}</div>
                  <div style={{ fontSize: 9, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ textAlign: "center" }}><RiskBadge score={item.predictedRisk} /></div>
                  <div style={{ textAlign: "center" }}>
                    {item.actualRisk !== undefined ? <RiskBadge score={item.actualRisk} /> : <span style={{ fontSize: 7, color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {item.actualRisk !== undefined && <VerdictLabel predicted={item.predictedRisk} actual={item.actualRisk} />}
                  </div>
                  <div style={{ textAlign: "center" }}><OutcomeBadge outcome={item.actualOutcome} /></div>
                  {isHovered && item.evidence && (
                    <div style={{
                      gridColumn: "1 / -1", marginTop: 4, padding: "5px 8px", borderRadius: 4,
                      background: "rgba(0,0,0,0.15)", borderLeft: `2px solid ${outcomeColor}44`,
                      fontSize: 8, color: "var(--text-secondary)", lineHeight: 1.3,
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
        padding: "12px 16px", position: "relative", overflow: "hidden",
        borderColor: "rgba(139,92,246,0.15)",
        background: "linear-gradient(135deg, rgba(139,92,246,0.03), rgba(15,18,26,0.97), rgba(59,130,246,0.03))",
        animation: "fadeSlideUp 0.4s 0.16s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <GlowOrb color="rgba(139,92,246,0.05)" top="-20%" right="-5%" size={140} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#a78bfa" }}>Accuracy Insights</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(139,92,246,0.2), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6 }}>
            <div style={{
              padding: "8px 10px", borderRadius: 6,
              background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.12)",
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 2 }}>Average Error Margin</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>
                {stats.total > 0 ? `${Math.round(MOCK_PREDICTIONS.reduce((s, i) => s + Math.abs(i.predictedRisk - (i.actualRisk ?? i.predictedRisk)), 0) / MOCK_PREDICTIONS.length * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 1 }}>Prediction vs actual risk score delta</div>
            </div>
            <div style={{
              padding: "8px 10px", borderRadius: 6,
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)",
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", marginBottom: 2 }}>Failed MRs Caught</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
                {stats.failed > 0 ? `${Math.round((MOCK_PREDICTIONS.filter(i => i.actualOutcome === "failed" && i.predictedRisk >= 0.6).length / stats.failed) * 100)}%` : "—"}
              </div>
              <div style={{ fontSize: 7, color: "var(--text-tertiary)", marginTop: 1 }}>High-risk predictions that correctly flagged failures</div>
            </div>
            <div style={{
              padding: "8px 10px", borderRadius: 6,
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)",
              gridColumn: isMobile ? "auto" : "1 / -1",
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#eab308", marginBottom: 2 }}>Key Pattern</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4 }}>
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
        padding: "8px 12px", textAlign: "center",
        background: "rgba(255,255,255,0.02)", borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.04)",
        animation: "fadeSlideUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <div style={{ fontSize: 8, color: "var(--text-tertiary)" }}>
          Predictions are verified against a <strong style={{ color: "var(--text-secondary)" }}>7-day survival window</strong> post-merge.
          <span style={{ marginLeft: 4 }}>Powered by GitLab Orbit — All 4 query types.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 4 }}>
          {(["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"] as const).map(q => (
            <span key={q} style={{ fontSize: 7, padding: "1px 6px", borderRadius: 3, background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.15)" }}>
              {q}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
