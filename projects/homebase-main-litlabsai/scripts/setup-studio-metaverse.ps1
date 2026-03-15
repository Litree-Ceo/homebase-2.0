#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup LiTreeLab Studio Metaverse
.DESCRIPTION
    Installs dependencies and configures the new studio app
#>

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🌌 LiTreeLab Studio Metaverse Setup                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$appPath = "github/apps/litreelab-studio-metaverse"

# Check if directory exists
if (-not (Test-Path $appPath)) {
    Write-Host "❌ App directory not found at $appPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location $appPath

# Install dependencies
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installation failed" -ForegroundColor Red
    Set-Location ../../..
    exit 1
}

Write-Host "`n✅ Dependencies installed!" -ForegroundColor Green

# Check environment
Write-Host "`n🔐 Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from template..." -ForegroundColor Yellow
    @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
"@ | Set-Content ".env.local"
    Write-Host "✅ Created .env.local template" -ForegroundColor Green
}

Set-Location ../../..

Write-Host @"

═══════════════════════════════════════════════════════════
✅ Setup complete!

🚀 Start the app:
   pnpm dev:studio-metaverse

📊 Or start everything:
   .\start-all.ps1

🌐 The app will run at: http://localhost:3002
═══════════════════════════════════════════════════════════
"@ -ForegroundColor Green
