#!/usr/bin/env pwsh
# PowerShell equivalent of lint-all.sh
# Usage: .\scripts\lint-all.ps1 [-Fix]

param(
    [switch]$Fix = $false
)

$ErrorActionPreference = "Continue"  # Continue on non-critical errors
$WarningPreference = "Continue"

$RootDir = (Get-Item -LiteralPath $PSScriptRoot).Parent.FullName
$TotalIssues = 0

function Write-Status($Message, $Color = "White") {
    Write-Host $Message -ForegroundColor $Color
}

Write-Status "════════════════════════════════════════════════════════════════" "Cyan"
Write-Status "  Overlord Monolith - Unified Linting (Windows)" "Cyan"
Write-Status "════════════════════════════════════════════════════════════════" "Cyan"

# ── Python Linting ──────────────────────────────────────────────────
Write-Host ""
Write-Status "Checking Python files..." "Yellow"

$PyFiles = @(Get-ChildItem -Path $RootDir -Recurse -Include "*.py" `
        -Exclude @("*.venv*", "*venv*", "*__pycache__*", "*.pytest_cache*") `
        -ErrorAction SilentlyContinue | Select-Object -First 50).FullName

if ($PyFiles.Count -eq 0) {
    Write-Status "  ℹ No Python files found" "Gray"
}
else {
    # Black formatting
    if (Get-Command black -ErrorAction SilentlyContinue) {
        if ($Fix) {
            Write-Status "  ▶ Running black (auto-fix)..." "Cyan"
            black --line-length=120 --quiet @PyFiles -ErrorAction Continue
        }
        else {
            Write-Status "  ▶ Checking black formatting..." "Cyan"
            if (-not (black --line-length=120 --diff --check @PyFiles 2>$null)) {
                Write-Status "  ✗ Black formatting issues found" "Red"
                $TotalIssues++
            }
            else {
                Write-Status "  ✓ Black OK" "Green"
            }
        }
    }
    
    # Ruff (fast linter)
    if (Get-Command ruff -ErrorAction SilentlyContinue) {
        Write-Status "  ▶ Checking ruff..." "Cyan"
        $RuffResult = ruff check "$RootDir" --select E, F, W, I --ignore E501 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Status "  ✗ Ruff issues found" "Red"
            $TotalIssues++
        }
        else {
            Write-Status "  ✓ Ruff OK" "Green"
        }
    }
    
    # Pylint (optional warning)
    if (Get-Command pylint -ErrorAction SilentlyContinue) {
        Write-Status "  ▶ Checking pylint..." "Cyan"
        pylint @PyFiles --rcfile="$RootDir\.pylintrc" --exit-zero --reports=no 2>$null
        Write-Status "  ✓ Pylint checked" "Green"
    }
}

# ── JSON Validation ─────────────────────────────────────────────────
Write-Host ""
Write-Status "Checking JSON files..." "Yellow"

$JsonFiles = Get-ChildItem -Path $RootDir -Recurse -Include "*.json" `
    -Exclude @("*node_modules*", "*.venv*", "*.git*", "*.mypy_cache*") `
    -ErrorAction SilentlyContinue | Select-Object -First 20

$JsonValid = $true
foreach ($File in $JsonFiles) {
    try {
        $Content = Get-Content -Raw -LiteralPath $File.FullName -ErrorAction Stop
        $null = ConvertFrom-Json -InputObject $Content -ErrorAction Stop
    }
    catch {
        Write-Status "  ✗ Invalid JSON: $($File.FullName)" "Red"
        $JsonValid = $false
        $TotalIssues++
    }
}

if ($JsonValid) {
    Write-Status "  ✓ JSON OK" "Green"
}

# ── Summary ──────────────────────────────────────────────────────────
Write-Host ""
Write-Status "════════════════════════════════════════════════════════════════" "Cyan"

if ($TotalIssues -eq 0) {
    Write-Status "✓ All checks passed!" "Green"
    exit 0
}
else {
    Write-Status "✗ Found $TotalIssues issue group(s)" "Red"
    if (-not $Fix) {
        Write-Status "  Run with -Fix flag to auto-fix formatting issues" "Yellow"
    }
    exit 1
}
