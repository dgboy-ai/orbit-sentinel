# Orbit Sentinel

**An autonomous engineering digital twin that predicts merge request impact before code reaches production.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitLab Project](https://img.shields.io/badge/GitLab-Transcend%20Hackathon-fc6d26?logo=gitlab)](https://gitlab.com/gitlab-ai-hackathon/transcend/39251857)
[![Live Demo](https://img.shields.io/badge/Demo-Vercel-000?logo=vercel)](https://orbit-sentinel.vercel.app)

---

## The Problem

Every merge request asks the same questions — and most teams answer them manually, if at all:

- **Who else will this break?** What files, services, and deployments are connected to the change?
- **Has this failed before?** Did a similar change cause an incident last month?
- **Who should review this?** Which teams and individuals own the affected code?
- **What's the rollback plan?** If this goes wrong, how do we recover?

Without answers, teams ship blind. Incidents that could have been prevented become post-mortems that could have been avoided.

## The Solution

Orbit Sentinel is an **autonomous engineering digital twin** — a living model of your software system built from the GitLab Orbit knowledge graph.

When a developer opens a merge request or pushes a commit, Orbit Sentinel activates automatically:

1. **Discovers** the system topology via `get_graph_schema`
2. **Queries** the Orbit graph using all four query types — NEIGHBORS, PATH_FINDING, TRAVERSAL, and AGGREGATION
3. **Simulates** the change impact across the dependency graph
4. **Reports** a complete analysis back on the merge request, with evidence, historical context, and remediation steps

Every conclusion cites specific Orbit evidence. Nothing is guessed.

---

## Architecture

```
                    GitLab Merge Request opened
                              │
                              ▼
    ┌─────────────────────────────────────────────────────┐
    │           GitLab Duo Agent Flow (8 steps)           │
    │                                                     │
    │  1. get_graph_schema() ─── Discover system schema   │
    │  2. NEIGHBORS query     ─── Blast radius            │
    │  3. PATH_FINDING query  ─── Dependency chain        │
    │  4. TRAVERSAL query     ─── Historical matches      │
    │  5. AGGREGATION query   ─── Pipeline risk           │
    │  6. Compose analysis report                         │
    │  7. Post note on MR                                 │
    │  8. Complete                                        │
    └──────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────────┐
    │  Engine (API)     │     │  Visualizer (React)   │
    │  TypeScript       │     │  D3.js · Vite         │
    │  Express server   │     │  6 interactive views  │
    │  Risk scoring     │     │  Auto-play demo mode  │
    │  Remediation      │     │  What-if simulation   │
    └──────────────────┘     └──────────────────────┘
```

### Components

| Component | Location | Stack | Purpose |
|---|---|---|---|
| **Agent Flow** | `flow/orbit-sentinel-flow.yaml` | GitLab Duo Agent Platform v1 | 8-step autonomous workflow triggered on MR open/commit |
| **Engine** | `engine/` | TypeScript, Express, Zod, Vitest | Orbit client, digital twin builder, risk engine, remediation planner |
| **Visualizer** | `visualizer/` | React 18, D3.js, Vite, TypeScript | Interactive 6-view dashboard with auto-play demo, what-if simulation, and graph exploration |
| **CI/CD** | `.gitlab-ci.yml` | GitLab Pages | Automated build and deployment pipeline (7 jobs across 4 stages) |
| **Duo Skill** | `.gitlab/duo/skill.yml` | GitLab Duo Chat | Published skill with 6 pre-built query recipes for all 4 Orbit query types |

---

## Orbit Queries

The engine exercises all four GitLab Orbit query types — no gaps, no stubs:

| Query Type | Purpose | Evidence |
|---|---|---|
| **NEIGHBORS** | Blast radius — everything connected to a changed file | `flow/orbit-sentinel-flow.yaml:35` |
| **PATH_FINDING** | Dependency chain from files to deployments | `flow/orbit-sentinel-flow.yaml:36` |
| **TRAVERSAL** | Historical matches — past MRs on the same files | `flow/orbit-sentinel-flow.yaml:37` |
| **AGGREGATION** | Pipeline risk — failure counts by project | `flow/orbit-sentinel-flow.yaml:38` |

---

## Quick Start

```bash
# One command (Windows / macOS / Linux)
.\setup.ps1
# → http://localhost:5173

# Or visit the live demo
# → https://orbit-sentinel.vercel.app
```

For detailed setup instructions, see [SETUP.md](orbit-sentinel/SETUP.md). For installation, see [INSTALLATION.md](orbit-sentinel/INSTALLATION.md).

---

## Documentation

| Document | Contents |
|---|---|
| [SETUP.md](orbit-sentinel/SETUP.md) | Prerequisites, one-click setup, manual build steps |
| [INSTALLATION.md](orbit-sentinel/INSTALLATION.md) | Full installation guide with troubleshooting |
| [AGENTS.md](orbit-sentinel/AGENTS.md) | Agent behavior, error handling, validation rules, monitoring |
| [flow/orbit-sentinel-flow.yaml](orbit-sentinel/flow/orbit-sentinel-flow.yaml) | GitLab Duo Agent Platform workflow definition |
| [demo/devpost-submission.md](orbit-sentinel/demo/devpost-submission.md) | Hackathon submission details |
| [demo/demo-script.md](orbit-sentinel/demo/demo-script.md) | 3-minute walkthrough script for the demo video |
| [CHANGELOG.md](orbit-sentinel/CHANGELOG.md) | Full list of improvements and fixes |
| [LICENSE](orbit-sentinel/LICENSE) | MIT license |

---

## Visualizer

The React + D3 dashboard provides six analysis views:

1. **Overview** — Hero prediction, Orbit evidence panel, decision center, risk heatmap, incident intelligence, interactive digital twin graph
2. **Blast Radius** — Interactive dependency explorer — click nodes to inspect
3. **Risk Heatmap** — 5-dimension risk breakdown with scoring
4. **What-If Simulation** — Counterfactual analysis — click mitigations to see risk animate down
5. **Historical Context** — Past incidents and MRs with similarity scores
6. **Impact Report** — Full formatted MR comment output

Press **Space** to start or stop the auto-play demo, or visit with `?demo=true` for auto-load.

---

## Built For

[GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/) by [@trueboy1123](https://gitlab.com/trueboy1123)

MIT License — see [LICENSE](orbit-sentinel/LICENSE).
