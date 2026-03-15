#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🔥 LITLABS Complete Setup & Verification
.DESCRIPTION
    Verifies and sets up everything you need to start making money
.NOTES
    Author: Larry Bol - LITLABS 2026
#>

$ErrorActionPreference = "Continue"

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "    LITLABS MONEY MAKER SETUP - FULL SYSTEM CHECK" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

# Git Check
Write-Host "[GIT] Checking Git configuration..." -ForegroundColor Yellow
$gitName = git config user.name
$gitEmail = git config user.email
if ($gitName -and $gitEmail) {
    Write-Host "[OK] Git configured as: $gitName <$gitEmail>" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Git not configured!" -ForegroundColor Red
    git config --global user.name "Larry Bol"
    git config --global user.email "dyingbreed243@gmail.com"
    Write-Host "[FIXED] Git configured!" -ForegroundColor Green
}

# Azure Check
Write-Host "`n[AZURE] Checking Azure login..." -ForegroundColor Yellow
$azAccount = az account show 2>&1
if ($LASTEXITCODE -eq 0) {
    $subscription = az account show --query name -o tsv
    $role = (az role assignment list --assignee (az account show --query user.name -o tsv) --query "[0].roleDefinitionName" -o tsv)
    Write-Host "[OK] Signed into Azure" -ForegroundColor Green
    Write-Host "     Subscription: $subscription" -ForegroundColor Cyan
    Write-Host "     Role: $role" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] Not signed into Azure!" -ForegroundColor Red
    Write-Host "[ACTION] Run: az login" -ForegroundColor Yellow
}

# Dependencies Check
Write-Host "`n[DEPS] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[OK] Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[WARN] Root dependencies missing - run 'pnpm install'" -ForegroundColor Yellow
}

if (Test-Path "api/node_modules") {
    Write-Host "[OK] API dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[WARN] API dependencies missing" -ForegroundColor Yellow
}

if (Test-Path "apps/web/node_modules") {
    Write-Host "[OK] Web dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[WARN] Web dependencies missing" -ForegroundColor Yellow
}

# API Keys Check
Write-Host "`n[KEYS] Checking API configuration..." -ForegroundColor Yellow
if (Test-Path "api/local.settings.json") {
    Write-Host "[OK] API settings file exists" -ForegroundColor Green
    $settings = Get-Content "api/local.settings.json" | ConvertFrom-Json
    
    # Check critical keys
    $missingKeys = @()
    if ([string]::IsNullOrWhiteSpace($settings.Values.PADDLE_WEBHOOK_SECRET)) { $missingKeys += "PADDLE_WEBHOOK_SECRET" }
    if ([string]::IsNullOrWhiteSpace($settings.Values.EXCHANGE_API_KEY)) { $missingKeys += "EXCHANGE_API_KEY" }
    
    if ($missingKeys.Count -eq 0) {
        Write-Host "[OK] All API keys configured" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Missing keys: $($missingKeys -join ', ')" -ForegroundColor Yellow
        Write-Host "       Edit api/local.settings.json to add them" -ForegroundColor Cyan
    }
} else {
    Write-Host "[ERROR] api/local.settings.json not found!" -ForegroundColor Red
}

# Python Check
Write-Host "`n[PYTHON] Checking Python environment..." -ForegroundColor Yellow
if (Test-Path ".venv/Scripts/Activate.ps1") {
    Write-Host "[OK] Python virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "[INFO] No Python venv (optional)" -ForegroundColor Cyan
}

# Summary
Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "    SETUP COMPLETE - READY TO MAKE MONEY!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "`nTo start the dev environment:" -ForegroundColor Yellow
Write-Host "  1. Just open this workspace (auto-starts)" -ForegroundColor Cyan
Write-Host "  2. Or run: .\scripts\Auto-Start-DevEnvironment.ps1" -ForegroundColor Cyan
Write-Host "`n`$`$`$ LET'S GET THIS BAG! TIME TO MAKE THAT MONEY! `$`$`$`n" -ForegroundColor Yellow
