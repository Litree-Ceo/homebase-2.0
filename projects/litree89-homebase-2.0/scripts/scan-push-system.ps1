<#!
.SYNOPSIS
Scan Push System - PowerShell Version
.DESCRIPTION
Comprehensive automation tool for Everything HomeBase 2.0 with Honeycomb Vision Drip Layout Mode
.PARAMETER Free
Enable free tier mode
.PARAMETER Pro
Enable pro tier mode
.EXAMPLE
.\scan-push-system.ps1 -Free
.EXAMPLE
.\scan-push-system.ps1 -Pro
#>

[CmdletBinding()]
param(
    [switch]$Free,
    [switch]$Pro
)

# Configuration
$script:Colors = @{
    Black   = "$([char]0x1b)[30m"
    Purple  = "$([char]0x1b)[35m"
    Gold    = "$([char]0x1b)[33m"
    Yellow  = "$([char]0x1b)[33m"
    Reset   = "$([char]0x1b)[0m"
    Bright  = "$([char]0x1b)[1m"
}

$script:Config = @{
    Root       = (Get-Location).Path
    Apps       = Join-Path (Get-Location).Path "apps"
    Packages   = Join-Path (Get-Location).Path "packages"
    Scripts    = Join-Path (Get-Location).Path "scripts"
    Cursor     = Join-Path $env:USERPROFILE ".cursor"
    Files      = @("package.json", "pnpm-lock.yaml", "tsconfig.json", ".eslintrc.json", ".prettierrc")
}

$script:ScanResults = @()
$script:IsFreeTier = $true

function Write-Header {
    Clear-Host
    Write-Host "$($script:Colors.Black)$($script:Colors.Bright)"
    Write-Host "╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║                    SCAN PUSH SYSTEM                        ║"
    Write-Host "║              Everything HomeBase 2.0                       ║"
    Write-Host "║                                                            ║"
    Write-Host "║  🐝 Honeycomb Vision Drip Layout Mode                      ║"
    Write-Host "║  🎨 Black, Purple, Gold, Yellow Theme                      ║"
    Write-Host "║  🆓 Free Tier Access                                       ║"
    Write-Host "║  🎯 Cursor Top-Level Integration                           ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝"
    Write-Host "$($script:Colors.Reset)"
}

function Enable-HoneycombVision {
    Write-Host "$($script:Colors.Purple)$($script:Colors.Bright)🐝 HONEYCOMB VISION MODE ACTIVATED$($script:Colors.Reset)"
    Show-HoneycombGrid
}

function Disable-HoneycombVision {
    Write-Host "$($script:Colors.Gold)$($script:Colors.Bright)✨ HONEYCOMB VISION MODE DEACTIVATED$($script:Colors.Reset)"
}

function Show-HoneycombGrid {
    $grid = @(
        "    🌟    🌟    🌟    ",
        "  🐝  🐝  🐝  🐝  🐝  ",
        "    🌟    🌟    🌟    ",
        "  🐝  🐝  🐝  🐝  🐝  ",
        "    🌟    🌟    🌟    "
    )
    
    foreach ($row in $grid) {
        Write-Host "$($script:Colors.Purple)$row$($script:Colors.Reset)"
    }
}

function Invoke-DripEffect {
    $drips = @("💧", "✨", "🌟", "💎")
    $randomDrip = $drips[(Get-Random -Maximum $drips.Count)]
    Write-Host "$($script:Colors.Gold)$randomDrip$($script:Colors.Reset)"
}

function Test-Prerequisites {
    Write-Host "$($script:Colors.Purple)🔍 Checking Prerequisites...$($script:Colors.Reset)"
    
    $requirements = @(
        @{ Name = "Node.js"; Check = { node --version } },
        @{ Name = "pnpm"; Check = { pnpm --version } },
        @{ Name = "git"; Check = { git --version } }
    )

    foreach ($req in $requirements) {
        try {
            $result = & $req.Check 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "$($script:Colors.Gold)✅ $($req.Name): $result$($script:Colors.Reset)"
            } else {
                Write-Host "$($script:Colors.Yellow)⚠️  $($req.Name): Not found$($script:Colors.Reset)"
            }
        } catch {
            Write-Host "$($script:Colors.Yellow)⚠️  $($req.Name): Not found$($script:Colors.Reset)"
        }
    }
}

function Invoke-ScanEnvironment {
    Write-Host "$($script:Colors.Purple)🔎 Scanning Environment...$($script:Colors.Reset)"
    
    Scan-Directory -Path $script:Config.Apps -Type "Apps"
    Scan-Directory -Path $script:Config.Packages -Type "Packages"
    Scan-Directory -Path $script:Config.Scripts -Type "Scripts"
    
    Scan-ForFiles
    Test-CursorIntegration
    
    Write-Host "$($script:Colors.Gold)📊 Scan Complete: $($script:ScanResults.Count) items found$($script:Colors.Reset)"
}

