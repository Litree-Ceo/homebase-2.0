#!/usr/bin/env powershell
# Overlord Dashboard Setup Verification Script
# Checks that everything is configured correctly

$ErrorActionPreference = "Continue"
$global:SuccessCount = 0
$global:WarningCount = 0
$global:ErrorCount = 0

function Write-Status {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("OK", "WARN", "ERROR")]
        [string]$Status,
        
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    if ($Status -eq "OK") { 
        Write-Host "[PASS] $Message" -ForegroundColor Green
        $global:SuccessCount++
    }
    elseif ($Status -eq "WARN") { 
        Write-Host "[WARN] $Message" -ForegroundColor Yellow
        $global:WarningCount++
    }
    elseif ($Status -eq "ERROR") { 
        Write-Host "[FAIL] $Message" -ForegroundColor Red
        $global:ErrorCount++
    }
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "     Overlord Dashboard - Setup Verification" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python version
$pythonVersion = python --version 2>&1
if ($pythonVersion -match "Python 3\.(1[0-9]|[2-9][0-9])") {
    Write-Status -Status "OK" -Message "Python version: $pythonVersion"
} else {
    Write-Status -Status "WARN" -Message "Python 3.10+ recommended (found: $pythonVersion)"
}

# 2. Check .env file exists
if (Test-Path ".env") {
    Write-Status -Status "OK" -Message ".env file exists"
} else {
    Write-Status -Status "ERROR" -Message ".env file not found. Copy from .env.example"
}

# 3. Check API key is set and valid
$apiKey = $env:API_KEY
if (-not $apiKey) {
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "API_KEY=(.+)") {
            $apiKey = $Matches[1].Trim()
        }
    }
}

if ($apiKey -and $apiKey.Length -ge 32 -and $apiKey -notmatch "changeme") {
    Write-Status -Status "OK" -Message "API_KEY is set and secure ($($apiKey.Length) chars)"
} else {
    Write-Status -Status "ERROR" -Message "API_KEY is missing, too short, or using default value"
}

# 4. Check required Python packages
$packages = @("psutil", "requests", "pyyaml", "dotenv")
foreach ($pkg in $packages) {
    try {
        $null = python -c "import $pkg" 2>&1
        Write-Status -Status "OK" -Message "Python package: $pkg"
    } catch {
        Write-Status -Status "ERROR" -Message "Missing Python package: $pkg (pip install $pkg)"
    }
}

# 5. Check server.py exists and is valid
if (Test-Path "server.py") {
    try {
        $null = python -c "import server" 2>&1
        Write-Status -Status "OK" -Message "server.py imports successfully"
    } catch {
        Write-Status -Status "ERROR" -Message "server.py has import errors"
    }
} else {
    Write-Status -Status "ERROR" -Message "server.py not found"
}

# 6. Check config.yaml exists
if (Test-Path "config.yaml") {
    Write-Status -Status "OK" -Message "config.yaml exists"
} else {
    Write-Status -Status "WARN" -Message "config.yaml not found (will use defaults)"
}

# 7. Check if port is available
$port = 8999
$listener = $null
try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
    $listener.Start()
    $listener.Stop()
    Write-Status -Status "OK" -Message "Port $port is available"
} catch {
    Write-Status -Status "WARN" -Message "Port $port may be in use"
} finally {
    if ($listener) { $listener.Stop() }
}

# 8. Check database
if (Test-Path "overlord.db") {
    $size = (Get-Item "overlord.db").Length / 1KB
    Write-Status -Status "OK" -Message "Database exists ($([math]::Round($size, 2)) KB)"
} else {
    Write-Status -Status "OK" -Message "Database will be created on first run"
}

# 9. Check backup directory
if (Test-Path "backups") {
    $backupCount = (Get-ChildItem -Path "backups" -Filter "*.db" -ErrorAction SilentlyContinue).Count
    Write-Status -Status "OK" -Message "Backup directory exists ($backupCount backups)"
} else {
    Write-Status -Status "WARN" -Message "Backup directory not found"
}

# 10. Check test suite
try {
    $testOutput = python -m pytest tests/ --tb=no -q 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Status -Status "OK" -Message "All tests pass"
    } else {
        Write-Status -Status "WARN" -Message "Some tests are failing"
    }
} catch {
    Write-Status -Status "WARN" -Message "Could not run tests (pytest may not be installed)"
}

# Summary
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Verification Summary:" -ForegroundColor Cyan
Write-Host "  Passed:  $global:SuccessCount" -ForegroundColor Green
Write-Host "  Warnings: $global:WarningCount" -ForegroundColor Yellow
Write-Host "  Errors:   $global:ErrorCount" -ForegroundColor Red
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if ($global:ErrorCount -gt 0) {
    Write-Host "Please fix the errors above before starting the server." -ForegroundColor Red
    exit 1
} elseif ($global:WarningCount -gt 0) {
    Write-Host "Setup is functional but has warnings. Review above." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "All checks passed! Ready to start the server." -ForegroundColor Green
    Write-Host "  Run: python server.py" -ForegroundColor Gray
    exit 0
}
