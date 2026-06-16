# Orbit Sentinel — One-Click Setup

param(
  [switch]$Run = $true
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "=== Orbit Sentinel Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Install engine
Write-Host "[1/3] Installing engine..." -ForegroundColor Yellow
Push-Location "$root\engine"
npm install --silent 2>&1 | Out-Null
npm run build 2>&1 | Out-Null
Pop-Location
Write-Host "  ✓ Engine ready" -ForegroundColor Green

# 2. Install visualizer
Write-Host "[2/3] Installing visualizer..." -ForegroundColor Yellow
Push-Location "$root\visualizer"
npm install --silent 2>&1 | Out-Null
Pop-Location
Write-Host "  ✓ Visualizer ready" -ForegroundColor Green

# 3. Start visualizer
Write-Host "[3/3] Starting visualizer..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Space to toggle demo mode" -ForegroundColor Cyan
Write-Host "  Or visit: http://localhost:5173/?demo=true" -ForegroundColor Cyan
Write-Host ""

Push-Location "$root\visualizer"
npm run dev
Pop-Location
