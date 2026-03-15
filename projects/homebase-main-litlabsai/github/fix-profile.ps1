# Fix PowerShell Profile Script
$profilePath = $PROFILE

# Remove existing profile
if (Test-Path $profilePath) {
    Remove-Item $profilePath -Force
}

# Create new clean profile
$profileContent = @"
# HomeBase-2.0 PowerShell Profile

function hb { 
    cd "e:\VSCode\projects\HomeBase-2.0"
    Write-Host "🚀 Navigated to HomeBase-2.0" -ForegroundColor Green
}

function hb-app { 
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    Write-Host "📱 Navigated to litlabs-web app" -ForegroundColor Green
}

function hb-dev {
    Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
    & e:/VSCode/projects/HomeBase-2.0/.venv/Scripts/Activate.ps1
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run dev
}

function hb-smoke {
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run smoke-test
}

function hb-git {
    cd "e:\VSCode\projects\HomeBase-2.0"
    git add .
    git commit -m "Update"
    git push origin main
}

function hb-deploy {
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run build
    vercel --prod
}

function hb-emergency {
    cd "e:\VSCode\projects\HomeBase-2.0\apps\litlabs-web"
    npm run emergency-recovery
}

function hb-help {
    Write-Host "🎯 HomeBase-2.0 Commands:" -ForegroundColor Green
    Write-Host "  hb        - Go to project root" -ForegroundColor White
    Write-Host "  hb-app    - Go to app directory" -ForegroundColor White
    Write-Host "  hb-dev    - Start dev server" -ForegroundColor White
    Write-Host "  hb-smoke  - Run smoke tests" -ForegroundColor White
    Write-Host "  hb-git    - Commit and push" -ForegroundColor White
    Write-Host "  hb-deploy  - Deploy to production" -ForegroundColor White
    Write-Host "  hb-emergency - Emergency recovery" -ForegroundColor White
    Write-Host "  hb-help   - Show this help" -ForegroundColor White
}

Write-Host "🎉 HomeBase-2.0 Terminal loaded! Type hb-help for commands." -ForegroundColor Green
"@

# Write new profile
Set-Content -Path $profilePath -Value $profileContent

Write-Host "✅ PowerShell profile fixed!" -ForegroundColor Green
Write-Host "🔄 Open new PowerShell window to use commands" -ForegroundColor Yellow