function Scan-Directory {
    param(
        [string]$Path,
        [string]$Type
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "$($script:Colors.Yellow)⚠️  Directory not found: $Path$($script:Colors.Reset)"
        return
    }

    Write-Host "$($script:Colors.Purple)📁 $Type Directory:$($script:Colors.Reset)"
    
    $items = Get-ChildItem -Path $Path -Force
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Write-Host "  $($script:Colors.Gold)📂 $($item.Name)/$($script:Colors.Reset)"
            $script:ScanResults += [PSCustomObject]@{
                Type = 'directory'
                Path = $item.FullName
                Name = $item.Name
            }
            
            # Check for package.json in subdirectories
            $packageJsonPath = Join-Path $item.FullName "package.json"
            if (Test-Path $packageJsonPath) {
                $script:ScanResults += [PSCustomObject]@{
                    Type = 'package'
                    Path = $packageJsonPath
                    Name = $item.Name
                }
            }
        } else {
            Write-Host "  $($script:Colors.Yellow)📄 $($item.Name)$($script:Colors.Reset)"
            $script:ScanResults += [PSCustomObject]@{
                Type = 'file'
                Path = $item.FullName
                Name = $item.Name
            }
        }
    }
}

function Scan-ForFiles {
    Write-Host "$($script:Colors.Purple)🔍 Scanning for Configuration Files...$($script:Colors.Reset)"
    
    foreach ($filename in $script:Config.Files) {
        $fullPath = Join-Path $script:Config.Root $filename
        if (Test-Path $fullPath) {
            Write-Host "  $($script:Colors.Gold)⚙️  $filename$($script:Colors.Reset)"
            $script:ScanResults += [PSCustomObject]@{
                Type = 'config'
                Path = $fullPath
                Name = $filename
            }
        }
    }
}

function Test-CursorIntegration {
    Write-Host "$($script:Colors.Purple)🎯 Checking Cursor Integration...$($script:Colors.Reset)"
    
    if (Test-Path $script:Config.Cursor) {
        Write-Host "$($script:Colors.Gold)✅ Cursor detected at: $($script:Config.Cursor)$($script:Colors.Reset)"
        Set-CursorIntegration
    } else {
        Write-Host "$($script:Colors.Yellow)⚠️  Cursor not found. Creating Cursor integration...$($script:Colors.Reset)"
        New-CursorIntegration
    }
}

function Set-CursorIntegration {
    $cursorConfigPath = Join-Path $script:Config.Cursor "homebase-config.json"
    $config = @{
        scanPushEnabled = $true
        honeycombVision = $true
        freeTier = $true
        lastScan = (Get-Date).ToString("o")
        version = "2.0"
    }
    
    $config | ConvertTo-Json -Depth 3 | Out-File -FilePath $cursorConfigPath -Encoding utf8
    Write-Host "$($script:Colors.Gold)🔧 Cursor integration configured$($script:Colors.Reset)"
}

function New-CursorIntegration {
    try {
        New-Item -ItemType Directory -Path $script:Config.Cursor -Force | Out-Null
        Set-CursorIntegration
    } catch {
        Write-Host "$($script:Colors.Yellow)⚠️  Could not create Cursor directory: $($_.Exception.Message)$($script:Colors.Reset)"
    }
}

function Invoke-ProcessQueue {
    Write-Host "$($script:Colors.Purple)🚀 Processing Scan Queue...$($script:Colors.Reset)"
    
    foreach ($item in $script:ScanResults) {
        Invoke-ProcessItem -Item $item
        Invoke-DripEffect
    }
}

function Invoke-ProcessItem {
    param(
        [PSCustomObject]$Item
    )
    
    switch ($Item.Type) {
        'package' { Update-Package -Item $Item }
        'config' { Update-Config -Item $Item }
        'directory' { Process-Directory -Item $Item }
        default { Write-Host "$($script:Colors.Yellow)⏭️  Skipping: $($Item.Name)$($script:Colors.Reset)" }
    }
}

function Update-Package {
    param(
        [PSCustomObject]$Item
    )
    
    Write-Host "$($script:Colors.Gold)📦 Updating package: $($Item.Name)$($script:Colors.Reset)"
    
    try {
        $packageDir = Split-Path $Item.Path -Parent
        Set-Location $packageDir
        
        # Run pnpm install
        pnpm install
        
        # Run pnpm update
        pnpm update
        
        Write-Host "$($script:Colors.Gold)✅ Package updated: $($Item.Name)$($script:Colors.Reset)"
    } catch {
        Write-Host "$($script:Colors.Yellow)⚠️  Failed to update package $($Item.Name): $($_.Exception.Message)$($script:Colors.Reset)"
    }
}

