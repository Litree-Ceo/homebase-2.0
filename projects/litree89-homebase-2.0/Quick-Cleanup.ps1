#!/usr/bin/env pwsh
<#
Emergency cleanup for VS Code Docker timeout issues
#>

Write-Host "🔧 EMERGENCY CLEANUP STARTED..." -ForegroundColor Cyan
Write-Host ""

# Kill Docker hangs
Write-Host "1️⃣  Killing hung processes..." -ForegroundColor Yellow
$hares = @("vmmem", "docker", "dockerd", "vpnkit", "com.docker.backend", "gvproxy")
foreach($proc in $hares) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Write-Host "   ✅ Done" -ForegroundColor Green

# Clear VS Code cache
Write-Host "2️⃣  Clearing VS Code cache..." -ForegroundColor Yellow
$paths = @(
    "$env:APPDATA\Code\Cache",
    "$env:APPDATA\Code\CachedData",
    "$env:APPDATA\Code\Code Cache"
)
foreach($p in $paths) {
    if(Test-Path $p) { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }
}
Write-Host "   ✅ Done" -ForegroundColor Green

# Clean pnpm
Write-Host "3️⃣  Cleaning pnpm cache..." -ForegroundColor Yellow
if(Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm store prune 2>&1 | Out-Null
}
Write-Host "   ✅ Done" -ForegroundColor Green

# Clean build artifacts
Write-Host "4️⃣  Removing build artifacts..." -ForegroundColor Yellow
$root = "E:\VSCode\HomeBase 2.0"
@("$root\api\dist", "$root\apps\web\.next", "$root\.turbo") | ForEach-Object {
    if(Test-Path $_) { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }
}
Write-Host "   ✅ Done" -ForegroundColor Green

Write-Host ""
Write-Host "✨ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "📋 Next: Close VS Code → Reopen → Run 'pnpm install'" -ForegroundColor Cyan
