#!/usr/bin/env pwsh
# Quick Start Script for HomeBase 2.0

Write-Host "🚀 Starting HomeBase 2.0 Development Environment..." -ForegroundColor Green

# Navigate to the main workspace
Set-Location "github"

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies first..." -ForegroundColor Yellow
    pnpm install
}

# Start development servers
Write-Host "🌐 Starting development servers..." -ForegroundColor Cyan
pnpm dev