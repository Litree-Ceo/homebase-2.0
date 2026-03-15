#!/usr/bin/env pwsh
# Quick launcher for Firefox with local dev server

param(
    [string]$Url = "http://localhost:3000",
    [string]$Page = ""
)

$FirefoxPath = "C:\Program Files\Mozilla Firefox\firefox.exe"
$FullUrl = if ($Page) { "$Url/$Page" } else { $Url }

if (Test-Path $FirefoxPath) {
    Write-Host "🦊 Opening in Firefox: $FullUrl" -ForegroundColor Cyan
    Start-Process $FirefoxPath -ArgumentList $FullUrl
} else {
    Write-Host "⚠️  Firefox not found at: $FirefoxPath" -ForegroundColor Yellow
    Write-Host "Opening in default browser..." -ForegroundColor Gray
    Start-Process $FullUrl
}
