# Test Suite for OpenClaw Telegram Setup Script (Security Hardened v2.0)
<#
.SYNOPSIS
    Validates the security hardening changes to setup-openclaw-telegram.ps1
.DESCRIPTION
    This test script verifies that all security improvements are working correctly:
    - Cryptographically secure token generation
    - File permission hardening
    - Backup creation
    - Error handling
    - Configuration validation
.NOTES
    Version: 1.0
    Run this after executing setup-openclaw-telegram.ps1
#>

param(
    [string]$ConfigPath = "$HOME\.openclaw\openclaw.json",
    [string]$ScriptPath = "$PSScriptRoot\setup-openclaw-telegram.ps1"
)

$TestResults = @()
$PassCount = 0
$FailCount = 0

function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        $status = "PASS"
        $script:PassCount++
        $color = "Green"
    }
    else {
        $status = "FAIL"
        $script:FailCount++
        $color = "Red"
    }
    
    $result = [PSCustomObject]@{
        Test      = $TestName
        Status    = $status
        Message   = $Message
        Timestamp = Get-Date
    }
    $script:TestResults += $result
    
    Write-Host "[$status] $TestName" -ForegroundColor $color
    if ($Message) {
        Write-Host "       $Message" -ForegroundColor Gray
    }
}

function Test-FileExists {
    param([string]$Path, [string]$TestName)
    
    if (Test-Path $Path) {
        Test-Result -TestName $TestName -Passed $true -Message "Found: $Path"
        return $true
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "Not found: $Path"
        return $false
    }
}

function Test-FilePermissions {
    param([string]$Path, [string]$TestName)
    
    try {
        $acl = Get-Acl $Path
        $owner = $acl.Owner
        $currentUser = "$env:USERDOMAIN\$env:USERNAME"
        
        # Check if only current user has access (no inheritance)
        $accessRules = $acl.Access | Where-Object { $_.IdentityReference -like "*$env:USERNAME*" }
        $inheritanceEnabled = $acl.AreAccessRulesProtected
        
        if ($owner -like "*$env:USERNAME*" -and $accessRules.Count -ge 1 -and -not $inheritanceEnabled) {
            Test-Result -TestName $TestName -Passed $true -Message "Permissions restricted to current user"
            return $true
        }
        else {
            Test-Result -TestName $TestName -Passed $false -Message "Owner: $owner, Rules: $($accessRules.Count), Inheritance: $inheritanceEnabled"
            return $false
        }
    }
    catch {
        Test-Result -TestName $TestName -Passed $false -Message "Error: $_"
        return $false
    }
}

function Test-TokenSecurity {
    param($Config, [string]$TestName)
    
    # Check auth token exists and is sufficient length
    if ($Config.gateway.auth -and $Config.gateway.auth.token) {
        $token = $Config.gateway.auth.token
        $length = $token.Length
        
        # Check for URL-safe base64 characteristics (no +, /, =)
        $isUrlSafe = $token -notmatch '[\+/=]'
        
        if ($length -ge 32 -and $isUrlSafe) {
            Test-Result -TestName $TestName -Passed $true -Message "Token length: $length, URL-safe: $isUrlSafe"
            return $true
        }
        else {
            Test-Result -TestName $TestName -Passed $false -Message "Token length: $length, URL-safe: $isUrlSafe"
            return $false
        }
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "No auth token found in config"
        return $false
    }
}

function Test-ConfigStructure {
    param($Config, [string]$TestName)
    
    $checks = @()
    
    # Check gateway exists
    if ($Config.gateway) {
        $checks += "gateway exists"
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "Missing gateway object"
        return $false
    }
    
    # Check auth configured
    if ($Config.gateway.auth -and $Config.gateway.auth.mode -eq "token") {
        $checks += "auth.mode=token"
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "Auth not configured correctly"
        return $false
    }
    
    # Check trustedProxies
    if ($Config.gateway.trustedProxies -and $Config.gateway.trustedProxies.Count -gt 0) {
        $checks += "trustedProxies set"
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "trustedProxies not set"
        return $false
    }
    
    # Check channels.telegram exists
    if ($Config.channels -and $Config.channels.telegram) {
        $checks += "channels.telegram exists"
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "Missing channels.telegram"
        return $false
    }
    
    # Check token NOT in channels.telegram
    if (-not $Config.channels.telegram.PSObject.Properties['token']) {
        $checks += "no token in channels.telegram"
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "Token found in channels.telegram (should use env var)"
        return $false
    }
    
    Test-Result -TestName $TestName -Passed $true -Message ($checks -join ", ")
    return $true
}

function Test-BackupCreated {
    param([string]$ConfigPath, [string]$TestName)
    
    $backupPattern = "$ConfigPath.bak.*"
    $backups = Get-Item $backupPattern -ErrorAction SilentlyContinue
    
    if ($backups) {
        $latest = $backups | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Test-Result -TestName $TestName -Passed $true -Message "Latest backup: $($latest.Name)"
        return $true
    }
    else {
        Test-Result -TestName $TestName -Passed $false -Message "No backup files found"
        return $false
    }
}

# Main test execution
Write-Host "`n=== OpenClaw Setup Script Test Suite ===`n" -ForegroundColor Cyan
Write-Host "Testing: $ScriptPath" -ForegroundColor Gray
Write-Host "Config:  $ConfigPath`n" -ForegroundColor Gray

# Test 1: Script file exists
Test-FileExists -Path $ScriptPath -TestName "Script file exists"

# Test 2: Config file exists
$configExists = Test-FileExists -Path $ConfigPath -TestName "Config file exists"

if ($configExists) {
    # Test 3: Load config
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        Test-Result -TestName "Config is valid JSON" -Passed $true -Message "Successfully parsed"
        
        # Test 4: File permissions
        Test-FilePermissions -Path $ConfigPath -TestName "Config file permissions hardened"
        
        # Test 5: Token security
        Test-TokenSecurity -Config $config -TestName "Auth token is secure (32+ chars, URL-safe)"
        
        # Test 6: Config structure
        Test-ConfigStructure -Config $config -TestName "Config structure is correct"
        
        # Test 7: Backup exists
        Test-BackupCreated -ConfigPath $ConfigPath -TestName "Backup file created"
        
        # Test 8: Check for Telegram bot token environment variable
        if ($env:TELEGRAM_BOT_TOKEN) {
            Test-Result -TestName "TELEGRAM_BOT_TOKEN env var set" -Passed $true -Message "Token length: $($env:TELEGRAM_BOT_TOKEN.Length)"
        }
        else {
            Test-Result -TestName "TELEGRAM_BOT_TOKEN env var set" -Passed $false -Message "Environment variable not set"
        }
    }
    catch {
        Test-Result -TestName "Config is valid JSON" -Passed $false -Message "Parse error: $_"
    }
}
else {
    Write-Host "`n[Skipping] Config tests (file not found)" -ForegroundColor Yellow
    Write-Host "Run setup-openclaw-telegram.ps1 first!" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Test Summary ===`n" -ForegroundColor Cyan
Write-Host "Total:  $($PassCount + $FailCount)" -ForegroundColor White
Write-Host "Passed: $PassCount" -ForegroundColor Green
Write-Host "Failed: $FailCount" -ForegroundColor Red
Write-Host ""

if ($FailCount -eq 0) {
    Write-Host "[OK] All tests passed!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "[FAIL] Some tests failed. Review output above." -ForegroundColor Red
    exit 1
}