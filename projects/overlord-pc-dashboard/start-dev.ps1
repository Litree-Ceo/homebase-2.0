#!/usr/bin/env pwsh
# start-dev.ps1 - Launch Overlord Dev Environment (Optimized)
$ErrorActionPreference = 'SilentlyContinue'
Write-Host "🚀 Starting Overlord Dev Environment..." -ForegroundColor Cyan

# Kill resource hogs
taskkill /F /IM node.exe 2>$null
taskkill /F /IM python.exe 2>$null
Start-Sleep -Milliseconds 500

# Clear memory
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

# Start server
$proc = Start-Process python -ArgumentList "server.py" -WindowStyle Hidden -PassThrough
Write-Host "✅ Server PID: $($proc.Id)" -ForegroundColor Green
Write-Host "🌐 http://localhost:8080" -ForegroundColor Cyan
Write-Host "`nStop with: Stop-Process -Id $($proc.Id)" -ForegroundColor Gray
