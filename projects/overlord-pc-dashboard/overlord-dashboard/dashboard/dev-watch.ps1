# dev-watch.ps1 — Auto-restart server on file changes (Live Preview)
# Usage: .\dev-watch.ps1

param(
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  OVERLORD — Live Development Mode             ║" -ForegroundColor Cyan
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Watching for changes to:" -ForegroundColor Yellow
Write-Host "    • server.py" -ForegroundColor White
Write-Host "    • index.html" -ForegroundColor White
Write-Host "    • style.css" -ForegroundColor White
Write-Host "    • config.yaml" -ForegroundColor White
Write-Host ""
Write-Host "  Server: http://localhost:$Port" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

# Open browser once
Start-Process "http://localhost:$Port"

$pythonProcess = $null
$watchFiles = @('server.py', 'index.html', 'style.css', 'config.yaml')

function Start-Server {
    # Kill old process if exists
    if ($pythonProcess -and -not $pythonProcess.HasExited) {
        Write-Host "→ Stopping old server..." -ForegroundColor Yellow
        $pythonProcess.Kill()
        Start-Sleep -Milliseconds 500
    }

    Write-Host "→ Starting server..." -ForegroundColor Cyan
    $pythonProcess = Start-Process python -ArgumentList "server.py" -PassThru -NoNewWindow
    Write-Host "✓ Server running (PID: $($pythonProcess.Id))" -ForegroundColor Green
    Write-Host ""
}

# Initial start
Start-Server

# Watch loop
$lastWrite = @{}
foreach ($file in $watchFiles) {
    if (Test-Path $file) {
        $lastWrite[$file] = (Get-Item $file).LastWriteTime
    }
}

Write-Host "👁️  Watching for file changes..." -ForegroundColor Magenta
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 1

        foreach ($file in $watchFiles) {
            if (Test-Path $file) {
                $current = (Get-Item $file).LastWriteTime
                if ($lastWrite[$file] -ne $current) {
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
                    Write-Host "🔄 CHANGE DETECTED: $file" -ForegroundColor Yellow
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
                    $lastWrite[$file] = $current
                    Start-Server
                }
            }
        }
    }
} finally {
    # Cleanup on exit
    if ($pythonProcess -and -not $pythonProcess.HasExited) {
        Write-Host ""
        Write-Host "→ Stopping server..." -ForegroundColor Yellow
        $pythonProcess.Kill()
    }
    Write-Host "✓ Dev watch stopped" -ForegroundColor Green
}
