
# OpenClaw Telegram Setup Script - Security Hardened
<#
.SYNOPSIS
    Configures OpenClaw for Telegram integration with security best practices.
.DESCRIPTION
    This script merges Telegram channel configuration, applies security fixes,
    and ensures proper token handling. All sensitive operations use cryptographically
    secure random number generation and proper file permissions.
.NOTES
    Author: Security Hardened Version
    Version: 2.0
    Requirements:
    - OpenClaw must be installed before running this script
    - Telegram bot token should be set as environment variable: $env:TELEGRAM_BOT_TOKEN
#>

# Enable strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Configuration paths
$ConfigFile = "$HOME\.openclaw\openclaw.json"
$NewConfigPath = "$PSScriptRoot\OPENCLAW_TELEGRAM_CONFIG.json"

# Validate script prerequisites
function Test-Prerequisites {
    if (!(Test-Path $ConfigFile)) {
        throw "OpenClaw config not found at $ConfigFile. Please install OpenClaw first."
    }
    
    if (!(Test-Path $NewConfigPath)) {
        throw "Template config not found at $NewConfigPath."
    }
}

# Generate cryptographically secure token
function New-SecureToken {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        # Convert to URL-safe base64 (no padding, + and / replaced)
        $token = [System.Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
        return $token
    }
    finally {
        if ($rng -is [System.IDisposable]) {
            $rng.Dispose()
        }
    }
}

# Set secure file permissions (restrict to current user)
function Set-SecureFilePermissions {
    param([string]$Path)
    
    try {
        if (!(Test-Path $Path)) {
            throw "File not found: $Path"
        }
        
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        Write-Host "  [INFO] Setting permissions for user: $currentUser" -ForegroundColor Gray
        
        $acl = Get-Acl $Path
        
        # Remove all existing access rules
        $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) }
        
        # Add full control for current user only
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $currentUser,
            "FullControl",
            "None",
            "None",
            "Allow"
        )
        $acl.SetAccessRule($rule)
        
        # Disable inheritance and remove inherited rules
        $acl.SetAccessRuleProtection($true, $false)
        
        Set-Acl -Path $Path -AclObject $acl
    }
    catch {
        Write-Host "  [WARN] Could not apply strict security permissions: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  [WARN] Proceeding with default permissions." -ForegroundColor Yellow
    }
}

# Create backup of existing config
function Backup-Config {
    param([string]$SourcePath)
    
    $backupPath = "$SourcePath.bak.$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $backupPath -Force
        Write-Host "Created backup: $backupPath" -ForegroundColor Gray
        return $backupPath
    }
    return $null
}

# Validate JSON structure
function Test-ConfigStructure {
    param($Config)
    
    if ($null -eq $Config) {
        throw "Configuration is null or invalid JSON"
    }
    
    # Ensure gateway object exists
    if ($null -eq $Config.gateway) {
        $Config | Add-Member -MemberType NoteProperty -Name "gateway" -Value @{}
    }
    
    return $Config
}

