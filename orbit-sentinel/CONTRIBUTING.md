# Contributing

Thanks for your interest in Orbit Sentinel! This is a hackathon project for the GitLab AI Hackathon, but we'd love contributions.

## Development Setup

```powershell
.\setup.ps1
```

This installs dependencies for both `engine/` and `visualizer/`, builds both, and starts the dev server at `http://localhost:5173`.

## Project Structure

```
orbit-sentinel/
├── engine/          # Node.js/TypeScript backend (95 tests)
│   ├── src/
│   │   ├── orbit/           # GitLab Orbit API client
│   │   ├── twin/            # Digital twin builder + simulator (orbitOrFallback)
│   │   ├── fallback/        # Grep fallback when Orbit is down
│   │   ├── memory/          # Historical memory store + similarity engine
│   │   ├── risk/            # Risk scoring engine
│   │   ├── remediation/     # Remediation planner + test generator
│   │   ├── reporter/        # Markdown + Visualizer data reporters
│   │   ├── server.ts        # Express API server
│   │   └── types.ts         # TypeScript interfaces
│   └── tests/
├── visualizer/      # React + Vite + D3.js frontend (29 tests)
│   └── src/
│       ├── components/      # 41 UI components (PanelFallback, ScanLine, PredictionsTracker, etc.)
│       ├── constants/       # Design tokens, view definitions
│       ├── services/        # API client for engine communication
│       ├── utils/           # Colors, graph helpers, session persistence
│       └── types.ts         # VisualizationData type (includes fallback flag)
├── flow/            # GitLab Duo Agent Platform flow YAML
├── skills/          # AI Catalog skill definition (6 recipes)
└── docs/            # Documentation
```

## Making Changes

1. **Engine** — `cd engine && npm run dev` (auto-restarts on changes)
2. **Visualizer** — `cd visualizer && npm run dev` (Vite HMR)
3. **Tests** — `cd engine && npm test` (95 engine tests) / `cd visualizer && npx vitest run` (29 visualizer tests)
4. **Typecheck** — `cd engine && npx tsc --noEmit` / `cd visualizer && npx tsc --noEmit`
5. **Build** — `cd engine && npm run build` then `cd visualizer && npm run build`

## Coding Conventions

- Use TypeScript with strict mode
- Inline styles (no CSS files) — the visualizer uses React inline `style` props exclusively
- Errors use the `ErrorHandler` class from `engine/src/errors.ts`
- Tests use Vitest, colocated in `engine/tests/`
- Fallback resilience: wrap Orbit calls in `orbitOrFallback()` — never let Orbit downtime crash analysis

## Committing

We commit to `main` and push to both `origin` (GitHub) and `gitlab` (GitLab) remotes:

```powershell
git add <files>
git commit -m "type: description"
git push origin main
git push gitlab main
```

## Reporting Issues

File issues on [GitLab](https://gitlab.com/gitlab-ai-hackathon/transcend/39251857/-/issues) or [GitHub](https://github.com/dgboy-ai/orbit-sentinel/issues).
