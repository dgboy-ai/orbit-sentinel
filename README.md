# Orbit Sentinel — Engineering Digital Twin

> GitHub Copilot predicts code. Orbit Sentinel predicts consequences.

[![Tests](https://img.shields.io/badge/tests-95%20passing-brightgreen?logo=vitest)](https://gitlab.com/gitlab-ai-hackathon/transcend/39251857/-/pipelines)
[![Vercel](https://img.shields.io/badge/live%20demo-Vercel-000?logo=vercel)](https://orbit-sentinel.vercel.app)
[![GitLab AI Hackathon](https://img.shields.io/badge/GitLab%20AI%20Hackathon-2026-orange?logo=gitlab)](https://gitlab.com/gitlab-ai-hackathon)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Judge's Tour](https://img.shields.io/badge/judge-tour-purple?logo=react)](https://orbit-sentinel.vercel.app/?judge=true)

**Orbit Sentinel** is an autonomous engineering digital twin powered by GitLab Orbit. Paste any GitLab MR URL into the visualizer to build a living model of the affected software system — discovering blast radius, historical incidents, ownership, deployment dependencies, and rollback strategies — with a complete impact analysis across 7 dashboard views. A Duo Agent Platform flow is also included for fully autonomous MR posting.

---

## 🏆 Live Orbit Queries — Proven

Live Orbit API queries against indexed project `gitlab-ai-hackathon/transcend/39251857` (GitLab ID **83381762**):

| Query | Findings |
|-------|----------|
| `get_graph_schema` | 18 node types, ~45 relationship types discovered |
| Digital Twin Builder (4 query types) | **14 nodes, 13 edges** across 7 node types per MR analysis |
| Risk Signals | 3 High (bus factor, no coverage, no reviewers), 2 Medium |

[Full traversal results →](orbit-sentinel/docs/orbit-traversal-results.md)

---

## 📋 Judge's Quick Links

| Document | What It Shows |
|----------|---------------|
| [Live Demo](https://orbit-sentinel.vercel.app) | Interactive 7-view dashboard — setup wizard, blast radius, risk, simulation, history, report |
| [Judge's Tour](https://orbit-sentinel.vercel.app/?judge=true) | Guided walkthrough — press Space for auto-demo, ← → to navigate |
| [Demo Script](orbit-sentinel/demo/demo-script.md) | 3-minute walkthrough — follow along with the live site |
| [Devpost Submission](orbit-sentinel/demo/devpost-submission.md) | Full entry: problem, solution, architecture, quantified impact |
| [Sample MR Note](orbit-sentinel/demo/output/sample-impact-report.md) | What the agent posts on a real merge request |
| [Orbit Traversal Proof](orbit-sentinel/docs/orbit-traversal-results.md) | Raw results from live Orbit queries on the hackathon project |
| [Flow YAML](orbit-sentinel/flow/orbit-sentinel-flow.yaml) | The 8-step Duo Agent Platform workflow |
| [Changelog](orbit-sentinel/CHANGELOG.md) | Full history of features, fixes, polish |
| [Agent Instructions](orbit-sentinel/AGENTS.md) | How the digital twin behaves, error handling, output format |

---

## MR Analysis — Core Capability

### Paste Any GitLab MR URL

The **MR Analyzer** panel accepts any GitLab merge request URL — it parses the project path and MR ID, fetches changed files via the engine's CORS proxy, then runs all 4 Orbit query types against the affected files.

**Live analysis flow:**
1. Paste MR URL → auto-extracts `project` + `MR IID`
2. Engine fetches changed files from GitLab API (up to 5 files, no CORS issues)
3. DigitalTwinBuilder executes NEIGHBORS + PATH_FINDING + TRAVERSAL + AGGREGATION
4. Results merged into unified graph (nodes + edges) → 7 dashboard views populate
5. Success toast confirms: "✓ Analysis complete — MR !X"

**No token required** for basic analysis. Optional GitLab personal access token (`glpat-xxx`, `read_api` scope) enables richer file content retrieval — sent once, discarded after.

### 3 Pre-Configured Quick Demos

| Scenario | What It Shows | Risk |
|----------|---------------|------|
| 🔴 **Critical Risk** | Pipeline failed, 7 downstream services at risk, no rollback plan | 88% |
| 🟡 **Medium Risk** | Empty diff, no pipeline, abandoned branch pattern — needs attention | 55% |
| 🟢 **Low Risk** | All tests pass, reviewers approved, no downstream impact | 15% |

Each populates all 7 views with realistic, interconnected data — blast radius, risk breakdown, counterfactuals, historical incidents, timeline, and deployment decision.

### MR URL Validation

Input field validates against `gitlab.com/\<project\>/-/merge_requests/\<digits\>` with live format indicator badge.

---

## Architecture

```mermaid
flowchart TD
    MR["📝 MR Opened"] --> FLOW

    subgraph FLOW["Duo Agent Flow (8 steps)"]
        direction TB
        S1["1. get_graph_schema"] --> S2["2. NEIGHBORS"] --> S3["3. PATH_FINDING"] --> S4["4. TRAVERSAL"] --> S5["5. AGGREGATION"]
        S5 --> S6["6. Compose Report"] --> S7["7. Post MR Note"] --> S8["8. Complete"]
    end

    FLOW --> NOTE["📋 MR Note Posted"]

    subgraph ENGINE["Engine (TypeScript · Express · Render)"]
        direction TB
        E0["DigitalTwinBuilder"] --> E1["Orbit API Proxy\n(app.orbit.dev)"]
        E1 --> E2["Risk Scoring"]
        E2 --> E3["Remediation Planner"]
        E3 --> E4["Markdown Reporter"]
        E1 -.-> GITLAB["GitLab API Proxy\n(/api/probe-mr-files)\nCORS-safe file fetching"]
    end

    subgraph VIZ["Visualizer (React · D3 · Vite · Vercel)"]
        direction TB
        V1["MrAnalyzer Card\n(Gradient/Glow/Pulse)"] --> V2["3 Quick Demo\nScenarios"]
        V2 --> V3["2-Column Layout\n(Query Log + Problem)"]
        V3 --> V4["7 Dashboard Views\n+ Mobile Responsive"]
    end

    MR -.-> GITLAB
    VIZ --> ENGINE
    ENGINE --> VIZ
```

Every conclusion cites specific Orbit query evidence. No black box.

---

## Mobile Support — Fully Responsive

The visualizer adapts across 5 breakpoints for desktop, tablet, and phone:

| Breakpoint | Behavior |
|---|---|
| >1100px | Full 5-column grid, all query type tags visible |
| 900–1100px | Grids collapse to 2-column, scrollable nav, "4 Queries" tag hidden |
| 768–900px | Compact cards, responsive hero column, graph info overlay shrinks, scrollable nav with hidden scrollbar for touch |
| 480–768px | Single column grids, stacked layout, "mobile bar" elements hidden |
| <360px (tiny) | Tab bar replaced with dropdown menu, full-width elements, ultra-compact sizing |

Touch-friendly: `-webkit-overflow-scrolling: touch`, hidden scrollbar on nav, responsive button sizing.

---

## Quick Start

```powershell
.\setup.ps1        # One command — install, build, start → http://localhost:5173
```

**Live demo**: [orbit-sentinel.vercel.app](https://orbit-sentinel.vercel.app) — interactive dashboard with 7 views, auto-play, and what-if simulation.

---

## Visualizer Views (All 4 Orbit Query Types)

| View | What It Shows |
|------|---------------|
| **Overview** | Impact Calculator (interactive ROI sliders), hero prediction, evidence panel, decision center, counterfactual simulation, digital twin graph |
| **Setup** | 4-step guided journey — Mission → Architecture → Setup → Launch. Copy commands, Devpost checklist |
| **Blast Radius** | Interactive dependency explorer with depth control — click nodes to inspect (NEIGHBORS) |
| **Risk** | 5-dimension risk breakdown with probability bars — click mitigations to see risk animate down (AGGREGATION) |
| **Simulation** | Counterfactual analysis with timeline — what if we roll back? add tests? notify owners? |
| **History** | Repository memory with Jaccard similarity scoring — has this failed before? (TRAVERSAL) |
| **Report** | Full formatted MR comment output — ready to copy into the MR thread |

---

## Details

**Flow** — 8-step Duo Agent Platform workflow at [`flow/orbit-sentinel-flow.yaml`](orbit-sentinel/flow/orbit-sentinel-flow.yaml) using all 4 Orbit query types (NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION). Configured to trigger on MR open and new commits, with a `create_merge_request_note` step to post analysis results directly to the MR thread. Ready to deploy — needs a Maintainer token to publish to AI Catalog.

**Engine** — Express server at `orbit-sentinel/engine/` deployed on **Render** (TypeScript, 75 tests). Key components:

- **DigitalTwinBuilder** — orchestrates all 4 Orbit query types per MR, merges results into a unified graph (nodes + edges). Parses Orbit API 2.1.0 `result.nodes`/`result.edges` format.
- **Orbit API Proxy** — forwards queries to `app.orbit.dev`, handles rate limiting with exponential backoff
- **CORS Proxy** — `/api/probe-mr-files` fetches changed file contents from GitLab without browser CORS issues
- **GitLab Token Passthrough** — users provide `glpat-xxx` in the UI, sent once per analysis, discarded after
- **Rate Limiting** — `MAX_CHANGED_FILES` capped at 5 per MR, 500ms throttle between file iterations (reduces Orbit queries from 107 to 23 per analysis)
- **Debug Endpoint** — `/api/raw-orbit` for ad-hoc Orbit query exploration

**Duo Integration** — [Skill definition](orbit-sentinel/.gitlab/duo/skill.yml) for Duo Chat, [MCP config](orbit-sentinel/.gitlab/duo/mcp.json) for agent platform, [query recipes](orbit-sentinel/skills/orbit-sentinel/recipes/) with 6 ready-to-use JSON examples.

**Stack** — Node 22+, TypeScript 5.5, React 18, D3.js, Vite 5.3, Express, Zod, Vitest.

| Status |
|--------|
| Deployed | Visualizer on [Vercel](https://orbit-sentinel.vercel.app), engine on [Render](https://orbit-sentinel.onrender.com) |
| Tests | **95 passing** (75 engine + 10 visualizer + 10 integration/flow) |
| Live Orbit Data | Engine returns real graph data for project ID **83381762** (14 nodes, 13 edges per MR) |
| Quick Demos | 3 pre-configured risk scenarios (Critical 🔴, Medium 🟡, Low 🟢) |
| UI Polish | Gradient glow card, pulsing live badge, success toast, 2-column query log layout, MR ID validation, neon borders |
| 🧮 Impact Calculator | Interactive ROI sliders with animated metrics — adjust MRs/week, hourly rate, manual hours |
| ⚡ Setup Wizard | 4-step guided journey with copyable commands and Devpost launch checklist |
| 📱 Mobile | 5 breakpoints to 360px, touch scrolling, dropdown nav on tiny screens, collapsible grids |
| ⏳ AI Catalog | Needs Maintainer token — run `glab skills publish` |
| ⏳ Demo video | Needs recording (≤3 min) — [script](orbit-sentinel/demo/demo-script.md) ready |
| 📖 Docs | [`docs/`](orbit-sentinel/docs/) — traversal proof, deployment guide |

---

## UX Highlights

| Feature | Details |
|---------|---------|
| **Gradient glow card** | Purple gradient background, `0 0 30px` neon glow shadow, corner radial decoration, grid dot pattern |
| **Pulsing live badge** | Green dot with `pulseDot` animation + "Engine Live" label when engine is reachable |
| **Success toast** | Green banner "✓ Analysis complete — MR !X" fades in for 5s |
| **2-column layout** | Query log + architecture diagram on left, problem section + impact calculator on right |
| **MR validation** | Input shows visual format indicator when URL matches `gitlab.com/\<project\>/-/merge_requests/\<digits\>` |
| **Gradient button** | Purple gradient background; hover glow effect |

---

## Built For

[GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/) — Showcase Track · MIT License
