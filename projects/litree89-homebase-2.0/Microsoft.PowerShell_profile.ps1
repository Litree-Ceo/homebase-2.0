# ═════════════════════════════════════════════════════════════════════
# PowerShell Profile - Optimized for HomeBase 2.0 Development
# ═════════════════════════════════════════════════════════════════════
# Last Updated: 2026-01-01
# Auto-loaded on every PowerShell session

# ─────────────────────────────────────────────────────────────────────
# 1. ENVIRONMENT SETUP
# ─────────────────────────────────────────────────────────────────────

# Set workspace root
$WORKSPACE_ROOT = Split-Path -Parent $PROFILE
Set-Location $WORKSPACE_ROOT

# Add workspace scripts to PATH
$env:PATH = "$WORKSPACE_ROOT\scripts;$env:PATH"

# FIX: Remove problematic VS Code env vars that interfere with kubectl
Remove-Item env:VSCODE_GIT_ASKPASS_NODE -ErrorAction SilentlyContinue
Remove-Item env:VSCODE_GIT_ASKPASS -ErrorAction SilentlyContinue

# ─────────────────────────────────────────────────────────────────────
# 2. MODULE IMPORTS & PROMPT SETUP
# ─────────────────────────────────────────────────────────────────────

# Oh My Posh - Make prompt beautiful
$ompPath = "$env:LOCALAPPDATA\Programs\oh-my-posh\bin\oh-my-posh.exe"
if (Test-Path $ompPath) {
  & $ompPath init pwsh --config "$env:POSH_THEMES_PATH\takuya.omp.json" | Out-String | Invoke-Expression
}

# PSReadLine configuration for better experience
if (Get-Module -ListAvailable PSReadLine) {
  Import-Module PSReadLine
  Set-PSReadLineOption -PredictionSource HistoryAndPlugin -PredictionViewStyle ListView
  Set-PSReadLineKeyHandler -Chord "Ctrl+d" -Function DeleteCharOrExit
  Set-PSReadLineKeyHandler -Chord "Tab" -Function MenuComplete
  Set-PSReadLineOption -HistoryNoDuplicates
}

# Colors for output
$ESC = [char]27
$ColorReset = "$ESC[0m"
$ColorCyan = "$ESC[96m"
$ColorGreen = "$ESC[92m"
$ColorYellow = "$ESC[93m"
$ColorMagenta = "$ESC[95m"
$ColorRed = "$ESC[91m"
$ColorBlue = "$ESC[94m"

# ─────────────────────────────────────────────────────────────────────
# 3. CUSTOM FUNCTIONS - Development Shortcuts
# ─────────────────────────────────────────────────────────────────────

# 🏠 Go to workspace root
function cdhome {
  Set-Location $WORKSPACE_ROOT
  Write-Host "${ColorCyan}📍 HomeBase 2.0 root: $(Get-Location)${ColorReset}"
}

# 📁 Navigate to API
function cdapi {
  Set-Location "$WORKSPACE_ROOT/api"
  Write-Host "${ColorMagenta}🔧 API directory: $(Get-Location)${ColorReset}"
}

# 🌐 Navigate to web app
function cdweb {
  Set-Location "$WORKSPACE_ROOT/apps/web"
  Write-Host "${ColorBlue}🌐 Web app directory: $(Get-Location)${ColorReset}"
}

# 📦 Navigate to packages
function cdpkg {
  Set-Location "$WORKSPACE_ROOT/packages/core"
  Write-Host "${ColorGreen}📦 Packages directory: $(Get-Location)${ColorReset}"
}

# 🚀 Start dev environment
function start-dev {
  Write-Host "${ColorCyan}🚀 Starting dev environment...${ColorReset}"
  pnpm dev
}

# 🔨 Build workspace
function build-all {
  Write-Host "${ColorYellow}🔨 Building all workspaces...${ColorReset}"
  pnpm build
}

# ✅ Run tests
function test-all {
  Write-Host "${ColorGreen}✅ Running tests...${ColorReset}"
  pnpm test
}

# 🔍 Lint code
function lint-all {
  Write-Host "${ColorBlue}🔍 Linting all code...${ColorReset}"
  pnpm lint
}

# 🧹 Clean workspace
function clean-all {
  Write-Host "${ColorMagenta}🧹 Cleaning workspace...${ColorReset}"
  Remove-Item -Path "$WORKSPACE_ROOT/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "$WORKSPACE_ROOT/pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "$WORKSPACE_ROOT/**/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "$WORKSPACE_ROOT/**/dist" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "$WORKSPACE_ROOT/**/.next" -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "${ColorGreen}✅ Clean complete!${ColorReset}"
}

# 📋 Git quick status
function gits {
  git status --short
  Write-Host ""
  git log --oneline -5
}

# 📝 Git commit and push
function gitpush {
  param([string]$Message = "chore: update")
  git add .
  git commit -m "$Message"
  git push origin main
  Write-Host "${ColorGreen}✅ Pushed to main${ColorReset}"
}

# 🔗 Open in browser
function open-web {
  Start-Process "http://localhost:3000"
  Write-Host "${ColorCyan}🌐 Opened http://localhost:3000 in browser${ColorReset}"
}

