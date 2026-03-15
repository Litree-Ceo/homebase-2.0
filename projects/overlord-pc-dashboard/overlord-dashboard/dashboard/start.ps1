#!/usr/bin/env powershell
<#
.SYNOPSIS
Start the Dashboard service using Docker Compose
.DESCRIPTION
Starts the Overlord Dashboard module via docker-compose
.EXAMPLE
.\start.ps1
#>

$ErrorActionPreference = "Stop"

# Find root directory
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting Dashboard service..." -ForegroundColor Cyan
Write-Host "Root directory: $RootDir" -ForegroundColor Gray

Push-Location $RootDir
try {
    docker-compose up -d dashboard
    Write-Host "[OK] Dashboard service started" -ForegroundColor Green
    Write-Host "  View logs: docker-compose logs -f dashboard" -ForegroundColor Gray
}
catch {
    Write-Host "[ERROR] Failed to start Dashboard: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
