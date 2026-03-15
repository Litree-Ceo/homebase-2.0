#!/usr/bin/env powershell
<#
.SYNOPSIS
Run the Dashboard service in development mode
.DESCRIPTION
Starts the Dashboard module with LOG_LEVEL=debug for local development
.EXAMPLE
.\dev.ps1
#>

$ErrorActionPreference = "Stop"

# Find root directory
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting Dashboard in development mode..." -ForegroundColor Cyan
Write-Host "Root directory: $RootDir" -ForegroundColor Gray

Push-Location $RootDir
try {
    $env:LOG_LEVEL = "debug"
    docker-compose up dashboard
    Write-Host "[OK] Dashboard development service stopped" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Failed to run Dashboard: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
