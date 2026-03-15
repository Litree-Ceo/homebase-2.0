# ═══════════════════════════════════════════════════════════════════
# OVERLORD DASHBOARD - ONE-COMMAND STARTUP
# ═══════════════════════════════════════════════════════════════════
# Add this to your PowerShell profile or run it directly

function overlord {
    <#
    .SYNOPSIS
    One-command startup for Overlord PC Dashboard with hot-reload dev mode.
    
    .DESCRIPTION
    Starts Overlord in Docker with file watching, logs, and auto-opens browser.
    
    .PARAMETER Mode
    'dev' (default) - Hot-reload development mode
    'prod' - Production mode (no file watching)
    'stop' - Stop running Overlord container
    'logs' - Show live logs
    'shell' - Open shell in running container
    'clean' - Stop and remove container + volumes
    
    .EXAMPLE
    overlord              # Start dev mode
    overlord -Mode prod  # Start production
    overlord -Mode logs  # View logs
    overlord -Mode stop  # Stop container
    #>
    
    param(
        [ValidateSet('dev', 'prod', 'stop', 'logs', 'shell', 'clean')]
        [string]$Mode = 'dev'
    )
    
    $projectPath = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"
    $containerName = "overlord-dashboard-dev"
    $port = 8080
    $url = "http://localhost:$port"
    
    Push-Location $projectPath
    
    try {
        switch ($Mode) {
            'dev' {
                Write-Host "🚀 Starting Overlord (DEV MODE - Hot Reload)" -ForegroundColor Cyan
                Write-Host "📁 Project: $projectPath" -ForegroundColor Gray
                
                # Build and start with file watching
                docker compose -f docker-compose.dev.yml up --build -d
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Container started" -ForegroundColor Green
                    Start-Sleep -Seconds 3
                    
                    # Check health
                    $health = docker inspect --format='{{.State.Health.Status}}' $containerName 2>$null
                    
                    if ($health -eq 'healthy') {
                        Write-Host "✅ Container healthy" -ForegroundColor Green
                        Write-Host "`n📊 Opening dashboard: $url" -ForegroundColor Cyan
                        Start-Process $url
                        
                        Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║             🔥 OVERLORD DEV MODE ACTIVE 🔥                     ║
╠════════════════════════════════════════════════════════════════╣
║ Edit server.py, index.html, style.css, config.yaml           ║
║ Changes auto-reload instantly (no rebuild needed)            ║
║                                                               ║
║ Commands:                                                     ║
║   overlord -Mode logs     → View live logs                    ║
║   overlord -Mode shell    → Shell into container             ║
║   overlord -Mode stop     → Stop container                   ║
║   overlord -Mode clean    → Remove container & volumes       ║
║                                                               ║
║ Dashboard: $url                                              ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
                    } else {
                        Write-Host "⚠️  Container not healthy yet. Check logs:" -ForegroundColor Yellow
                        overlord -Mode logs
                    }
                } else {
                    Write-Host "❌ Failed to start container" -ForegroundColor Red
                }
            }
            
            'prod' {
                Write-Host "🚀 Starting Overlord (PRODUCTION MODE)" -ForegroundColor Yellow
                docker compose -f docker-compose.prod.yml up --build -d
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Production container started" -ForegroundColor Green
                    Start-Sleep -Seconds 2
                    Start-Process $url
                }
            }
            
            'stop' {
                Write-Host "⛔ Stopping Overlord..." -ForegroundColor Yellow
                docker compose -f docker-compose.dev.yml down
                Write-Host "✅ Stopped" -ForegroundColor Green
            }
            
            'logs' {
                Write-Host "📊 Live logs (Ctrl+C to exit)..." -ForegroundColor Cyan
                docker compose -f docker-compose.dev.yml logs -f overlord
            }
            
            'shell' {
                Write-Host "🐚 Opening shell in container..." -ForegroundColor Cyan
                docker compose -f docker-compose.dev.yml exec overlord /bin/bash
            }
            
            'clean' {
                Write-Host "🗑️  Cleaning up (removing container + volumes)..." -ForegroundColor Red
                docker compose -f docker-compose.dev.yml down -v
                Write-Host "✅ Cleaned" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}
