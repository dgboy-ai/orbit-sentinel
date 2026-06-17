import React from "react";

function SkeletonBlock({ width, height, borderRadius = 8, delay = 0 }: { width?: string; height?: string; borderRadius?: number; delay?: number }) {
  return (
    <div className="shimmer-loading" style={{
      width: width ?? "100%", height: height ?? "100%",
      borderRadius, background: "rgba(255,255,255,0.03)",
      minHeight: height ? undefined : 20,
      animationDelay: `${delay}s`,
    }} />
  );
}

function SkeletonCard({ height, children, delay = 0 }: { height?: string; children?: React.ReactNode; delay?: number }) {
  return (
    <div className="card" style={{
      padding: "14px 18px", height: height ?? "auto",
      borderColor: "rgba(255,255,255,0.04)",
      display: "flex", flexDirection: "column", gap: 10,
      animation: `fadeSlideUp 0.4s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
    }}>
      {children ?? (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <SkeletonBlock width="28px" height="28px" borderRadius={6} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock height="12px" />
            </div>
          </div>
          <SkeletonBlock height="60px" />
        </>
      )}
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, height: "100%", background: "var(--bg-primary)" }}>
      {/* ProblemSection slot (matches ProblemSection height to prevent CLS) */}
      <SkeletonCard delay={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <SkeletonBlock width="28px" height="28px" borderRadius={6} delay={0.05} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock height="13px" width="160px" delay={0.08} />
            <div style={{ height: 4 }} />
            <SkeletonBlock height="10px" width="260px" delay={0.11} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 10 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonBlock height="11px" width="90px" delay={0.14 + i * 0.04} />
              <SkeletonBlock height="8px" delay={0.18 + i * 0.04} />
              <SkeletonBlock height="8px" delay={0.22 + i * 0.04} />
              <SkeletonBlock height="8px" width="80%" delay={0.26 + i * 0.04} />
            </div>
          ))}
        </div>
        <SkeletonBlock height="10px" borderRadius={6} delay={0.35} />
      </SkeletonCard>

      {/* Metrics row */}
      <div className="card" style={{
        padding: "16px 20px", borderColor: "rgba(96,165,250,0.08)",
        display: "flex", flexDirection: "column", gap: 12,
        animation: "fadeSlideUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <SkeletonBlock height="14px" width="240px" delay={0.1} />
        <div className="resp-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", animation: `fadeSlideUp 0.3s ${0.12 + i * 0.04}s both` }}>
              <SkeletonBlock width="24px" height="24px" borderRadius={6} delay={0.15 + i * 0.04} />
              <SkeletonBlock width="50px" height="18px" delay={0.2 + i * 0.04} />
              <SkeletonBlock width="80px" height="10px" delay={0.25 + i * 0.04} />
            </div>
          ))}
        </div>
      </div>

      {/* Hero row */}
      <div className="resp-grid-2 resp-stack" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
        <SkeletonCard height="100px" delay={0.15}>
          <SkeletonBlock height="54px" delay={0.2} />
        </SkeletonCard>
        <SkeletonCard height="100px" delay={0.18} />
      </div>

      {/* Triple column */}
      <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: 12 }}>
        <SkeletonCard delay={0.22} />
        <SkeletonCard delay={0.26} />
        <SkeletonCard delay={0.3} />
      </div>

      {/* Double column */}
      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonCard delay={0.34} />
          <SkeletonCard delay={0.38} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonCard delay={0.42}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SkeletonBlock width="28px" height="28px" borderRadius={6} delay={0.46} />
              <SkeletonBlock height="12px" width="140px" delay={0.5} />
            </div>
            <div style={{ flex: 1, minHeight: 200 }}>
              <SkeletonBlock height="200px" delay={0.55} />
            </div>
          </SkeletonCard>
          <SkeletonCard delay={0.48} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SkeletonCard delay={0.52} />
        <SkeletonCard delay={0.56} />
      </div>
    </div>
  );
}
