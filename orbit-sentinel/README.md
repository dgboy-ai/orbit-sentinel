# Orbit Sentinel — Engineering Digital Twin

> GitHub Copilot predicts code. Orbit Sentinel predicts consequences.

Orbit Sentinel is an autonomous engineering digital twin powered by **GitLab Orbit**. When a developer opens a merge request, it builds a living model of the software system — discovering blast radius, historical incidents, reviewer ownership, deployment dependencies, and rollback strategies — then posts a complete impact analysis on the MR.

## 🏆 Breakthrough: Real Orbit Queries Executed

The agent was tested in GitLab Duo Chat and successfully ran **live Orbit queries** against the actual project (`transcend/39251857`). Results:

| Query | Findings |
|-------|----------|
| `get_graph_schema` | 18 node types, ~45 relationship types discovered |
| Full Graph Traversal | **22 nodes, 40 relationships** across 6 node types |
| Merge Requests | 3 MRs (!1, !2, !3) — all authored by @pjphillips |
| Issues | 2 closed issues — duplicate pattern detected |
| Pipelines | 1 pipeline (success, 0% coverage) |
| Files | 11 files tracked in graph |
| Risk Signals | 3 High (bus factor, no coverage, no reviewers), 2 Medium |

[Full traversal results](/docs/orbit-traversal-results.md)

The visualizer now shows **real data from your actual project** — not fictional mock data.

## Quick Start

```powershell
.\setup.ps1        # One-click: install deps, build, start visualizer
# → http://localhost:5173
```

**Or visit the live demo** (if deployed to GitLab Pages):  
`https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/`

## How It Works

```
┌─────────────────────────────────────────────────────┐
│              GitLab Merge Request Opened             │
└──────────────────────┬──────────────────────────────┘
                       │ trigger
┌──────────────────────▼──────────────────────────────┐
│         Orbit Sentinel Flow (Duo Agent Platform)     │
│                                                       │
│  Step 1  get_graph_schema → understand the ontology   │
│  Step 2  NEIGHBORS query → blast radius computation   │
│  Step 3  PATH_FINDING query → dependency chains       │
│  Step 4  TRAVERSAL query → historical matches         │
│  Step 5  AGGREGATION query → pipeline risk scoring   │
│  Step 6  Analyze + predict failure modes              │
│  Step 7  post_mr_comment → full impact report         │
│  Step 8  add_label → tag risk level on MR             │
└──────────────────────┬──────────────────────────────┘
                       │ output
┌──────────────────────▼──────────────────────────────┐
│   MR Comment: Risk Score | Blast Radius | History    │
│   Reviewers | Rollback Plan | Remediations           │
└─────────────────────────────────────────────────────┘
```

**Key principle:** Every conclusion cites specific Orbit query evidence. No black box.

## Visualizer Features

The interactive dashboard (`localhost:5173` or GitLab Pages) demonstrates the complete analysis in 6 views with interactive controls:

### Views

| View | What It Shows |
|------|---------------|
| **Overview** | Hero prediction + Orbit evidence + Decision center + Counterfactual simulation + Incidents + Interactive Graph |
| **Blast Radius** | Interactive dependency explorer with depth control |
| **Risk** | Risk score breakdown with probability bars |
| **Simulation** | Change impact analysis with timeline |
| **History** | Repository memory with similarity scoring |
| **Report** | Full formatted impact report |

### Interactive Features

| Feature | How |
|---------|-----|
| **Auto-Play Demo** | Press **Space** or click **▶ Play Demo** — cycles all 6 views with overlay labels |
| **What-If Simulation** | **Click any mitigation bar** — risk gauge animates to show the impact |
| **Graph Exploration** | **Click any node** — detail panel shows type, risk level, and connection count |
| **URL Params** | `?view=blast-radius` opens directly to a view. `?demo=true` auto-starts demo |

### Run the Visualizer

