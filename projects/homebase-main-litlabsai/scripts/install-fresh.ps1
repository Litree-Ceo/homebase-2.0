# scripts/install-fresh.ps1
Write-Host "Starting fresh installation..." -ForegroundColor Green

# Ensure we are in the root
Set-Location $PSScriptRoot/..

# Install dependencies
Write-Host "Installing dependencies with pnpm..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host "Run 'pnpm smart' to start your agents." -ForegroundColor Yellow
} else {
    Write-Host "Installation failed. Please check the logs." -ForegroundColor Red
}
