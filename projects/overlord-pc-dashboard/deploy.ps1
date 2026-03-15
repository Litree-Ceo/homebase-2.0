#!/usr/bin/env pwsh
# ════════════════════════════════════════════════════════════════════════════
#  OVERLORD PC DASHBOARD — Windows Deployment Script
#  One-command deployment for PC (native or Docker)
# ════════════════════════════════════════════════════════════════════════════

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('native', 'docker', 'test')]
    [string]$Mode = 'native',
    
    [switch]$GenerateKey,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# ── Colors ─────────────────────────────────────────────────────────────────
function Write-Step($msg) { Write-Host "→ $msg" -ForegroundColor Cyan }
function Write-Done($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# ── Header ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host " OVERLORD PC DASHBOARD — Deployment" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# ── Generate API Key ───────────────────────────────────────────────────────
if ($GenerateKey) {
    Write-Step "Generating secure API key..."
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $key = [Convert]::ToBase64String($bytes) -replace '\+','-' -replace '/','-' -replace '=',''
    Write-Host ""
    Write-Host "🔑 New API Key: " -NoNewline -ForegroundColor Yellow
    Write-Host $key -ForegroundColor White
    Write-Host ""
    Write-Host "   Add this to config.yaml:" -ForegroundColor DarkGray
    Write-Host "   auth:" -ForegroundColor DarkGray
    Write-Host "     api_key: `"$key`"" -ForegroundColor DarkGray
    Write-Host ""
    exit 0
}

# ── Check Environment ──────────────────────────────────────────────────────
Write-Step "Checking environment..."

# Python check
try {
    $pythonVersion = & python --version 2>&1
    if ($pythonVersion -match "Python (\d+\.\d+)") {
        $version = [version]$matches[1]
        if ($version -lt [version]"3.9") {
            Write-Error "Python 3.9+ required (found $pythonVersion)"
            exit 1
        }
        Write-Done "Python: $pythonVersion"
    }
} catch {
    Write-Error "Python not found. Install from https://python.org"
    exit 1
}

# Docker check (for docker mode)
if ($Mode -eq 'docker') {
    try {
        $dockerVersion = & docker --version 2>&1
        Write-Done "Docker: $dockerVersion"
    } catch {
        Write-Error "Docker not found. Install Docker Desktop for Windows."
        exit 1
    }
}

# Files check
$requiredFiles = @('server.py', 'index.html', 'style.css', 'config.yaml', 'requirements.txt')
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Missing required file: $file"
        exit 1
    }
}
Write-Done "All required files present"

# Config check
if (Select-String -Path config.yaml -Pattern "overlord-change-me-please" -Quiet) {
    Write-Warn "WARNING: Default API key detected in config.yaml"
    Write-Host "   Run: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\deploy.ps1 -GenerateKey" -ForegroundColor White -NoNewline
    Write-Host " to create a secure one" -ForegroundColor Yellow
    Write-Host ""
}

if ($CheckOnly) {
    Write-Host "✓ All checks passed. Ready to deploy." -ForegroundColor Green
    exit 0
}

Write-Host ""

# ══════════════════════════════════════════════════════════════════════════
#  DEPLOYMENT
# ══════════════════════════════════════════════════════════════════════════

switch ($Mode) {
    'native' {
        Write-Host "🚀 Deploying: Native Python Server" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Step "Installing Python dependencies..."
        & pip install -r requirements.txt --quiet --disable-pip-version-check
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install dependencies"
            exit 1
        }
        Write-Done "Dependencies installed"
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host " 🎯 DEPLOYMENT COMPLETE" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Dashboard URL:  " -NoNewline -ForegroundColor Yellow
        Write-Host "http://localhost:8080" -ForegroundColor White
        Write-Host ""
        Write-Host "   Starting server..." -ForegroundColor DarkGray
        Write-Host ""
        
        # Start server
        & python server.py
    }
    
    'docker' {
        Write-Host "🐳 Deploying: Docker Container" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Step "Building Docker image..."
        & docker-compose build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker build failed"
            exit 1
        }
        Write-Done "Image built"
        
        Write-Step "Starting container..."
        & docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to start container"
            exit 1
        }
        Write-Done "Container started"
        
        Start-Sleep -Seconds 2
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host " 🎯 DEPLOYMENT COMPLETE" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Dashboard URL:  " -NoNewline -ForegroundColor Yellow
        Write-Host "http://localhost:8080" -ForegroundColor White
        Write-Host ""
        Write-Host "   Container Name: " -NoNewline -ForegroundColor DarkGray
        Write-Host "overlord-dashboard" -ForegroundColor White
        Write-Host ""
        Write-Host "   Useful Commands:" -ForegroundColor DarkGray
        Write-Host "   • View logs:    " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose logs -f" -ForegroundColor White
        Write-Host "   • Stop:         " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose down" -ForegroundColor White
        Write-Host "   • Restart:      " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose restart" -ForegroundColor White
        Write-Host ""
    }
    
    'test' {
        Write-Host "🧪 Running Tests" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Step "Installing test dependencies..."
        & pip install -r requirements.txt --quiet --disable-pip-version-check
        
        Write-Step "Running pytest..."
        & python -m pytest tests/ -v
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Done "All tests passed!"
        } else {
            Write-Host ""
            Write-Error "Tests failed"
            exit 1
        }
    }
}

Write-Host ""
