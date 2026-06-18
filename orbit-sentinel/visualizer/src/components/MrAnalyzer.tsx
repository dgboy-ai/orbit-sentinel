import React, { useState, useCallback } from "react";
import type { VisualizationData } from "../types";
import { SCENARIOS, type ScenarioOption } from "../data/scenarios";

const MR_URL_REGEX = /gitlab\.com\/([\w.-]+\/[\w.-]+(?:\/[\w.-]+)*)\/-\/merge_requests\/(\d+)/i;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "";
const FETCH_TIMEOUT = 120000;

interface MrAnalyzerProps {
  onSelectScenario: (data: VisualizationData, label: string) => void;
  apiAvailable: boolean;
  currentScenario: string | null;
}

export default function MrAnalyzer({ onSelectScenario, apiAvailable, currentScenario }: MrAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [parsed, setParsed] = useState<{ project: string; mrIid: number } | null>(null);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

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

  const analyzeLive = useCallback(async () => {
    if (!parsed) return;
    setAnalyzing(true);
    setLiveError(null);

    try {
      const useCreds = !!token;

      // Fetch actual changed files from GitLab API
      const encodedPath = encodeURIComponent(parsed.project);
      const filesUrl = `https://gitlab.com/api/v4/projects/${encodedPath}/merge_requests/${parsed.mrIid}/changes`;
      let changedFiles: string[] = ["src/main.ts"];
      try {
        const ac = new AbortController();
        const ft = setTimeout(() => ac.abort(), 8000);
        const filesHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (useCreds) filesHeaders["Authorization"] = `Bearer ${token}`;
        const filesRes = await fetch(filesUrl, {
          headers: filesHeaders,
          signal: ac.signal,
        });
        clearTimeout(ft);
        if (filesRes.ok) {
          const filesData = await filesRes.json() as { changes?: Array<{ new_path: string }> };
          if (filesData.changes?.length) {
            changedFiles = filesData.changes.map(c => c.new_path);
          }
        }
      } catch { /* fallback */ }

      const endpoint = `${API_BASE_URL}${useCreds ? "/api/analyze-with-creds" : "/api/analyze"}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const body: Record<string, unknown> = {
        projectId: 0,
        projectPath: parsed.project,
        mrIid: parsed.mrIid,
        mrTitle: `MR !${parsed.mrIid}`,
        changedFiles,
        changeDescription: `Analyze MR !${parsed.mrIid} — ${changedFiles.length} file(s) changed`,
      };
      if (useCreds) body.gitlabToken = token;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.message || "Analysis failed");
      }

      const data = await res.json();
      if (data.success && data.report) {
        onSelectScenario(data.report, `Live · MR !${parsed.mrIid}`);
      } else {
        throw new Error("Invalid response from engine");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setLiveError(msg);
    } finally {
      setAnalyzing(false);
    }
  }, [parsed, token, apiAvailable, onSelectScenario]);

  const handleAnalyze = useCallback(() => {
    if (!parsed) return;
    if (apiAvailable) {
      analyzeLive();
    } else {
      const medium = SCENARIOS.find(s => s.id === "medium")!;
      onSelectScenario(medium.data, `MR !${parsed.mrIid} · ${parsed.project}`);
    }
  }, [parsed, apiAvailable, analyzeLive, onSelectScenario]);

  const handlePreset = useCallback((s: ScenarioOption) => {
    onSelectScenario(s.data, s.label);
  }, [onSelectScenario]);

  const canAnalyze = parsed && (apiAvailable ? true : true);

  return (
    <div className="card" style={{
      padding: 16, display: "flex", flexDirection: "column", gap: 10,
      animation: "fadeSlideUp 0.5s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <div className="card-header-icon" style={{ background: "rgba(139,92,246,0.12)" }}>🔍</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>MR Analyzer</span>
        <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>
          {apiAvailable ? "Engine connected — live Orbit API" : "Paste any GitLab MR URL or try a preset"}
        </span>
      </div>

      {apiAvailable && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, fontSize: 9,
          color: "var(--accent-blue)", marginBottom: 2,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span>Engine live · {showTokenInput ? "Token will be sent to engine for real Orbit API calls" : "Enter token below to analyze real MRs"}</span>
        </div>
      )}

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
          disabled={!canAnalyze || analyzing}
          style={{
            padding: analyzing ? "7px 16px" : "7px 16px", fontSize: 11, fontWeight: 600,
            cursor: canAnalyze && !analyzing ? "pointer" : "not-allowed",
            border: "1px solid rgba(139,92,246,0.3)", borderRadius: 6,
            background: analyzing ? "rgba(139,92,246,0.06)" :
                       canAnalyze ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
            color: analyzing ? "#a78bfa88" : canAnalyze ? "#a78bfa" : "var(--text-tertiary)",
            whiteSpace: "nowrap", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 4,
          }}
          onMouseEnter={e => { if (canAnalyze && !analyzing) { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; }}}
          onMouseLeave={e => { if (canAnalyze && !analyzing) { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}}
        >
          {analyzing ? (
            <>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #a78bfa44", borderTopColor: "#a78bfa", animation: "spin 0.6s linear infinite" }} />
              Analyzing…
            </>
          ) : apiAvailable ? (
            "🔍 Analyze Live"
          ) : (
            "Analyze (Demo)"
          )}
        </button>
      </div>

      {parsed && !apiAvailable && (
        <div style={{ fontSize: 10, color: "var(--accent-blue)", padding: "2px 0" }}>
          ✓ Parsed: <strong>{parsed.project}</strong> · MR !{parsed.mrIid}
          <span style={{ color: "var(--text-tertiary)", marginLeft: 8 }}>• Loading demo scenario (no engine configured)</span>
        </div>
      )}

      {apiAvailable && !showTokenInput && (
        <button onClick={() => setShowTokenInput(true)}
          style={{
            fontSize: 9, fontWeight: 600, cursor: "pointer", padding: "3px 10px",
            border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 4,
            background: "transparent", color: "var(--text-tertiary)",
            alignSelf: "flex-start",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >+ Add GitLab token for live Orbit API</button>
      )}

      {apiAvailable && showTokenInput && (
        <div style={{
          padding: "8px 10px", borderRadius: 6,
          background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--accent-blue)" }}>🔑 GitLab Personal Access Token</span>
            <a href="https://gitlab.com/-/user_settings/personal_access_tokens" target="_blank" rel="noreferrer"
              style={{ fontSize: 8, color: "var(--text-tertiary)", marginLeft: "auto" }}
            >Generate →</a>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="glpat-xxxxxxxxxxxx"
              style={{
                flex: 1, padding: "5px 8px", fontSize: 10, borderRadius: 4,
                border: "1px solid var(--border)", outline: "none",
                background: "rgba(0,0,0,0.2)", color: "var(--text-primary)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#60a5fa66"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
            <button onClick={() => setShowToken(!showToken)}
              style={{
                padding: "3px 6px", fontSize: 9, cursor: "pointer",
                background: "transparent", border: "1px solid var(--border)", borderRadius: 4,
                color: "var(--text-secondary)",
              }}
            >{showToken ? "Hide" : "Show"}</button>
          </div>
          <div style={{ fontSize: 8, color: "var(--text-tertiary)", marginTop: 3 }}>
            Token is sent once to the engine and discarded after analysis. Requires <code>read_api</code> scope.
          </div>
        </div>
      )}

      {liveError && (
        <div style={{
          padding: "6px 10px", borderRadius: 6, fontSize: 9,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          color: "#ef4444",
        }}>
          ✗ {liveError}
        </div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Demos</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SCENARIOS.map(s => {
            const active = currentScenario === s.id || currentScenario === s.label;
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
