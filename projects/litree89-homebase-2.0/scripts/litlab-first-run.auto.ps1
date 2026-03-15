# litlab-first-run.auto.ps1 - Automated Local Development Bootstrap
# Auto-detects package manager and starts both API (Functions) and Web (Vite) locally
# Usage: pwsh .\scripts\litlab-first-run.auto.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"

function Write-Status($message, $color = $ColorInfo) {
    Write-Host "==> $message" -ForegroundColor $color
}

# ==============================================================================
# Phase 1: Verify Prerequisites
# ==============================================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $ColorInfo
Write-Host "║        LITLABS Local Development Bootstrap                  ║" -ForegroundColor $ColorInfo
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $ColorInfo
Write-Host ""

Write-Status "Checking prerequisites..." $ColorInfo

$tools = @{
    "node" = "Node.js (https://nodejs.org)"
    "git" = "Git (https://git-scm.com)"
    "func" = "Azure Functions Core Tools (npm i -g azure-functions-core-tools@4)"
}

$missing = @()
foreach ($tool in $tools.Keys) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        $version = & $tool --version 2>$null | Select-Object -First 1
        Write-Host "  ✓ $tool " -NoNewline -ForegroundColor $ColorSuccess
        Write-Host "($version)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $tool missing" -ForegroundColor $ColorError
        $missing += "$tool - $($tools[$tool])"
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Status "Missing required tools:" $ColorError
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor $ColorWarning }
    Write-Host ""
    Write-Status "Run setup-litlab-homebase.ps1 to install prerequisites" $ColorWarning
    exit 1
}

# Check Node version
$nodeVersion = (node --version) -replace 'v', ''
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 20) {
    Write-Status "Warning: Node.js $nodeVersion detected. Node 20+ recommended for Azure Functions v4" $ColorWarning
}

Write-Status "All prerequisites found" $ColorSuccess

# ==============================================================================
# Phase 2: Detect Package Manager
# ==============================================================================
Write-Status "Detecting package manager..." $ColorInfo

$packageManager = "npm"
$installCmd = "npm install"
$runCmd = "npm run"

if (Test-Path "pnpm-lock.yaml") {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $packageManager = "pnpm"
        $installCmd = "pnpm install"
        $runCmd = "pnpm"
    } else {
        Write-Status "pnpm-lock.yaml found but pnpm not installed. Installing pnpm..." $ColorWarning
        npm install -g pnpm
        $packageManager = "pnpm"
        $installCmd = "pnpm install"
        $runCmd = "pnpm"
    }
} elseif (Test-Path "yarn.lock") {
    if (Get-Command yarn -ErrorAction SilentlyContinue) {
        $packageManager = "yarn"
        $installCmd = "yarn install"
        $runCmd = "yarn"
    }
}

Write-Host "  Using: " -NoNewline -ForegroundColor Gray
Write-Host "$packageManager" -ForegroundColor $ColorSuccess

# ==============================================================================
# Phase 3: Install Dependencies
# ==============================================================================
Write-Status "Installing dependencies..." $ColorInfo

# Root workspace
Write-Host "  Installing root dependencies..." -ForegroundColor Gray
Invoke-Expression $installCmd

# API (Azure Functions)
if (Test-Path "packages/api/package.json") {
    Write-Host "  Installing api/ dependencies..." -ForegroundColor Gray
    Push-Location packages/api
    Invoke-Expression $installCmd
    Pop-Location
}

# Web (Next.js)
if (Test-Path "apps/web/package.json") {
    Write-Host "  Installing app/ dependencies..." -ForegroundColor Gray
    Push-Location apps/web
    Invoke-Expression $installCmd
    Pop-Location
}

Write-Status "Dependencies installed" $ColorSuccess

# ==============================================================================
# Phase 4: Environment Configuration
# ==============================================================================
Write-Status "Checking environment configuration..." $ColorInfo

# API local.settings.json
if (-not (Test-Path "packages/api/local.settings.json")) {
    if (Test-Path "packages/packages/api/local.settings.json.example") {
        Copy-Item "packages/packages/api/local.settings.json.example" "packages/api/local.settings.json"
        Write-Host "  Created packages/api/local.settings.json from example" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "  Warning: packages/api/local.settings.json not found" -ForegroundColor $ColorWarning
    }
}

# App .env.local
if (-not (Test-Path "apps/web/.env.local")) {
    if (Test-Path "apps/web/.env.example") {
        Copy-Item "apps/web/.env.example" "apps/web/.env.local"
        Write-Host "  Created apps/web/.env.local from example" -ForegroundColor $ColorSuccess
    }
}

Write-Status "Environment configured" $ColorSuccess

# ==============================================================================
# Phase 5: Start Development Servers
# ==============================================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $ColorSuccess
Write-Host "║              Starting Development Servers                   ║" -ForegroundColor $ColorSuccess
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $ColorSuccess
Write-Host ""

Write-Status "Starting Azure Functions (API) on http://localhost:7071..." $ColorInfo
Write-Status "Starting Web (Next.js) on http://localhost:3000..." $ColorInfo
Write-Host ""

# Start both servers concurrently
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/packages/api
    func start
}

$appJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/apps/web
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm dev
    } else {
        npm run dev
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host " Development servers starting..." -ForegroundColor $ColorInfo
Write-Host "" -ForegroundColor Gray
Write-Host "   📦 API (Azure Functions): " -NoNewline
Write-Host "http://localhost:7071/api" -ForegroundColor $ColorSuccess
Write-Host "   🌐 Web (Next.js):      " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor $ColorSuccess
Write-Host "" -ForegroundColor Gray
Write-Host " Press Ctrl+C to stop both servers" -ForegroundColor $ColorWarning
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host ""

# Wait for jobs and stream output
try {
    while ($true) {
        $apiOutput = Receive-Job $apiJob
        $appOutput = Receive-Job $appJob
        
        if ($apiOutput) { 
            $apiOutput | ForEach-Object { Write-Host "[API] $_" -ForegroundColor Cyan }
        }
        if ($appOutput) { 
            $appOutput | ForEach-Object { Write-Host "[APP] $_" -ForegroundColor Yellow }
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    Stop-Job $apiJob, $appJob
    Remove-Job $apiJob, $appJob
    Write-Status "Development servers stopped" $ColorInfo
}

