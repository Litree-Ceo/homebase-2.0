#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Smart Auto-Sync for LiTreeLab'Studio™ - Instant Visual Updates
.DESCRIPTION
    Watches for file changes and automatically syncs dependencies, restarts servers,
    and provides instant visual feedback for development workflow.
.NOTES
    Author: Larry Bol (LiTreeLab'Studio™)
    Version: 2.0 - Honeycomb Edition
#>

param(
    [switch]$Watch = $true,
    [switch]$Force = $false,
    [string]$Path = ".",
    [int]$DebounceMs = 1000
)

# Colors for output
$Colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
    Accent = 'Magenta'
}

function Write-SmartLog {
    param(
        [string]$Message,
        [ValidateSet('Success', 'Warning', 'Error', 'Info', 'Accent')]
        [string]$Type = 'Info'
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Type) {
        'Success' { '✅' }
        'Warning' { '⚠️ ' }
        'Error' { '❌' }
        'Info' { 'ℹ️ ' }
        'Accent' { '🏠' }
    }
    
    Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $Colors[$Type]
}

function Test-Prerequisites {
    Write-SmartLog "🔍 Checking prerequisites..." -Type Info
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-SmartLog "Node.js: $nodeVersion" -Type Success
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-SmartLog "Node.js not found or not in PATH" -Type Error
        return $false
    }
    
    # Check PNPM
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion) {
            Write-SmartLog "PNPM: v$pnpmVersion" -Type Success
        } else {
            throw "PNPM not found"
        }
    } catch {
        Write-SmartLog "PNPM not found. Installing..." -Type Warning
        npm install -g pnpm
    }
    
    return $true
}

function Sync-Dependencies {
    param(
        [string]$ProjectPath = "."
    )
    
    Write-SmartLog "📦 Syncing dependencies..." -Type Info
    
    Push-Location $ProjectPath
    try {
        # Install/update dependencies
        $result = pnpm install --silent 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-SmartLog "Dependencies synced successfully" -Type Success
        } else {
            Write-SmartLog "Dependency sync failed: $result" -Type Error
        }
    } finally {
        Pop-Location
    }
}

function Restart-DevServer {
    Write-SmartLog "🔄 Restarting development server..." -Type Info
    
    # Kill existing Next.js processes
    $nextProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*next*dev*" }
    
    if ($nextProcesses) {
        $nextProcesses | Stop-Process -Force
        Write-SmartLog "Stopped existing Next.js processes" -Type Success
    }
    
    # Start new development server in background
    Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory "apps/web" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-SmartLog "Development server restarted on http://localhost:3000" -Type Success
}

function Watch-FileChanges {
    param(
        [string]$WatchPath = ".",
        [int]$DebounceMs = 1000
    )
    
    Write-SmartLog "👁️  Starting file watcher for $WatchPath..." -Type Accent
    Write-SmartLog "🏠 LiTreeLab'Studio™ Smart Auto-Sync is active" -Type Accent
    
    $lastSync = @{}
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = Resolve-Path $WatchPath
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true
    
    # Watch for specific file types
    $watcher.Filter = "*.*"
    
    $action = {
        param($sender, $e)
        
        $filePath = $e.FullPath
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $extension = [System.IO.Path]::GetExtension($filePath)
        
        # Skip irrelevant files
        if ($fileName -match "^\.|node_modules|\.git|\.next|dist|build" -or 
            $extension -in @('.log', '.tmp', '.swp', '.swo')) {
            return
        }
        
        # Debounce rapid changes
        $now = Get-Date
        if ($lastSync[$filePath] -and 
            ($now - $lastSync[$filePath]).TotalMilliseconds -lt $using:DebounceMs) {
            return
        }
        $lastSync[$filePath] = $now
        
        Write-SmartLog "📝 Changed: $fileName" -Type Info
        
        # Handle different file types
        switch -Regex ($extension) {
            '\.(tsx?|jsx?|css|scss)$' {
                Write-SmartLog "🎨 Frontend file changed - Hot reload active" -Type Success
            }
            '\.json$' {
                if ($fileName -eq 'package.json') {
                    Write-SmartLog "📦 Package.json changed - Syncing dependencies..." -Type Warning
                    Sync-Dependencies
                }
            }
            '\.config\.(js|ts|mjs)$' {
                Write-SmartLog "⚙️ Config changed - Restarting server..." -Type Warning
                Restart-DevServer
            }
        }
    }
    
    # Register event handlers
    Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
    Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
    Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
    
    try {
        Write-SmartLog "✨ Auto-sync is running. Press Ctrl+C to stop." -Type Success
        Write-SmartLog "🌐 Open http://localhost:3000 to see live changes" -Type Accent
        
        # Keep the script running
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        $watcher.Dispose()
        Write-SmartLog "🛑 File watcher stopped" -Type Warning
    }
}

# Main execution
try {
    Write-SmartLog "🚀 LiTreeLab'Studio™ Smart Auto-Sync Starting..." -Type Accent
    
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    if ($Force -or -not (Get-Process -Name "node" -ErrorAction SilentlyContinue | 
                          Where-Object { $_.CommandLine -like "*next*dev*" })) {
        Write-SmartLog "🏃 Starting development environment..." -Type Info
        Sync-Dependencies
        Restart-DevServer
    }
    
    if ($Watch) {
        Watch-FileChanges -WatchPath $Path -DebounceMs $DebounceMs
    }
    
} catch {
    Write-SmartLog "❌ Error: $($_.Exception.Message)" -Type Error
    exit 1
}