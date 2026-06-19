# Orbit Sentinel — Autonomous Engineering Digital Twin

## Inspiration

Every developer knows the feeling: you hit merge, and then you hold your breath. Will this deploy break something? Did I miss a downstream dependency? Has this file caused incidents before? Is there a rollback plan?

Existing tools tell you what changed, but nobody tells you what will *break*. Code review catches logic errors, but it can't trace blast radius through a dependency graph or find the MR from six months ago that silently failed on the same file. Engineers spend hours manually checking deployment chains, digging through incident history, and guessing at risk — because there's no digital twin of the software system to simulate the change before it lands.

GitLab Orbit changes that. It exposes the entire SDLC as a queryable knowledge graph — code, MRs, pipelines, deployments, incidents, ownership — all connected. But Orbit is an API, not a tool. Someone needs to turn those four query types into something a developer can use without learning GraphQL.

That's Orbit Sentinel.

## What It Does

Orbit Sentinel is an autonomous engineering digital twin. Paste any GitLab MR URL and it builds a living model of the affected software system — discovering blast radius, historical incidents, deployment dependencies, reviewer ownership, and rollback strategies — all before the change reaches production.

**The 8-View Dashboard:**

| View | What It Shows |
|------|---------------|
| **Setup Wizard** | 4-step guided journey — Mission → Architecture → Setup → Devpost checklist |
| **Dashboard** | Impact calculator, architecture diagram, Orbit evidence, incident intelligence, counterfactual simulation |
| **Blast Radius** | Interactive graph from Orbit NEIGHBORS query — click any node to inspect connections |
| **Risk Investigation** | 5-dimension risk breakdown with AGGREGATION data — failure probability heatmap, pipeline correlation |
| **Forecast Engine** | What-if simulator — adjust variables and see risk change in real-time |
| **Historical Context** | Past incidents with Jaccard similarity scores from Orbit TRAVERSAL query |
| **Impact Report** | Full formatted MR comment — export as Markdown or JSON with one click |
| **Predictions Tracker** | Accuracy scoreboard with post-merge verification — proves the predictions work |

**The Duo Agent Platform Flow:**

When a merge request is opened or updated, the flow automatically:
1. Calls `get_graph_schema()` to discover the Orbit ontology
2. Executes all four query types: NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION
3. Builds a unified digital twin from the combined evidence
4. Composes a 9-section impact analysis: executive summary, blast radius, failure predictions, historical context, reviewer recommendations, rollback plan, test plan, remediation steps
5. Posts the complete report as a note on the merge request

The same analysis engine powers both the visual dashboard and the autonomous MR flow — one codebase, two interfaces.

**Closed-Loop Accuracy:**

Every prediction is tracked post-merge through a 7-day survival window. True positives, false positives — all recorded. The Predictions Tracker surfaces accuracy rate, risk trend charts, and a per-file vulnerability forecast. Orbit Sentinel doesn't just predict — it proves its predictions were right.

## How We Built It

**Architecture:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  GitLab MR   │────▶│  Engine API  │────▶│  Visualizer  │
│  (webhook)   │     │  (Node.js)   │     │  (React/D3)  │
└──────────────┘     │  :3001       │     │  :5173       │
                     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │  GitLab Orbit│
                     │  Knowledge   │
                     │  Graph       │
                     └──────────────┘
