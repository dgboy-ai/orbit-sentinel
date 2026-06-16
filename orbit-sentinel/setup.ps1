# Orbit Sentinel — One-Click Setup

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "=== Orbit Sentinel Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Install engine
Write-Host "[1/3] Installing engine..." -ForegroundColor Yellow
Push-Location "$root\engine"
npm install --silent
if (-not $?) { Write-Host "  ✗ Engine install failed" -ForegroundColor Red; exit 1 }
npm run build
if (-not $?) { Write-Host "  ✗ Engine build failed" -ForegroundColor Red; exit 1 }
Pop-Location
Write-Host "  ✓ Engine ready (with error handling and validation)" -ForegroundColor Green

# 2. Install visualizer
Write-Host "[2/3] Installing visualizer..." -ForegroundColor Yellow
Push-Location "$root\visualizer"
npm install --silent
if (-not $?) { Write-Host "  ✗ Visualizer install failed" -ForegroundColor Red; exit 1 }
Pop-Location
Write-Host "  ✓ Visualizer ready (with enhanced demo features)" -ForegroundColor Green

# 3. Create environment file template
Write-Host "[3/3] Creating environment configuration..." -ForegroundColor Yellow
$envFile = "$root\.env"
if (-not (Test-Path $envFile)) {
    @"
# Orbit Sentinel Environment Configuration
# Copy this file to .env and fill in your values

# GitLab Configuration
GITLAB_HOST=gitlab.com
ORBIT_GROUP_PATH=your-group/your-project
ORBIT_API_ENDPOINT=https://gitlab.com/api/v4/orbit
GITLAB_ACCESS_TOKEN=your-gitlab-access-token

# Optional: Override defaults
ORBIT_MAX_TRAVERSAL_DEPTH=5
ORBIT_MAX_HISTORICAL_MATCHES=10

# Performance Settings
ORBIT_CACHE_TTL=300
ORBIT_MAX_RETRIES=3
ORBIT_TIMEOUT_MS=15000
"@ | Set-Content -Path $envFile -Encoding UTF8
    Write-Host "  ✓ Environment template created (.env)" -ForegroundColor Green
}

# 4. Start visualizer
Write-Host "[4/3] Starting visualizer..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Space to toggle demo mode" -ForegroundColor Cyan
Write-Host "  Or visit: http://localhost:5173/?demo=true" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Features enabled:" -ForegroundColor Cyan
Write-Host "    • Enhanced error handling and validation" -ForegroundColor White
Write-Host "    • Performance monitoring and caching" -ForegroundColor White
Write-Host "    • Comprehensive demo mode" -ForegroundColor White
Write-Host "    • Security hardening" -ForegroundColor White
Write-Host ""

Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$root\visualizer"
Write-Host "  Visualizer started at http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Press any key to stop..." -ForegroundColor Gray
Write-Host ""
Read-Host "  [Press Enter to quit]"
