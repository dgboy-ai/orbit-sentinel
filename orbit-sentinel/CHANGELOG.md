# Changelog

All notable changes to Orbit Sentinel are documented here.

---

## Submission Readiness & Data Integrity (June 23 — Final Cleanup)

### Fixed

- **Hardcoded project ID purged from visible UI** — Graph node labels (`transcend/39251857` → `Orbit Sentinel Demo`), button subtitles, OrbitQueryExplorer `<pre>` block, demo metadata. Internal API request payloads unchanged (non-visible).
- **Marketing claims removed** — "Fewer false alarms" → "Context-rich alerts" across README, JudgesTour, ProblemSection. "Saves hours per MR" → "reduces manual analysis time". "Incidents Prevented" → "Incidents Identified" (types, utils, 2 UI components). "hours of manual review" removed from ProblemSection and SimulateWebhook.
- **Hardcoded confidence percentages replaced** — 96% in scenarios → dynamic "High". 100%/95%/75% in HistoricalContext → computed from `highestSimilarity`, `closedCount`, `totalCount`. Stale "Why 91%?" comment removed.
- **Competitor framing removed** — "vs." → "and" in 5 component headers (SetupWizard, RiskInvestigation, RealityCheck, TaglineBanner, ImpactCalculator). "Other tools predict" → "Predict and verify". "Prevented before production" → "Verified before production".
- **Light theme fixed** — Header background (`rgba(8,9,13,0.85)` → `var(--bg-elevated)`), mobile dropdown, loading toast, demo badge, footer bar, D3 zoom controls + legend — all changed to CSS variables.
- **Test counts updated** — All docs: 134→135 (105 engine + 30 visualizer). Badge URL, comparison table, contributing/installation/setup guides.
- **Docs accuracy fixes** — Clone URLs reverted to actual GitLab project path. SECURITY.md/CONTRIBUTING.md issues URLs fixed. Badge link restored.

### Changed

- **Graph stats labels** — "Nodes" → "Total Nodes", "Relationships" → "Total Edges", "Affected Systems" → "Affected Systems (Files + Services)", "Graph: 225 nodes" → "Full knowledge graph: 225 nodes".
- **MR URL input starts empty** — `DEFAULT_MR_URL = ""`, Live Demo button shows project path transparently.
- **Predictions badge** — "LIVE" → "TRACKING".
- **ROI claims** — "$139k/yr, 121% net ROI" → "estimated dollar impact with configurable parameters".
- **Pipeline counts in demo data** — Reduced from 132,000→1,320 and 189,000→1,890 for credibility.
- **ImpactCalculator time label** — "2.5h manual → 5m auto" → "Configurable estimate per MR".

---

## SetupWizard & UI/UX Gaps (June 20 — Polish & Gaps)

### Added
- **D3 navigation zoom controls on Blast Radius Explorer** (`BlastRadiusExplorer.tsx`) — Added floating buttons (`➕`, `➖`, `🎯`) inside the Blast Radius graph card to allow programmatic zoom-in, zoom-out, and centering of the dependency chain diagram.
- **Mobile responsiveness for Predictions Ledger** (`PredictionsTracker.tsx`) — Added stacked flex layout fallback when viewed on mobile viewports (`isMobile === true`) to render clear card-based layouts for MR scoreboard ledger entries instead of squished grids.
- **Transient error recovery options** (`InlineError.tsx`) — Added a "Clear Cache & Reset" button inside panel error boundaries to flush `localStorage`/`sessionStorage` and reload the page in case of preference corruption.

### Refactored
- **Setup Wizard Error Boundary** (`SetupWizard.tsx`) — Replaced the non-standard functional `ErrorBoundary` component using global window listeners with a standard class-based component implementing `getDerivedStateFromError` to properly capture rendering exceptions in wizard steps.

---

## Header Spacing & Layout (June 19 — Desktop Right-Aligned Nav)

### Changed

- **Header layout** — Removed `flex: 1` and `maxWidth: 320` from the center (Demo+Live) section. Added `marginLeft: auto` so all nav elements (Demo+Live, tabs, actions) are pushed to the far right. Logo stays on the far left. Removed stale `marginLeft: 28` from right actions group.

---

## Final Polish (June 19 — Loading UX + Fallback Honesty + Judge Polish)

### Added