```

**Engine** (`orbit-sentinel/engine/`, TypeScript, 95 tests):
- `DigitalTwinBuilder` — orchestrates all 4 Orbit query types via `orbitOrFallback()` wrappers, merges results into a unified graph
- `Grep Fallback` — when Orbit is unavailable, fetches changed files via GitLab Repository Files API, parses JS/TS/Python imports, builds dependency graph without Orbit
- `Risk Engine` — scores changes across 5 dimensions (functionality, code quality, security, alignment, improvement) using Orbit evidence
- `Memory Store` — historical similarity engine with Jaccard scoring, surfaces past incidents on the same files
- `Remediation Planner` — generates rollback strategies, test plans, and remediation steps prioritized by risk
- Input validation on every endpoint (Zod), exponential backoff for rate limits, 8 classified error types

**Visualizer** (`orbit-sentinel/visualizer/`, React 18 + D3.js + Vite, 13 tests):
- 40 components across 8 dashboard views — all inline-styled with zero CSS files
- Responsive across 5 breakpoints (360px to 1600px+)
- Design token system (`constants/tokens.ts`) — centralized colors, z-index tiers, animation presets, spacing scale
- Judge's Tour mode (`?judge=true`) — auto-demo with keyboard navigation (Space, ← →, 1-8)
- Theme toggle (light/dark) persisted to localStorage
- Export system — Markdown clipboard copy and JSON file download from Impact Report
- Agent Flow Progress — animated 8-step Duo workflow visualization

**Duo Agent Platform Integration:**
- Flow YAML at `flow/orbit-sentinel-flow.yaml` — 8-step pipeline with all 4 Orbit query types
- Skill definition at `.gitlab/duo/skill.yml` — category: code_review, 3 capabilities, agent orchestration
- MCP server config at `.gitlab/duo/mcp.json` — connects to Orbit knowledge graph via HTTP
- 6 query recipes in `skills/orbit-sentinel/recipes/` — ready-to-use JSON for blast radius, dependency chains, deployment impact, historical similarity, ownership discovery, pipeline risk

**Deployment:**
- Visualizer on Vercel (`orbit-sentinel.vercel.app`) — instant deploys from main branch
- Engine on Render — Node.js Express server with health checks
- Docker Compose — boots full stack (engine + visualizer + nginx) with health checks
- CI/CD via `.gitlab-ci.yml` — 6 jobs across 4 stages (build, lint, test, deploy)

**Testing:**
- 108 tests total (95 engine + 13 visualizer)
- Vitest for both engine (unit/integration) and visualizer (component/smoke)
- Engine tests cover: Orbit client error handling, all 4 query types, similarity engine, risk thresholds, digital twin construction, remediation planning, rollback strategy, simulation edge cases

## Challenges We Ran Into

**1. Orbit API 2.1.0 Format Shift**

Mid-development, Orbit's API response format changed. `result.rows` became `result.nodes`/`result.edges`. The entire `DigitalTwinBuilder.mergeGraph()` had to be rewritten — went from returning empty results to 14 nodes and 13 edges per MR. Lesson: never hardcode GraphQL response shapes.

**2. CORS Blocking GitLab File Fetches**

The browser couldn't fetch changed file contents directly from `gitlab.com` due to CORS. We built a CORS proxy at `/api/probe-mr-files` on the engine, proxying file content requests through the server. Now the visualizer fetches files through the engine, not the browser.

**3. Rate Limit Amplification**

Initial implementation hammered the Orbit API — 107 queries per MR analysis. Each changed file triggered redundant calls. We capped `MAX_CHANGED_FILES` at 5, added 500ms throttle between file iterations, and deduplicated query types. Result: 23 queries per MR, 78% reduction.

**4. Dark Screen on GitLab Pages**

Visualizer deployed to GitLab Pages rendered a blank screen. Root cause: Pages access control was Private, requiring auth that the static site couldn't provide. Moved to Vercel (no access restrictions), kept Pages config for future use.

**5. Fallback Without a Token**

When no `GITLAB_ACCESS_TOKEN` was configured, the grep fallback hung on timeouts. Added a fast-path: if no token present, return empty immediately instead of attempting API calls. Reduced failure mode from 30-second timeout to instant "no data."

**6. Duplicate Flow in AI Catalog**

An older version of the flow YAML was published alongside the active one. The stale entry had the same project ID, creating confusion. Had to hide the duplicate from Catalog.

## Accomplishments We're Proud Of

**108 tests passing** — 95 engine tests across 13 test files + 13 visualizer component tests. Every test is meaningful: Orbit client error handling, retry logic, all 4 query types, similarity engine edge cases, risk thresholds, digital twin construction, rollback strategies. No fluff.

**Live Orbit data** — The engine queries a real GitLab Orbit knowledge graph and returns actual graph data: **14 nodes, 13 edges** per MR analysis across 7 node types. Not mocked, not simulated — live from GitLab's API. Full traversal results documented.

**Closed-loop accuracy** — We don't just predict and walk away. Every prediction is tracked post-merge with a 7-day survival window. The Predictions Tracker computes accuracy rate, shows risk trend charts, and surfaces vulnerability-adjusted predictions. This is the difference between a demo and a tool.

**Fallback resilience** — When Orbit is unavailable, the engine degrades to grep-based file analysis. Changed files are fetched via GitLab API, imports are parsed, a dependency graph is built — and the visualizer shows a "Degraded" mode banner so the user knows. No crash. No blank screen. No "Orbit is down" error.

**40 React components, 8 views, 5 breakpoints** — Every component is inline-styled with zero CSS files. The design token system centralizes colors, z-index tiers, animations, and spacing. Theme toggle persists across sessions. Keyboard shortcuts (1-8 for views, Space for demo, D for theme) make it feel like a native app.

**Flow published to AI Catalog** — The 8-step Duo Agent Platform flow is live in the AI Catalog with 1 successful run. It's listed alongside GitLab's official flows (Code Review, Fix CI/CD Pipeline) and is publicly accessible.

## What We Learned

**Orbit is not just a graph database — it's a SDLC simulator.** The four query types (NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION) each reveal a different dimension of the software lifecycle. Combined, they paint a complete picture that no single query type can provide. NEIGHBORS shows what's connected; PATH_FINDING shows how breakage propagates; TRAVERSAL shows history repeating; AGGREGATION shows systemic fragility.

**A digital twin is only as good as its fallback.** When Orbit is available, the twin is rich with graph evidence. When it's not, you can still analyze — but the quality difference motivates getting Orbit enabled. The fallback isn't a substitute; it's a safety net that proves the value of the real thing.

**Visual feedback changes how developers trust predictions.** The same analysis that gets posted as an MR note feels different when rendered as an interactive dashboard. Being able to click a node, adjust a slider, or see accuracy trend over time builds confidence in the predictions. Text-only tools don't have this effect.

**Testing Orbit integrations requires real Orbit data.** Mock data gets you 80% of the way, but the last 20% — the actual GraphQL response shapes, the rate limiting behavior, the schema differences between indexed and non-indexed projects — only shows up against a real API. Our fallback system exists because we learned this the hard way.

## What's Next

1. **Multi-project orbit traversal** — Extend the digital twin to trace dependencies across GitLab groups, not just within a single project
2. **Natural language MR summaries** — Generate plain-English change descriptions from the digital twin, so non-technical stakeholders can understand impact
3. **VSCode extension** — Inline blast radius hints while editing, before the MR is even opened
4. **GitHub Orbit adapter** — If/when Orbit supports GitHub, adapt the digital twin to work with GitHub repos
5. **Open source community** — Publish the skill recipes as a curated marketplace, invite contributions for new query patterns
6. **Predictive CI/CD** — Use historical AGGREGATION data to predict pipeline failure probability before the pipeline runs
