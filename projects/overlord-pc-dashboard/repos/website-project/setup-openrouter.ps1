#!/usr/bin/env pwsh
# Setup script for OpenRouter integration

Write-Host "🚀 Setting up Social Site with OpenRouter AI..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path backend\.env)) {
    Write-Host "📄 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item backend\.env.example backend\.env
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit backend\.env and add your OpenRouter API key:" -ForegroundColor Red
    Write-Host "   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get your key from: https://openrouter.ai/settings/keys" -ForegroundColor Cyan
} else {
    Write-Host "✅ backend\.env already exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies  
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend-new
npm install
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  1. Terminal 1: cd backend; npm start" -ForegroundColor White
Write-Host "  2. Terminal 2: cd frontend-new; npm start" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:3000" -ForegroundColor Cyan
