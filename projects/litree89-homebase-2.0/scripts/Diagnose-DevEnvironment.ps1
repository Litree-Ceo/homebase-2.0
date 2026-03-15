#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive dev environment diagnostic for LITLABS HomeBase 2.0
.DESCRIPTION
    Scans and verifies all development tools after E: drive migration
#>

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║  🔍 LITLABS Dev Environment Diagnostic                       ║
║  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')                              ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Critical tools with their expected locations
$criticalTools = @(
    @{Name="Go"; Path="E:\VSCode\Go\bin\go.exe"; InPath=$true},
    @{Name="Python"; Path="E:\Python\python.exe"; InPath=$true},
    @{Name="Node.js"; Path="C:\Program Files\nodejs\node.exe"; InPath=$true},
    @{Name="pnpm"; Command="pnpm"; InPath=$true},
    @{Name="Git"; Path="C:\Program Files\Git\cmd\git.exe"; InPath=$true},
    @{Name="Azure CLI"; Command="az"; InPath=$true},
    @{Name="Docker"; Path="C:\Program Files\Docker\Docker\resources\bin\docker.exe"; InPath=$false},
    @{Name="PowerShell 7"; Path="C:\Program Files\PowerShell\7\pwsh.exe"; InPath=$true}
)

$issues = @()
$passed = 0
$failed = 0

Write-Host "`n📋 Checking Critical Tools...`n" -ForegroundColor Yellow

foreach ($tool in $criticalTools) {
    Write-Host "  $($tool.Name)..." -NoNewline
    
    $exists = $false
    $pathLocation = $null
    
    # Check by path if provided
    if ($tool.Path) {
        $exists = Test-Path $tool.Path
        if ($exists) {
            $pathLocation = $tool.Path
        }
    }
    
    # Check by command if provided
    if ($tool.Command -and -not $exists) {
        $cmd = Get-Command $tool.Command -ErrorAction SilentlyContinue
        if ($cmd) {
            $exists = $true
            $pathLocation = $cmd.Source
        }
    }
    
    if ($exists) {
        Write-Host " ✅" -ForegroundColor Green
        if ($pathLocation) {
            Write-Host "    └─ $pathLocation" -ForegroundColor Gray
        }
        $passed++
    } else {
        Write-Host " ❌ NOT FOUND" -ForegroundColor Red
        $issues += "Missing: $($tool.Name)"
        if ($tool.Path) {
            Write-Host "    └─ Expected at: $($tool.Path)" -ForegroundColor Gray
        }
        $failed++
    }
}

# Check environment variables
Write-Host "`n📋 Checking Environment Variables...`n" -ForegroundColor Yellow

$envVars = @(
    @{Name="GOROOT"; Expected="E:\VSCode\Go"; Scope="Machine"},
    @{Name="GOPATH"; Expected="$env:USERPROFILE\go"; Scope="User"},
    @{Name="Path (Go)"; Expected="E:\VSCode\Go\bin"; Scope="Machine"}
)

foreach ($var in $envVars) {
    Write-Host "  $($var.Name)..." -NoNewline
    
    if ($var.Name -eq "Path (Go)") {
        $path = [Environment]::GetEnvironmentVariable("Path", $var.Scope)
        $exists = $path -like "*$($var.Expected)*"
    } else {
        $value = [Environment]::GetEnvironmentVariable($var.Name, $var.Scope)
        $exists = $value -eq $var.Expected
    }
    
    if ($exists) {
        Write-Host " ✅" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ❌ INCORRECT" -ForegroundColor Red
        Write-Host "    └─ Expected: $($var.Expected)" -ForegroundColor Gray
        if ($var.Name -ne "Path (Go)") {
            Write-Host "    └─ Actual: $value" -ForegroundColor Gray
        }
        $issues += "Fix $($var.Name) in $($var.Scope) environment"
        $failed++
    }
}

# Check VS Code settings
Write-Host "`n📋 Checking VS Code Settings...`n" -ForegroundColor Yellow

$vsCodeSettings = ".\.vscode\settings.json"
if (Test-Path $vsCodeSettings) {
    Write-Host "  VS Code settings.json..." -NoNewline
    try {
        $settingsContent = Get-Content $vsCodeSettings -Raw
        # Remove comments from JSONC
        $settingsContent = $settingsContent -replace '(?m)^\s*//.*$', ''
        $settingsContent = $settingsContent -replace '(?m)/\*[\s\S]*?\*/', ''
        # Remove trailing commas
        $settingsContent = $settingsContent -replace ',(\s*[}\]])', '$1'
        
        $settings = $settingsContent | ConvertFrom-Json -ErrorAction Stop
        
        if ($settings."go.goroot" -eq "E:\VSCode\Go") {
            Write-Host " ✅" -ForegroundColor Green
            $passed++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $issues += "Update VS Code settings.json with correct Go paths"
            $failed++
        }
    } catch {
        Write-Host " ⚠️  PARSE ERROR" -ForegroundColor Yellow
        Write-Host "    └─ Could not parse settings.json (may contain comments)" -ForegroundColor Gray
        # Don't count as failure if we can't parse
    }
} else {
    Write-Host "  VS Code settings.json... ⚠️  NOT FOUND" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("═" * 65) -ForegroundColor Cyan
Write-Host "  📊 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host ("═" * 65) -ForegroundColor Cyan

Write-Host "`n  ✅ Passed: " -NoNewline -ForegroundColor Green
Write-Host $passed
Write-Host "  ❌ Failed: " -NoNewline -ForegroundColor Red
Write-Host $failed

if ($issues.Count -gt 0) {
    Write-Host "`n  🔧 Issues Found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "     • $issue" -ForegroundColor White
    }
    
    Write-Host "`n  💡 Recommended Actions:" -ForegroundColor Cyan
    Write-Host "     1. Run: .\scripts\Fix-GoPaths.ps1 (as Administrator)"
    Write-Host "     2. Close ALL VS Code windows"
    Write-Host "     3. Reopen VS Code"
    Write-Host "     4. Run this diagnostic again to verify"
} else {
    Write-Host "`n  🎉 All checks passed!" -ForegroundColor Green
    Write-Host "     Your development environment is properly configured." -ForegroundColor White
    Write-Host "`n  ⚠️  If VS Code still shows errors:" -ForegroundColor Yellow
    Write-Host "     Close ALL VS Code windows and reopen to reload environment" -ForegroundColor White
}

Write-Host "`n" + ("═" * 65) + "`n" -ForegroundColor Cyan

# Return exit code
if ($failed -gt 0) { exit 1 } else { exit 0 }
