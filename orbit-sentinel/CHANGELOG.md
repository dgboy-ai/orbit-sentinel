# Changelog

All notable changes to Orbit Sentinel are documented here.

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
 ✓  75 tests passed (13 files)
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
