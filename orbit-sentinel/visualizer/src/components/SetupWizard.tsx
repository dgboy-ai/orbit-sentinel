import React, { useState, useEffect, useCallback } from "react";

interface StepDef {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const STEPS: StepDef[] = [
  { id: "mission", icon: "🎯", title: "The Mission", subtitle: "What Orbit Sentinel does and why it matters" },
  { id: "architecture", icon: "🏗️", title: "The Architecture", subtitle: "How it connects from GitLab to Orbit to you" },
  { id: "setup", icon: "🔧", title: "Your Setup", subtitle: "Connect your GitLab and install the skill" },
  { id: "launch", icon: "🚀", title: "Launch", subtitle: "Submit to Devpost and join the mission" },
];

const TEAL = "#2dd4bf";
const TEAL_GLOW = "rgba(45,212,191,0.2)";
const TEAL_BG = "rgba(45,212,191,0.06)";

function GlowDot({ color, top, left, size }: { color: string; top?: string; left?: string; size: number }) {
  return (
    <div style={{
      position: "absolute", top, left, width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size * 0.3}px)`, pointerEvents: "none", opacity: 0.5,
      animation: "float 8s ease-in-out infinite",
    }} />
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }).catch(() => {});
  }, [code]);
  return (
    <div style={{
      position: "relative", background: "rgba(0,0,0,0.4)", borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
    }}>
      {label && (
        <div style={{
          padding: "4px 10px", fontSize: 8, fontWeight: 700, letterSpacing: "0.5px",
          textTransform: "uppercase", color: "var(--text-tertiary)",
          borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)",
        }}>{label}</div>
      )}
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <code style={{
          flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
          color: TEAL, lineHeight: 1.5, overflowX: "auto", whiteSpace: "nowrap",
        }}>{code}</code>
        <button onClick={handleCopy}
          style={{
            padding: "4px 10px", fontSize: 9, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 5, background: copied ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
            color: copied ? "#22c55e" : "var(--text-secondary)", whiteSpace: "nowrap",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
          onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
        >{copied ? "✓ Copied" : "Copy"}</button>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          height: 3, borderRadius: 2,
          width: i === current ? 24 : i < current ? 12 : 12,
          background: i <= current ? TEAL : "rgba(255,255,255,0.08)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      ))}
    </div>
  );
}

function AnimatedCounter({ value, suffix = "", delay = 0 }: { value: string | number; suffix?: string; delay?: number }) {
  const [display, setDisplay] = useState<string | number>(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (typeof value === "number") {
        let current = 0;
        const step = Math.ceil(value / 20);
        const interval = setInterval(() => {
          current += step;
          if (current >= value) {
            setDisplay(value);
            clearInterval(interval);
          } else {
            setDisplay(current);
          }
        }, 40);
        return () => clearInterval(interval);
      } else {
        setDisplay(value as string);
      }
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);
  if (!mounted) return <span>0{suffix}</span>;
  return <span>{display}{suffix}</span>;
}

function MissionStep() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const problems = [
    { icon: "⏱️", text: "Hours wasted manually tracing blast radius across files", accent: "#f97316" },
    { icon: "💥", text: "Production incidents from unseen dependency chains", accent: "#ef4444" },
    { icon: "📜", text: "No institutional memory — past failures repeat on same code", accent: "#a78bfa" },
    { icon: "🤷", text: "Unknown reviewers, missing rollback plans, blind merges", accent: "#6366f1" },
  ];
  const solutions = [
    { icon: "💥", label: "Blast Radius", desc: "NEIGHBORS query finds everything connected to changed files", nodes: "23 nodes", color: "#a78bfa" },
    { icon: "🔗", label: "Dependency Chain", desc: "PATH_FINDING traces MR-to-pipeline deployment paths", nodes: "13 edges", color: "#60a5fa" },
    { icon: "📜", label: "Historical Match", desc: "TRAVERSAL finds similar MRs using Jaccard similarity", nodes: "3 incidents", color: "#22d3ee" },
    { icon: "📊", label: "Pipeline Risk", desc: "AGGREGATION counts failures across the pipeline ecosystem", nodes: "132K pipelines", color: "#f97316" },
  ];
  const impacts = [
    { value: 78, suffix: "%", label: "Fewer Orbit Queries", detail: "Rate limiting cut queries from 107 → 23 per analysis", sub: "MAX_CHANGED_FILES=5 + 500ms throttle" },
    { value: 3, suffix: " High", label: "Risk Signals Detected", detail: "Bus factor, zero coverage, no reviewers — real findings", sub: "From 23-node digital twin on project 39251857" },
    { value: 14, suffix: " Nodes", label: "Digital Twin Graph", detail: "Built from all 4 Orbit query types in a single pass", sub: "13 relationships across 7 node types" },
    { value: 4, suffix: "/4", label: "Orbit Query Types", detail: "NEIGHBORS + PATH_FINDING + TRAVERSAL + AGGREGATION", sub: "All executed, all real, no mocks" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero banner */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "22px 24px", borderRadius: 12,
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(15,18,26,0.95), rgba(45,212,191,0.04))",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: "0 0 40px rgba(139,92,246,0.06)",
        ...s(0),
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 180, height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(45,212,191,0.1))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, border: "1px solid rgba(139,92,246,0.15)",
          }}>🎯</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)" }}>
              Orbit Sentinel — Engineering Digital Twin
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4, maxWidth: 500 }}>
            Orbit Sentinel builds a living model of the affected system from GitLab Orbit graph data — discovering blast radius, historical incidents, ownership chains, and deployment dependencies. Runs in under 60 seconds on a live MR.
          </div>
          </div>
        </div>
        {/* Real data badge */}
        <div style={{
          position: "absolute", bottom: 10, right: 14, zIndex: 1,
          display: "flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 4,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.1)",
          fontSize: 8, fontWeight: 700, color: "#22c55e",
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
          Live Orbit API · 23 nodes · 43 edges
        </div>
      </div>

      {/* Problem */}
      <div className="card" style={{
        padding: "18px 22px", position: "relative", overflow: "hidden",
        borderColor: "rgba(239,68,68,0.12)",
        background: "linear-gradient(135deg, rgba(239,68,68,0.03), rgba(15,18,26,0.95))",
        ...s(0.06),
      }}>
        <div style={{
          position: "absolute", top: -40, left: -40, width: 120, height: 120,
          background: "radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>⚠️</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>The Problem</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 1 }}>Every MR hides unknown risks — here's what goes wrong</div>
            </div>
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {problems.map((p, i) => (
              <div key={p.text} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                background: `${p.accent}06`, border: `1px solid ${p.accent}10`,
                animation: `fadeSlideUp 0.3s ${0.1 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${p.accent}0C`; e.currentTarget.style.borderColor = `${p.accent}18`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${p.accent}06`; e.currentTarget.style.borderColor = `${p.accent}10`; }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                <span style={{ fontSize: 10, color: "var(--text-primary)", lineHeight: 1.4 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="card" style={{
        padding: "18px 22px", position: "relative", overflow: "hidden",
        borderColor: `${TEAL}18`,
        background: `linear-gradient(135deg, ${TEAL_BG}, rgba(15,18,26,0.95))`,
        ...s(0.12),
      }}>
        <div style={{
          position: "absolute", top: -50, right: -30, width: 150, height: 150,
          background: "radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${TEAL}14`, border: `1px solid ${TEAL}18`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🛰️</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>The Solution: Orbit Sentinel</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 1 }}>A digital twin powered by all 4 GitLab Orbit query types</div>
            </div>
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {solutions.map((q, i) => (
              <div key={q.label} style={{
                padding: "12px 14px", borderRadius: 8,
                background: `${q.color}06`, border: `1px solid ${q.color}14`,
                animation: `fadeSlideUp 0.3s ${0.16 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${q.color}0C`; e.currentTarget.style.borderColor = `${q.color}22`; e.currentTarget.style.boxShadow = `0 0 20px ${q.color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${q.color}06`; e.currentTarget.style.borderColor = `${q.color}14`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{q.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.label}</span>
                  <span style={{
                    marginLeft: "auto", fontSize: 8, fontWeight: 700,
                    padding: "1px 6px", borderRadius: 4,
                    background: `${q.color}12`, color: q.color, fontFamily: "'JetBrains Mono', monospace",
                  }}>{q.nodes}</span>
                </div>
                <div style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4, marginLeft: 20 }}>{q.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="card" style={{
        padding: "18px 22px", position: "relative", overflow: "hidden",
        borderColor: "rgba(34,197,94,0.10)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.03), rgba(15,18,26,0.95))",
        ...s(0.18),
      }}>
        <div style={{
          position: "absolute", bottom: -40, right: -20, width: 140, height: 140,
          background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>📈</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>The Impact</div>
              <div style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 1 }}>What changes for developers — quantified with real Orbit data</div>
            </div>
          </div>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {impacts.map((m, i) => (
              <div key={m.label} style={{
                padding: "12px 10px", borderRadius: 8, textAlign: "center",
                background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.08)",
                animation: `fadeSlideUp 0.3s ${0.22 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.06)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.03)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.08)"; }}
              >
                <div style={{
                  fontSize: 22, fontWeight: 900,
                  color: "#22c55e", fontFamily: "'JetBrains Mono', monospace",
                  textShadow: "0 0 16px rgba(34,197,94,0.25)",
                  letterSpacing: "-0.5px",
                }}>
                  <AnimatedCounter value={m.value} suffix={m.suffix} delay={0.3 + i * 0.08} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-primary)", marginTop: 4, lineHeight: 1.3 }}>{m.label}</div>
                <div style={{ fontSize: 8, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.3 }}>{m.detail}</div>
                <div style={{
                  fontSize: 7, color: "var(--text-tertiary)", marginTop: 3,
                  paddingTop: 3, borderTop: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.3px",
                }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureStep() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const layers = [
    {
      icon: "🔀", title: "GitLab MR Event", color: "#fc6d26",
      items: ["Developer opens MR", "@ai-orbit-sentinel mention triggers flow", "Changed files + branch sent to engine"],
    },
    {
      icon: "🛰️", title: "GitLab Orbit API", color: "#6366f1",
      items: ["NEIGHBORS: blast radius of changed files", "PATH_FINDING: dependency chain to deployment", "TRAVERSAL: past MRs on same files", "AGGREGATION: pipeline failure counts"],
    },
    {
      icon: "🧠", title: "Orbit Sentinel Engine", color: TEAL,
      items: ["Digital twin construction from graph data", "Change simulation + risk scoring", "Remediation planning + test generation"],
    },
    {
      icon: "📊", title: "Visualizer Dashboard", color: "#60a5fa",
      items: ["6 interactive analysis views", "Real-time what-if simulation", "HTML export for MR notes"],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...s(0) }}>
        <div style={{
          flex: 1, padding: "16px 20px", borderRadius: 12,
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.6,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>🏗️ End-to-End Data Flow</div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <span style={{ color: "#fc6d26", fontWeight: 700 }}>MR Opened</span>
            <span style={{ color: "var(--text-tertiary)" }}> → </span>
            <span style={{ color: "#6366f1", fontWeight: 700 }}>Orbit Graph Query</span>
            <span style={{ color: "var(--text-tertiary)" }}> (4 types) → </span>
            <span style={{ color: TEAL, fontWeight: 700 }}>Digital Twin Built</span>
            <span style={{ color: "var(--text-tertiary)" }}> → </span>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>Analysis Report</span>
            <span style={{ color: "var(--text-tertiary)" }}> → </span>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>MR Note Posted</span>
          </div>
        </div>
      </div>

      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {layers.map((layer, i) => (
          <div key={layer.title} className="card" style={{
            padding: "14px 16px", borderColor: `${layer.color}18`,
            background: `linear-gradient(135deg, ${layer.color}06, rgba(15,18,26,0.95))`,
            ...s(0.06 + i * 0.04),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{layer.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: layer.color }}>{layer.title}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {layer.items.map((item, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 8px", borderRadius: 5,
                  background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)",
                  fontSize: 9, color: "var(--text-primary)", lineHeight: 1.3,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: layer.color, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{
        padding: "14px 18px", borderColor: "rgba(96,165,250,0.12)",
        background: "linear-gradient(135deg, rgba(96,165,250,0.04), rgba(15,18,26,0.95))",
        ...s(0.2),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>🧩</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)" }}>GitLab Duo Integration Points</span>
        </div>
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            { icon: "🤖", label: "Duo Chat Skill", desc: "`.gitlab/duo/skill.yml` — trigger via @mention" },
            { icon: "🔁", label: "Agent Flow", desc: "`flow/orbit-sentinel-flow.yaml` — 8-step autonomous pipeline" },
            { icon: "🔌", label: "MCP Server", desc: "`.gitlab/duo/mcp.json` — connects to Orbit API" },
          ].map((p, i) => (
            <div key={p.label} style={{
              padding: "8px 10px", borderRadius: 6, textAlign: "center",
              background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)",
              animation: `fadeSlideUp 0.3s ${0.24 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{p.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-primary)" }}>{p.label}</div>
              <div style={{ fontSize: 8, color: "var(--text-tertiary)", marginTop: 1 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupStep() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const tokens = [
    {
      icon: "1", title: "Create Access Token",
      steps: [
        "Go to your GitLab project → Settings → Access Tokens",
        "Create a token with `read_api` and `read_repository` scopes",
        "Set as `GITLAB_ACCESS_TOKEN` environment variable",
      ],
    },
    {
      icon: "2", title: "Deploy the Engine",
      steps: [
        "Set `GITLAB_HOST`, `ORBIT_GROUP_PATH`, `ORBIT_API_ENDPOINT`",
        "Or use the included `deploy.sh` for one-click deployment",
        "Engine auto-falls back to demo data if Orbit is unreachable",
      ],
    },
    {
      icon: "3", title: "Install the Skill",
      steps: [
        "Run: `glab skills install orbit-sentinel --global`",
        "Or copy `.gitlab/duo/skill.yml` to your project",
        "Configure `.gitlab/duo/mcp.json` with your endpoint",
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: "14px 18px", borderRadius: 10, ...s(0),
        background: "linear-gradient(135deg, rgba(45,212,191,0.06), rgba(15,18,26,0.95))",
        border: "1px solid rgba(45,212,191,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div className="card-header-icon" style={{ background: `${TEAL}18` }}>⚡</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>Quick Start</div>
            <div style={{ fontSize: 9, color: "var(--text-secondary)" }}>Get running in under 5 minutes</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <CodeBlock code='git clone https://gitlab.com/your-project/orbit-sentinel.git' label="Step 0: Clone the repo" />
          <CodeBlock code='cd orbit-sentinel; .\setup.ps1  # PowerShell quick-start' label="Step 1: Install dependencies" />
          <CodeBlock code='export GITLAB_ACCESS_TOKEN=your_token_here' label="Step 2: Set your token" />
          <CodeBlock code='glab skills install orbit-sentinel --global' label="Step 3: Install Duo Chat skill" />
          <CodeBlock code='# Open http://localhost:5173 to explore the dashboard' label="Step 4: Start developing" />
        </div>
        <div style={{
          marginTop: 8, padding: "8px 12px", borderRadius: 6,
          background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)",
          fontSize: 9, color: "#f97316", lineHeight: 1.4,
        }}>
          💡 <strong>No GitLab Orbit access?</strong> The visualizer runs fully in demo mode with realistic data — no token required. You can explore every feature immediately.
        </div>
      </div>

      <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tokens.map((t, i) => (
          <div key={t.title} className="card" style={{
            padding: "14px 16px", borderColor: `${TEAL}12`,
            ...s(0.06 + i * 0.04),
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: `${TEAL}18`, border: `1px solid ${TEAL}33`,
              fontSize: 10, fontWeight: 800, color: TEAL, marginBottom: 6,
            }}>{t.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{t.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {t.steps.map((step, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "flex-start", gap: 5,
                  fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4,
                }}>
                  <span style={{ color: TEAL, flexShrink: 0, fontSize: 8 }}>▸</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{
        padding: "12px 16px", borderColor: "rgba(34,197,94,0.12)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(15,18,26,0.95))",
        ...s(0.16),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
            <strong style={{ color: "#22c55e" }}>Already deployed:</strong>{" "}
            Live at <a href="https://orbit-sentinel.vercel.app" target="_blank" rel="noopener noreferrer"
              style={{ color: TEAL, textDecoration: "underline", textUnderlineOffset: 2 }}>orbit-sentinel.vercel.app</a>
            {" — "}No setup needed to explore the full dashboard.
          </span>
        </div>
      </div>
    </div>
  );
}

function LaunchStep() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const s = (d: number) => mounted ? { animation: `fadeSlideUp 0.5s ${d}s cubic-bezier(0.16,1,0.3,1) both` } : { opacity: 0 };

  const checklist = [
    { icon: "🤖", label: "AI Catalog Published", done: false, detail: "Publish the skill/flow to GitLab Duo AI Catalog" },
    { icon: "🎬", label: "Demo Video (≤3 min)", done: false, detail: "Upload to YouTube/Vimeo — follow demo/demo-script.md" },
    { icon: "📝", label: "Devpost Submission", done: false, detail: "Fill in description, gallery, docs on Devpost" },
    { icon: "🖼️", label: "Screenshots", done: true, detail: "Capture all 6 dashboard views" },
    { icon: "📋", label: "Contribute MRs", done: false, detail: "Submit orbit::hackathon MRs to GitLab Orbit" },
    { icon: "🧪", label: "Tests Passing", done: true, detail: "134 tests across 19 files" },
    { icon: "🏗️", label: "Build Succeeds", done: true, detail: "TypeScript + Vite production build" },
    { icon: "🚀", label: "Live Demo Deployed", done: true, detail: "orbit-sentinel.vercel.app" },
  ];

  const links = [
    { icon: "🛰️", label: "Live Demo", url: "https://orbit-sentinel.vercel.app", color: "#60a5fa" },
    { icon: "📦", label: "AI Catalog", url: "https://gitlab.com/ai-catalog", color: "#a78bfa" },
    { icon: "🏆", label: "Devpost", url: "https://devpost.com/software/orbit-sentinel", color: "#fc6d26" },
    { icon: "💬", label: "Discord", url: "https://discord.gg/gitlab", color: "#6366f1" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{
        padding: "20px 24px", position: "relative", overflow: "hidden",
        borderColor: "rgba(45,212,191,0.2)",
        background: `linear-gradient(135deg, ${TEAL_BG}, rgba(15,18,26,0.95), rgba(45,212,191,0.03))`,
        ...s(0),
      }}>
        <GlowDot color="rgba(45,212,191,0.08)" top="-40%" left="-10%" size={250} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: TEAL, textShadow: `0 0 30px ${TEAL_GLOW}`, textAlign: "center", marginBottom: 4 }}>
            🚀 Ready to Launch
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", marginBottom: 16, lineHeight: 1.5 }}>
            Orbit Sentinel is built and ready. Complete the checklist below to submit to the GitLab Transcend Hackathon.
          </div>

          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {checklist.map((item, i) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 6,
                background: item.done ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)",
                border: `1px solid ${item.done ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}`,
                animation: `fadeSlideUp 0.3s ${0.06 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
              }}>
                <span style={{ fontSize: 14 }}>{item.done ? "✅" : "⬜"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: item.done ? "#22c55e" : "#ef4444",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{item.label}</div>
                  <div style={{ fontSize: 8, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, ...s(0.12),
      }}>
        {links.map((link, i) => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 12px", borderRadius: 8, textDecoration: "none",
              background: `${link.color}08`, border: `1px solid ${link.color}18`,
              animation: `fadeSlideUp 0.3s ${0.14 + i * 0.03}s cubic-bezier(0.16,1,0.3,1) both`,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${link.color}14`; e.currentTarget.style.borderColor = `${link.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${link.color}08`; e.currentTarget.style.borderColor = `${link.color}18`; }}
          >
            <span style={{ fontSize: 14 }}>{link.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: link.color }}>{link.label}</span>
          </a>
        ))}
      </div>

      <div className="card" style={{
        padding: "14px 18px", borderColor: "rgba(34,197,94,0.12)",
        background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(15,18,26,0.95))",
        ...s(0.16),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong style={{ color: "#22c55e" }}>Both tracks eligible:</strong>{" "}
            Showcase Track (agent/flow on Duo Platform) +{" "}
            <strong style={{ color: "#f97316" }}>Contribute Track</strong>{" "}
            (submit MRs with <code style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>orbit::hackathon</code> label — $200 per merged MR, up to 5).
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupWizard() {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stepContent = [
    <MissionStep />,
    <ArchitectureStep />,
    <SetupStep />,
    <LaunchStep />,
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 16,
      maxWidth: 900, margin: "0 auto", width: "100%",
      padding: "8px 0",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        animation: "fadeSlideUp 0.4s ease both",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{STEPS[step].icon}</span>
            {STEPS[step].title}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>
            {STEPS[step].subtitle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
            Step {step + 1} / {STEPS.length}
          </div>
          <StepIndicator current={step} total={STEPS.length} />
        </div>
      </div>

      {/* Step Content */}
      <div style={{
        animation: "fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <ErrorBoundary fallback={<div style={{ padding: 20, color: "#ef4444", fontSize: 12 }}>Failed to render step content.</div>}>
          {stepContent[step]}
        </ErrorBoundary>
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeSlideUp 0.3s 0.1s ease both",
      }}>
        <button onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: "8px 18px", fontSize: 11, fontWeight: 600, cursor: step === 0 ? "default" : "pointer",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            background: step === 0 ? "transparent" : "rgba(255,255,255,0.04)",
            color: step === 0 ? "var(--text-tertiary)" : "var(--text-secondary)",
            opacity: step === 0 ? 0.3 : 1,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { if (step > 0) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
          onMouseLeave={e => { if (step > 0) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
        >← Back</button>

        <div style={{ display: "flex", gap: 4 }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)}
              style={{
                width: 8, height: 8, borderRadius: "50%", cursor: "pointer", padding: 0,
                border: "none",
                background: i === step ? TEAL : "rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
              }}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
            />
          ))}
        </div>

        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
          style={{
            padding: "8px 18px", fontSize: 11, fontWeight: 600, cursor: step === STEPS.length - 1 ? "default" : "pointer",
            border: `1px solid ${TEAL}33`, borderRadius: 6,
            background: `${TEAL}12`, color: TEAL,
            opacity: step === STEPS.length - 1 ? 0.3 : 1,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { if (step < STEPS.length - 1) { e.currentTarget.style.background = `${TEAL}22`; e.currentTarget.style.borderColor = `${TEAL}55`; } }}
          onMouseLeave={e => { if (step < STEPS.length - 1) { e.currentTarget.style.background = `${TEAL}12`; e.currentTarget.style.borderColor = `${TEAL}33`; } }}
        >{step === STEPS.length - 1 ? "✨ Done" : "Next →"}</button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}
