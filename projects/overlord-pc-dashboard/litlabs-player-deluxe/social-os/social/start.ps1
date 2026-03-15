#!/usr/bin/env powershell
<#
.SYNOPSIS
Start the Social service using Docker Compose
.DESCRIPTION
Starts the Overlord Social module via docker-compose
.EXAMPLE
.\start.ps1
#>

$ErrorActionPreference = "Stop"

# Find root directory
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting Social service..." -ForegroundColor Cyan
Write-Host "Root directory: $RootDir" -ForegroundColor Gray

Push-Location $RootDir
try {
    docker-compose up -d social
    Write-Host "[OK] Social service started" -ForegroundColor Green
    Write-Host "  View logs: docker-compose logs -f social" -ForegroundColor Gray
}
catch {
    Write-Host "[ERROR] Failed to start Social: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
