# 🚀 QUICK START - One Click Setup!
# Run this in PowerShell to get everything working instantly

Write-Host "🚀 STARTING ULTIMATE SETUP..." -ForegroundColor Cyan

# Step 1: Install beautiful fonts
Write-Host "🎨 Installing beautiful fonts..." -ForegroundColor Yellow
try {
    winget install Microsoft.CascadiaCode --accept-package-agreements --accept-source-agreements | Out-Null
    winget install FiraCode --accept-package-agreements --accept-source-agreements | Out-Null
    winget install JetBrains.Mono --accept-package-agreements --accept-source-agreements | Out-Null
    winget install Adobe.SourceCodePro --accept-package-agreements --accept-source-agreements | Out-Null
    Write-Host "✅ Fonts installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Font installation failed - continuing..." -ForegroundColor Yellow
}

# Step 2: Install Oh My Posh
Write-Host "🌟 Installing Oh My Posh..." -ForegroundColor Yellow
try {
    winget install JanDeDobbeleer.OhMyPosh --accept-package-agreements --accept-source-agreements | Out-Null
    Write-Host "✅ Oh My Posh installed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Oh My Posh installation failed - continuing..." -ForegroundColor Yellow
}

# Step 3: Setup PowerShell profile
Write-Host "🔧 Setting up PowerShell profile..." -ForegroundColor Yellow
try {
    if (!(Test-Path -Path $PROFILE)) {
        New-Item -ItemType File -Path $PROFILE -Force | Out-Null
    }
    
    $profileContent = @"
# Oh My Posh Theme
oh-my-posh --init --shell pwsh --config https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/material.omp.json | Invoke-Expression

# HomeBase-2.0 Quick Aliases
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

function hb-git {
    Write-Host "🐙 Committing and pushing changes..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0"
    git add .
    git commit -m "Update"
    git push origin main
}

function hb-deploy {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run build
    vercel --prod
}

function hb-status {
    Write-Host "📊 Checking system status..." -ForegroundColor Cyan
    cd "e:\VSCode\projects\HomeBase-2.0"
    Write-Host "Git Status:" -ForegroundColor Yellow
    git status
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    Write-Host "Running smoke tests..." -ForegroundColor Yellow
    npm run smoke-test
}

function hb-emergency {
    Write-Host "🛡️ Emergency recovery..." -ForegroundColor Red
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run emergency-recovery
}

Write-Host "🎉 HomeBase-2.0 aliases loaded!" -ForegroundColor Green
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  hb-dev     - Start development server" -ForegroundColor White
Write-Host "  hb-smoke   - Run smoke tests" -ForegroundColor White
Write-Host "  hb-git     - Commit and push changes" -ForegroundColor White
Write-Host "  hb-deploy  - Deploy to production" -ForegroundColor White
Write-Host "  hb-status  - Check system status" -ForegroundColor White
Write-Host "  hb-emergency - Emergency recovery" -ForegroundColor White
"@
    
    Set-Content -Path $PROFILE -Value $profileContent
    Write-Host "✅ PowerShell profile configured!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PowerShell profile setup failed - continuing..." -ForegroundColor Yellow
}

# Step 4: Install global packages
Write-Host "📦 Installing global packages..." -ForegroundColor Yellow
try {
    npm install -g pnpm | Out-Null
    npm install -g vercel | Out-Null
    npm install -g @render/cli | Out-Null
    Write-Host "✅ Global packages installed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Global package installation failed - continuing..." -ForegroundColor Yellow
}

# Step 5: Go to project and setup
Write-Host "📁 Setting up project..." -ForegroundColor Yellow
try {
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    pnpm install | Out-Null
    Write-Host "✅ Project dependencies installed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Project setup failed - continuing..." -ForegroundColor Yellow
}

# Step 6: Reload profile
Write-Host "🔄 Reloading PowerShell profile..." -ForegroundColor Yellow
try {
    . $PROFILE
    Write-Host "✅ Profile reloaded!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Profile reload failed - continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Quick start commands:" -ForegroundColor Cyan
Write-Host "  hb-dev      - Start development server" -ForegroundColor White
Write-Host "  hb-smoke    - Run smoke tests" -ForegroundColor White
Write-Host "  hb-git      - Commit and push changes" -ForegroundColor White
Write-Host "  hb-deploy   - Deploy to production" -ForegroundColor White
Write-Host "  hb-status   - Check system status" -ForegroundColor White
Write-Host "  hb-emergency - Emergency recovery" -ForegroundColor White
Write-Host ""
Write-Host "🌟 Your terminal now has beautiful fonts and themes!" -ForegroundColor Yellow
Write-Host "📱 Open Windows Terminal settings to customize colors and backgrounds" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Ready to start building! Type 'hb-dev' to begin!" -ForegroundColor Green
