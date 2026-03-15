#!/usr/bin/env pwsh
<#
.SYNOPSIS
    LITLABS Auto-Start Script - Smart Dev Environment Launcher
.DESCRIPTION
    Automatically detects and starts the necessary services for HomeBase 2.0:
    - Azure Functions API (port 7071)
    - Next.js Frontend (port 3000)
    - Python Virtual Environment (if exists)
.NOTES
    Author: LITLABS 2026
    Auto-runs on workspace open via VS Code tasks
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipAPI,
    [switch]$SkipWeb
)

$ErrorActionPreference = "Continue"
$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    LITLABS AUTO-START - LET'S GET THIS MONEY!" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Workspace: $WorkspaceRoot" -ForegroundColor Yellow
Write-Host "`n[CHECKS] Running pre-flight checks..." -ForegroundColor Magenta

# Function to check if port is in use
function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -ne $connection
    } catch {
        return $false
    }
}

# Function to check if pnpm is installed
function Test-PnpmInstalled {
    try {
        $null = pnpm --version 2>&1
        return $true
    } catch {
        return $false
    }
}

# Check dependencies
if (-not (Test-PnpmInstalled)) {
    Write-Host "[ERROR] pnpm is not installed!" -ForegroundColor Red
    Write-Host "Install it: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path (Join-Path $WorkspaceRoot "api"))) {
    Write-Host "[ERROR] API folder not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $WorkspaceRoot "apps\web"))) {
    Write-Host "[ERROR] Web folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] All dependencies found!" -ForegroundColor Green

# Function to start process in new window
function Start-ServiceInBackground {
    param(
        [string]$Name,
        [string]$Command,
        [int]$Port,
        [string]$WorkDir
    )
    
    if (Test-PortInUse -Port $Port) {
        Write-Host "[SKIP] $Name already running on port $Port" -ForegroundColor Green
        return $true
    }
    
    # Check if work directory exists
    if (-not (Test-Path $WorkDir)) {
        Write-Host "[ERROR] Directory not found: $WorkDir" -ForegroundColor Red
        return $false
    }
    
    Write-Host "[START] Launching $Name on port $Port..." -ForegroundColor Magenta
    
    try {
        $processArgs = @{
            FilePath = "pwsh.exe"
            ArgumentList = "-NoExit", "-NoProfile", "-Command", $Command
            WindowStyle = "Normal"
            WorkingDirectory = $WorkDir
            PassThru = $true
        }
        
        $null = Start-Process @processArgs
        Start-Sleep -Seconds 5
        
        if (Test-PortInUse -Port $Port) {
            Write-Host "[SUCCESS] $Name started successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[WARN] $Name starting (may take a moment)..." -ForegroundColor Yellow
            return $true
        }
    }
    catch {
        Write-Host "[ERROR] Failed to start $Name : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Activate Python venv if exists
$venvPath = Join-Path $WorkspaceRoot ".venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "[PYTHON] Activating virtual environment..." -ForegroundColor Cyan
    & $venvPath
    Write-Host "[OK] Python venv activated!" -ForegroundColor Green
}

# Start API
if (-not $SkipAPI) {
    $apiPath = Join-Path $WorkspaceRoot "api"
    if (Test-Path (Join-Path $apiPath "package.json")) {
        Write-Host "`n[API] Preparing Azure Functions..." -ForegroundColor Cyan
        $apiCommand = "Write-Host 'Starting API...' -ForegroundColor Cyan; pnpm install --silent; pnpm build; if (`$LASTEXITCODE -eq 0) { pnpm start } else { Write-Host 'Build failed!' -ForegroundColor Red; pause }"
        Start-ServiceInBackground -Name "Azure Functions API" -Command $apiCommand -Port 7071 -WorkDir $apiPath
    } else {
        Write-Host "[SKIP] API package.json not found" -ForegroundColor Yellow
    }
}

# Start Web Frontend
if (-not $SkipWeb) {
    $webPath = Join-Path $WorkspaceRoot "apps\web"
    if (Test-Path (Join-Path $webPath "package.json")) {
        Write-Host "`n[WEB] Preparing Next.js..." -ForegroundColor Cyan
        $webCommand = "Write-Host 'Starting Web App...' -ForegroundColor Cyan; pnpm install --silent; pnpm dev"
        Start-ServiceInBackground -Name "Next.js Frontend" -Command $webCommand -Port 3000 -WorkDir $webPath
    } else {
        Write-Host "[SKIP] Web package.json not found" -ForegroundColor Yellow
    }
}

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "    READY TO MAKE MONEY - ALL SYSTEMS GO!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "`nFrontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "API:       http://localhost:7071/api" -ForegroundColor Cyan
Write-Host "Swagger:   http://localhost:7071/api/swagger" -ForegroundColor Cyan
Write-Host "`nTip: Check the new terminal windows for service logs" -ForegroundColor Yellow
Write-Host "Tip: Run 'netstat -ano | findstr :3000' to verify ports" -ForegroundColor Yellow
Write-Host "`n[READY] LET'S GET THIS BAG! TIME TO MAKE THAT MONEY!" -ForegroundColor Yellow
Write-Host ""
