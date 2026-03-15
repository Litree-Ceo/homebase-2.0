# 🚀 SMART TERMINAL SETUP - Make Your Terminal Genius!

Write-Host "🚀 Making your terminal smart and powerful..." -ForegroundColor Cyan

# Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Create PowerShell profile if it doesn't exist
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force | Out-Null
}

# Add smart aliases and functions
$profileContent = @"
# Smart Terminal Setup for HomeBase-2.0

# Quick Navigation
function hb { 
    cd "e:\VSCode\projects\HomeBase-2.0"
    Write-Host "🚀 Navigated to HomeBase-2.0" -ForegroundColor Green
}

function hb-app { 
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    Write-Host "📱 Navigated to litlabs-web app" -ForegroundColor Green
}

# Development Commands
function hb-dev {
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    & e:/VSCode/projects/HomeBase-2.0/.venv/Scripts/Activate.ps1
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run dev
}

function hb-smoke {
    Write-Host "🧪 Running smoke tests..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run smoke-test
}

function hb-build {
    Write-Host "🏗️ Building project..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run build
}

# Git Commands
function hb-git {
    Write-Host "🐙 Committing and pushing changes..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0"
    git add .
    git commit -m "Update"
    git push origin main
}

function hb-status {
    Write-Host "📊 Checking system status..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0"
    Write-Host "Git Status:" -ForegroundColor Yellow
    git status
}

# Deployment Commands
function hb-deploy {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run build
    vercel --prod
}

function hb-deploy-render {
    Write-Host "🌐 Deploying to Render..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0"
    render deploy
}

# Emergency Commands
function hb-emergency {
    Write-Host "🛡️ Emergency recovery..." -ForegroundColor Red
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run emergency-recovery
}

function hb-clean {
    Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    rm -rf .next
    npm run build
}

# Utility Commands
function hb-setup {
    Write-Host "🔧 Setting up project..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    pnpm install
    npm run build
}

function hb-test {
    Write-Host "🧪 Running all tests..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run smoke-test
    npm run type-check
    npm run lint
}

# Help Command
function hb-help {
    Write-Host "🎯 HomeBase-2.0 Smart Terminal Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Navigation:" -ForegroundColor Yellow
    Write-Host "  hb        - Go to project root" -ForegroundColor White
    Write-Host "  hb-app    - Go to app directory" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Development:" -ForegroundColor Yellow
    Write-Host "  hb-dev    - Start development server" -ForegroundColor White
    Write-Host "  hb-smoke  - Run smoke tests" -ForegroundColor White
    Write-Host "  hb-build  - Build project" -ForegroundColor White
    Write-Host ""
    Write-Host "🐙 Git:" -ForegroundColor Yellow
    Write-Host "  hb-git    - Commit and push changes" -ForegroundColor White
    Write-Host "  hb-status - Check git status" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Deployment:" -ForegroundColor Yellow
    Write-Host "  hb-deploy       - Deploy to Vercel" -ForegroundColor White
    Write-Host "  hb-deploy-render - Deploy to Render" -ForegroundColor White
    Write-Host ""
    Write-Host "🛡️ Emergency:" -ForegroundColor Yellow
    Write-Host "  hb-emergency - Emergency recovery" -ForegroundColor White
    Write-Host "  hb-clean     - Clean and rebuild" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Utility:" -ForegroundColor Yellow
    Write-Host "  hb-setup  - Setup project" -ForegroundColor White
    Write-Host "  hb-test   - Run all tests" -ForegroundColor White
    Write-Host "  hb-help   - Show this help" -ForegroundColor White
}

# Welcome Message
Write-Host "🎉 Smart Terminal loaded! Type 'hb-help' for commands." -ForegroundColor Green
"@

Set-Content -Path $PROFILE -Value $profileContent

# Reload profile
. $PROFILE

Write-Host ""
Write-Host "🎉 YOUR TERMINAL IS NOW SMART!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Quick start:" -ForegroundColor Cyan
Write-Host "  hb-dev    - Start development server" -ForegroundColor White
Write-Host "  hb-help   - Show all commands" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your terminal is no longer dumb! It's now a genius!" -ForegroundColor Yellow