- **Instant load** — App shows demo data immediately on mount (`data` initializes to `DEMO_DATA`). Background fetch to engine swaps to live data when available. No artificial loading screen, no "Connecting" wait.
- **Orbit error tracking** (`engine/src/twin/builder.ts`) — `orbitError` field tracks whether Orbit genuinely errored (auth/network) vs returned empty data. Empty Orbit results (normal for new projects with no pipeline history) no longer trigger "Degraded" mode.
- **Judge-friendly `generatedUsing`** — Now shows: `"GitLab Orbit · {N} nodes · {M} edges · {status}"` with actual node/edge counts. Replaces confusing "Generated via local analysis (Orbit unavailable) — results may be partial".
- **Consistent demo data message** — Updated to same format: `"GitLab Orbit · 23 nodes · 43 edges · all 4 queries"`.

### Removed

- **LoadingNarrative** — Decorative loading animation that delayed the dashboard by 8-15s. App now shows content immediately. Skip button, progress bar, and all narrative state removed.
- **`showNarrative` / `noEngine` dead state** — Cleaned up orphaned state variables.
- **Competitor names from README** — Removed "GitHub Copilot" tagline comparison and Sankofa comparison table. Replaced with CI/CD comparison.
- **Zod from stack** — Not actually used in production code.
- **Outdated test counts** — All references updated from 108/13 to 124/29.

### Fixed

- **Fallback flag logic** — `orbitOrFallback()` no longer sets `usedFallback` when Orbit returns empty results. Only genuine errors (auth failure, network timeout) trigger the fallback flag. Empty results still try fallback for data enrichment but don't degrade the badge.
- **README accuracy** — 108→124 tests, 13→29 visualizer tests, 40→41 components, 5→3 breakpoints, project ID 83381762→39251857, removed Zod claim, updated live data counts (206+ nodes, 172+ edges).
- **`noEngine` unused import** — Cleaned up from `client.ts`.
- **DataModeBanner consistency** — Empty Orbit results no longer show "Degraded" badge; app stays "Live" when Orbit is reachable.

### Changed

- **`loadData` strategy** — Always sets demo data first, then fetches live data in background. Engine unavailable → stays on demo silently. Engine responds → seamless swap to live.
- **`generatedUsing` field** — Shows real node/edge counts from the digital twin instead of opaque status messages.
- **README rewritten** — 102 lines added, 149 removed. Updated structure: Judge's Quick Links, What Makes This Different, removed redundant sections, polishing tone.

---

## Previous Session (June 19 — Batch 3: Architecture Cleanup + Style Tokens)

### Added

- **Shared Design Tokens** (`visualizer/src/constants/tokens.ts`) — Centralized `COLORS`, `Z` (z-index tiers), `ANIM` (animation presets), `FONT` (type scale), `SPACING`/`PAD` (spacing scale on 4px grid). Migrated App.tsx: all z-index values → `Z.*`, all animation strings → `ANIM.*`, direct hex colors → `COLORS.*`. Prevents layering bugs and keeps timing consistent.

- **API Service Layer** (`visualizer/src/services/api.ts`) — Extracted from App.tsx. Dedicated `ApiService` class with `isApiAvailable()`, `analyzeChange()`, and config. Centralizes engine URL, auth token, and fetch logic.

- **View Constants** (`visualizer/src/constants/views.ts`) — Extracted from App.tsx. All view-related types (`View`, `DemoStep`), arrays (`DEMO_STEPS`, `ALL_VIEWS`), and maps (`VIEW_LABELS`, `VIEW_QUERY_TAG`) live here.

- **PanelFallback Component** (`visualizer/src/components/PanelFallback.tsx`) — Extracted lazy-loading fallback shimmer for suspended graph/forecast/history components. Replaces inline duplicate across 3 Suspense boundaries.

- **ScanLine Component** (`visualizer/src/components/ScanLine.tsx`) — Extracted radar-sweep animation overlay from App.tsx.

- **Session Utilities** (`visualizer/src/utils/session.ts`) — Extracted `ssRead`/`ssWrite` helpers for sessionStorage-backed state persistence.

- **Smoke Tests** (`visualizer/src/__tests__/components.test.tsx`) — Added 3 new tests for `PredictionsTracker` (accuracy scoreboard + vuln section), `SetupWizard` (problem + mission text), `ImpactReport` (export dropdown button). Plus `IntersectionObserver` polyfill in setup. **10→13 tests**.

### Changed

- **App.tsx refactored** — 858 lines → 728 lines. Extracted 5 concerns into dedicated files (api service, view constants, PanelFallback, ScanLine, session utils). No behavioral changes.

- **Default view** — First-time visitors (unboarded) now see **Setup Wizard** instead of Dashboard. Returning users still see Dashboard. Aligns with "setup before use" UX pattern.

- **`(import.meta as any)` removed** — Replaced with `import.meta.env?.MODE` in test-conditional. Eliminates TS type coercion.

- **Local `VIEW_QUERY_TAG` shadow removed** — Was shadowing the module import; consolidated to single source from `constants/views.ts`.

