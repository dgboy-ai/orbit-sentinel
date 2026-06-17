# Orbit Sentinel — Installation

Get from zero to running in one command.

---

## Quick Start

```powershell
.\setup.ps1
# → http://localhost:5173
```

Or visit the live demo: [orbit-sentinel.vercel.app](https://orbit-sentinel.vercel.app)

---

## Prerequisites

- **Node.js** v18+ (v22 recommended)
- **npm** v10+
- **Git** 2.0+

---

## One-Click Setup

```powershell
.\setup.ps1
```

What it does:
1. Installs engine dependencies and builds TypeScript
2. Installs visualizer dependencies and builds the React app
3. Starts the Vite development server at `http://localhost:5173`

---

## Manual Setup

```bash
# 1. Clone
git clone https://gitlab.com/gitlab-ai-hackathon/transcend/39251857.git
cd 39251857

# 2. Engine
cd engine
npm install
npm run build

# 3. Visualizer
cd ../visualizer
npm install
npm run build

# 4. Start
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Create a `.env` at the project root (optional — demo mode works without it):

```env
GITLAB_HOST=gitlab.com
ORBIT_API_ENDPOINT=https://gitlab.com/api/v4/orbit
GITLAB_ACCESS_TOKEN=your-token
```

Without these, the visualizer runs in **demo mode** with sample data.

---

## GitLab Flow Installation

To enable the autonomous agent on merge requests:

1. Go to your GitLab project → **Settings** → **AI** → **Flows**
2. Click **New Flow**, paste `flow/orbit-sentinel-flow.yaml`, save, enable
3. The flow triggers automatically on every MR open and commit push

---

## Verify It Works

| Check | Expected |
|---|---|
| `npm test` in `engine/` | 52 tests passed |
| `npm run dev` in `visualizer/` | Server starts on port 5173 |
| Browser at `http://localhost:5173` | Interactive dashboard loads |
| `http://localhost:5173/?demo=true` | Auto-play demo cycles through all 6 views |

---

## Further Reading

| Document | What's Inside |
|---|---|
| [SETUP.md](SETUP.md) | Detailed setup prerequisites and edge cases |
| [CHANGELOG.md](CHANGELOG.md) | History of changes and fixes |
| [AGENTS.md](AGENTS.md) | Agent behavior, error handling, Orbit queries |
| [flow/orbit-sentinel-flow.yaml](flow/orbit-sentinel-flow.yaml) | Duo Agent Platform workflow definition |
