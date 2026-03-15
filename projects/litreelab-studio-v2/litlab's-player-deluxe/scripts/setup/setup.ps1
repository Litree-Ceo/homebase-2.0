# setup.ps1 — First-time setup and launcher for Overlord Dashboard (PowerShell)
# Usage:
#   .\setup.ps1           # install deps + start server
#   .\setup.ps1 -GenKey   # generate a fresh API key and write to config.yaml
#   .\setup.ps1 -Test     # install deps + run tests (no server start)

param(
    [switch]$GenKey,
    [switch]$Test
)

$ErrorActionPreference = 'Stop'

# If this repo is a monolith, run the dashboard setup from modules\dashboard.
# This prevents accidentally installing the monolith root requirements.txt.
$repoRoot = $PSScriptRoot
$dashboardDir = Join-Path $repoRoot 'modules\dashboard'
$didPushLocation = $false
if ((Test-Path (Join-Path $dashboardDir 'server.py')) -and -not (Test-Path (Join-Path $repoRoot 'server.py'))) {
    Write-Host "[i] Monolith detected — running setup from: $dashboardDir" -ForegroundColor DarkGray
    Push-Location $dashboardDir
    $didPushLocation = $true
}

try {

    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║   OVERLORD DASHBOARD — SETUP v4.0   ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # ── Python check ──────────────────────────────────────────────────────────────
    $python = $null
    foreach ($cmd in @('python', 'python3', 'py')) {
        try {
            $ver = & $cmd -c "import sys; v=sys.version_info; print(v.major,v.minor)" 2>$null
            if ($ver) {
                $parts = $ver.Split(' ')
                if ([int]$parts[0] -ge 3 -and [int]$parts[1] -ge 10) {
                    $python = $cmd
                    break
                }
            }
        }
        catch { }
    }

    if (-not $python) {
        Write-Host "  [ERROR] Python 3.10+ required but not found on PATH." -ForegroundColor Red
        Write-Host "  Download: https://python.org" -ForegroundColor Yellow
        throw "Python 3.10+ not found on PATH"
    }

    $pyver = & $python --version
    Write-Host "  [OK] Python : $pyver" -ForegroundColor Green

    # ── Install dependencies ───────────────────────────────────────────────────────
    Write-Host "  [..] Installing dependencies..." -ForegroundColor Cyan
    & $python -m pip install -r requirements.txt --quiet
    Write-Host "  [OK] Dependencies installed." -ForegroundColor Green

    # ── Optional: generate + write a new API key ──────────────────────────────────
    if ($GenKey) {
        $newKey = & $python -c "import secrets; print(secrets.token_urlsafe(32))"
        $configPath = Join-Path $repoRoot 'config.yaml'
        if (-not (Test-Path $configPath)) {
            throw "config.yaml not found at repo root: $configPath"
        }
        $cfg = Get-Content $configPath -Raw
        $cfg = $cfg -replace 'api_key:.*', "api_key: `"$newKey`""
        Set-Content $configPath $cfg -NoNewline
        Write-Host "  [OK] New API key written to config.yaml:" -ForegroundColor Green
        Write-Host "       $newKey" -ForegroundColor Yellow
    }

    # ── Check for default API key ─────────────────────────────────────────────────
    $cfgContent = Get-Content (Join-Path $repoRoot 'config.yaml') -Raw
    if ($cfgContent -match 'overlord-change-me-please') {
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────────────┐" -ForegroundColor Yellow
        Write-Host "  │ WARNING: Default API key detected in config.yaml  │" -ForegroundColor Yellow
        Write-Host "  │ Run: .\setup.ps1 -GenKey  to auto-generate one.   │" -ForegroundColor Yellow
        Write-Host "  └──────────────────────────────────────────────────┘" -ForegroundColor Yellow
        Write-Host ""
    }

    # ── Tests only mode ───────────────────────────────────────────────────────────
    if ($Test) {
        Write-Host "  [..] Running test suite..." -ForegroundColor Cyan
        $testsPath = Join-Path $repoRoot 'tests'
        if (Test-Path $testsPath) {
            & $python -m pytest $testsPath -v --tb=short
        }
        else {
            & $python -m pytest -v --tb=short
        }
        Write-Host ""
        return
    }

    # ── Start server ───────────────────────────────────────────────────────────────
    Write-Host "  [..] Starting server..." -ForegroundColor Cyan
    Write-Host ""
    & $python server.py

}
finally {
    if ($didPushLocation) {
        Pop-Location
    }
}
