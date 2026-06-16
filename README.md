# 🛰️ Orbit Sentinel

**An autonomous engineering digital twin that predicts merge request impact before code reaches production.**

GitHub Copilot predicts code. Orbit Sentinel predicts consequences.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitLab Project](https://img.shields.io/badge/GitLab-Transcend%20Hackathon-fc6d26?logo=gitlab)](https://gitlab.com/gitlab-ai-hackathon/transcend/39251857)
[![GitLab Pages](https://img.shields.io/badge/Visualizer-Live-22c55e?logo=gitlab)](https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/)
[![Built for](https://img.shields.io/badge/Built%20for-GitLab%20Orbit-3b82f6)](#)

---

## The Problem

Every merge request asks the same questions:

- **Who else will this break?**
- **Has this failed before?**
- **Who should review this?**
- **What's the rollback plan?**

Most teams answer these manually, if at all. Orbit Sentinel answers them automatically — by building a **digital twin of your software system** using GitLab Orbit.

When a developer mentions `@ai-orbit-sentinel` on an MR, the flow activates: it queries the Orbit knowledge graph using all four query types, simulates the change impact, and posts a complete analysis report back on the MR — with evidence, historical context, and actionable remediation.

---

## Architecture

```
Merge Request → @mention
    │
    ▼
┌───────────────────────────────────────────┐
│          GitLab Duo Agent Flow             │
│                                           │
│  Step 1  Schema Discovery  (get_graph_schema)       │
│  Step 2  Blast Radius     (NEIGHBORS query)        │
│  Step 3  Dependency Chain (PATH_FINDING query)     │
│  Step 4  Historical Match (TRAVERSAL query)        │
│  Step 5  Pipeline Risk    (AGGREGATION query)      │
│  Step 6  Analysis & Prediction                     │
│  Step 7  Post Report      (post_mr_comment)        │
│  Step 8  Label MR         (add_label)              │
│                                           │
└──────────────────────┬────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   Visualizer Dashboard   │
        │   (React + D3.js)        │
        │   → GitLab Pages         │
        └──────────────────────────┘
```

All four Orbit query types are used. Every conclusion cites specific query evidence.

---

## Components

| Component | Location | Stack | Purpose |
|---|---|---|---|
| **Flow** | `flow/orbit-sentinel-flow.yaml` | GitLab Duo Agent Platform v1 | 8-step agent workflow with 4 tools |
| **Engine** | `engine/` | TypeScript, Zod, Vitest | Orbit client, digital twin builder, risk engine, remediation planner |
| **Visualizer** | `visualizer/` | React 18, D3.js, Vite, TypeScript | Interactive 6-view dashboard with auto-play demo |
| **Skill** | `skills/orbit-sentinel/` | GitLab Duo Chat Skill | 6 pre-built query recipes for all 4 query types |
| **CI/CD** | `.gitlab-ci.yml` | GitLab Pages | Auto-builds and deploys visualizer on push to main |
| **MCP** | `.gitlab/duo/mcp.json` | GitLab Orbit MCP | Connects flow to `query_graph` and `get_graph_schema` tools |

---

## Quick Start

### 1. Install the flow

Go to **Settings → AI → Flows** in your GitLab project, create a new flow, and paste the contents of `flow/orbit-sentinel-flow.yaml`. Enable the **Mention** trigger.

### 2. Install the skill (optional, for Duo Chat)

```bash
glab skills install --global orbit-sentinel
```

### 3. Run the visualizer (local)

```bash
cd visualizer
npm install
npm run dev
# Open http://localhost:5173/?demo=true
```

### 4. Test the flow

On any merge request, comment:

```
@ai-orbit-sentinel analyze this MR
```

The flow builds a digital twin, runs all 4 Orbit query types, and posts a full impact report.

---

## Visualizer

The React + D3 dashboard shows 6 analysis views with an auto-play demo mode:

| View | What It Shows |
|---|---|
| **Overview** | Hero prediction, Orbit evidence panel, decision center, risk heatmap, incident intelligence, interactive digital twin graph |
| **Blast Radius** | Interactive dependency explorer — click nodes to inspect |
| **Risk Heatmap** | 5-dimension risk breakdown with scoring |
| **What-If Simulation** | Counterfactual analysis — click mitigations to see risk animate down |
| **Historical Context** | Past incidents and MRs with similarity scores |
| **Impact Report** | Full formatted MR comment output |

Press **Space** to start/stop the auto-play demo, or visit `?demo=true` for auto-load.

---

## Orbit Query Recipes

Six pre-built query recipes in `skills/orbit-sentinel/recipes/`:

| Recipe | Query Type | Use Case |
|---|---|---|
| `blast-radius.json` | NEIGHBORS | Find everything connected to a changed file |
| `dependency-chain.json` | PATH_FINDING | Trace dependency paths between files |
| `deployment-impact.json` | TRAVERSAL | Map files to their deployment targets |
| `historical-similarity.json` | TRAVERSAL | Find past MRs that modified the same files |
| `ownership-discovery.json` | NEIGHBORS | Find teams and users who own files |
| `pipeline-risk.json` | AGGREGATION | Count pipeline failures by project |

---

## Engine

The TypeScript engine at `engine/` provides:

- **OrbitClient** — Full Orbit API wrapper (traversal, aggregation, path_finding, neighbors)
- **DigitalTwinBuilder** — Constructs a digital twin from multiple Orbit queries
- **ChangeSimulator** — Simulates MR impact across the dependency graph
- **RiskEngine** — Computes aggregate risk scores with configurable thresholds
- **SimilarityEngine** — Jaccard-based historical match scoring
- **MarkdownReporter** — Generates professional-formatted MR comments
- **RemediationPlanner** — Prioritizes remediation suggestions
- **RollbackStrategist** — Generates rollback plans by risk level

```bash
cd engine
npm install
npm test    # 52 tests across 11 test files (Vitest)
```

---

## Demo Video

[![Orbit Sentinel Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-ff0000?logo=youtube)](https://youtube.com)

3-minute walkthrough:
- **0:00** — Developer opens an MR and mentions `@ai-orbit-sentinel`
- **0:15** — Visualizer auto-play cycles through all 6 analysis views
- **0:30** — Orbit Evidence panel shows all 4 query types with real results
- **0:50** — Interactive counterfactual — click mitigations to see risk drop
- **1:05** — Historical incident matches with similarity scores
- **1:20** — Decision Center with reviewer and rollback recommendations
- **1:35** — Interactive D3 digital twin graph — click nodes for details
- **2:00** — Full report posted on the MR with all 8 sections

---

## License

MIT — see [LICENSE](LICENSE).

Built for the [GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/) by [@trueboy1123](https://gitlab.com/trueboy1123).