# Main execution
try {
    Write-Host "`n=== OpenClaw Telegram Setup (Security Hardened v2.0) ===`n" -ForegroundColor Cyan
    
    # Validate prerequisites
    Test-Prerequisites
    
    # Create backup before modifications
    Backup-Config -SourcePath $ConfigFile
    
    # Load configurations with error handling
    try {
        $CurrentConfig = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        $NewConfig = Get-Content $NewConfigPath -Raw | ConvertFrom-Json
    }
    catch {
        throw "Failed to parse JSON configuration: $_"
    }
    
    # Validate and fix config structure
    $CurrentConfig = Test-ConfigStructure -Config $CurrentConfig
    
    # Fix: Remove 'channels' from 'gateway' if it exists (incorrect structure)
    if ($CurrentConfig.gateway.PSObject.Properties['channels']) {
        Write-Host "[FIX] Removing incorrect gateway.channels property..." -ForegroundColor Yellow
        $CurrentConfig.gateway.PSObject.Properties.Remove('channels')
    }
    
    # Ensure channels object exists
    if ($null -eq $CurrentConfig.channels) {
        $CurrentConfig | Add-Member -MemberType NoteProperty -Name "channels" -Value @{}
    }
    
    # Merge Telegram channel configuration
    if ($NewConfig.channels -and $NewConfig.channels.telegram) {
        if ($null -eq $CurrentConfig.channels.telegram) {
            $CurrentConfig.channels | Add-Member -MemberType NoteProperty -Name "telegram" -Value $NewConfig.channels.telegram
            Write-Host "[CONFIG] Added Telegram channel configuration" -ForegroundColor Green
        }
        else {
            $CurrentConfig.channels.telegram = $NewConfig.channels.telegram
        }
    }
    
    # Fix: Remove 'token' from 'channels.telegram' if it exists (must be env var)
    if ($CurrentConfig.channels.telegram -and $CurrentConfig.channels.telegram.PSObject.Properties['token']) {
        Write-Host "Fixing config: Removing channels.telegram.token (invalid key)..." -ForegroundColor Yellow
        $CurrentConfig.channels.telegram.PSObject.Properties.Remove('token')
    }
    
    # SECURITY FIXES
    Write-Host "`n[SECURITY] Applying security hardening..." -ForegroundColor Cyan
    
    # 1. Set trusted proxies if not configured
    if ($null -eq $CurrentConfig.gateway.trustedProxies -or $CurrentConfig.gateway.trustedProxies.Count -eq 0) {
        $CurrentConfig.gateway | Add-Member -MemberType NoteProperty -Name "trustedProxies" -Value @("127.0.0.1")
        Write-Host "  [+] Set gateway.trustedProxies = @('127.0.0.1')" -ForegroundColor Green
    }
    
    # 2. Enable token authentication
    if ($null -eq $CurrentConfig.gateway.auth) {
        $token = New-SecureToken -Length 32
        $authObj = @{
            mode = "token"
            token = $token
        }
        $CurrentConfig.gateway | Add-Member -MemberType NoteProperty -Name "auth" -Value $authObj
        Write-Host "  [+] Generated secure token (32 bytes)" -ForegroundColor Green
        Write-Host "    [!] Token is stored in config file - keep it secret!" -ForegroundColor Yellow
    }
    elseif ($null -eq $CurrentConfig.gateway.auth.token -or $CurrentConfig.gateway.auth.token.Length -lt 32) {
        $token = New-SecureToken -Length 32
        $CurrentConfig.gateway.auth | Add-Member -MemberType NoteProperty -Name "mode" -Value "token" -Force
        $CurrentConfig.gateway.auth | Add-Member -MemberType NoteProperty -Name "token" -Value $token -Force
        Write-Host "  [+] Updated auth token (32 bytes)" -ForegroundColor Green
    }
    else {
        Write-Host "  [+] Auth token already configured" -ForegroundColor Green
    }
    
    # Write configuration to temporary file securely
    $tempFile = [System.IO.Path]::GetTempFileName()
    $json = $CurrentConfig | ConvertTo-Json -Depth 10
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($tempFile, $json, $utf8NoBom)
    
    # Set secure permissions on temp file
    Set-SecureFilePermissions -Path $tempFile
    
    # Atomic move to target location
    Write-Host "`n[FILE] Writing configuration to $ConfigFile" -ForegroundColor Cyan
    try {
        Move-Item -Path $tempFile -Destination $ConfigFile -Force -ErrorAction Stop
    }
    catch {
        # Fallback to cmd if Move-Item fails due to permissions
        Write-Host "[WARN] Move-Item failed, attempting cmd bypass..." -ForegroundColor Yellow
        cmd /c move /y "`"$tempFile`"" "`"$ConfigFile`""
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to move config file. Manual copy required from: $tempFile"
        }
    }
    
    # Set final permissions on config file
    Set-SecureFilePermissions -Path $ConfigFile
    
    Write-Host "`n[SUCCESS] OpenClaw configuration updated and secured!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor White
    Write-Host "  1. Set Telegram bot token as environment variable:" -ForegroundColor Gray
    Write-Host "     `$env:TELEGRAM_BOT_TOKEN = 'your_bot_token_here'" -ForegroundColor Cyan
    Write-Host "  2. Restart OpenClaw gateway:" -ForegroundColor Gray
    Write-Host "     openclaw gateway restart" -ForegroundColor Cyan
    Write-Host "`n" -ForegroundColor White
}
catch {
    Write-Host "`n[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup temp file if it still exists
    if ($tempFile -and (Test-Path $tempFile)) {
        try { Remove-Item $tempFile -Force -ErrorAction SilentlyContinue } catch {}
    }
}
