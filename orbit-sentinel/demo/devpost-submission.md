# Orbit Sentinel — Autonomous Engineering Digital Twin

## Inspiration

> GitHub Copilot predicts code. Orbit Sentinel predicts **consequences**.

You hit merge. Then you hold your breath. Will this break something? Did I miss a downstream dependency? Has this file failed before? Is there a rollback plan?

Code review catches logic errors. It cannot trace blast radius through a dependency graph. It cannot find the MR from six months ago that silently caused an incident on the same file. Engineers spend hours manually checking deployment chains, digging through incident history, and guessing at risk — because no digital twin exists to simulate the change before it lands.

GitLab Orbit exposes the entire SDLC as a queryable knowledge graph. But Orbit is an API, not a tool. Someone has to turn those four query types into something a developer can use without learning GraphQL.

Orbit Sentinel is that tool.

| Competitor | Their Approach | Ours |
|---|---|---|
| **MR Sentinel** | 5-agent governance pipeline, text-only MR notes | Visual dashboard + same analysis — 40 components, 8 views |
| **Sankofa** | Onboarding briefs via Orbit | Closed-loop accuracy tracking, 3.8× more tests |
| **Stayed Shipped** | Post-merge outcome verification only | Pre-merge prediction + post-merge verification — full loop |
| **Failure Triage Agent** | Pipeline failure root cause only | Entire SDLC: blast radius, history, ownership, rollback, tests |

Every competitor solves one piece. Orbit Sentinel solves the **whole pipeline**.

## What It Does

Paste any GitLab MR URL. Orbit Sentinel builds a living digital twin of the affected system — then delivers an 8-view interactive dashboard and an autonomous MR note, all from the same analysis:

| View | What It Shows | Orbit Query |
|---|---|---|
| **Dashboard** | Impact calculator, architecture diagram, evidence panel, incident intelligence, counterfactuals | All 4 |
| **Setup Wizard** | 4-step guided journey — first-time visitors see this, not a blank graph | — |
| **Blast Radius** | Interactive dependency explorer — click any node to drill into connections | NEIGHBORS |
| **Risk Investigation** | 5-dimension risk breakdown, pipeline failure heatmap, correlation coefficient | AGGREGATION |
| **Forecast Engine** | What-if simulator — toggle variables, watch risk animate in real-time | Simulation |
| **Historical Context** | Past incidents ranked by Jaccard similarity — "has this failed before?" | TRAVERSAL |
| **Impact Report** | Full MR comment with one-click Markdown copy or JSON export | All 4 |
| **Predictions Tracker** | Accuracy scoreboard, post-merge verification, vulnerability-adjusted forecasts | Closed-loop |

**The autonomous flow** triggers automatically on MR open or commit push — executes all 4 Orbit queries, composes a 9-section report (executive summary, blast radius, failure predictions, historical context, reviewer recommendations, rollback plan, test plan, remediation steps), and posts it as an MR note.

**The closed loop:** Every prediction is tracked post-merge through a 7-day survival window. The Predictions Tracker computes accuracy rate, shows risk trend charts, and surfaces vulnerability-adjusted predictions. Orbit Sentinel doesn't just predict — it proves its predictions were right.

## How We Built It

```
GitLab MR ──▶ Engine (Node.js/TS, 95 tests) ──▶ Visualizer (React/D3, 13 tests)
                   │                                     │
                   ▼                                     │
          GitLab Orbit Knowledge Graph ◀─────────────────┘
          (4 query types, 14 nodes/13 edges per MR)
```

**Engine** — TypeScript, Express, Zod validation, 8 classified error types with exponential backoff:
- `DigitalTwinBuilder` — orchestrates all 4 Orbit queries, merges into unified graph via `orbitOrFallback()`
- `Grep Fallback` — when Orbit is unavailable, fetches files via GitLab API, parses imports, builds dependency graph without Orbit. Fast-paths to empty when no token present (no hanging)
- `Risk Engine` — 5-dimension scoring (functionality, code quality, security, alignment, improvement) from Orbit evidence
- `Memory Store` — Jaccard similarity engine for historical incident matching
- `Remediation Planner` — rollback strategies, test plans, remediation steps by risk priority
- Rate-limited to 23 queries per MR (was 107 — 78% reduction via caching + dedup + file cap)

**Visualizer** — React 18, D3.js, Vite, 40 components, zero CSS files:
- 8 interactive views, responsive across 5 breakpoints (360px to 1600px)
- Design token system: centralized colors, z-index tiers, animation presets, spacing scale
- Judge's Tour (`?judge=true`) — guided walkthrough, Space for auto-demo, ← → / 1-8 to navigate
- Theme toggle (light/dark) persisted to localStorage
- 13 component smoke tests covering all major views

