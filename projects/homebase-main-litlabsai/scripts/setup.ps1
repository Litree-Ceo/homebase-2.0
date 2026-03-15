#!/usr/bin/env pwsh
# HomeBase 2.0 Setup Script
# This script sets up the development environment and installs all dependencies

Write-Host "🚀 Setting up HomeBase 2.0..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20.x" -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm found: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm@9.15.4
}

# Navigate to github directory (main workspace)
Set-Location "github"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Check if Azure Functions Core Tools is installed (for API)
try {
    $funcVersion = func --version
    Write-Host "✅ Azure Functions Core Tools found: $funcVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Azure Functions Core Tools not found. Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true" -ForegroundColor Yellow
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  pnpm dev        - Start all services in development mode" -ForegroundColor White
Write-Host "  pnpm dev:web    - Start web app only" -ForegroundColor White
Write-Host "  pnpm dev:api    - Start API only" -ForegroundColor White
Write-Host "  pnpm build      - Build all packages" -ForegroundColor White
Write-Host "  pnpm lint       - Run linting" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Run 'pnpm dev' to start development!" -ForegroundColor Green