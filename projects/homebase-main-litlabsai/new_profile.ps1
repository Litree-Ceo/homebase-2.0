# PowerShell Profile for Homebase 2.0
# Optimized for Trae & Development

# -----------------------------------------------------------------------------
# 1. Modules & Imports
# -----------------------------------------------------------------------------
try {
    Import-Module Terminal-Icons -ErrorAction SilentlyContinue
} catch {
    Write-Warning "Terminal-Icons module not found. Run 'Install-Module Terminal-Icons -Scope CurrentUser' to install."
}

try {
    Import-Module PSReadLine -ErrorAction SilentlyContinue
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -PredictionViewStyle ListView
} catch {
    # PSReadLine might be built-in or missing
}

# -----------------------------------------------------------------------------
# 2. Environment Setup
# -----------------------------------------------------------------------------
$env:HomebaseRoot = "C:\Users\litre\homebase-2.0"
$env:LitLabsRoot = "$env:HomebaseRoot\homebase-2.0\litlabs"
$env:AgentZeroRoot = "$env:HomebaseRoot\github\apps\agent-zero"

# -----------------------------------------------------------------------------
# 3. Aliases & Functions
# -----------------------------------------------------------------------------

# --> Navigation
function home { Set-Location $env:HomebaseRoot }
function labs { Set-Location $env:LitLabsRoot }
function zero { Set-Location $env:AgentZeroRoot }

# --> Agent B: Browser Agent (Chromium + Gemini/OpenAI)
function agent-b {
    param([string]$Task)
    $ScriptPath = "$env:AgentZeroRoot\browser_agent.py"
    if (-not (Test-Path $ScriptPath)) {
        Write-Error "Browser Agent script not found at $ScriptPath"
        return
    }
    
    # Check if virtual env exists, else use global python
    # Assuming global python has the deps for now based on user context
    python $ScriptPath $Task
}

# --> Agent Z: Agent Zero Enhanced
function agent-z {
    param([string]$Task)
    $ScriptPath = "$env:AgentZeroRoot\main_enhanced.py"
    if (-not (Test-Path $ScriptPath)) {
        Write-Error "Agent Zero script not found at $ScriptPath"
        return
    }
    python $ScriptPath $Task
}

# --> Google Opal
function opal {
    Start-Process "https://opal.dev"
}

# --> Deployment & Build
function deploy-firebase {
    Write-Host "🔥 Deploying to Firebase Hosting..." -ForegroundColor Yellow
    Set-Location $env:LitLabsRoot
    
    # Clean build artifacts
    if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
    if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
    
    # Build
    Write-Host "🔨 Building Next.js project..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        return
    }
    
    # Deploy
    Write-Host "🚀 Uploading to Firebase..." -ForegroundColor Cyan
    firebase deploy --only hosting
}

function dev {
    Set-Location $env:LitLabsRoot
    npm run dev
}

# -----------------------------------------------------------------------------
# 4. Prompt Customization
# -----------------------------------------------------------------------------
function prompt {
    $path = $(Get-Location).Path.Replace($HOME, "~")
    $user = "Litre"
    
    Write-Host ""
    Write-Host " ⚡ $user " -NoNewline -ForegroundColor Yellow
    Write-Host " $path " -NoNewline -ForegroundColor Cyan
    
    # Git status if available
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Host " *" -NoNewline -ForegroundColor Red
        }
    }
    
    return "`n❯ "
}

# -----------------------------------------------------------------------------
# 5. Startup Message
# -----------------------------------------------------------------------------
Clear-Host
Write-Host "===========================================" -ForegroundColor Magenta
Write-Host "   HOMEBASE 2.0 | GOLDEN ENVIRONMENT       " -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Magenta
Write-Host " 🤖 Agents: agent-b (Browser), agent-z (Zero)"
Write-Host " 🚀 Dev:    dev, deploy-firebase"
Write-Host " 📍 Nav:    home, labs, zero"
Write-Host " 💎 Tools:  opal"
Write-Host "===========================================" -ForegroundColor DarkGray
