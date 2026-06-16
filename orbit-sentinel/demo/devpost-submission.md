# Orbit Sentinel — Engineering Digital Twin

> GitHub Copilot predicts code. Orbit Sentinel predicts consequences.

## What We Built

Orbit Sentinel is an autonomous engineering digital twin that uses **GitLab Orbit** to predict merge request impact before deployment. When a developer opens an MR, it builds a digital twin of the software system — discovering blast radius, historical incidents, reviewer ownership, and rollback strategies — then posts a complete impact analysis.

### The Workflow (8 steps, 4 Orbit query types)

1. **Schema Discovery** — `get_graph_schema` to understand the Orbit ontology
2. **Blast Radius** — `NEIGHBORS` queries across 4 system layers
3. **Dependency Chains** — `PATH_FINDING` queries to trace to production
4. **Historical Context** — `TRAVERSAL` queries with similarity scoring
5. **Pipeline Risk** — `AGGREGATION` queries for failure rates
6. **Prediction** — Probability × severity scoring
7. **Post Report** — Complete impact analysis as MR comment
8. **Label MR** — Risk tag applied automatically

All four Orbit query types are used. Every conclusion cites specific query evidence.

### Interactive Visualizer

The React/D3 dashboard (6 views, interactive controls):

- **Auto-Play Demo** — Press Space or click "Play Demo" to cycle all 6 views with overlay explanations
- **Interactive Counterfactual** — Click any mitigation bar to see risk animate down in real time
- **Clickable Graph** — Click any node for a detail panel showing type, risk level, and connections
- **URL Params** — `?view=blast-radius` or `?demo=true` for direct access
- **GitLab Pages** — Accessible at a URL (no local install needed)

### Architecture

```
GitLab MR → Duo Agent Platform Flow
  → 8-step v1 agent workflow
  → 4 Orbit query types (NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION)
  → post_mr_comment + add_label
  → Visualizer dashboard (React/D3)
```

The engine is a TypeScript library with: Orbit API client, digital twin builder, change simulator, risk engine, remediation planner, and markdown reporter.

## How We Built It

- **Flow:** v1 single-agent flow on GitLab Duo Agent Platform with 4 tools (query_graph, get_graph_schema, post_mr_comment, add_label)
- **Visualizer:** React 18 + D3.js + TypeScript. Premium dark UI with glassmorphism, gradient accents, glow effects
- **Engine:** TypeScript library — 12 pre-built queries, digital twin builder, risk engine, change simulator
- **Skill:** 6 pre-built query recipes covering all 4 query types
- **CI/CD:** GitLab Pages deployment via `.gitlab-ci.yml`
- **Duo Chat:** Skill defined at `.gitlab/duo/skill.yml` with MCP integration

## What's Next

- **Publish to AI Catalog** so any GitLab project can install Orbit Sentinel
- **Real-time dependency graph streaming** from Orbit queries
- **Multi-agent pipeline** once platform supports cross-component references
- **Extended counterfactual** with user-defined mitigation scenarios

## Links

- **GitLab Project:** https://gitlab.com/gitlab-ai-hackathon/transcend/39251857
- **Visualizer (Pages):** https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/
- **Visualizer (local):** `cd visualizer && npm run dev` → http://localhost:5173
- **Auto-Demo:** http://localhost:5173/?demo=true
- **AI Catalog Agent:** [Published as "Orbit Sentinel"]
- **Demo Video:** [YouTube link]

## Screenshots

[Overview — Hero prediction, Orbit evidence, Decision center, Counterfactual simulation, Incident intelligence, Digital Twin graph]
[Blast Radius Explorer — Interactive dependency explorer]
[Risk Heatmap — 5-dimension risk breakdown]
[What-If Simulation — Counterfactual risk analysis]
[Historical Context — Repository memory with similarity scores]
[Full Impact Report — Complete formatted output]

## Built For

GitLab Transcend Hackathon — Showcase Track

**License:** MIT
