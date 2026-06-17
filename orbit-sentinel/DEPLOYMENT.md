# Orbit Sentinel — Deployment Guide

## Overview

Orbit Sentinel has two deployable components:

1. **Visualizer** — React/D3 dashboard (static site, hosted on Vercel)
2. **Engine** — Express API server (Node.js, hosted on Render)

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
| `VITE_API_BASE_URL` | `https://your-engine.onrender.com` | Points visualizer to live engine API |

Without `VITE_API_BASE_URL`, the visualizer runs in demo mode with embedded sample data.

---

## Engine (Render)

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
| `GITLAB_ACCESS_TOKEN` | `glpat-...` | Orbit API authentication |
| `ORBIT_API_ENDPOINT` | `https://gitlab.com/api/v4/orbit` | Orbit API endpoint |
| `GITLAB_HOST` | `gitlab.com` | GitLab instance hostname |
| `DEMO_MODE` | `false` | Enable live Orbit queries |
| `PORT` | `3001` | Server port (Render sets this automatically via `process.env.PORT`) |

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
| Engine health check fails | Verify `GITLAB_ACCESS_TOKEN` is set and has `read_api` scope |
| Visualizer shows blank screen | Open browser console. Check `VITE_API_BASE_URL` is correct and the engine is running |
| Orbit queries return 401 | Regenerate the access token. Orbit must be enabled on the GitLab group |
| CORS errors in browser | Update `origin` array in `server.ts` to include the deployed visualizer URL |
