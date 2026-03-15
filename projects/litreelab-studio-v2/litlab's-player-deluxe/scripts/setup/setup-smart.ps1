#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Smart Setup Wizard for Overlord Dashboard
.DESCRIPTION
    Automatically configures API keys, checks dependencies, and sets up the dashboard.
    Run this once and everything will be configured!
#>

param(
    [switch]$SkipLogo,
    [switch]$SkipBrowser
)

$ErrorActionPreference = "Stop"

# ═══════════════════════════════════════════════════════════════
#  COLORS & OUTPUT
# ═══════════════════════════════════════════════════════════════
function Write-Header($text) {
    Write-Host ""
    Write-Host "◈ $text ◈" -ForegroundColor Cyan
    Write-Host ("─" * 60) -ForegroundColor DarkGray
}

function Write-Success($text) { Write-Host "  ✓ $text" -ForegroundColor Green }
function Write-Info($text) { Write-Host "  ℹ $text" -ForegroundColor Yellow }
function Write-Error($text) { Write-Host "  ✗ $text" -ForegroundColor Red }

# ═══════════════════════════════════════════════════════════════
#  STEP 1: CHECK PYTHON & DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
Write-Header "STEP 1: Checking Dependencies"

try {
    $pythonVersion = python --version 2>&1
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-Error "Python not found! Please install Python 3.8+"
    exit 1
}

# Check if requirements are installed
Write-Info "Checking Python packages..."
$packages = @("psutil", "pyyaml", "requests", "firebase-admin", "python-dotenv")
$missing = @()

foreach ($pkg in $packages) {
    $result = python -c "import $pkg" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missing += $pkg
    }
}

if ($missing.Count -gt 0) {
    Write-Info "Installing missing packages: $($missing -join ', ')"
    pip install -r requirements.txt
    Write-Success "Packages installed"
} else {
    Write-Success "All packages already installed"
}

# ═══════════════════════════════════════════════════════════════
#  STEP 2: CONFIGURE REAL-DEBRID
# ═══════════════════════════════════════════════════════════════
Write-Header "STEP 2: Real-Debrid Configuration"

$envFile = ".env"
$apiKeysFile = "# API Keys.txt"

# Check if RD_API_KEY is already set
$currentKey = [Environment]::GetEnvironmentVariable("RD_API_KEY")
$envContent = Get-Content $envFile -Raw -ErrorAction SilentlyContinue

if ($envContent -match "RD_API_KEY=([^`r`n]+)" -and $matches[1] -and $matches[1] -ne "your-api-key-here") {
    $key = $matches[1]
    Write-Success "Real-Debrid API key already configured"
    Write-Info "Key: $($key.Substring(0, 8))...$($key.Substring($key.Length - 4))"
} else {
    # Try to get from API Keys file
    if (Test-Path $apiKeysFile) {
        $apiContent = Get-Content $apiKeysFile -Raw
        if ($apiContent -match "REALDEBRID_API_KEY=([A-Z0-9]+)") {
            $key = $matches[1]
            Write-Info "Found key in '# API Keys.txt'"
            
            # Update .env file
            if ($envContent -match "RD_API_KEY=.*") {
                $envContent = $envContent -replace "RD_API_KEY=.*", "RD_API_KEY=$key"
            } else {
                $envContent += "`nRD_API_KEY=$key"
            }
            Set-Content $envFile $envContent -NoNewline
            Write-Success "Real-Debrid API key configured from file"
        }
    } else {
        Write-Error "No API key found!"
        Write-Host ""
        Write-Host "  To get your Real-Debrid API key:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://real-debrid.com/apitoken" -ForegroundColor Gray
        Write-Host "  2. Copy your API token" -ForegroundColor Gray
        Write-Host "  3. Paste it below:" -ForegroundColor Gray
        Write-Host ""
        $key = Read-Host "  Enter your Real-Debrid API key"
        
        if ($key) {
            if ($envContent -match "RD_API_KEY=.*") {
                $envContent = $envContent -replace "RD_API_KEY=.*", "RD_API_KEY=$key"
            } else {
                $envContent += "`nRD_API_KEY=$key"
            }
            Set-Content $envFile $envContent -NoNewline
            Write-Success "API key saved to .env file"
        }
    }
}

# ═══════════════════════════════════════════════════════════════
#  STEP 3: CHECK LOGO ASSETS
# ═══════════════════════════════════════════════════════════════
if (-not $SkipLogo) {
    Write-Header "STEP 3: Logo Assets"
    
    $logoFile = "assets/logo-overlord.svg"
    if (Test-Path $logoFile) {
        Write-Success "Logo found: $logoFile"
        Write-Info "View preview at: assets/logo-preview.html"
        
        # Check if PNGs need to be generated
        if (-not (Test-Path "assets/png/logo-512.png")) {
            Write-Info "Generating PNG versions..."
            Push-Location assets
            try {
                python generate-pngs.py
                Write-Success "PNGs generated"
            } catch {
                Write-Error "Failed to generate PNGs (cairosvg may not be installed)"
                Write-Info "Run: pip install cairosvg"
            }
            Pop-Location
        } else {
            Write-Success "PNGs already generated"
        }
        
        # Open preview in browser
        if (-not $SkipBrowser) {
            $previewPath = (Resolve-Path "assets/logo-preview.html").Path
            Write-Info "Opening logo preview..."
            Start-Process "chrome.exe" $previewPath -ErrorAction SilentlyContinue
            Start-Process "firefox.exe" $previewPath -ErrorAction SilentlyContinue
            Start-Process "msedge.exe" $previewPath -ErrorAction SilentlyContinue
            Start-Process $previewPath -ErrorAction SilentlyContinue
        }
    } else {
        Write-Error "Logo not found! Run the logo generation first."
    }
}

# ═══════════════════════════════════════════════════════════════
#  STEP 4: VERIFY CONFIG
# ═══════════════════════════════════════════════════════════════
Write-Header "STEP 4: Configuration Summary"

$config = Get-Content "config.yaml" -Raw
$apiKey = ($config | Select-String 'api_key: "([^"]+)"').Matches.Groups[1].Value

Write-Info "Dashboard API Key: $($apiKey.Substring(0, 8))..."
Write-Info "Server Port: $(($config | Select-String 'port: (\d+)').Matches.Groups[1].Value)"
Write-Info "Auth Enabled: $(($config | Select-String 'enabled: (true|false)').Matches.Groups[1].Value)"

# ═══════════════════════════════════════════════════════════════
#  STEP 5: START SERVER
# ═══════════════════════════════════════════════════════════════
Write-Header "STEP 5: Ready to Start"

Write-Host ""
Write-Host "  ┌─────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │                                                         │" -ForegroundColor Cyan
Write-Host "  │   ◈ SYSTEM OVERLORD v4.2 is configured and ready! ◈    │" -ForegroundColor Cyan
Write-Host "  │                                                         │" -ForegroundColor Cyan
Write-Host "  └─────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "  Start the server now? (Y/n)"

if ($startNow -eq "" -or $startNow -eq "Y" -or $startNow -eq "y") {
    Write-Info "Starting server..."
    python server.py
} else {
    Write-Info "You can start later with: python server.py"
}
