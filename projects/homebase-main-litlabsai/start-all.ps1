#!/usr/bin/env pwsh
# Start-All.ps1 - Launch all development servers
# HomeBase 2.0 Master Launcher

param(
    [switch]$Build,
    [switch]$AgentZero,
    [switch]$OpenClaw,
    [switch]$StudioMetaverse,
    [switch]$NoBrowser
)

$Host.UI.RawUI.WindowTitle = "HomeBase 2.0 - Development Servers"

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║              🚀 HomeBase 2.0 - Development Mode              ║
╠═══════════════════════════════════════════════════════════════╣
║  Starting all development servers...                          ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$RootPath = $PSScriptRoot
$Processes = @()

try {
    # 1. Start GitHub Monorepo (Web + API + Apps)
    Write-Host "`n[1/4] Starting GitHub Monorepo..." -ForegroundColor Green
    $githubPath = Join-Path $RootPath "github"
    $proc1 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$githubPath'; pnpm dev" -WindowStyle Normal -PassThru
    $Processes += $proc1
    Write-Host "  ✓ GitHub monorepo starting on http://localhost:3000" -ForegroundColor Gray
    Start-Sleep -Seconds 3

    # 2. Start Litlabs
    Write-Host "`n[2/4] Starting Litlabs..." -ForegroundColor Green
    $litlabsPath = Join-Path $RootPath "litlabs"
    $proc2 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$litlabsPath'; pnpm dev" -WindowStyle Normal -PassThru
    $Processes += $proc2
    Write-Host "  ✓ Litlabs starting on http://localhost:3001" -ForegroundColor Gray
    Start-Sleep -Seconds 2

    # 3. Start Studio Metaverse (if requested or by default)
    if ($StudioMetaverse -or $true) {
        Write-Host "`n[3/5] Starting LiTreeLab Studio Metaverse..." -ForegroundColor Green
        $studioPath = Join-Path $RootPath "github/apps/litreelab-studio-metaverse"
        $procStudio = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$studioPath'; pnpm dev" -WindowStyle Normal -PassThru
        $Processes += $procStudio
        Write-Host "  ✓ Studio Metaverse starting on http://localhost:3002" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }

    # 4. Start Agent Zero (if requested)
    if ($AgentZero) {
        Write-Host "`n[3/4] Starting Agent Zero..." -ForegroundColor Green
        $agentZeroPath = Join-Path $RootPath "github/apps/agent-zero"
        $proc3 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$agentZeroPath'; docker-compose up -d; Write-Host 'Agent Zero started on http://localhost:8000' -ForegroundColor Cyan; pause" -WindowStyle Normal -PassThru
        $Processes += $proc3
        Write-Host "  ✓ Agent Zero starting on http://localhost:8000" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }

    # 5. Start OpenClaw (if requested)
    if ($OpenClaw) {
        Write-Host "`n[4/4] Starting OpenClaw..." -ForegroundColor Green
        $proc4 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "openclaw start" -WindowStyle Normal -PassThru
        $Processes += $proc4
        Write-Host "  ✓ OpenClaw starting on http://localhost:18789" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }

    # Summary
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ All servers started successfully!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  📱 Main Web App:     http://localhost:3000" -ForegroundColor White
    Write-Host "  🔬 Litlabs:          http://localhost:3001" -ForegroundColor White
    Write-Host "  🌌 Studio Metaverse: http://localhost:3002" -ForegroundColor White
    if ($AgentZero) { Write-Host "  🤖 Agent Zero:       http://localhost:8000" -ForegroundColor White }
    if ($OpenClaw) { Write-Host "  🦞 OpenClaw:         http://localhost:18789" -ForegroundColor White }
    Write-Host ""
    Write-Host "  💡 Press Ctrl+C in each window to stop servers" -ForegroundColor Yellow
    Write-Host ""

    # Open browsers
    if (-not $NoBrowser) {
        Start-Sleep -Seconds 5
        Write-Host "  🌐 Opening browsers..." -ForegroundColor Cyan
        Start-Process "http://localhost:3000"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3001"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3002"
    }

    Write-Host "`n✨ Happy coding! ✨`n" -ForegroundColor Magenta

    # Wait for processes
    Write-Host "Press any key to close all servers..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    # Cleanup
    Write-Host "`n🛑 Stopping all servers..." -ForegroundColor Red
    $Processes | ForEach-Object { 
        if (-not $_.HasExited) {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    }

    # Stop Docker if Agent Zero was started
    if ($AgentZero) {
        Write-Host "  Stopping Agent Zero Docker containers..." -ForegroundColor Gray
        Set-Location (Join-Path $RootPath "github/apps/agent-zero")
        docker-compose down 2>&1 | Out-Null
    }

    Write-Host "  ✅ All servers stopped.`n" -ForegroundColor Green

 } catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    $stackTrace = $_.ScriptStackTrace
    Write-Host "Stack: $stackTrace" -ForegroundColor DarkGray
}
