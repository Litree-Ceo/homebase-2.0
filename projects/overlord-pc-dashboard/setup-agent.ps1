#!/usr/bin/env powershell
# Overlord Agent Setup - Complete installation

$ErrorActionPreference = "Stop"

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        OVERLORD AI AGENT SETUP                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check Python
Write-Host "`n[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $pyVersion = python --version 2>&1
    Write-Host "    ✓ $pyVersion" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Python not found! Install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n[2/5] Installing dependencies..." -ForegroundColor Yellow
$deps = @("requests", "python-dotenv", "psutil")
foreach ($dep in $deps) {
    try {
        python -c "import $dep" 2>&1 | Out-Null
        Write-Host "    ✓ $dep already installed" -ForegroundColor Green
    } catch {
        Write-Host "    → Installing $dep..." -ForegroundColor Cyan
        pip install $dep -q
    }
}

# Setup .env
Write-Host "`n[3/5] Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    @"
API_KEY=$(-join ((65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ }))
GROQ_API_KEY=
PERPLEXITY_API_KEY=
PORT=8080
AUTH_ON=true
"@ | Out-File .env -Encoding UTF8
    Write-Host "    ✓ Created .env file" -ForegroundColor Green
}

# Show current keys
$envContent = Get-Content .env -Raw

# Groq API Key
if ($envContent -match "GROQ_API_KEY=.+" -and $matches[0].Length -gt 14) {
    Write-Host "    ✓ GROQ_API_KEY configured" -ForegroundColor Green
} else {
    Write-Host "`n    🔑 Enter your Groq API Key (get from console.groq.com):" -ForegroundColor Cyan
    $groqKey = Read-Host "    Groq API Key"
    if ($groqKey) {
        (Get-Content .env) -replace "GROQ_API_KEY=.*", "GROQ_API_KEY=$groqKey" | Set-Content .env
        Write-Host "    ✓ Groq key saved" -ForegroundColor Green
    }
}

# Perplexity API Key
if ($envContent -match "PERPLEXITY_API_KEY=.+" -and $matches[0].Length -gt 20) {
    Write-Host "    ✓ PERPLEXITY_API_KEY configured" -ForegroundColor Green
} else {
    Write-Host "`n    🔑 Enter your Perplexity API Key (get from perplexity.ai/settings):" -ForegroundColor Cyan
    Write-Host "       This enables web search capabilities" -ForegroundColor Gray
    $perpKey = Read-Host "    Perplexity API Key (optional, press Enter to skip)"
    if ($perpKey) {
        (Get-Content .env) -replace "PERPLEXITY_API_KEY=.*", "PERPLEXITY_API_KEY=$perpKey" | Set-Content .env
        Write-Host "    ✓ Perplexity key saved" -ForegroundColor Green
    } else {
        Write-Host "    ⚠ Skipped (web search won't work without it)" -ForegroundColor Yellow
    }
}

# Install server
Write-Host "`n[4/5] Installing agent server..." -ForegroundColor Yellow
if (Test-Path server.py) {
    Copy-Item server.py server.py.backup -Force
    Write-Host "    ✓ Backed up server.py" -ForegroundColor Green
}
Copy-Item agent_server.py server.py -Force
Write-Host "    ✓ Installed agent server" -ForegroundColor Green

# Create launcher
Write-Host "`n[5/5] Creating launcher..." -ForegroundColor Yellow
$launcher = @"
@echo off
echo Starting Overlord AI Agent...
echo.
python server.py
pause
"@
$launcher | Out-File "start-agent.bat" -Encoding ASCII
Write-Host "    ✓ Created start-agent.bat" -ForegroundColor Green

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        SETUP COMPLETE! 🎉                            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 Quick Start:" -ForegroundColor Cyan
Write-Host "   1. Run: python server.py" -ForegroundColor White
Write-Host "   2. Open: http://localhost:8080/agent.html" -ForegroundColor White
Write-Host "   3. API Endpoint: http://localhost:8080/api/agent/chat" -ForegroundColor White
Write-Host "   4. n8n Webhook: http://localhost:8080/api/n8n/webhook" -ForegroundColor White

Write-Host "`n🛠️ Available Commands:" -ForegroundColor Cyan
Write-Host "   /stats         - Show PC stats" -ForegroundColor Gray
Write-Host "   /cmd <command> - Execute shell command" -ForegroundColor Gray
Write-Host "   /read <file>   - Read file contents" -ForegroundColor Gray
Write-Host "   /search <query>- Web search (auto-detected)" -ForegroundColor Gray

Write-Host "`n🔗 n8n Integration:" -ForegroundColor Cyan
Write-Host "   Import: n8n-agent-workflow.json into n8n" -ForegroundColor Gray
Write-Host "   Update: Change 'your-overlord-server' to your IP/hostname" -ForegroundColor Gray

Write-Host ""
