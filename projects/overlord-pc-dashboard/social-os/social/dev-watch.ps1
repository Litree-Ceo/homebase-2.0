#!/usr/bin/env pwsh
# ============================================
# LiTreeLabStudio SOCIAL - Live Development Mode
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  LiTreeLabStudio SOCIAL — Live Development Mode      ║" -ForegroundColor Green
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host ""
Write-Host "  Watching for changes to:" -ForegroundColor Cyan
Write-Host "    • index.html"
Write-Host "    • style.css"
Write-Host "    • app.js"
Write-Host ""
Write-Host "  Server: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Files to watch
$files = @("index.html", "style.css", "app.js")
$port = 3000
$serverProcess = $null

# Simple HTTP Server function
function Start-Server {
    Write-Host "→ Starting server..." -ForegroundColor Yellow
    
    # Kill any existing server on port 3000
    Get-Process | Where-Object { $_.ProcessName -eq 'python' } | ForEach-Object {
        try {
            $connections = netstat -ano | Select-String ":$port.*LISTENING"
            if ($connections -match $_.Id) {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
    
    # Start Python simple HTTP server
    $script:serverProcess = Start-Process python -ArgumentList "-m http.server $port --bind 127.0.0.1" -WindowStyle Hidden -PassThru
    Start-Sleep -Milliseconds 500
    
    Write-Host "✓ Server running (PID: $($script:serverProcess.Id))" -ForegroundColor Green
    Write-Host ""
}

# Stop server function
function Stop-Server {
    if ($script:serverProcess) {
        Stop-Process -Id $script:serverProcess.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 200
    }
}

# Initial server start
Start-Server

# Open browser (first time only)
Start-Sleep -Seconds 1
Start-Process "http://localhost:$port"

# Track last modification times
$lastWrite = @{}
foreach ($file in $files) {
    if (Test-Path $file) {
        $lastWrite[$file] = (Get-Item $file).LastWriteTime
    }
}

# Watch loop
try {
    Write-Host "👁️  Watching for file changes..." -ForegroundColor Cyan
    Write-Host ""
    
    while ($true) {
        Start-Sleep -Milliseconds 500
        
        foreach ($file in $files) {
            if (Test-Path $file) {
                $currentWrite = (Get-Item $file).LastWriteTime
                
                if ($currentWrite -ne $lastWrite[$file]) {
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
                    Write-Host "🔄 CHANGE DETECTED: $file" -ForegroundColor Yellow
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
                    
                    $lastWrite[$file] = $currentWrite
                    
                    # Restart server
                    Stop-Server
                    Start-Server
                    
                    Write-Host "✓ Changes applied - refresh browser" -ForegroundColor Green
                    Write-Host ""
                }
            }
        }
    }
} finally {
    Write-Host ""
    Write-Host "✓ Dev watch stopped" -ForegroundColor Yellow
    Stop-Server
}
