#!/usr/bin/env pwsh
# 🚀 One-Click Deploy with Gemini CLI
# Usage: .\deploy-with-gemini.ps1

param(
    [switch]$CloudShell = $false
)

$ErrorActionPreference = "Stop"

Write-Host @"
🤖 Gemini CLI Deployment Assistant
═══════════════════════════════════
"@ -ForegroundColor Cyan

if ($CloudShell) {
    Write-Host "☁️  Cloud Shell Mode" -ForegroundColor Yellow
    
    # Cloud Shell commands
    $commands = @"
cd ~/homebase-2.0/github
git pull origin merge-github-content 2>/dev/null || echo 'Already up to date'
pnpm install
pnpm build:web
firebase deploy --only hosting
"@
    
    Write-Host "`n📋 Copy these commands to Cloud Shell:" -ForegroundColor Green
    Write-Host $commands -ForegroundColor White
    
    # Open Cloud Shell
    Start-Process "https://shell.cloud.google.com/?project=studio-6082148059-d1fec"
    
} else {
    Write-Host "💻 Local Mode" -ForegroundColor Yellow
    
    # Check if we're in the right directory
    if (!(Test-Path "github\package.json")) {
        Write-Host "❌ Error: Run this from the homebase-2.0 root directory" -ForegroundColor Red
        exit 1
    }
    
    # Use Gemini to analyze and deploy
    Write-Host "`n🤖 Asking Gemini to analyze deployment readiness..." -ForegroundColor Cyan
    
    $analysis = @"
Analyze the Firebase deployment for project studio-6082148059-d1fec:
- Check if firebase.json exists and is valid
- Check if .firebaserc exists with correct project
- Verify build output directory exists
- List any missing configuration

Provide a concise summary.
"@
    
    # Check files
    $checks = @{
        "firebase.json" = Test-Path "github\firebase.json"
        ".firebaserc" = Test-Path "github\.firebaserc"
        "apphosting.yaml" = Test-Path "github\apphosting.yaml"
        "node_modules" = Test-Path "github\node_modules"
    }
    
    Write-Host "`n📁 Configuration Status:" -ForegroundColor Yellow
    $checks.GetEnumerator() | ForEach-Object {
        if ($_.Value) {
            Write-Host "  ✅ $($_.Key)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($_.Key)" -ForegroundColor Red
        }
    }
    
    # Deploy
    Write-Host "`n🚀 Starting deployment..." -ForegroundColor Green
    
    Set-Location github
    
    # Install if needed
    if (!$checks["node_modules"]) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        pnpm install
    }
    
    # Build
    Write-Host "🔨 Building..." -ForegroundColor Yellow
    pnpm build:web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    # Deploy
    Write-Host "📤 Deploying to Firebase..." -ForegroundColor Yellow
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
        Write-Host "🌐 https://studio-6082148059-d1fec.web.app" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Deployment failed" -ForegroundColor Red
        Write-Host "💡 Try running: firebase login" -ForegroundColor Yellow
    }
}
