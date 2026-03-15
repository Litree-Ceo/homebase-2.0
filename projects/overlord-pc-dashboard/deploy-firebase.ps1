# deploy-firebase.ps1 — Deploy Overlord Dashboard to Firebase
# Hosts dashboard on Firebase + sets up real-time sync with instant-load caching

param(
    [switch]$SkipBuild,
    [switch]$LocalOnly,
    [switch]$Production
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  OVERLORD DASHBOARD — Firebase Deployment" -ForegroundColor Cyan
Write-Host "  Instant-Load Experience with SWR Caching" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── Prepare public directory ──────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Host "→ Preparing files for hosting..." -ForegroundColor Yellow
    
    # Use modules/dashboard as the source (Firebase hosting public dir)
    $sourceDir = "modules/dashboard"
    
    if (-not (Test-Path $sourceDir)) {
        Write-Host "✗ Source directory not found: $sourceDir" -ForegroundColor Red
        exit 1
    }
    
    # Verify critical files exist
    $criticalFiles = @(
        "$sourceDir/index_v2.html",
        "$sourceDir/sw.js",
        "$sourceDir/sw-register.js",
        "$sourceDir/manifest.json",
        "$sourceDir/style.css"
    )
    
    $missingFiles = @()
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Host "⚠ Missing files:" -ForegroundColor Yellow
        $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor DarkYellow }
    }
    
    Write-Host "✓ Source ready: $sourceDir" -ForegroundColor Green
    
    # Display cache configuration
    Write-Host ""
    Write-Host "→ Cache Strategy:" -ForegroundColor Cyan
    Write-Host "  • HTML:         max-age=0 (always fresh)" -ForegroundColor Gray
    Write-Host "  • CSS/JS:       immutable (1 year)" -ForegroundColor Gray
    Write-Host "  • API:          stale-while-revalidate (1min fresh, 5min stale)" -ForegroundColor Gray
    Write-Host "  • Images:       immutable (1 year)" -ForegroundColor Gray
    Write-Host "  • 3D Assets:    immutable (1 year)" -ForegroundColor Gray
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
        Write-Host "  Instant-Load Experience Activated" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Dashboard URL:    " -NoNewline -ForegroundColor Yellow
        Write-Host "https://overlord-dashboard.web.app" -ForegroundColor White
        Write-Host "  PWA Manifest:     " -NoNewline -ForegroundColor Yellow
        Write-Host "/manifest.json" -ForegroundColor White
        Write-Host "  Service Worker:   " -NoNewline -ForegroundColor Yellow
        Write-Host "/sw.js" -ForegroundColor White
        Write-Host ""
        Write-Host "  📦 Caching Features:" -ForegroundColor Cyan
        Write-Host "     • App Shell cached for instant loads" -ForegroundColor Gray
        Write-Host "     • Stale-While-Revalidate for API data" -ForegroundColor Gray
        Write-Host "     • 3D assets cached for offline use" -ForegroundColor Gray
        Write-Host "     • Background sync for offline mutations" -ForegroundColor Gray
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
