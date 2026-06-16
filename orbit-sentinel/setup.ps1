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
Write-Host "  ✓ Engine ready" -ForegroundColor Green

# 2. Install visualizer
Write-Host "[2/3] Installing visualizer..." -ForegroundColor Yellow
Push-Location "$root\visualizer"
npm install --silent
if (-not $?) { Write-Host "  ✗ Visualizer install failed" -ForegroundColor Red; exit 1 }
Pop-Location
Write-Host "  ✓ Visualizer ready" -ForegroundColor Green

# 3. Start visualizer
Write-Host "[3/3] Starting visualizer..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Space to toggle demo mode" -ForegroundColor Cyan
Write-Host "  Or visit: http://localhost:5173/?demo=true" -ForegroundColor Cyan
Write-Host ""

Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$root\visualizer"
Write-Host "  Visualizer started at http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Press any key to stop..." -ForegroundColor Gray
Write-Host ""
Read-Host "  [Press Enter to quit]"