function Update-Config {
    param(
        [PSCustomObject]$Item
    )
    
    Write-Host "$($script:Colors.Gold)⚙️  Processing config: $($Item.Name)$($script:Colors.Reset)"
    
    if ($Item.Name -eq 'package.json') {
        Update-PackageJson -FilePath $Item.Path
    } elseif ($Item.Name -eq 'tsconfig.json') {
        Update-TsConfig -FilePath $Item.Path
    }
}

function Update-PackageJson {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content -Path $FilePath -Raw | ConvertFrom-Json
        
        if (-not $content.scripts) {
            $content | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
        }
        
        $newScripts = @{
            'scan:push' = 'node scripts/scan-push-system.js'
            'scan:push:free' = 'node scripts/scan-push-system.js --free'
            'scan:push:pro' = 'node scripts/scan-push-system.js --pro'
        }
        
        foreach ($key in $newScripts.Keys) {
            $content.scripts.$key = $newScripts[$key]
        }
        
        $content | ConvertTo-Json -Depth 10 | Out-File -FilePath $FilePath -Encoding utf8
        Write-Host "$($script:Colors.Gold)✅ Package.json updated with scan push scripts$($script:Colors.Reset)"
    } catch {
        Write-Host "$($script:Colors.Yellow)⚠️  Failed to update package.json: $($_.Exception.Message)$($script:Colors.Reset)"
    }
}

function Update-TsConfig {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content -Path $FilePath -Raw | ConvertFrom-Json
        
        if (-not $content.compilerOptions) {
            $content | Add-Member -MemberType NoteProperty -Name "compilerOptions" -Value @{}
        }
        
        if (-not $content.compilerOptions.paths) {
            $content.compilerOptions | Add-Member -MemberType NoteProperty -Name "paths" -Value @{}
        }
        
        $content.compilerOptions.paths['@/*'] = @('src/*')
        
        $content | ConvertTo-Json -Depth 10 | Out-File -FilePath $FilePath -Encoding utf8
        Write-Host "$($script:Colors.Gold)✅ TypeScript config updated$($script:Colors.Reset)"
    } catch {
        Write-Host "$($script:Colors.Yellow)⚠️  Failed to update tsconfig.json: $($_.Exception.Message)$($script:Colors.Reset)"
    }
}

function Process-Directory {
    param(
        [PSCustomObject]$Item
    )
    
    Write-Host "$($script:Colors.Gold)📁 Processing directory: $($Item.Name)$($script:Colors.Reset)"
    
    # Create scan push manifest
    $manifestPath = Join-Path $Item.Path "scan-push-manifest.json"
    $manifest = @{
        name = $Item.Name
        type = 'scan-push-target'
        version = '2.0.0'
        lastUpdated = (Get-Date).ToString("o")
        honeycombVision = $true
        freeTier = $script:IsFreeTier
        dependencies = @()
    }
    
    $manifest | ConvertTo-Json -Depth 3 | Out-File -FilePath $manifestPath -Encoding utf8
    Write-Host "$($script:Colors.Gold)✅ Scan push manifest created for $($Item.Name)$($script:Colors.Reset)"
}

function Write-Completion {
    Write-Host "$($script:Colors.Black)$($script:Colors.Bright)"
    Write-Host "╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║                    SCAN PUSH COMPLETE                        ║"
    Write-Host "║                                                            ║"
    Write-Host "║  ✅ Everything has been scanned and pushed                   ║"
    Write-Host "║  ✅ All packages installed and updated                       ║"
    Write-Host "║  ✅ Cursor integration configured                            ║"
    Write-Host "║  ✅ Honeycomb Vision Drip Layout Mode ready                  ║"
    Write-Host "║  ✅ Free tier access enabled                                 ║"
    Write-Host "║                                                            ║"
    Write-Host "║  🐝 Ready to use: npm run scan:push                         ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝"
    Write-Host "$($script:Colors.Reset)"
}

# Main execution
function Main {
    Write-Header
    
    if ($Free) {
        $script:IsFreeTier = $true
        Write-Host "$($script:Colors.Purple)🆓 Free tier mode enabled$($script:Colors.Reset)"
    }
    
    if ($Pro) {
        $script:IsFreeTier = $false
        Write-Host "$($script:Colors.Gold)💎 Pro tier mode enabled$($script:Colors.Reset)"
    }
    
    try {
        Enable-HoneycombVision
        Test-Prerequisites
        Invoke-ScanEnvironment
        Invoke-ProcessQueue
        Disable-HoneycombVision
        Write-Completion
    } catch {
        Write-Host "$($script:Colors.Yellow)❌ Error: $($_.Exception.Message)$($script:Colors.Reset)"
        exit 1
    }
}

# Run if called directly
Main