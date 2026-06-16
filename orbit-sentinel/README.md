# 🛰️ Orbit Sentinel — Autonomous Engineering Digital Twin

> Simulate the future of your codebase before you merge.

Orbit Sentinel is an autonomous engineering digital twin that uses **GitLab Orbit** to build a living model of your software system, simulate proposed changes, predict failures, and generate remediation plans — all before code reaches production.

## The Vision

Most AI coding tools understand the current code. Orbit Sentinel understands the **future** of the code.

When a developer opens a merge request, Orbit Sentinel:

1. **Constructs a digital twin** of the software system using GitLab Orbit
2. **Simulates the change** across the full dependency graph
3. **Predicts failure modes** with probability and severity scoring
4. **Finds historical precedents** — similar changes and their outcomes
5. **Recommends reviewers** based on expertise and workload
6. **Generates rollback plans** and test strategies
7. **Creates remediation suggestions**, including auto-generated fix MRs
8. **Posts a comprehensive report** on the merge request

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitLab Merge Request                    │
└──────────────────────┬──────────────────────────────────┘
                       │ trigger (opened/updated)
┌──────────────────────▼──────────────────────────────────┐
│              Orbit Sentinel Flow (7 Agents)              │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Graph   │─▶│ Memory │─▶│Simulation│─▶│   Risk   │  │
│  │ Analyst  │  │ Agent  │  │  Agent   │  │  Agent   │  │
│  └──────────┘  └────────┘  └──────────┘  └──────────┘  │
│        │            │            │              │        │
│        ▼            ▼            ▼              ▼        │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────┐│
│  │ Reviewer │  │Remediation │  │Reporting │  │  Risk  ││
│  │  Agent   │  │   Agent    │  │  Agent   │  │Engine  ││
│  └──────────┘  └────────────┘  └──────────┘  └────────┘│
└──────────────────────┬──────────────────────────────────┘
                       │ output
┌──────────────────────▼──────────────────────────────────┐
│         MR Comment: Impact Report + Visualization        │
└─────────────────────────────────────────────────────────┘
```

### Engine Components

```
engine/src/
├── index.ts              # Main OrbitSentinel class
├── types.ts              # All type definitions
├── config.ts             # Configuration
├── orbit/
│   ├── client.ts         # Orbit API client (all 4 query types)
│   └── queries.ts        # Pre-built query library (12 queries)
├── twin/
│   ├── builder.ts        # Digital twin construction
│   └── simulator.ts      # Change simulation & failure prediction
├── memory/
│   ├── store.ts          # Historical data retrieval
│   └── similarity.ts     # Change similarity scoring
├── risk/
│   └── engine.ts         # Risk scoring, rollback & test plan generation
├── remediation/
│   ├── planner.ts        # Remediation prioritization
│   ├── rollback.ts       # Rollback strategy generation
│   └── test-generator.ts # Automated test plan generation
└── reporter/
    ├── markdown.ts       # Human-readable MR reports
    └── visualizer.ts     # Visualization data preparation
```

### Flow Configuration

```
flow/
├── orbit-sentinel-flow.yaml     # Duo Agent Platform flow (7 agents)
├── trigger-examples.yaml        # Trigger configuration examples
└── agents/
    ├── 01-graph-analyst.yaml     # Orbit query specialist
    ├── 02-memory-agent.yaml      # Historical pattern analysis
    ├── 03-simulation-agent.yaml  # What-if simulation
    ├── 04-risk-agent.yaml        # Risk assessment
    ├── 05-reviewer-agent.yaml    # Reviewer recommendation
    ├── 06-remediation-agent.yaml # Fix generation
    └── 07-reporting-agent.yaml   # Report compilation
```

### Skill & Configuration

```
skills/orbit-sentinel/
├── SKILL.md                     # Orbit Sentinel skill definition
└── recipes/
    ├── blast-radius.json        # NEIGHBORS query recipe
    ├── dependency-chain.json    # PATH_FINDING query recipe
    ├── deployment-impact.json   # TRAVERSAL query recipe
    ├── historical-similarity.json # TRAVERSAL query recipe
    ├── ownership-discovery.json # NEIGHBORS query recipe
    └── pipeline-risk.json       # AGGREGATION query recipe

.gitlab/duo/
└── mcp.json                     # MCP server configuration

AGENTS.md                        # Project-level agent instructions
```

## Orbit Query Types Used

| Query Type | Count | Purpose |
|-----------|-------|---------|
| **Traversal** | 4 | File search, historical MRs, incidents, deployment trace |
| **Aggregation** | 2 | Pipeline failures, open MR counts |
| **Path Finding** | 2 | Dependency chains, deployment paths |
| **Neighbors** | 3 | Blast radius, ownership, dependency mapping |

## Getting Started

### Prerequisites

- GitLab CLI (`glab`) v1.95+
- GitLab Orbit enabled on your top-level group
- `glab auth login` configured

### Installation

```bash
# 1. Install the Orbit skill
glab skills install --global orbit

# 2. Install Orbit Sentinel skill
glab skills install --global orbit-sentinel

# 3. Set up MCP configuration
cp .gitlab/duo/mcp.json ~/.gitlab/duo/mcp.json

# 4. Enable the flow in your project
# Go to AI > Flows > New Flow > Upload orbit-sentinel-flow.yaml
```

### Running the Engine

```bash
cd engine
npm install
npm run build

# Analyze a specific merge request
GITLAB_ACCESS_TOKEN=your_token \
ORBIT_GROUP_PATH=my-org/my-project \
node dist/index.js
```

### Visualizer

```bash
cd visualizer
npm install
npm run dev
# Opens at http://localhost:5173
```

## Demo

**[View Demo Script](demo/demo-script.md)** — 3-minute walkthrough designed for the hackathon submission.

## Project Structure

```
orbit-sentinel/
├── engine/          # TypeScript engine (Orbit client, digital twin, simulation)
├── visualizer/      # React/D3 visualization dashboard
├── flow/            # Duo Agent Platform flow & agent definitions
├── skills/          # Orbit Sentinel skill with query recipes
├── .gitlab/duo/     # MCP configuration
├── demo/            # Demo script and assets
├── AGENTS.md        # Agent instructions
└── LICENSE          # MIT License
```

## License

MIT — see [LICENSE](LICENSE).

---

Built for the [GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/).
