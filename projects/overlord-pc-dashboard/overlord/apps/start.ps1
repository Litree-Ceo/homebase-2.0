#!/usr/bin/env powershell
# Start the Overlord API server

param(
    [switch]$Dev,
    [switch]$Install
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Cyan = "`e[36m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

function Write-Info($msg) { Write-Host "$Cyan[INFO]$Reset $msg" }
function Write-Success($msg) { Write-Host "$Green[OK]$Reset $msg" }
function Write-Warn($msg) { Write-Host "$Yellow[WARN]$Reset $msg" }

# Check Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Error "Python not found. Please install Python 3.11+"
    exit 1
}

Write-Info "Using Python: $($python.Source)"
& $python.Source --version

# Create virtual environment if needed
if (-not (Test-Path "venv")) {
    Write-Info "Creating virtual environment..."
    & $python.Source -m venv venv
}

# Activate virtual environment
Write-Info "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install dependencies
if ($Install -or -not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Info "Installing dependencies..."
    pip install -r requirements.txt
    Write-Success "Dependencies installed"
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Warn ".env file not found, copying from .env.example"
    Copy-Item ".env.example" ".env"
    Write-Warn "Please edit .env file with your configuration"
}

# Start server
Write-Info "Starting Overlord API..."
if ($Dev) {
    Write-Info "Development mode with auto-reload"
    python -m app.main
} else {
    Write-Info "Production mode"
    uvicorn app.main:app --host 0.0.0.0 --port 8000
}
