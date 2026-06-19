# Changelog

All notable changes to Orbit Sentinel are documented here.

---

## Latest Session (June 19 — Batch 2: Vulnerability Prediction + Power UX)

### Added

- **Security Findings in Blast Radius** (`BlastRadiusExplorer.tsx`) — New `StatPill` showing critical/high vulnerability counts per component. Each service node in the picker now shows per-file vulnerability badge (severity-colored, count). Uses `useVulnerabilities` hook to compute vulnerability info from graph nodes. 5-column responsive stats grid.

- **Pipeline Failure Correlation in Risk View** (`RiskInvestigation.tsx`) — New "Pipeline Failure Correlation" card in the investigation panel. Shows correlation coefficient bar between risk score and pipeline failures, failure probability heatmap grid, and text insight (e.g. "Historical pipeline reliability: 62%"). Pulls from `AGGREGATION` query pipeline failure data.

- **Export/Share Report** (`ImpactReport.tsx`) — Export dropdown button in report toolbar with two options: **Copy Markdown** (generates full markdown from report data, copies to clipboard with fallback) and **Download JSON** (exports raw report data as `.json` file). Click-outside-to-close behavior. Theme-aware background (`var(--bg-elevated)`).

- **Vulnerability-Adjusted Predictions** (`PredictionsTracker.tsx`) — New "Vulnerability-Adjusted Predictions" section showing predicted vs actual vulns per MR. Per-file breakdown table with severity icons, predicted count, actual count, and confirmation toggle per file. Pulls predictions from `vulnerabilityPredictions` on each MR entry.

- **Keyboard Shortcuts & Power User Hints** (`App.tsx`) — Global keyboard shortcuts: **1–8** switch between dashboard views (Overview=1, Setup=2, Blast Radius=3, Risk=4, Simulation=5, History=6, Report=7, Predictions=8). **D** toggles demo mode. **E** toggles the Editor panel. Shortcuts shown in a tooltip overlay at bottom of screen. Captured in `useEffect` keydown listener.

- **Light/Dark Theme Toggle** (`index.html`, `App.tsx`) — Theme state persisted in `localStorage` under key `orbit-theme`. Toggle button in top nav bar (sun/moon icon). CSS custom properties for light theme (`--bg-card: rgba(255,255,255,0.85)`, `--bg-elevated: rgba(255,255,255,0.95)`). Theme stored and restored on load via `useEffect`. All components use `var(--...)` variables so they automatically adapt.

### Fixed

- **BlastRadiusExplorer `resp-grid-5`** — Stats grid was using hardcoded `repeat(4, 1fr)` / `repeat(5, 1fr)` with no responsive breakpoint. Added `className="resp-grid-5"` so it collapses to 2 columns at 900px and 1 column at 480px.

- **ImpactReport export dropdown background** — Hardcoded `rgba(12,14,20,0.96)` broke light theme appearance. Replaced with `var(--bg-elevated)` so the dropdown adapts to both themes.

---

## Session 2 (June 18)

### Added

- **PredictionsTracker.tsx** — Post-merge verification + accuracy scoreboard. Animated stat counters (total tracked, accuracy %, true positives, avg error), DualSparkline showing predicted vs actual risk trend over time, filterable/sortable MR ledger with outcome badges, verification input per MR, accuracy insights panel.
- **Grep fallback** (`engine/src/fallback/grep-fallback.ts`) — File-analysis fallback when Orbit is unavailable. Fetches files via GitLab Repository Files API, parses JS/TS/Python imports, builds dependency graph. Fast-paths to empty when no token present. Four fallback methods: `neighborsFile`, `pathFindingFiles`, `traversalFiles`, `emptyResult`.
- **`orbitOrFallback()`** in `DigitalTwinBuilder` — Wraps all 8 Orbit query types with try/catch. On Orbit failure, calls fallback and sets `usedFallback = true`. Propagates `fallback` flag through twin metadata → engine response → visualizer.
- **Degraded mode** (`DataModeBanner`) — New `"degraded"` mode: orange dot, orange border, "Degraded" label, "Orbit unavailable — using file analysis fallback" description. Activated when `result.report.fallback === true`.
- **`"predictions"` view** — 8th view registered in App.tsx. Added to View type, VIEW_LABELS, DEMO_STEPS, tabs, getInitialView, switch body.
- **Memory store fallback** — `memoryStore.findHistoricalMatches()` now wrapped in try/catch inside `analyzeChange`. Returns empty array on failure instead of crashing the whole analysis.
- **Close-loop accuracy tracking** — PredictionsTracker records predicted risk vs actual outcome, computes accuracy score, shows risk trend chart with DualSparkline.
- **README update** — Added Predictions view, fallback resilience, competitive comparison vs Sankofa, updated test count (105), closed-loop section, Docker quick start.

### Changed

