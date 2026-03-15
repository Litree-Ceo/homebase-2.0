#!/usr/bin/env pwsh
# LitLabs AI - Development Server Startup Script

Write-Host "🔥 LitLabs AI - Starting Development Server 🔥" -ForegroundColor Cyan
Write-Host ""

# Set the correct directory
$ProjectDir = "D:\LiTreeLabStudio\Projects\Active\Labs-Ai"
Set-Location $ProjectDir

Write-Host "📂 Current Directory: " -NoNewline -ForegroundColor Yellow
Write-Host $ProjectDir -ForegroundColor Green
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "   Current location: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ package.json found!" -ForegroundColor Green
Write-Host ""

# Start the dev server
Write-Host "🚀 Starting Next.js dev server..." -ForegroundColor Magenta
Write-Host "💰 Let's get this money! 💰" -ForegroundColor Yellow
Write-Host ""

npm run dev
