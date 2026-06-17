# Project Structure

```
orbit-sentinel/
├── .gitlab-ci.yml               # GitLab Pages deployment
├── .gitlab/duo/                  # GitLab Duo integration
│   ├── skill.yml                # Duo Chat skill definition
│   └── mcp.json                 # MCP server config
├── visualizer/                    # React/D3 interactive dashboard
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helper functions
│   └── public/                   # Static assets
├── engine/                        # TypeScript Orbit client + twin
│   ├── src/
│   │   ├── orbit/                # Orbit API client
│   │   │   ├── client.ts         # Main Orbit client with error handling
│   │   │   └── queries.ts        # Query definitions
│   │   ├── twin/                # Digital twin construction
│   │   ├── risk/                # Risk scoring engine
│   │   ├── remediation/         # Remediation planning
│   │   └── reporter/            # Report generation
│   ├── errors.ts                # Error handling and classification
│   └── validators.ts            # Input validation and sanitization
│   └── dist/                     # Built output
├── flow/                          # GitLab Duo Agent Platform
│   └── orbit-sentinel-flow.yaml
├── skills/                        # Orbit skill with 6 query recipes
│   └── orbit-sentinel/
│       └── recipes/              # 6 query recipes
├── demo/                          # Demo materials
│   ├── demo-script.md             # ~3-minute video script
│   ├── screenshots-guide.md       # Screenshot capture guide
│   └── devpost-submission.md     # Devpost entry text
├── docs/                          # Documentation
│   └── screenshots/               # Reference UI screenshots
├── setup.ps1                        # One-click install & run (enhanced)
├── INSTALLATION.md                # Comprehensive setup guide
├── SETUP.md                       # Setup instructions
├── AGENTS.md                      # Agent instructions (enhanced)
├── CHANGELOG.md                   # Full history of features and fixes
├── CONTRIBUTING.md                # Contribution guidelines
├── SECURITY.md                    # Security policy
└── LICENSE                        # MIT
```