```bash
# Option A: One-click setup
.\setup.ps1

# Option B: Manual
cd visualizer
npm install
npm run dev
# → http://localhost:5173
# → http://localhost:5173/?demo=true (auto-demo)
```

## Flow Configuration

The flow is defined at `flow/orbit-sentinel-flow.yaml`. It uses a single-agent v1 architecture that orchestrates 8 steps across 4 Orbit query types:

1. `get_graph_schema` — discover available schema
2. `query_graph` (NEIGHBORS) — blast radius
3. `query_graph` (PATH_FINDING) — dependency chains
4. `query_graph` (TRAVERSAL) — historical context
5. `query_graph` (AGGREGATION) — pipeline risk
6. `post_mr_comment` — post report to MR
7. `add_label` — tag MR with risk level

### Deploy the Flow

```bash
# 1. Go to your project → AI → Flows → New Flow
# 2. Upload flow/orbit-sentinel-flow.yaml
# 3. Save → Enable
# 4. Open a test MR to trigger
# 5. Publish to AI Catalog
```

## GitLab Pages Deployment

The `.gitlab-ci.yml` automatically deploys the visualizer to GitLab Pages on every push to `main`:

```
https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/
```

The pipeline also runs TypeScript checks on the engine and visualizer.

## Duo Chat Integration

The skill at `.gitlab/duo/skill.yml` makes Orbit Sentinel available in Duo Chat with:

- Triggers on MR open and new commits
- All 4 Orbit query types available as tools
- 300-second timeout for complex analyses
- Single-threaded execution

The MCP configuration at `.gitlab/duo/mcp.json` connects the GitLab Orbit MCP server.

## Engine

```
engine/src/
├── orbit/
│   ├── client.ts     # Orbit API client (all 4 query types)
│   └── queries.ts    # 12 pre-built queries
├── twin/
│   ├── builder.ts    # Digital twin construction
│   └── simulator.ts  # Change simulation
├── risk/
│   └── engine.ts     # Risk scoring
├── remediation/
│   ├── planner.ts
│   ├── rollback.ts
│   └── test-generator.ts
└── reporter/
    ├── markdown.ts
    └── visualizer.ts
```

All four Orbit query types are used: **Traversal**, **Aggregation**, **Path Finding**, **Neighbors**.

## Project Status

| Component | Status |
|-----------|--------|
| Flow YAML (Duo Agent Platform) | ✅ Built, validated v1 syntax |
| Visualizer (React/D3 dashboard) | ✅ Built, tested, interactive |
| Engine (TypeScript Orbit client) | ✅ Built, compiles clean |
| Orbit skill + 6 query recipes | ✅ Built, 4 query types covered |
| GitLab Pages CI/CD | ✅ Configured |
| Duo Chat skill definition | ✅ Built |
| One-click setup script | ✅ Built |
| AI Catalog publication | ⏳ Needs user action on GitLab |
| Demo video | ⏳ Needs recording (≤3 min) |

## Project Structure

```
orbit-sentinel/
├── .gitlab-ci.yml       # GitLab Pages deployment
├── .gitlab/duo/
│   ├── skill.yml        # Duo Chat skill definition
│   └── mcp.json         # MCP server config
├── visualizer/          # React/D3 interactive dashboard
├── engine/              # TypeScript Orbit client + twin
├── flow/
│   └── orbit-sentinel-flow.yaml  # Duo Agent Platform flow
├── skills/              # Orbit skill with 6 query recipes
├── demo/
│   ├── demo-script.md   # 3-minute video script
│   └── devpost-submission.md  # Devpost entry text
├── docs/
│   └── screenshots/     # UI screenshots (11 images)
├── setup.ps1            # One-click install & run
├── SETUP.md             # Setup instructions
├── AGENTS.md            # Agent instructions
└── LICENSE              # MIT
```

## Built For

[GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/) — Showcase Track

**License:** MIT