**Duo Agent Platform:**
- Flow YAML at `flow/orbit-sentinel-flow.yaml` — published to AI Catalog (1 run, public)
- Skill at `.gitlab/duo/skill.yml` — category: code_review, 3 capabilities, agent orchestration
- MCP config at `.gitlab/duo/mcp.json` — HTTP connection to Orbit knowledge graph
- 6 query recipes in `skills/orbit-sentinel/recipes/` — ready-to-use JSON for each query pattern

**Deployment:** Vercel (visualizer), Render (engine), Docker Compose (full stack with health checks), CI/CD via `.gitlab-ci.yml` (6 jobs, 4 stages)

**Testing:** 108 tests (95 engine + 13 visualizer) — Orbit client error handling, all 4 query types, similarity engine edge cases, risk thresholds, twin construction, rollback strategies, remediation planning

## Challenges We Ran Into

**Orbit API 2.1.0 format shift.** `result.rows` became `result.nodes`/`result.edges` mid-development. Entire `mergeGraph()` rewritten. Went from 0 nodes to 14 nodes, 13 edges per MR. Never hardcode GraphQL response shapes.

**CORS blocking GitLab file fetches.** Browser couldn't fetch changed files from gitlab.com. Built a CORS proxy at `/api/probe-mr-files` on the engine — now all file fetches route through the server.

**Rate limit amplification.** Initial code made 107 Orbit queries per MR analysis. Capped changed files at 5, added 500ms throttle, deduplicated query types. Down to 23 queries — 78% reduction.

**Dark screen on GitLab Pages.** Pages access control was Private, requiring auth the static site couldn't provide. Moved to Vercel. Kept Pages config for future use.

**Fallback hung without a token.** Grep fallback timed out at 30 seconds when no `GITLAB_ACCESS_TOKEN` was configured. Added fast-path: no token → return empty immediately. Failure mode went from 30s timeout to instant.

**Duplicate flow in AI Catalog.** An older YAML was published alongside the active one. Same project ID, different creation date. Had to hide the stale entry.

## Accomplishments That We're Proud Of

**108 tests. Zero fluff.** Every test is meaningful — Orbit client retry logic, all 4 query types, similarity engine edge cases, digital twin construction, component smoke tests. No coverage theater.

**Live Orbit data, not mocks.** The engine queries a real GitLab Orbit knowledge graph and returns actual graph data: 14 nodes, 13 edges per MR across 7 node types. Full traversal results documented.

**Closed-loop accuracy.** We don't predict and disappear. Every prediction is tracked post-merge with a 7-day survival window. Accuracy rate, risk trends, vulnerability-adjusted forecasts — all surfaced in the Predictions Tracker. This is the difference between a demo and a tool.

**Fallback resilience.** When Orbit is unavailable, the engine degrades to grep-based file analysis. The visualizer shows a "Degraded" mode banner. No crash. No blank screen. No "Orbit is down" error.

**40 components, 8 views, 5 breakpoints, zero CSS files.** Design token system. Theme toggle. Keyboard shortcuts. Judge's Tour. Everything inline-styled.

**Flow in AI Catalog alongside GitLab's official flows.** Orbit Sentinel is listed with Code Review, Fix CI/CD Pipeline, and the other 15+ competitor flows — and ours has the only visual dashboard.

## What We Learned

**The four Orbit query types are not interchangeable — they're complementary.** NEIGHBORS reveals blast radius. PATH_FINDING shows propagation chains. TRAVERSAL surfaces historical patterns. AGGREGATION measures systemic fragility. Combined, they paint a complete picture that no single query can. Using all four is not redundant — it's the whole point.

**A digital twin without a fallback is a gamble.** When Orbit is available, the twin is rich with graph evidence. When it's not, you still need to ship analysis. The fallback isn't a substitute — it's a safety net that proves the value of the real thing by showing what you lose without it.

**Visual feedback changes trust.** The same analysis posted as an MR note feels different when rendered as an interactive dashboard. Clicking a node, adjusting a slider, watching accuracy trend over time — these build confidence that text cannot. Every competitor in this hackathon produces text-only output. We're the only one with a visual dashboard.

**Real Orbit data reveals what mocks cannot.** GraphQL response shapes, rate limiting behavior, schema differences between indexed and non-indexed projects — none of these show up in unit tests. Our fallback system exists because we learned this the hard way.

## What's Next

1. **Multi-group orbit traversal** — Trace dependencies across GitLab groups, not just single projects
2. **Natural language MR briefs** — Plain-English summaries for non-technical stakeholders (product managers, support engineers)
3. **VSCode extension** — Inline blast radius hints while editing, before the MR exists
4. **Predictive CI/CD** — Use AGGREGATION data to predict pipeline failure probability before the pipeline runs
5. **Open source recipe marketplace** — Community-contributed query patterns for the Duo Agent Platform