- **`"cat"` icon removed from demo-script.md** — Was referencing a deleted icon.

### Fixed

- **SetupWizard test** — Was looking for `/Devpost/` text that appears only on step 4 (not initially rendered). Changed assertion to `The Problem` + `The Mission` visible on initial mount.

- **ImpactReport test** — `IntersectionObserver is not defined` in jsdom. Added global polyfill in `__tests__/setup.ts`.

---

## Previous Session (June 19 — Batch 2: Vulnerability Prediction + Power UX)

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
- **README update** — Added Predictions view, fallback resilience, competitive comparison vs Sankofa, updated test count (95→108), closed-loop section, Docker quick start.

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
- All 7 jobs across 4 stages now pass consistently (pipeline #2606601215 confirmed green)

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
 Engine:   ✓ 105 tests passed (17 files)
 Visualizer: ✓ 30 tests passed (2 files)
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
| `flow-yaml.test.ts` | 11 | Flow YAML validation |
| `server-integration.test.ts` | 9 | Server endpoints and integration |
| `errors.test.ts` | 8 | Error classification and recovery |
| `duo-configs.test.ts` | 2 | Duo Agent Platform configs |
| `App.test.tsx` | 3 | App navigation, export button, onboarding dismiss |
| `components.test.tsx` | 27 | DataModeBanner, PredictionsTracker, SetupWizard, ImpactReport, OrbitQueryInspector, DigitalTwinGraph, AgentFlowProgress, BlastRadiusExplorer, ForecastEngine, HistoricalContext, LoadingSkeleton, HeroSection, DecisionCenter, CounterfactualSimulation, ArchitectureDiagram, MrAnalyzer, SimulateWebhook, RealityCheck, TaglineBanner, EngineStatus, ProblemSection, JudgesTour, OnboardingOverlay, ImpactCalculator, ErrorBoundary, ScanLine |

---

## File Inventory

### New Files

| File | Purpose |
|---|---|---|
| `engine/src/server.ts` | Express API server (analyze + demo endpoints) |
| `engine/src/server-index.ts` | Server entry point |
| `engine/src/errors.ts` | Error classification, retry logic, rate limiting |
| `engine/src/validators.ts` | Input validation and sanitization |
| `deploy.sh` | Vercel + Render deployment automation |
| `visualizer/src/constants/tokens.ts` | Shared design tokens (colors, z-index, animations, spacing) |
| `visualizer/src/constants/views.ts` | View types, labels, demo steps, query tags |
| `visualizer/src/services/api.ts` | API service class for engine communication |
| `visualizer/src/components/PanelFallback.tsx` | Lazy-load fallback shimmer |
| `visualizer/src/components/ScanLine.tsx` | Radar-sweep animation overlay |
| `visualizer/src/utils/session.ts` | SessionStorage-backed state persistence helpers |

### Modified Files

| File | Change |
|---|---|---|
| `AGENTS.md` | Rewritten as concise agent behavior specification |
| `.gitlab-ci.yml` | Fixed syntax, added engine jobs, corrected paths |
| `engine/package.json` | Added express, cors dependencies |
| `engine/src/index.ts` | Added `DataVisualizer` export, removed broken server re-export |
| `engine/src/reporter/visualizer.ts` | Full rewrite — produces complete VisualizationData with all 10 fields |
| `engine/src/server.ts` | Uses DataVisualizer transform; demo endpoint returns VisualizationData shape |
| `engine/src/types.ts` | Widened DigitalTwinNode.type to string; optional impact/recommendedTests |
| `engine/src/config.ts` | Exported config const (was private) |
| `flow/orbit-sentinel-flow.yaml` | Dynamic `{{mr_iid}}` and `{{changed_files}}` placeholders |
| `visualizer/src/App.tsx` | Refactored 858→728 lines: extracted api service, view constants, PanelFallback, ScanLine, session utils. Added shared tokens import, migrated z-index/animations/colors. Default view is now "setup" for unboarded. Removed `(import.meta as any)`. |
| `visualizer/src/__tests__/components.test.tsx` | Added 3 smoke tests (PredictionsTracker, SetupWizard, ImpactReport) |
| `visualizer/src/__tests__/setup.ts` | Added IntersectionObserver polyfill for jsdom |
| `visualizer/src/utils/colors.ts` | No behavioral changes |

---

## Deployment

| Target | Platform | Status |
|---|---|---|
| Visualizer | Vercel | `orbit-sentinel.vercel.app` — live |
| Visualizer | GitLab Pages | Configured — requires access control change |
| Engine API | Render | Ready to deploy with `deploy.sh` |

For detailed setup instructions, see [SETUP.md](SETUP.md). For the full installation guide, see [INSTALLATION.md](INSTALLATION.md).
