# Project Structure

```
orbit-sentinel/
├── .gitlab/duo/                   # GitLab Duo integration
│   ├── skill.yml                  # Duo Chat skill definition
│   └── mcp.json                   # MCP server config
├── visualizer/                    # React/D3 interactive dashboard
│   ├── src/
│   │   ├── components/           # 38 React components (PredictionsTracker, AgentFlowProgress, etc.)
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helper functions (colors, animations)
│   └── public/                   # Static assets
├── engine/                        # TypeScript Orbit client + digital twin
│   ├── src/
│   │   ├── orbit/                # Orbit API client
│   │   │   ├── client.ts         # Main Orbit client with retry/backoff
│   │   │   └── queries.ts        # 4 query type definitions
│   │   ├── fallback/             # Grep fallback (file analysis when Orbit down)
│   │   │   └── grep-fallback.ts  # GitLab Repository Files API + import parsing
│   │   ├── twin/                # Digital twin construction + simulation
│   │   ├── risk/                # Risk scoring engine
│   │   ├── remediation/         # Remediation planner + test generator
│   │   ├── memory/              # Historical memory + similarity engine
│   │   └── reporter/            # Markdown + Visualizer data reporters
│   ├── errors.ts                # Error handling and classification
│   ├── validators.ts            # Input validation and sanitization
│   └── dist/                     # Built output
├── flow/                          # GitLab Duo Agent Platform
│   └── orbit-sentinel-flow.yaml
├── skills/                        # Orbit skill with 6 query recipes
│   └── orbit-sentinel/
│       └── recipes/              # 6 query recipes (blast-radius, dependency-chain, etc.)
├── demo/                          # Demo materials
│   ├── demo-script.md             # 3-minute video script (8 views)
│   ├── screenshots-guide.md       # Screenshot capture guide
│   └── devpost-submission.md     # Devpost entry text
├── docs/                          # Documentation
│   ├── orbit-traversal-results.md  # Live Orbit query proof
│   └── screenshots/               # Reference UI screenshots
├── docker-compose.yml             # Full stack: engine + visualizer + nginx
├── setup.ps1                      # One-click install & run (enhanced)
├── INSTALLATION.md                # Comprehensive setup guide
├── SETUP.md                       # Setup instructions
├── AGENTS.md                      # Agent behavior spec (fallback + closed-loop)
├── CHANGELOG.md                   # Full history of features and fixes
├── CONTRIBUTING.md                # Contribution guidelines
├── DEPLOYMENT.md                  # Deploy to Vercel + Render + Docker
├── SECURITY.md                    # Security policy (token handling in fallback)
└── LICENSE                        # MIT
```
