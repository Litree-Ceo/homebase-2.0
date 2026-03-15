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
    } catch { }
}

if (-not $python) {
    Write-Host "  [ERROR] Python 3.10+ required but not found on PATH." -ForegroundColor Red
    Write-Host "  Download: https://python.org" -ForegroundColor Yellow
    exit 1
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
    $cfg    = Get-Content config.yaml -Raw
    $cfg    = $cfg -replace 'api_key:.*', "api_key: `"$newKey`""
    Set-Content config.yaml $cfg -NoNewline
    Write-Host "  [OK] New API key written to config.yaml:" -ForegroundColor Green
    Write-Host "       $newKey" -ForegroundColor Yellow
}

# ── Check for default API key ─────────────────────────────────────────────────
$cfgContent = Get-Content config.yaml -Raw
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
    & $python -m pytest tests/ -v --tb=short
    Write-Host ""
    exit 0
}

# ── Start server ───────────────────────────────────────────────────────────────
Write-Host "  [..] Starting server..." -ForegroundColor Cyan
Write-Host ""
& $python server.py
