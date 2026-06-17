import React, { useState, useCallback } from "react";
import type { VisualizationData } from "../types";
import { SCENARIOS, type ScenarioOption } from "../data/scenarios";

const MR_URL_REGEX = /gitlab\.com\/([\w.-]+\/[\w.-]+(?:\/[\w.-]+)*)\/-\/merge_requests\/(\d+)/i;

interface MrAnalyzerProps {
  onSelectScenario: (data: VisualizationData, label: string) => void;
  apiAvailable: boolean;
  currentScenario: string | null;
}

export default function MrAnalyzer({ onSelectScenario, apiAvailable, currentScenario }: MrAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [parsed, setParsed] = useState<{ project: string; mrIid: number } | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const m = val.match(MR_URL_REGEX);
    if (m) {
      setParsed({ project: m[1], mrIid: parseInt(m[2], 10) });
    } else {
      setParsed(null);
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!parsed) return;
    // In a real scenario, this would call the API.
    // For now, load the medium scenario as default when an MR URL is pasted.
    const medium = SCENARIOS.find(s => s.id === "medium")!;
    onSelectScenario(medium.data, `MR !${parsed.mrIid} · ${parsed.project}`);
  }, [parsed, onSelectScenario]);

  const handlePreset = useCallback((s: ScenarioOption) => {
    onSelectScenario(s.data, s.label);
  }, [onSelectScenario]);

  return (
    <div className="card" style={{
      padding: 16, display: "flex", flexDirection: "column", gap: 10,
      animation: "fadeSlideUp 0.5s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <div className="card-header-icon" style={{ background: "rgba(139,92,246,0.12)" }}>🔍</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>MR Analyzer</span>
        <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>Paste any GitLab MR URL or try a preset</span>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://gitlab.com/group/project/-/merge_requests/123"
            style={{
              width: "100%", padding: "7px 10px", fontSize: 11, borderRadius: 6,
              border: "1px solid var(--border)", outline: "none",
              background: "rgba(0,0,0,0.2)", color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#a78bfa66"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>
        <button onClick={handleAnalyze}
          disabled={!parsed}
          style={{
            padding: "7px 16px", fontSize: 11, fontWeight: 600, cursor: parsed ? "pointer" : "not-allowed",
            border: "1px solid rgba(139,92,246,0.3)", borderRadius: 6,
            background: parsed ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
            color: parsed ? "#a78bfa" : "var(--text-tertiary)", whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (parsed) { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; }}}
          onMouseLeave={e => { if (parsed) { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}}
        >Analyze</button>
      </div>

      {parsed && (
        <div style={{ fontSize: 10, color: "var(--accent-blue)", padding: "2px 0" }}>
          ✓ Parsed: <strong>{parsed.project}</strong> · MR !{parsed.mrIid}
          {apiAvailable && <span style={{ color: "var(--text-tertiary)", marginLeft: 8 }}>• Engine connected — analysis will query live Orbit data</span>}
        </div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Demos</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SCENARIOS.map(s => {
            const active = currentScenario === s.id;
            return (
              <button key={s.id} onClick={() => handlePreset(s)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", fontSize: 10, fontWeight: 600, cursor: "pointer",
                  border: active
                    ? `1.5px solid ${s.color}88`
                    : "1px solid var(--border)",
                  borderRadius: 6, flex: 1, minWidth: 0,
                  background: active ? `${s.color}15` : "rgba(255,255,255,0.02)",
                  color: active ? s.color : "var(--text-secondary)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              >
                <span>{s.icon}</span>
                <span style={{ whiteSpace: "nowrap" }}>{s.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          {SCENARIOS.map(s => (
            <span key={s.id} style={{ fontSize: 9, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
              {s.description}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
