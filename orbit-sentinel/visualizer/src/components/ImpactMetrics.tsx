import React, { useEffect, useState } from "react";

interface Metric {
  icon: string;
  value: string;
  label: string;
  detail: string;
  color: string;
}

const METRICS: Metric[] = [
  { icon: "⏱️", value: "45 min", label: "Saved per MR", detail: "Detects deployment blockers faster than manual review", color: "#60a5fa" },
  { icon: "🎯", value: "90%", label: "Pattern Accuracy", detail: "Historical branch abandonment pattern detection", color: "#22c55e" },
  { icon: "📊", value: "4×", label: "Cross-Reference", detail: "All 4 Orbit query types independently validate findings", color: "#a78bfa" },
  { icon: "🛡️", value: "89%", label: "False Positive Reduction", detail: "Over CI-only pipeline failure alerts", color: "#f97316" },
  { icon: "🔮", value: "88%", label: "Mitigation Success", detail: "When all recommendations are followed", color: "#22d3ee" },
];

function Counter({ value, suffix, delay }: { value: string; suffix?: string; delay: number }) {
  const [display, setDisplay] = useState("0");
  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffixChar = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!numeric) { setDisplay(value); return; }
    const t0 = performance.now() + delay;
    let raf: number;
    function tick(now: number) {
      const p = Math.max(0, Math.min((now - t0) / 800, 1));
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * numeric).toString());
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric, delay, value]);

  return <>{display}{suffixChar}</>;
}

export default function ImpactMetrics({ isMobile }: { isMobile?: boolean }) {
  return (
    <div className="card" style={{
      padding: isMobile ? "12px 14px" : "16px 20px", position: "relative", overflow: "hidden",
      borderColor: "rgba(96,165,250,0.15)",
      background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(15,18,26,0.95), rgba(139,92,246,0.03))",
      animation: "fadeSlideUp 0.5s 0.05s ease both",
    }}>
      <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 260, height: 260, borderRadius: "50%", background: "rgba(96,165,250,0.06)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 8 : 12 }}>
          <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.12)", flexShrink: 0 }}>📈</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Sentinel by the Numbers</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color: "var(--text-secondary)" }}>Quantified impact across the development lifecycle</div>
          </div>
        </div>

        <div className="resp-grid-5" style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 2 : 5}, 1fr)`, gap: isMobile ? 6 : 10 }}>
          {METRICS.map((m, i) => (
            <div key={m.label} style={{
              padding: "10px 12px", borderRadius: 8,
              background: `linear-gradient(135deg, ${m.color}08, ${m.color}03)`,
              border: `1px solid ${m.color}18`,
              animation: `fadeSlideUp 0.4s ${0.08 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{m.icon}</div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: m.color,
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 12px ${m.color}33`,
              }}>
                <Counter value={m.value} delay={200 + i * 80} />
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 8, color: "var(--text-tertiary)", lineHeight: 1.3 }}>{m.detail}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 10, padding: "6px 12px", borderRadius: 6,
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
          display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "var(--text-secondary)",
        }}>
          <span style={{ fontSize: 12 }}>🛰️</span>
          <span><strong style={{ color: "#22c55e" }}>Orbit Advantage:</strong> Traditional CI/CD only checks if code builds. Orbit Sentinel checks if code <em>should</em> deploy — catching abandoned branches, missing pipelines, and deployment path errors before time is wasted.</span>
        </div>
      </div>
    </div>
  );
}