- **Demo script** — Updated "6 views" → "8 views" to include predictions.
- **METHODOLOGY.md** — Added fallback behavior section and post-merge verification rubric.

---

### Fixed

- **Orbit API 2.1.0 format** — `DigitalTwinBuilder.mergeGraph()` now parses `result.nodes`/`result.edges` instead of empty `result.rows`. Went from 0 → 14 nodes, 13 edges per MR.
- **CORS on GitLab file fetch** — MR file contents proxied through engine's `/api/probe-mr-files` instead of direct browser → gitlab.com fetch.
- **Rate limit hammering** — `MAX_CHANGED_FILES` capped at 5, 500ms throttle between file iterations. Orbit queries reduced from 107 → 23 per analysis.

### Added

- **`/api/raw-orbit`** — debug proxy endpoint on engine for ad-hoc Orbit query exploration.
- **Project ID discovery** — Found correct GitLab numeric ID (83381762) for indexed project. Path-based IDs don't work; `node_ids` filter requires numeric ID.

### UI Polish

- **MrAnalyzer card** — gradient background, neon purple glow (`0 0 30px`), pulsing "Engine Live" badge, corner decoration, grid dot pattern, gradient button with hover glow.
- **Quick Demo buttons** — Larger (12px font, 12px 14px padding), vertical stacked layout with 22px icons and inline descriptions. Purple gradient separator.
- **Success toast** — Green banner "✓ Analysis complete — MR !X" appears for 5s after live analysis.
- **Two-column layout** — Query log + diagram on left, problem + impact on right (reduces scrolling).
- **Token input restyled** — Purple accent border/glow, matching MrAnalyzer design system.
- **MR validation badge** — Input shows validation indicator for `^[0-9]+$` format.

### Changed

- **README.md** — Rewritten with current architecture (CORS proxy, rate limits, Orbit API format), updated status table, engine component descriptions, correct project ID context, 6 Quick Demo scenarios, UI polish features. Removed outdated `STRUCTURE.md` references.

### Known

- Vercel not auto-deploying from GitHub pushes. Trigger manually from dashboard or install `vercel` CLI.

---

## What We Fixed

### Black Screen on GitLab Pages

The visualizer deployed to GitLab Pages but rendered a blank page. Root cause: GitLab Pages access control was set to **Private**, requiring authentication that the static site couldn't provide. The fix involved two paths:

- **Immediate workaround** — Deployed the visualizer to Vercel, which has no access restrictions. Live at `orbit-sentinel.vercel.app`.
- **Permanent fix** — The Pages deployment remains configured; switching access control to "Everyone" (requires a Maintainer or Owner) will resolve it in-place.

### Pipeline Failures

The `.gitlab-ci.yml` went through several iterations before stabilizing:

