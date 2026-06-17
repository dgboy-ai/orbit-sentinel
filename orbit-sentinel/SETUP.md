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
npm test         # runs 75 tests
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
| Tests pass | `cd engine; if ($?) { npm test }` | 75 tests passed |
| Visualizer builds | `cd visualizer; if ($?) { npm run build }` | `dist/` created |
| Dev server | `cd visualizer; if ($?) { npm run dev }` | Opens at :5173 |

## Deploy Flow to GitLab

1. Go to your project → **Settings** → **AI** → **Flows** → **New Flow**
2. Paste contents of `flow/orbit-sentinel-flow.yaml`
3. Save → Enable
4. Open a merge request or push a new commit — the flow triggers automatically
5. The flow runs and posts analysis to the MR

## Enable Live Orbit Queries

The engine (local or on **Render** at [orbit-sentinel.onrender.com](https://orbit-sentinel.onrender.com)) needs a `GITLAB_ACCESS_TOKEN` to query the real Orbit API.

For the engine to query a real GitLab Orbit knowledge graph (vs. demo mode), you need:

### 1. Enable Orbit on Your GitLab Group

```bash
# Orbit must be enabled on your GitLab group by an admin or owner.
# Navigate to: Group → Settings → General → Permissions → Enable Orbit Knowledge Graph
```

Orbit is available on GitLab.com groups. If you don't see the option, ask your group owner or check [GitLab Orbit docs](https://docs.gitlab.com/ee/user/orbit/).

### 2. Create a Project Access Token

1. Go to your project → **Settings** → **Access Tokens**
2. Create a token with the `read_api` scope (minimum) or `api` scope (full access)
3. Copy the token value

### 3. Configure Environment

Create a `.env` file at the repository root (not inside `engine/` or `visualizer/`):

```env
GITLAB_HOST=gitlab.com
ORBIT_API_ENDPOINT=https://gitlab.com/api/v4/orbit
GITLAB_ACCESS_TOKEN=glpat-your-token-here
```

### 4. Verify Connectivity

```powershell
cd engine
npm run build
# Start the API server:
node dist/server.js
# In another terminal:
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# To verify Orbit API access, set DEMO_MODE=false and call the analyze endpoint
# with a real MR IID and project path from your GitLab group.
```

Without these environment variables, the engine runs in demo mode with sample data.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: not found` | Install Node.js v22+ from nodejs.org |
| Port 5173 in use | Kill existing process or change in `vite.config.ts` |
| Engine tests fail | Run `cd engine && npm install` then retry |
| Visualizer blank | Open browser console for errors, ensure `npm run dev` started |
