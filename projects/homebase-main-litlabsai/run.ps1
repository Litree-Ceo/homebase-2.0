#!/usr/bin/env pwsh
# HomeBase 2.0 - Complete Development Environment Launcher
param(
    [switch]$Setup,
    [switch]$WebOnly,
    [switch]$ApiOnly,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

Write-Host "🏠 HomeBase 2.0 Development Environment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Navigate to main workspace
if (Test-Path "github") {
    Set-Location "github"
} else {
    Write-Host "❌ GitHub workspace not found!" -ForegroundColor Red
    exit 1
}

# Clean if requested
if ($Clean) {
    Write-Host "🧹 Cleaning workspace..." -ForegroundColor Yellow
    pnpm clean
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "✅ Workspace cleaned!" -ForegroundColor Green
    exit 0
}

# Setup dependencies if needed or requested
if ($Setup -or !(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Check for pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Host "✅ Using pnpm $pnpmVersion" -ForegroundColor Green
    } catch {
        Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
        npm install -g pnpm@9.15.4
    }
    
    pnpm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

# Check environment files
$envFiles = @(
    "apps/web/.env.local",
    "api/local.settings.json"
)

foreach ($envFile in $envFiles) {
    if (!(Test-Path $envFile)) {
        Write-Host "⚠️  Missing: $envFile" -ForegroundColor Yellow
        if ($envFile -like "*.example") {
            $targetFile = $envFile -replace "\.example", ""
            if (Test-Path "$envFile.example") {
                Copy-Item "$envFile.example" $targetFile
                Write-Host "✅ Created $targetFile from example" -ForegroundColor Green
            }
        }
    }
}

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Green

if ($WebOnly) {
    Write-Host "🌐 Starting web app only..." -ForegroundColor Cyan
    pnpm dev:web
} elseif ($ApiOnly) {
    Write-Host "⚡ Starting API only..." -ForegroundColor Cyan
    pnpm dev:api
} else {
    Write-Host "🌟 Starting all services..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available at:" -ForegroundColor White
    Write-Host "  Web App: http://localhost:3000" -ForegroundColor Green
    Write-Host "  API:     http://localhost:7071" -ForegroundColor Green
    Write-Host ""
    pnpm dev
}