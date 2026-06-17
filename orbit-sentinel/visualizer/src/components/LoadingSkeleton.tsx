import React from "react";

function SkeletonBlock({ width, height, borderRadius = 8 }: { width?: string; height?: string; borderRadius?: number }) {
  return (
    <div className="shimmer-loading" style={{
      width: width ?? "100%", height: height ?? "100%",
      borderRadius, background: "rgba(255,255,255,0.03)",
      minHeight: height ? undefined : 20,
    }} />
  );
}

function SkeletonCard({ height, children }: { height?: string; children?: React.ReactNode }) {
  return (
    <div className="card" style={{
      padding: "14px 18px", height: height ?? "auto",
      borderColor: "rgba(255,255,255,0.04)",
      display: "flex", flexDirection: "column", gap: 10,
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
      <SkeletonCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <SkeletonBlock width="28px" height="28px" borderRadius={6} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock height="13px" width="160px" />
            <div style={{ height: 4 }} />
            <SkeletonBlock height="10px" width="260px" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 10 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonBlock height="11px" width="90px" />
              <SkeletonBlock height="8px" />
              <SkeletonBlock height="8px" />
              <SkeletonBlock height="8px" width="80%" />
            </div>
          ))}
        </div>
        <SkeletonBlock height="10px" borderRadius={6} />
      </SkeletonCard>

      {/* Metrics row */}
      <div className="card" style={{
        padding: "16px 20px", borderColor: "rgba(96,165,250,0.08)",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <SkeletonBlock height="14px" width="240px" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <SkeletonBlock width="24px" height="24px" borderRadius={6} />
              <SkeletonBlock width="50px" height="18px" />
              <SkeletonBlock width="80px" height="10px" />
            </div>
          ))}
        </div>
      </div>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
        <SkeletonCard height="100px">
          <SkeletonBlock height="54px" />
        </SkeletonCard>
        <SkeletonCard height="100px" />
      </div>

      {/* Triple column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: 12 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Double column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonCard>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SkeletonBlock width="28px" height="28px" borderRadius={6} />
              <SkeletonBlock height="12px" width="140px" />
            </div>
            <div style={{ flex: 1, minHeight: 200 }}>
              <SkeletonBlock height="200px" />
            </div>
          </SkeletonCard>
          <SkeletonCard />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
