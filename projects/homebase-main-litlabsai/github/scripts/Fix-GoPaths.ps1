#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix Go installation paths after moving to E: drive
.DESCRIPTION
    Updates system PATH to point to E:\VSCode\Go instead of C:\Program Files\Go
    Requires Administrator privileges to modify Machine PATH
#>

#Requires -RunAsAdministrator

Write-Host "`n🔧 Fixing Go Paths - LITLABS 2026`n" -ForegroundColor Cyan

# Verify Go exists at new location
$goExePath = "E:\VSCode\Go\bin\go.exe"
if (-not (Test-Path $goExePath)) {
    Write-Host "❌ Go not found at $goExePath" -ForegroundColor Red
    Write-Host "   Searching for Go installation..." -ForegroundColor Yellow
    $found = Get-ChildItem -Path "E:\" -Filter "go.exe" -Recurse -ErrorAction SilentlyContinue -Depth 3 | Select-Object -First 1
    if ($found) {
        Write-Host "   Found Go at: $($found.DirectoryName)" -ForegroundColor Green
        exit 1
    } else {
        Write-Host "   No Go installation found on E: drive" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Go found at: $goExePath" -ForegroundColor Green

# Fix Machine PATH
Write-Host "`n🔄 Updating Machine PATH..." -ForegroundColor Yellow
$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Remove old Go paths
$newMachinePath = $machinePath -replace [regex]::Escape("C:\Program Files\Go\bin;"), ""
$newMachinePath = $newMachinePath -replace [regex]::Escape(";C:\Program Files\Go\bin"), ""

# Remove any existing E:\VSCode\Go\bin entries
$newMachinePath = $newMachinePath -replace [regex]::Escape(";E:\VSCode\Go\bin"), ""
$newMachinePath = $newMachinePath -replace [regex]::Escape("E:\VSCode\Go\bin;"), ""

# Add new path
if ($newMachinePath -notlike "*E:\VSCode\Go\bin*") {
    $newMachinePath = "$newMachinePath;E:\VSCode\Go\bin"
}

# Clean up double semicolons
$newMachinePath = $newMachinePath -replace ";;", ";"

try {
    [Environment]::SetEnvironmentVariable("Path", $newMachinePath, "Machine")
    Write-Host "✅ Machine PATH updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update Machine PATH: $_" -ForegroundColor Red
    exit 1
}

# Set GOROOT for Machine
Write-Host "`n🔄 Setting GOROOT environment variable..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("GOROOT", "E:\VSCode\Go", "Machine")
    Write-Host "✅ GOROOT set to E:\VSCode\Go" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Failed to set GOROOT: $_" -ForegroundColor Yellow
}

# Verify User PATH also has Go
Write-Host "`n🔄 Checking User PATH..." -ForegroundColor Yellow
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*E:\VSCode\Go\bin*") {
    Write-Host "   Adding to User PATH as backup..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$userPath;E:\VSCode\Go\bin", "User")
    Write-Host "✅ User PATH updated" -ForegroundColor Green
} else {
    Write-Host "✅ User PATH already contains Go" -ForegroundColor Green
}

# Set User GOPATH if not set
$gopath = [Environment]::GetEnvironmentVariable("GOPATH", "User")
if (-not $gopath) {
    $gopath = "$env:USERPROFILE\go"
    [Environment]::SetEnvironmentVariable("GOPATH", $gopath, "User")
    Write-Host "✅ GOPATH set to $gopath" -ForegroundColor Green
}

Write-Host "`n✅ All Go paths fixed!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "   GOROOT: E:\VSCode\Go"
Write-Host "   GOPATH: $gopath"
Write-Host "   Binary: E:\VSCode\Go\bin\go.exe"
Write-Host "`n⚠️  IMPORTANT: Restart VS Code to apply changes!" -ForegroundColor Yellow
Write-Host "   (Close all VS Code windows and reopen)`n" -ForegroundColor Yellow
