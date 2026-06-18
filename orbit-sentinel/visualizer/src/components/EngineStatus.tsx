import React, { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "";
const POLL_INTERVAL = 30000;

type EngineState = "checking" | "live" | "cold" | "offline" | "unconfigured";

export default function EngineStatus() {
  const [state, setState] = useState<EngineState>("checking");
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [warming, setWarming] = useState(false);
  const mountedRef = useRef(true);

  const checkHealth = useCallback(async () => {
    if (!mountedRef.current) return;
    if (!API_BASE_URL || API_BASE_URL === "https://your-engine-domain.com") {
      if (mountedRef.current) setState("unconfigured");
      return;
    }
    if (mountedRef.current) setState("checking");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (!mountedRef.current) return;
      if (res.ok) {
        setState("live");
        setLastCheck(new Date().toLocaleTimeString());
      } else {
        setState("offline");
      }
    } catch {
      if (mountedRef.current) setState("cold");
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, [checkHealth]);

  const warmUp = useCallback(async () => {
    if (!mountedRef.current) return;
    setWarming(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (!mountedRef.current) return;
      if (res.ok) {
        setState("live");
        setLastCheck(new Date().toLocaleTimeString());
      }
    } catch {
      // still cold
    } finally {
      if (mountedRef.current) setWarming(false);
    }
  }, []);

  const cfg: Record<EngineState, { dot: string; label: string; hint: string }> = {
    checking: { dot: "#eab308", label: "…", hint: "Checking engine…" },
    live: { dot: "#22c55e", label: "Live", hint: `Engine connected ${lastCheck ? "· " + lastCheck : ""}` },
    cold: { dot: "#f97316", label: "Cold", hint: "Render cold-start — wake me up" },
    offline: { dot: "#ef4444", label: "Down", hint: "Engine unreachable" },
    unconfigured: { dot: "#8b8fa3", label: "N/A", hint: "No engine URL set" },
  };
  const c = cfg[state];

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 6,
      background: state === "live" ? "rgba(34,197,94,0.06)" :
                 state === "cold" ? "rgba(249,115,22,0.08)" :
                 "rgba(255,255,255,0.02)",
      border: `1px solid ${state === "live" ? "rgba(34,197,94,0.15)" : state === "cold" ? "rgba(249,115,22,0.2)" : "transparent"}`,
      fontSize: 9, whiteSpace: "nowrap",
      transition: "all 0.3s ease",
    }}
      title={c.hint}
    >
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: c.dot,
        animation: state === "checking" || warming ? "pulseDot 0.8s ease-in-out infinite" : "none",
        boxShadow: `0 0 4px ${c.dot}66`,
        flexShrink: 0,
      }} />
      <span style={{
        fontWeight: 600, color: c.dot,
        textTransform: "uppercase", letterSpacing: "0.4px",
      }}>{c.label}</span>
      {(state === "cold" || state === "offline") && (
        <button onClick={warming ? undefined : warmUp}
          style={{
            padding: "1px 7px", fontSize: 8, fontWeight: 600, cursor: warming ? "wait" : "pointer",
            border: "1px solid rgba(249,115,22,0.3)", borderRadius: 4,
            background: warming ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.1)",
            color: "#fb923c", lineHeight: 1.4,
            transition: "all 0.15s",
            animation: warming ? "pulseGlow 1s ease-in-out infinite" : "none",
          }}
          onMouseEnter={e => { if (!warming) e.currentTarget.style.background = "rgba(249,115,22,0.2)"; }}
          onMouseLeave={e => { if (!warming) e.currentTarget.style.background = "rgba(249,115,22,0.1)"; }}
        >{warming ? "Waking…" : "☕ Wake"}</button>
      )}
    </div>
  );
}
