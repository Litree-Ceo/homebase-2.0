#!/usr/bin/env powershell
# Module-level launcher wrapper for Windows PowerShell
# Automatically finds and delegates to root launcher
# Usage: .\launcher.ps1 [command] [args...]

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$ErrorActionPreference = "Stop"
$ScriptPath = $MyInvocation.MyCommand.Path

function Find-RootDir {
    $current = if ($ScriptPath) { Split-Path -Parent $ScriptPath } else { Get-Location }
    
    while ($current -ne $null) {
        if ((Test-Path "$current\.env.example" -PathType Leaf) -or (Test-Path "$current\pyproject.toml" -PathType Leaf)) {
            if (Test-Path "$current\scripts\launcher.py" -PathType Leaf) {
                return $current
            }
        }
        $parent = Split-Path -Parent $current
        if ($parent -eq $current) { break }
        $current = $parent
    }
    
    return Split-Path -Parent (Split-Path -Parent $current)
}

$RootDir = Find-RootDir
$Launcher = Join-Path $RootDir "scripts\launcher.py"

if (-not (Test-Path $Launcher -PathType Leaf)) {
    Write-Host "ERROR: Root launcher not found at $Launcher" -ForegroundColor Red
    Write-Host "Searched from: $(Get-Location)" -ForegroundColor Red
    Write-Host "Root directory detected: $RootDir" -ForegroundColor Red
    exit 1
}

Push-Location $RootDir
try {
    & python $Launcher @Arguments
}
finally {
    Pop-Location
}
