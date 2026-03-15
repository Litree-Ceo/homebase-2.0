#!/usr/bin/env powershell
<#
.SYNOPSIS
Run the Social service in development mode
.DESCRIPTION
Starts the Social module with LOG_LEVEL=debug for local development
.EXAMPLE
.\dev.ps1
#>

$ErrorActionPreference = "Stop"

# Find root directory
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting Social in development mode..." -ForegroundColor Cyan
Write-Host "Root directory: $RootDir" -ForegroundColor Gray

Push-Location $RootDir
try {
    $env:LOG_LEVEL = "debug"
    docker-compose up social
    Write-Host "[OK] Social development service stopped" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Failed to run Social: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
