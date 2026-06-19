# Orbit Sentinel — Deployment Guide

## Overview

Orbit Sentinel has two deployable components plus Docker Compose for local production:

1. **Visualizer** — React/D3 dashboard (static site, hosted on Vercel)
2. **Engine** — Express API server (Node.js, hosted on Render)
3. **Docker Compose** — Full stack with nginx reverse proxy

---

## Visualizer (Vercel)

### Automatic (Recommended)

The visualizer auto-deploys from the GitHub mirror at [github.com/dgboy-ai/orbit-sentinel](https://github.com/dgboy-ai/orbit-sentinel).

1. Push to the `main` branch
2. Vercel detects the change and deploys `orbit-sentinel/visualizer/`
3. Live at: [orbit-sentinel.vercel.app](https://orbit-sentinel.vercel.app)

### Manual

```bash
cd orbit-sentinel/visualizer
npm install
npm run build
npx vercel --prod
```

### Environment Variables (Vercel Dashboard)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_BASE_URL` | `https://orbit-sentinel.onrender.com` | Points visualizer to live engine API |

Without `VITE_API_BASE_URL`, the visualizer runs in demo mode with embedded sample data (dashboard loads instantly, upgrades to live when engine responds).

---

## Engine (Render)

The engine is deployed at [orbit-sentinel.onrender.com](https://orbit-sentinel.onrender.com). It will **not** return live Orbit data until `GITLAB_ACCESS_TOKEN` is set — without it, the engine runs in **fallback mode** (grep-based file analysis) and the visualizer shows a "Degraded" banner. The visualizer dashboard loads instantly with demo data and upgrades to live data when the engine responds.

### Prerequisites

- Render account
- `RENDER_API_KEY` environment variable

### Steps

```bash
cd orbit-sentinel/engine
npm install
npm run build
```

Deploy using the Render dashboard or CLI:

```bash
# Create a new Web Service on Render
# Root Directory: orbit-sentinel/engine
# Build Command: npm install && npm run build
# Start Command: node dist/server.js
```

### Environment Variables (Render Dashboard)

| Variable | Value | Purpose |
|----------|-------|---------|
| `GITLAB_ACCESS_TOKEN` | `glpat-...` | Orbit API authentication (also used by grep fallback for file fetch) |
| `ORBIT_API_ENDPOINT` | `https://gitlab.com/api/v4/orbit` | Orbit API endpoint |
| `GITLAB_HOST` | `gitlab.com` | GitLab instance hostname |
| `DEMO_MODE` | `false` | Enable live Orbit queries |
| `PORT` | `3001` | Server port (Render sets this automatically via `process.env.PORT`) |

---

## Docker Compose (Local Production)

```bash
docker compose -f ../docker-compose.yml up
```

Boots engine (port 3001) + visualizer (port 80 via nginx) with health checks. Uses multi-stage Dockerfiles for minimal images.

---

## GitLab Pages (CI/CD)

The `.gitlab-ci.yml` at the repository root deploys the visualizer to GitLab Pages on every push to `main`:

1. CI pipeline runs: test → lint → build → deploy
2. Build output from `orbit-sentinel/visualizer/dist/` is copied to `public/`
3. Pages URL: `https://gitlab-ai-hackathon.transcend.pages.dev`

View pipeline status: GitLab project → **CI/CD** → **Pipelines**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Vercel deploy fails | Check build logs. Ensure `orbit-sentinel/visualizer/` is the root directory in Vercel project settings |
| Engine health check fails | Verify `GITLAB_ACCESS_TOKEN` is set and has `read_api` scope. Without token, engine uses grep fallback |
| Visualizer shows blank screen | Open browser console. Check `VITE_API_BASE_URL` is correct and the engine is running |
| Orbit queries return 401 | Regenerate the access token. Orbit must be enabled on the GitLab group. Engine falls back to file analysis automatically |
| CORS errors in browser | Update `origin` array in `server.ts` to include the deployed visualizer URL |
| Docker compose fails | Ensure Docker daemon running. Check `docker-compose.yml` paths match repo structure |