- Fixed incorrect `rules:` syntax (`when: always` placement, missing merge request conditions)
- Corrected workspace paths so both `engine/` and `visualizer/` were scoped properly
- Added separate jobs for engine testing, engine linting, visualizer linting, and both builds
- All 6 jobs across 4 stages now pass consistently (pipeline #2606601215 confirmed green)

### Token and Authentication

The initial CI/CD pipeline used a legacy personal access token. Replaced with a **fine-grained project access token** with scoped permissions for Orbit API access. Stored as a **protected masked CI/CD variable** (`ORBIT_TOKEN`) so it is never exposed in logs and only available to protected branches.

---

## What We Added

### Engine API Server (`engine/src/server.ts`)

The engine was originally a library consumed programmatically. Created an Express server with two endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Analyze a merge request change — accepts project ID, MR IID, changed files, description |
| `/api/demo` | GET | Return synthetic demo data so the visualizer works without a live Orbit connection |

The server validates all inputs, handles errors gracefully, and returns structured responses compatible with the visualizer client.

### Dynamic Flow YAML (`flow/orbit-sentinel-flow.yaml`)

The GitLab Duo Agent Platform flow was hardcoded to a specific MR. Replaced static values with dynamic placeholders:

- `{{mr_iid}}` — Injected at runtime from the triggering merge request
- `{{changed_files}}` — Injected from the MR's changed files list

This is now routing `.yml` file paths into **PATH_FINDING** and **TRAVERSAL** queries instead of a fixed `ends_with(.yml)` filter.

### Visualizer API Integration (`visualizer/src/App.tsx`)

The visualizer previously displayed a hardcoded `DATA` object. Rewrote the data layer:

- **API service** — Calls `POST /api/analyze` with real MR parameters when an engine server is available
- **Demo mode fallback** — Calls `GET /api/demo` if the engine is unreachable, so the dashboard always works
- **Loading state** — Shows a spinner during data fetch
- **Error state** — Displays error messages when both API and demo mode fail

### DataVisualizer Full Shape Transform (`engine/src/reporter/visualizer.ts`)

The `DataVisualizer` previously produced only a partial `VisualizationData` subset (graph + riskData + summary). Full rewrite produces **all 10 top-level fields**:

- `hero` — predicted outcome, recommended action, confidence factors with color-coded status pills
- `evidence` — 4 Orbit query results (NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION)
- `futureTimeline` — 5-day predicted timeline with icons and descriptions
- `decisionCenter` — deployment verdict, reviewers, required tests, rollback strategy, risk reduction
- `counterfactuals` — what-if scenarios with risk-after values and colors
- `incidents` — historical matches with similarity scores, root cause, and mitigation

The `/api/analyze` and `/api/demo` endpoints both use this transformer so the visualizer always receives the correct shape regardless of data source.

### README Architecture Diagram

Added Mermaid-based system architecture diagram showing the complete 8-step flow from MR creation → Orbit queries → digital twin → simulation → report → visualizer → skill publish.

### Package Metadata

Added `repository`, `homepage`, and `bugs` fields to `visualizer/package.json` for proper npm registry linking.

### Deployment Script (`deploy.sh`)

Automated deployment to Vercel (visualizer) and Render (engine) with a single command. Checks for required environment variables (`VERCEL_TOKEN`, `RENDER_API_KEY`) and deploys each target sequentially.

### Error Handling (`engine/src/errors.ts`, `engine/src/validators.ts`)

Added a complete error classification and recovery system:

**8 error types** — RATE_LIMIT, AUTHENTICATION_ERROR, QUOTA_EXCEEDED, ORBIT_API_ERROR, NETWORK_ERROR, SERVICE_UNAVAILABLE, VALIDATION_ERROR, INVALID_MR

**Input validation** — Every MR analysis request validates project path format, MR IID range, changed files array, change description length, and branch name format before touching the Orbit API.

**Retry strategy** — Exponential backoff (1s → 2s → 4s) for transient errors. Authentication and validation errors are never retried.

---

## Test Results

```
 ✓  95 tests passed (15 files)
```

| Test File | Tests | What It Covers |
|---|---|---|
| `orbit-client.test.ts` | 11 | Orbit API client, error handling, retry logic |
| `orbit-queries.test.ts` | 12 | All 4 query types, schema discovery |
| `similarity-engine.test.ts` | 6 | Historical matching with Jaccard similarity |
| `test-generator.test.ts` | 6 | Test plan generation |
| `risk-engine-edge.test.ts` | 6 | Risk thresholds and edge cases |
| `remediation-planner.test.ts` | 5 | Remediation planning |
| `twin-builder.test.ts` | 5 | Digital twin construction |
| `simulator-edge.test.ts` | 5 | Simulation edge conditions |
| `rollback.test.ts` | 5 | Rollback strategy |
| `risk-engine.test.ts` | 4 | Risk scoring logic |
| `reporter.test.ts` | 4 | Report generation |
| `config.test.ts` | 3 | Configuration validation |
| `simulator.test.ts` | 3 | Change simulation |

---

## File Inventory

### New Files

| File | Purpose |
|---|---|
| `engine/src/server.ts` | Express API server (analyze + demo endpoints) |
| `engine/src/server-index.ts` | Server entry point |
| `engine/src/errors.ts` | Error classification, retry logic, rate limiting |
| `engine/src/validators.ts` | Input validation and sanitization |
| `deploy.sh` | Vercel + Render deployment automation |

### Modified Files

| File | Change |
|---|---|
| `README.md` | Rewritten as professional storytelling document with architecture diagram |
| `AGENTS.md` | Rewritten as concise agent behavior specification |
| `.gitlab-ci.yml` | Fixed syntax, added engine jobs, corrected paths |
| `engine/package.json` | Added express, cors, zod dependencies |
| `engine/src/index.ts` | Added `DataVisualizer` export, removed broken server re-export |
| `engine/src/reporter/visualizer.ts` | Full rewrite — produces complete VisualizationData with all 10 fields |
| `engine/src/server.ts` | Uses DataVisualizer transform; demo endpoint returns VisualizationData shape |
| `engine/src/types.ts` | Widened DigitalTwinNode.type to string; optional impact/recommendedTests |
| `engine/src/config.ts` | Exported config const (was private) |
| `visualizer/src/App.tsx` | Replaced hardcoded DATA with API service + demo fallback |
| `visualizer/package.json` | Added repository, homepage, bugs fields |
| `flow/orbit-sentinel-flow.yaml` | Dynamic `{{mr_iid}}` and `{{changed_files}}` placeholders |

---

## Deployment

| Target | Platform | Status |
|---|---|---|
| Visualizer | Vercel | `orbit-sentinel.vercel.app` — live |
| Visualizer | GitLab Pages | Configured — requires access control change |
| Engine API | Render | Ready to deploy with `deploy.sh` |

For detailed setup instructions, see [SETUP.md](SETUP.md). For the full installation guide, see [INSTALLATION.md](INSTALLATION.md).
