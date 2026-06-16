# 🛰️ Orbit Sentinel — Engineering Digital Twin

> GitHub Copilot predicts code. Orbit Sentinel predicts consequences.

## What We Built

Orbit Sentinel is an **autonomous engineering digital twin** that uses **GitLab Orbit** to predict merge request impact before deployment. When a developer creates a merge request or pushes a new commit, the flow automatically activates, builds a digital twin of the software system — discovering blast radius, historical incidents, reviewer ownership, and rollback strategies — then posts a complete impact analysis on the MR.

### The Problem

Every merge request asks: *Who else will this break? Has this failed before? Who should review? What's the rollback plan?* Most teams answer these manually, if at all. Orbit Sentinel answers them automatically — with evidence from the Orbit knowledge graph.

### How It Works (8 steps, 4 Orbit query types)

1. **Schema Discovery** — `get_graph_schema` to understand the Orbit ontology
2. **Blast Radius** — `NEIGHBORS` query to find all connected nodes
3. **Dependency Chains** — `PATH_FINDING` to trace paths to production
4. **Historical Context** — `TRAVERSAL` query with similarity scoring (50+ MRs matched)
5. **Pipeline Risk** — `AGGREGATION` query for failure rates (23,547 failed pipelines across 132k total)
6. **Analysis & Prediction** — Probability × severity scoring
7. **Post Report** — Complete impact analysis via `create_merge_request_note`
8. **Complete** — Return execution result; flow stops

All four Orbit query types are used. Every conclusion cites specific query evidence.

### Live Test Results

The agent was tested via GitLab Duo Flow and successfully ran **live Orbit queries** against the actual project. On the 10th session (June 16), the flow ran all 4 query types and **posted a complete analysis report as an MR comment** via `create_merge_request_note`. Results:

| Query Type | Entities Discovered |
|---|---|---|
| NEIGHBORS | 100 MR nodes, 100 Pipeline edges |
| PATH_FINDING | MR-to-pipeline deployment trace |
| TRAVERSAL | 50+ historical MRs (90% abandonment rate detected) |
| AGGREGATION | 132,059 total pipelines — 17.8% failure rate |

Risk Score: **5.5/10 (MEDIUM)** — Top risks: empty diff (no changes), no head pipeline, 9/10 prior MRs from same branch closed

### Interactive Visualizer

The React/D3 dashboard (6 views, auto-play demo):
- **Space bar** to start/stop auto-play, or `?demo=true` for auto-load
- **Future Timeline**: day-by-day engineering forecast (D+0 to D+7) from digital twin predictions
- **Interactive counterfactual**: click any mitigation bar to see risk animate down
- **Clickable graph**: click any node for detail (type, risk level, connections)
- **Evidence panel**: every claim links to the specific Orbit query that produced it
- **URL params**: `?view=blast-radius` or `?view=risk` for direct access
- **GitLab Pages**: deployed at a live URL — no local install needed

### Architecture

```
Merge Request opened / new commit
    │
    ▼
GitLab Duo Agent Flow (8 steps)
    │
    ├── get_graph_schema  ──→ Orbit Schema
    ├── query_graph       ──→ NEIGHBORS + PATH_FINDING + TRAVERSAL + AGGREGATION
    └── create_merge_request_note ──→ Full report on MR
    │
    ▼
Visualizer Dashboard (React 18 + D3.js + Vite)
    └── GitLab Pages
```

The engine is a TypeScript library with: Orbit API client, digital twin builder, change simulator, risk engine, similarity engine (Jaccard), remediation planner, rollback strategist, test generator, and markdown reporter — **52 unit tests across 11 test files**.

## How We Built It

- **Flow:** v1 AgentComponent flow on GitLab Duo Agent Platform with platform tools (`get_graph_schema`, `query_graph`, `create_merge_request_note`)
- **Visualizer:** React 18 + D3.js + Vite + TypeScript. Premium dark UI with glassmorphism, gradient accents, glow effects, custom scrollbars, 9 CSS animations
- **Engine:** TypeScript library — 13 Orbit query methods, digital twin builder, risk engine with configurable thresholds, change simulator, Jaccard similarity engine
- **Skill:** 6 pre-built query recipes covering all 4 query types in `skills/orbit-sentinel/recipes/`
- **CI/CD:** GitLab Pages deployment via `.gitlab-ci.yml` — auto-builds on push to main
- **Duo Chat:** Skill defined at `.gitlab/duo/skill.yml` with MCP integration
- **MCP:** `.gitlab/duo/mcp.json` connects flow to `query_graph` and `get_graph_schema` tools

## What's Next

- **Publish to AI Catalog** so any GitLab project can install Orbit Sentinel
- **Real-time dependency graph streaming** from Orbit queries via WebSocket
- **Multi-agent pipeline** once the platform supports cross-component references
- **Extended counterfactual** with user-defined mitigation scenarios

## Links

- **GitLab Project:** https://gitlab.com/gitlab-ai-hackathon/transcend/39251857
- **Visualizer (Pages):** https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/
- **Visualizer (Auto-Demo):** https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/?demo=true
- **Visualizer (local):** `cd visualizer && npm run dev`
- **Auto-Demo (local):** http://localhost:5173/?demo=true
- **AI Catalog Agent:** [Publishing as "Orbit Sentinel" — Settings > AI Catalog > Publish]
- **Demo Video:** [YouTube link — see demo/demo-script.md]

## Screenshots

Screenshots to capture from the visualizer (`?demo=true` auto-cycles through all 6):
1. **Overview** — Hero prediction (risk level, score, recommendation) + Orbit evidence panel + Decision center + Counterfactual simulation + Incident intelligence + Digital Twin graph
2. **Blast Radius Explorer** — Interactive dependency graph showing affected files and services
3. **Risk Heatmap** — 5-dimension risk breakdown with scoring bars
4. **What-If Simulation** — Counterfactual bars showing risk reduction per mitigation
5. **Historical Context** — Past incident cards with similarity percentage badges
6. **Impact Report** — Full formatted output with all 8 sections

See `demo/demo-script.md` for the exact 3-minute video walkthrough.

## Built For

GitLab Transcend Hackathon — Showcase Track

**License:** MIT
