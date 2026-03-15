# Start litlabs-web with serve - keeps running
# Usage: .\scripts\Start-LitlabsWeb.ps1

Write-Host "🚀 Starting litlabs-web on port 3001..." -ForegroundColor Green
Write-Host "Visit: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

Set-Location "$PSScriptRoot\.."

# Install serve if not present
if (-not (Get-Command serve -ErrorAction SilentlyContinue)) {
    Write-Host "Installing serve globally..." -ForegroundColor Yellow
    npm install -g serve
}

# Start serve
npx serve workspace/src/litlabs-web/public -p 3001 --single