# 📊 Show npm packages
function npm-list {
  param([string]$Filter = "")
  if ($Filter) {
    npm list | Select-String $Filter
  } else {
    npm list
  }
}

# ⚙️ Install dependencies
function install-deps {
  Write-Host "${ColorCyan}📦 Installing dependencies...${ColorReset}"
  pnpm install
  Write-Host "${ColorGreen}✅ Installation complete!${ColorReset}"
}

# 🔌 Test Azure connection
function test-azure {
  Write-Host "${ColorCyan}🔌 Testing Azure connection...${ColorReset}"
  az account show
}

# 📍 Show current location with details
function pwd-check {
  $loc = Get-Location
  $itemCount = (Get-ChildItem).Count
  Write-Host "${ColorYellow}📍 Current directory: $loc${ColorReset}"
  Write-Host "${ColorGray}   Items: $itemCount${ColorReset}"
}

# 🎯 Quick project setup
function setup-project {
  Write-Host "${ColorCyan}🎯 Setting up project...${ColorReset}"
  install-deps
  build-all
  Write-Host "${ColorGreen}✅ Project setup complete!${ColorReset}"
}

# Navigation helpers
function .. { Set-Location .. }
function ... { Set-Location ..\.. }
function ~ { Set-Location $env:USERPROFILE }

# ─────────────────────────────────────────────────────────────────────
# 4. ALIASES - Quick commands
# ─────────────────────────────────────────────────────────────────────

# Navigation
Set-Alias -Name ll -Value dir -Force
Set-Alias -Name c -Value Clear-Host -Force
Set-Alias -Name cls -Value Clear-Host -Force

# Git
Set-Alias -Name g -Value git -Force
Set-Alias -Name ga -Value { git add . } -Force
Set-Alias -Name gp -Value { git push } -Force
Set-Alias -Name gl -Value { git log --oneline -10 } -Force

# Development
Set-Alias -Name dev -Value start-dev -Force
Set-Alias -Name build -Value build-all -Force
Set-Alias -Name test -Value test-all -Force
Set-Alias -Name lint -Value lint-all -Force
Set-Alias -Name pn -Value pnpm -Force

# Package managers
Set-Alias -Name d -Value docker -Force
Set-Alias -Name k -Value kubectl -Force

# ─────────────────────────────────────────────────────────────────────
# 5. CUSTOM PROMPT (if oh-my-posh not available)
# ─────────────────────────────────────────────────────────────────────

if (-not (Test-Path $ompPath)) {
  function prompt {
    $lastStatus = $?
    $location = Get-Location
    
    # Check if in git repo
    $gitBranch = ""
    if (git rev-parse --git-dir 2>$null) {
      $gitBranch = & git branch --show-current 2>$null
      if ($gitBranch) {
        $gitBranch = " ${ColorMagenta}[$gitBranch]${ColorReset}"
      }
    }
    
    $venvIndicator = ""
    if ($env:VIRTUAL_ENV) { 
      $venvIndicator = " ${ColorGreen}(venv)${ColorReset}"
    }
    
    Write-Host ""
    Write-Host "${ColorCyan}💰${ColorReset}" -NoNewline
    Write-Host "$venvIndicator" -NoNewline
    Write-Host "$gitBranch" -NoNewline
    Write-Host " ${ColorYellow}$location${ColorReset}"
    return "${ColorGreen}❯${ColorReset} "
  }
}

# ─────────────────────────────────────────────────────────────────────
# 6. STARTUP MESSAGE
# ─────────────────────────────────────────────────────────────────────

$psVersionMajor = $PSVersionTable.PSVersion.Major
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  HomeBase 2.0 Development Environment" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📍 Root: $WORKSPACE_ROOT" -ForegroundColor Green
Write-Host "  🐚 Shell: PowerShell v$psVersionMajor" -ForegroundColor Blue
Write-Host "  📦 Package Manager: pnpm" -ForegroundColor Magenta
Write-Host ""
Write-Host "  ⌨️  Quick Commands:" -ForegroundColor Yellow
Write-Host "    • cdhome    - Go to workspace root" -ForegroundColor Gray
Write-Host "    • cdapi     - Go to API folder" -ForegroundColor Gray
Write-Host "    • cdweb     - Go to web app folder" -ForegroundColor Gray
Write-Host "    • cdpkg     - Go to packages folder" -ForegroundColor Gray
Write-Host "    • start-dev - Start dev environment" -ForegroundColor Gray
Write-Host "    • build-all - Build all workspaces" -ForegroundColor Gray
Write-Host "    • test-all  - Run all tests" -ForegroundColor Gray
Write-Host "    • lint-all  - Lint all code" -ForegroundColor Gray
Write-Host "    • clean-all - Clean workspace (node_modules, dist, .next)" -ForegroundColor Gray
Write-Host "    • gits      - Show git status & recent commits" -ForegroundColor Gray
Write-Host "    • gitpush   - Quick git commit and push" -ForegroundColor Gray
Write-Host "    • setup-project - Full project setup" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
