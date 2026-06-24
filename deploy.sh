#!/usr/bin/env bash
# Orbit Sentinel Deployment Script
# 
# This script deploys the Orbit Sentinel project to:
# - Engine: Render (web service)
# - Visualizer: Vercel (static site)
# 
# Prerequisites:
# - GitHub/GitLab account with write access
# - Vercel CLI installed
# - Render account with appropriate permissions
# 
# Usage:
# 1. Edit configuration in .deployment-config.sh
# 2. Run: ./deploy.sh
# 

# Configuration
PROJECT_NAME="orbit-sentinel"
GITHUB_REPO="gitlab-ai-hackathon/transcend/orbit-sentinel"
VERCEL_PROJECT="orbit-sentinel-visualizer"
RENDER_SERVICE="orbit-sentinel-engine"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print error and exit
error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Function to print info
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Installing..."
    # Install GitHub CLI
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y gh
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gh
    else
        echo "Please install GitHub CLI manually and re-run this script."
        exit 1
    fi
fi

# Login to GitHub if not already logged in
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub:"
    gh auth login
fi

# Create Vercel project
info "Creating Vercel project..."
if vercel projects ls --team "orbit-sentinel" | grep -q "$VERCEL_PROJECT"; then
    warning "Vercel project already exists. Using existing project."
else
    vercel --yes --token "$VERCEL_TOKEN" link --repo "$GITHUB_REPO" --project-name "$VERCEL_PROJECT"
fi

# Deploy visualizer to Vercel
info "Deploying visualizer to Vercel..."
cd visualizer
vercel --prod --token "$VERCEL_TOKEN"
cd ..

# Create Render service
info "Creating Render service..."
if ! curl -s -o /dev/null -w "%{http_code}" "https://api.render.com/v1/services?teamId=${RENDER_TEAM_ID}" | grep -q "200"; then
    error_exit "Render API access denied. Please check your API key."
fi

# Create Render web service
info "Creating Render web service..."
cat > render-config.json << EOF
{
  "name": "$RENDER_SERVICE",
  "serviceType": "web",
  "env": "production",
  "region": "us-east-1",
  "plan": "starter",
  "buildCommand": "cd engine && npm run build",
  "startCommand": "node dist/server.js",
  "healthCheck": {
    "path": "/health",
    "interval": 30
  },
  "envVars": {
    "NODE_ENV": "production",
    "PORT": "3001",
    "ORBIT_API_ENDPOINT": "https://gitlab.com/api/v4/orbit",
    "ORBIT_TOKEN_ENV_VAR": "ORBIT_TOKEN"
  },
  "disk": {
    "name": "data",
    "mountPath": "/tmp",
    "sizeGB": 1
  }
}
EOF

# Create .gitignore for engine
info "Creating .gitignore for engine..."
cat > engine/.gitignore << EOF
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
*.pem
*.key
*.crt
EOF

# Create .gitignore for visualizer
info "Creating .gitignore for visualizer..."
cat > visualizer/.gitignore << EOF
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
EOF

# Create deployment documentation
info "Creating deployment documentation..."
cat > DEPLOYMENT.md << EOF
# Orbit Sentinel Deployment Guide

## Overview

This project consists of two main components:

1. **Engine** - TypeScript service that analyzes MRs using GitLab Orbit
2. **Visualizer** - React dashboard that displays analysis results

## Deployment

### Visualizer (Vercel)

The visualizer is deployed as a static site to Vercel.

**URL**: https://orbit-sentinel.vercel.app

**Features**:
- Auto-play demo mode
- Interactive 6-view dashboard
- Real-time MR analysis
- Exportable reports

### Engine (Render)

The engine is deployed as a web service to Render.

**Health Check**: https://orbit-sentinel-api.onrender.com/health

**API Endpoints**:
- `POST /api/analyze` - Analyze MR changes
- `GET /api/demo` - Demo mode data

## Local Development

### Engine

```bash
cd engine
npm install
npm run build
npm start:api
```

### Visualizer

```bash
cd visualizer
npm install
npm run dev
# → http://localhost:5173
```

## Environment Variables

### Engine (.env)

```env
ORBIT_TOKEN=your-gitlab-orbit-token
ORBIT_API_ENDPOINT=https://gitlab.com/api/v4/orbit
```

### Visualizer (.env)

```env
VITE_API_BASE_URL=https://your-engine-domain.com
```

## CI/CD

The project includes a GitLab CI configuration that:

1. **Tests** - Runs TypeScript type checking, linting, and tests
2. **Builds** - Builds both engine and visualizer
3. **Deploys** - Deploys visualizer to Vercel and engine to Render

## Troubleshooting

### Visualizer Not Loading

Check browser console for errors. Ensure the engine API is running:

```bash
curl https://your-engine-domain.com/health
```

### Engine Not Responding

Check Render dashboard for deployment status and logs:

1. Go to https://dashboard.render.com
2. Select your service
3. Check "Logs" tab for errors
4. Check "Metrics" for resource usage

## Customization

### Adding New Views

Add new React components in `visualizer/src/components/` and update the routing in `visualizer/src/App.tsx`.

### Customizing the Demo

Edit the demo data in `engine/src/server.ts` to show different scenarios.

## Support

For issues, please contact the project maintainers.

## License

MIT License - See LICENSE file for details.
EOF

info "Deployment script completed!"
info "Next steps:"
info "1. Set VERCEL_TOKEN environment variable"
info "2. Set RENDER_TEAM_ID and RENDER_API_KEY environment variables"
info "3. Run the deployment script: ./deploy.sh"
info "4. Configure GitLab CI/CD pipeline to use the deployed services"
