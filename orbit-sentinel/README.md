# Orbit Sentinel

Autonomous engineering digital twin powered by GitLab Orbit. When a merge request is opened, builds a digital twin of the software system — discovers blast radius, historical incidents, pipeline risk, reviewer ownership, and rollback strategies.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  GitLab MR   │────▶│  Engine API  │────▶│  Visualizer  │
│  (webhook)   │     │  (Node.js)   │     │  (React/D3)  │
└──────────────┘     │  :3001       │     │  :5173       │
                     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │  GitLab Orbit│
                     │  Knowledge   │
                     │  Graph       │
                     └──────────────┘
```

The engine queries all four Orbit query types (NEIGHBORS, PATH_FINDING, TRAVERSAL, AGGREGATION) to build a digital twin, then the visualizer renders 8 interactive dashboard views.

## Quick Start

```powershell
.\setup.ps1            # install all deps + start dev server
```

Or manually:

```powershell
cd engine; npm install; npm run build
cd visualizer; npm install; npm run dev
```

Open `http://localhost:5173` — first visit shows the **Setup Wizard**.

## Features

| View | What It Shows |
|------|---------------|
| **Dashboard** | Impact calculator, architecture diagram, Orbit evidence, incident intelligence |
| **Setup Wizard** | 4-step guided tour — Mission → Architecture → Setup → Devpost checklist |
| **Blast Radius** | Orbit NEIGHBORS graph — connected services, files, and dependencies |
| **Risk Investigation** | AGGREGATION evidence cards — signals, findings, deployment verdict |
| **Forecast Engine** | Digital twin what-if simulator — interactive counterfactuals |
| **Historical Context** | TRAVERSAL results — past incidents with Jaccard similarity |
| **Impact Report** | Full MR impact summary with markdown/JSON export |
| **Predictions Tracker** | Accuracy scoreboard with post-merge verification |

## Project Structure

```
├── engine/          # Node.js/TypeScript backend (95 tests)
│   ├── src/
│   │   ├── orbit/           # GitLab Orbit API client
│   │   ├── twin/            # Digital twin builder + simulator
│   │   ├── fallback/        # Grep fallback when Orbit is down
│   │   ├── risk/            # Risk scoring engine
│   │   ├── remediation/     # Remediation planner
│   │   ├── reporter/        # Markdown + Visualizer data reporters
│   │   └── server.ts        # Express API server
│   └── tests/
├── visualizer/      # React + Vite + D3.js frontend (13 tests)
│   └── src/
│       ├── components/      # 40 UI components
│       ├── constants/       # Design tokens, view definitions
│       ├── services/        # API client for engine communication
│       ├── utils/           # Colors, graph helpers, session persistence
│       └── types.ts
├── flow/            # GitLab Duo Agent Platform flow YAML
└── skills/          # AI Catalog skill + MCP config
```

## Tech Stack

- **Engine**: Node.js, TypeScript, Express, Zod
- **Visualizer**: React 18, Vite, D3.js, Vitest
- **AI Platform**: GitLab Duo Agent Platform, GitLab Orbit API
- **Deployment**: Vercel (visualizer), Render (engine)

## Docs

| Document | Purpose |
|----------|---------|
| [SETUP.md](SETUP.md) | Full setup guide with environment config |
| [INSTALLATION.md](INSTALLATION.md) | Step-by-step installation |
| [CHANGELOG.md](CHANGELOG.md) | All notable changes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guide for contributors |
| [AGENTS.md](AGENTS.md) | AI agent behavior specification |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions |
| [SECURITY.md](SECURITY.md) | Security policy |

## License

MIT
