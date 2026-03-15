# ══════════════════════════════════════════════════════════════════════════════
# POWERSHELL SCRIPT GUARD & BEST PRACTICES TEMPLATE
# ══════════════════════════════════════════════════════════════════════════════
# Include this at the top of all PowerShell scripts for proper error handling.
#
# Usage:
#   1. Copy this to the top of your script
#   2. Define $SCRIPT_NAME and update parameters
#   3. Use Write-Log, Write-LogError, Write-LogWarn for output
#   4. Use -ErrorAction Stop for strict mode
#
# Features:
#   - Strict error handling with $ErrorActionPreference = "Stop"
#   - Colored logging (Info, Warn, Error)
#   - Exit cleanup context managers
#   - PID/state management
#   - Cross-platform path handling
# ══════════════════════════════════════════════════════════════════════════════

#Requires -Version 5.1

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('Debug', 'Info', 'Warn', 'Error')]
    [string]$LogLevel = 'Info'
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

# Script metadata
$SCRIPT_NAME = [System.IO.Path]::GetFileNameWithoutExtension($MyInvocation.MyCommand.Name)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommandPath
$ROOT_DIR = Split-Path -Parent $SCRIPT_DIR
$SCRIPT_PID = $PID
$PID_FILE = "$env:TEMP\${SCRIPT_NAME}.pid"
$LOG_DIR = if ($env:LOG_DIR) { $env:LOG_DIR } else { Join-Path $ROOT_DIR 'logs' }
$LOG_FILE = Join-Path $LOG_DIR "${SCRIPT_NAME}.log"

# Logging level constants
$LOG_LEVEL_DEBUG = 0
$LOG_LEVEL_INFO = 1
$LOG_LEVEL_WARN = 2
$LOG_LEVEL_ERROR = 3

$LogLevelValue = switch ($LogLevel) {
    'Debug' { $LOG_LEVEL_DEBUG }
    'Info' { $LOG_LEVEL_INFO }
    'Warn' { $LOG_LEVEL_WARN }
    'Error' { $LOG_LEVEL_ERROR }
    default { $LOG_LEVEL_INFO }
}

# ── Logging Functions ───────────────────────────────────────────────────────
function Write-LogDebug {
    param([string]$Message)
    if ($LogLevelValue -le $LOG_LEVEL_DEBUG) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $output = "[DEBUG] $timestamp :: $Message"
        Write-Host $output -ForegroundColor Cyan
        Add-Content -LiteralPath $LOG_FILE -Value $output -Encoding UTF8
    }
}

function Write-LogInfo {
    param([string]$Message)
    if ($LogLevelValue -le $LOG_LEVEL_INFO) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $output = "[INFO] $timestamp :: $Message"
        Write-Host $output -ForegroundColor Green
        Add-Content -LiteralPath $LOG_FILE -Value $output -Encoding UTF8
    }
}

function Write-LogWarn {
    param([string]$Message)
    if ($LogLevelValue -le $LOG_LEVEL_WARN) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $output = "[WARN] $timestamp :: $Message"
        Write-Host $output -ForegroundColor Yellow
        Add-Content -LiteralPath $LOG_FILE -Value $output -Encoding UTF8
    }
}

function Write-LogError {
    param([string]$Message)
    if ($LogLevelValue -le $LOG_LEVEL_ERROR) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $output = "[ERROR] $timestamp :: $Message"
        Write-Host $output -ForegroundColor Red
        Add-Content -LiteralPath $LOG_FILE -Value $output -Encoding UTF8
    }
}

function Throw-Error {
    param([string]$Message)
    Write-LogError $Message
    throw $Message
}

# ── Cleanup & Exit Functions ────────────────────────────────────────────────
function Invoke-Cleanup {
    if (Test-Path $PID_FILE) {
        $storedPID = Get-Content $PID_FILE -Raw -ErrorAction SilentlyContinue
        if ($storedPID -eq $SCRIPT_PID) {
            Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
            Write-LogDebug "Cleanup: Removed PID file"
        }
    }
}

$OnExitAction = {
    $exitCode = $?
    if (-not $exitCode) {
        Write-LogError "Script exited with error"
    }
    Invoke-Cleanup
}

# Register cleanup on exit
[System.AppDomain]::CurrentDomain.DomainUnload += [System.EventHandler] { & $OnExitAction }
trap { Invoke-Cleanup; throw $_ }

# ── Initialization ──────────────────────────────────────────────────────────
function Init-Script {
    # Create log directory
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Force -Path $LOG_DIR -ErrorAction Stop | Out-Null
    }
    
    # Check for existing process
    if (Test-Path $PID_FILE) {
        $oldPID = Get-Content $PID_FILE -Raw -ErrorAction SilentlyContinue
        if ($oldPID -and (Get-Process -Id $oldPID -ErrorAction SilentlyContinue)) {
            Throw-Error "Script already running with PID $oldPID"
        }
    }
    
    # Write PID file
    Set-Content -LiteralPath $PID_FILE -Value $SCRIPT_PID -Force -Encoding UTF8
    
    Write-LogInfo "════════════════════════════════════════════════"
    Write-LogInfo "Starting $SCRIPT_NAME (PID: $SCRIPT_PID)"
    Write-LogInfo "Log file: $LOG_FILE"
    Write-LogInfo "════════════════════════════════════════════════"
}

# ── Utility Functions ───────────────────────────────────────────────────────
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        Write-LogDebug "Found command: $Command"
        return $true
    }
    catch {
        Throw-Error "Required command not found: $Command"
        return $false
    }
}

function Test-FilePath {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Throw-Error "Required file not found: $Path"
    }
    Write-LogDebug "Found file: $Path"
}

function Test-DirPath {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        Throw-Error "Required directory not found: $Path"
    }
    Write-LogDebug "Found directory: $Path"
}

function Convert-ToAbsolutePath {
    param([string]$Path)
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }
    else {
        return Join-Path -Resolve (Get-Location).Path $Path
    }
}

# Initialize script
Init-Script
