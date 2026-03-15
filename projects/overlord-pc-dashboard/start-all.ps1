Write-Host '🚀 STARTING OVERLORD MONOLITH...' -ForegroundColor Cyan

Write-Host '🚀 STARTING OVERLORD MONOLITH...' -ForegroundColor Cyan

$Root = $PSScriptRoot

# --- 1. DETECT ARCHITECTURE ---
if (Test-Path (Join-Path $Root "modules\dashboard")) {
    Write-Host "✅ Detected Monolith Structure" -ForegroundColor Green
    $DashboardDir = Join-Path $Root "modules\dashboard"
    $SocialDir = Join-Path $Root "modules\social"
    $GridDir = Join-Path $Root "modules\grid"
}
elseif (Test-Path (Join-Path $Root "server.py")) {
    Write-Host "⚠️ Detected Flat Structure" -ForegroundColor Yellow
    $DashboardDir = $Root
    if (Test-Path (Join-Path $Root "social")) { $SocialDir = Join-Path $Root "social" }
    if (Test-Path (Join-Path $Root "grid")) { $GridDir = Join-Path $Root "grid" }
}
else {
    Write-Error "❌ Could not detect valid Overlord structure!"
    exit 1
}

# --- 2. START SERVICES ---

# 1. Dashboard (Port 8080)
if ($DashboardDir) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$DashboardDir'; if (Test-Path '.venv/Scripts/Activate.ps1') { . '.venv/Scripts/Activate.ps1' }; python server.py"
    Write-Host "✅ Dashboard Server Started (Port 8080) in $DashboardDir" -ForegroundColor Green
}

# 2. Social (Port 3000)
if ($SocialDir -and (Test-Path $SocialDir)) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SocialDir'; node .\\node_modules\\serve\\build\\main.js -s . -l 3000"
    Write-Host '✅ Social Server Started (Port 3000)' -ForegroundColor Green
}

# 3. Grid (Port 5000)
if ($GridDir -and (Test-Path $GridDir)) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$GridDir'; python server.py"
    Write-Host '✅ Grid Streaming Server Started (Port 5000)' -ForegroundColor Green
}

# 4. Tunnel (Remote Access)
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'code tunnel --name overlordlab --accept-server-license-terms'
Write-Host '✅ VS Code Tunnel Initialized (Name: overlordlab)' -ForegroundColor Green

Write-Host '🎯 ALL SYSTEMS ONLINE!' -ForegroundColor Green
Write-Host 'Access at: https://vscode.dev/tunnel/overlordlab' -ForegroundColor Yellow