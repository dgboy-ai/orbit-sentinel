import React, { useState, useEffect, useRef } from "react";

const QUERY_TYPES = ["NEIGHBORS", "PATH_FINDING", "TRAVERSAL", "AGGREGATION"];

const QUERY_META: Record<string, { icon: string; label: string; color: string; description: string }> = {
  NEIGHBORS:    { icon: "🌐", label: "Blast Radius", color: "#22c55e", description: "What's connected to the change?" },
  PATH_FINDING: { icon: "🛣️", label: "Deployment Path", color: "#f97316", description: "How does this reach production?" },
  TRAVERSAL:    { icon: "📚", label: "Historical Context", color: "#60a5fa", description: "Has this failed before?" },
  AGGREGATION:  { icon: "📊", label: "Ecosystem Risk", color: "#a78bfa", description: "Is the project already fragile?" },
};

type QueryStatus = "pending" | "running" | "success" | "error";

interface QueryExecution {
  queryType: string;
  queryName: string;
  durationMs: number;
  status: QueryStatus;
}

interface OrbitQueryLogProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function OrbitQueryLog({ onComplete, autoPlay = true }: OrbitQueryLogProps) {
  const [queries, setQueries] = useState<QueryExecution[]>(
    QUERY_TYPES.map(qt => ({ queryType: qt, queryName: QUERY_META[qt]?.label ?? qt, durationMs: 0, status: "pending" as const }))
  );
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    // Start execution after mount
    const startTimer = setTimeout(() => {
      setCurrentIndex(0);
      setQueries(prev => prev.map((q, i) => i === 0 ? { ...q, status: "running" } : q));
    }, 600);
    return () => clearTimeout(startTimer);
  }, [autoPlay]);

  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= QUERY_TYPES.length) return;

    // Simulate query execution time (200-800ms per query)
    const duration = 200 + Math.random() * 600;

    timerRef.current = window.setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      setQueries(prev => prev.map((q, i) =>
        i === currentIndex
          ? { ...q, status: success ? "success" : "error", durationMs: Math.round(duration) }
          : q
      ));

      const nextIndex = currentIndex + 1;
      if (nextIndex < QUERY_TYPES.length) {
        setCurrentIndex(nextIndex);
        setQueries(prev => prev.map((q, i) => i === nextIndex ? { ...q, status: "running" } : q));
      } else {
        setCompleted(true);
        onComplete?.();
      }
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, autoPlay, onComplete]);

  const runningCount = queries.filter(q => q.status === "success").length;

  return (
    <div className="card" style={{
      padding: 16,
      animation: "fadeSlideUp 0.5s ease both",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div className="card-header-icon" style={{ background: "rgba(96,165,250,0.1)" }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Orbit Query Execution</div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            {completed
              ? `All 4 queries complete in ${queries.reduce((a, q) => a + q.durationMs, 0)}ms`
              : `Executing ${currentIndex + 1}/${QUERY_TYPES.length} queries…`
            }
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 4, fontSize: 13, fontWeight: 700,
          background: completed ? "rgba(34,197,94,0.1)" : "rgba(96,165,250,0.1)",
          color: completed ? "#22c55e" : "#60a5fa",
        }}>
          {completed ? "✓ Done" : `${runningCount}/4`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 2, borderRadius: 1, background: "var(--overlay-06)", marginBottom: 10,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 1,
          width: `${(runningCount / QUERY_TYPES.length) * 100}%`,
          background: "linear-gradient(90deg, #60a5fa, #22c55e)",
          transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>

      {/* Query timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {queries.map((q, i) => {
          const meta = QUERY_META[q.queryType] ?? { icon: "📌", label: q.queryType, color: "#8b949e", description: "" };
          const isActive = q.status === "running";
          const isDone = q.status === "success" || q.status === "error";
          return (
            <div key={q.queryType} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 8px", borderRadius: 6,
              background: isActive ? `${meta.color}0a` : "transparent",
              border: isActive ? `1px solid ${meta.color}22` : "1px solid transparent",
              transition: "all 0.3s ease",
              opacity: isDone ? 1 : isActive ? 1 : 0.4,
            }}>
              {/* Status indicator */}
              <div style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: q.status === "success" ? `${meta.color}18` :
                           q.status === "error" ? "rgba(239,68,68,0.15)" :
                           isActive ? `${meta.color}12` : "var(--overlay-03)",
                color: q.status === "success" ? meta.color :
                       q.status === "error" ? "#ef4444" :
                       isActive ? meta.color : "var(--text-tertiary)",
                animation: isActive ? "pulseDot 0.8s ease-in-out infinite" : "none",
              }}>
                {q.status === "success" ? "✓" : q.status === "error" ? "✗" : meta.icon}
              </div>

              {/* Query info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: isActive ? meta.color : "var(--text-primary)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{
                    padding: "1px 4px", borderRadius: 3, fontSize: 12, fontWeight: 700,
                    background: `${meta.color}12`, color: meta.color,
                  }}>{q.queryType}</span>
                  {q.queryName}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  {isDone
                    ? `${q.durationMs}ms · ${meta.description}`
                    : isActive ? "Executing…" : "Pending"
                  }
                </div>
              </div>

              {/* Duration badge */}
              {isDone && (
                <span style={{
                  padding: "1px 5px", borderRadius: 3, fontSize: 12, fontWeight: 600,
                  background: q.durationMs > 400 ? "rgba(249,115,22,0.1)" : "rgba(34,197,94,0.1)",
                  color: q.durationMs > 400 ? "#fb923c" : "#22c55e",
                  whiteSpace: "nowrap",
                }}>{q.durationMs}ms</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion footer */}
      {completed && (
        <div style={{
          marginTop: 8, padding: "6px 10px", borderRadius: 6, fontSize: 13,
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
          color: "var(--text-secondary)", textAlign: "center",
          animation: "fadeSlideUp 0.3s ease",
        }}>
          ✓ All 4 GitLab Orbit queries executed · Digital twin built from graph evidence
        </div>
      )}
    </div>
  );
}
