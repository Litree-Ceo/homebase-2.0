# LiTree Unified - Quick Start Script

Write-Host "🌳 LiTree Unified Setup" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Check for .env.local
Write-Host ""
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.local not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ Created .env.local - Please edit with your API keys" -ForegroundColor Green
}

# Start dev server
Write-Host ""
Write-Host "🚀 Starting LiTree development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host ""

npm run dev
