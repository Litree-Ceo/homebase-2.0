# PowerShell script to reset, clean, and fully reinitialize EverythingHomebase workspace
Write-Host "[God Mode] Cleaning workspace..."
git reset --hard HEAD
if (Test-Path .git/index.lock) { Remove-Item .git/index.lock -Force }
git clean -fdx
Write-Host "[God Mode] Installing dependencies..."
npm install --workspaces
Write-Host "[God Mode] Building all apps/packages..."
npm run build --workspaces
Write-Host "[God Mode] Linting and formatting..."
npm run lint --workspaces
npm run format --workspaces
Write-Host "[God Mode] All systems ready. You can now start developing or deploying!"
