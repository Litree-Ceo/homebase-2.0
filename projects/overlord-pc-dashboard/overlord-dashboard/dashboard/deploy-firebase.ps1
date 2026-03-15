# deploy-firebase.ps1 — Deploy Overlord Dashboard to Firebase
# Hosts dashboard on Firebase + sets up real-time sync

param(
    [switch]$SkipBuild,
    [switch]$LocalOnly
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  OVERLORD DASHBOARD — Firebase Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── Prepare public directory ──────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Host "→ Preparing files for hosting..." -ForegroundColor Yellow
    
    if (Test-Path public) {
        Remove-Item public -Recurse -Force
    }
    New-Item -ItemType Directory -Path public -Force | Out-Null
    
    # Copy web files
    Copy-Item index.html public/
    Copy-Item style.css public/
    Copy-Item manifest.json public/
    
    Write-Host "✓ Files ready in public/" -ForegroundColor Green
}

# ── Check Firebase login ──────────────────────────────────────────────────
Write-Host "→ Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Not logged in to Firebase. Running login..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Firebase login failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Firebase authenticated" -ForegroundColor Green

# ── Deploy to Firebase ────────────────────────────────────────────────────
if (-not $LocalOnly) {
    Write-Host ""
    Write-Host "→ Deploying to Firebase..." -ForegroundColor Yellow
    firebase deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  🚀 DEPLOYMENT COMPLETE" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Dashboard URL: " -NoNewline -ForegroundColor Yellow
        Write-Host "https://overlord-dashboard.web.app" -ForegroundColor White
        Write-Host ""
        Write-Host "  • Start PC server: " -NoNewline -ForegroundColor DarkGray
        Write-Host "python server.py" -ForegroundColor White
        Write-Host "  • View logs:       " -NoNewline -ForegroundColor DarkGray
        Write-Host "firebase hosting:channel:open live" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "✓ Local setup complete. Run without -LocalOnly to deploy." -ForegroundColor Green
}

Write-Host ""
