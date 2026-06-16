# Orbit Sentinel — Setup

## Prerequisites

- **Node.js** v22+ (v20 LTS minimum)
- **npm** v10+
- **Git** (for cloning)
- **PowerShell 5.1+** (Windows) or **bash** (macOS/Linux)

## Quick Start (Windows)

```powershell
.\setup.ps1
```

This installs the engine, visualizer, and starts the dev server at `http://localhost:5173`.

## Manual Setup

### Engine

```powershell
cd engine
npm install
npm run build    # compiles TypeScript → dist/
npm test         # runs 52 tests
```

### Visualizer

```powershell
cd visualizer
npm install
npm run dev      # starts at http://localhost:5173
```

Open `http://localhost:5173/?demo=true` for auto-play mode.

## Verify It Works

| Check | Command (PowerShell) | Expected |
|-------|----------------------|----------|
| Engine compiles | `cd engine; if ($?) { npx tsc --noEmit }` | No errors |
| Tests pass | `cd engine; if ($?) { npm test }` | 52 tests passed |
| Visualizer builds | `cd visualizer; if ($?) { npm run build }` | `dist/` created |
| Dev server | `cd visualizer; if ($?) { npm run dev }` | Opens at :5173 |

## Deploy Flow to GitLab

1. Go to your project → **Settings** → **AI** → **Flows** → **New Flow**
2. Paste contents of `flow/orbit-sentinel-flow.yaml`
3. Save → Enable
4. Open a merge request or push a new commit — the flow triggers automatically
5. The flow runs and posts analysis to the MR

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: not found` | Install Node.js v22+ from nodejs.org |
| Port 5173 in use | Kill existing process or change in `vite.config.ts` |
| Engine tests fail | Run `cd engine && npm install` then retry |
| Visualizer blank | Open browser console for errors, ensure `npm run dev` started |
