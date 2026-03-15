#!/usr/bin/env powershell
# Overlord AI Agent Launcher
# Starts the enhanced AI Agent server

param(
    [int]$Port = 8080,
    [switch]$UseAgentServer,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Overlord AI Agent Launcher

Usage: .\start-agent.ps1 [options]

Options:
    -Port <number>     Set the port (default: 8080)
    -UseAgentServer    Use agent_server.py instead of server.py
    -Help              Show this help message

Examples:
    .\start-agent.ps1                    # Start on default port 8080
    .\start-agent.ps1 -Port 3000         # Start on port 3000
    .\start-agent.ps1 -UseAgentServer    # Use alternative server
"@
    exit
}

$Host.UI.RawUI.WindowTitle = "Overlord AI Agent v2.0"

Write-Host @"

    ╔══════════════════════════════════════════════════════════════════╗
    ║           🤖 OVERLORD AI AGENT v2.0 - ENHANCED                   ║
    ║                                                                  ║
    ║  Starting server...                                              ║
    ╚══════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Set environment variables
$env:PORT = $Port

# Choose server file
$serverFile = if ($UseAgentServer) { "agent_server.py" } else { "server.py" }

# Check if file exists
if (-not (Test-Path $serverFile)) {
    Write-Host "❌ Error: $serverFile not found!" -ForegroundColor Red
    exit 1
}

# Check Python
$pythonCmd = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } elseif (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { $null }

if (-not $pythonCmd) {
    Write-Host "❌ Error: Python not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Using Python: $pythonCmd" -ForegroundColor Green
Write-Host "✓ Server file: $serverFile" -ForegroundColor Green
Write-Host "✓ Port: $Port" -ForegroundColor Green
Write-Host ""

# Start server
try {
    & $pythonCmd $serverFile
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
