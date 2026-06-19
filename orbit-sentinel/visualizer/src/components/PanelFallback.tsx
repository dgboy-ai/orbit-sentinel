export default function PanelFallback({ height = 200 }: { height?: number }) {
  return (
    <div className="card" style={{
      height, display: "flex", flexDirection: "column", gap: 8,
      padding: "14px 16px", overflow: "hidden",
      background: "linear-gradient(180deg, rgba(139,92,246,0.02) 0%, transparent 100%)",
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(139,92,246,0.08)", animation: "shimmer 1.5s ease-in-out infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, rgba(139,92,246,0.08) 25%, rgba(139,92,246,0.15) 50%, rgba(139,92,246,0.08) 75%)" }} />
        <div style={{ width: 100, height: 10, borderRadius: 4, background: "rgba(139,92,246,0.06)", animation: "shimmer 1.8s ease-in-out infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, rgba(139,92,246,0.06) 25%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 75%)" }} />
        <div style={{ marginLeft: "auto", width: 50, height: 8, borderRadius: 4, background: "rgba(139,92,246,0.04)", animation: "shimmer 2s ease-in-out infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, rgba(139,92,246,0.04) 25%, rgba(139,92,246,0.1) 50%, rgba(139,92,246,0.04) 75%)" }} />
      </div>
      {Array.from({ length: Math.max(1, Math.floor((height - 50) / 20)) }).map((_, i) => (
        <div key={i} style={{
          height: 8, borderRadius: 4, width: `${60 + Math.random() * 30}%`,
          background: "rgba(139,92,246,0.04)",
          animation: "shimmer 1.5s ease-in-out infinite",
          backgroundSize: "200% 100%",
          backgroundImage: "linear-gradient(90deg, rgba(139,92,246,0.04) 25%, rgba(139,92,246,0.1) 50%, rgba(139,92,246,0.04) 75%)",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}
