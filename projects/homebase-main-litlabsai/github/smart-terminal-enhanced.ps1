# Enhanced Terminal Intelligence - Main Integration
# Genius-level smart terminal with context awareness, git intelligence, deployment automation, and emergency recovery

$TerminalVersion = "2.0.0-genius"
$IntelligenceModules = @(
    "context-awareness.ps1",
    "git-intelligence.ps1",
    "deployment-intelligence.ps1",
    "emergency-intelligence.ps1"
)

# Load all intelligence modules
$ModulePath = Split-Path -Parent $MyInvocation.MyCommand.Path
foreach ($module in $IntelligenceModules) {
    $modulePath = Join-Path $ModulePath $module
    if (Test-Path $modulePath) {
        . $modulePath
    }
}

# ============================================================================
# SMART ALIASES - Context-aware shortcuts
# ============================================================================

# Development
Set-Alias -Name hb -Value Invoke-HomebaseCommand -Force
Set-Alias -Name hb-dev -Value Start-SmartDev -Force
Set-Alias -Name hb-build -Value Invoke-SmartBuild -Force
Set-Alias -Name hb-lint -Value Invoke-SmartLint -Force
Set-Alias -Name hb-test -Value Invoke-SmartTest -Force

# Git
Set-Alias -Name hb-status -Value Show-GitStatus -Force
Set-Alias -Name hb-pull -Value Smart-GitPull -Force
Set-Alias -Name hb-push -Value Smart-GitPush -Force
Set-Alias -Name hb-commit -Value Suggest-CommitMessage -Force

# Deployment
Set-Alias -Name hb-deploy -Value Invoke-SmartDeploy -Force
Set-Alias -Name hb-rollback -Value Rollback-Deployment -Force
Set-Alias -Name hb-health -Value Show-ContextStatus -Force

# Emergency
Set-Alias -Name hb-diagnose -Value Diagnose-Issue -Force
Set-Alias -Name hb-clean -Value Clear-AllCaches -Force
Set-Alias -Name hb-monitor -Value Monitor-ProjectHealth -Force

# ============================================================================
# SMART FUNCTIONS
# ============================================================================

function Invoke-HomebaseCommand {
    param([string]$Command = "status")
    
    $ctx = Get-ProjectContext
    
    switch ($Command.ToLower()) {
        "status" { Show-ContextStatus; Show-GitStatus }
        "health" { Show-ContextStatus }
        "packages" { 
            Write-Host "📦 Packages in monorepo:" -ForegroundColor Cyan
            $ctx.Packages | ForEach-Object { Write-Host "  • $($_.Name)" -ForegroundColor Gray }
        }
        default { Write-Host "Usage: hb [status|health|packages]" -ForegroundColor Yellow }
    }
}

function Start-SmartDev {
    param([string]$Package)
    
    $ctx = Get-ProjectContext
    
    if ($Package) {
        $pkg = $ctx.Packages | Where-Object { $_.Name -eq $Package }
        if ($pkg) {
            Write-Host "🚀 Starting dev for $Package..." -ForegroundColor Cyan
            Push-Location $pkg.Path
            pnpm dev
            Pop-Location
        } else {
            Write-Host "❌ Package not found: $Package" -ForegroundColor Red
        }
    } else {
        Write-Host "🚀 Starting dev environment..." -ForegroundColor Cyan
        pnpm dev
    }
}

function Invoke-SmartBuild {
    param([string]$Package)
    
    $ctx = Get-ProjectContext
    
    Write-Host "🔨 Building..." -ForegroundColor Cyan
    
    if ($Package) {
        $pkg = $ctx.Packages | Where-Object { $_.Name -eq $Package }
        if ($pkg -and $pkg.HasBuild) {
            Push-Location $pkg.Path
            pnpm build
            Pop-Location
        }
    } else {
        pnpm build
    }
}

function Invoke-SmartLint {
    Write-Host "🔍 Linting..." -ForegroundColor Cyan
    pnpm lint
}

function Invoke-SmartTest {
    Write-Host "🧪 Testing..." -ForegroundColor Cyan
    pnpm test
}

function Invoke-SmartDeploy {
    param(
        [string]$Platform = "vercel",
        [string]$Environment = "production"
    )
    
    switch ($Platform.ToLower()) {
        "vercel" { Deploy-ToVercel -Environment $Environment }
        "azure" { 
            $rg = Read-Host "Resource Group"
            $app = Read-Host "App Name"
            Deploy-ToAzure -ResourceGroup $rg -AppName $app
        }
        default { Write-Host "Supported platforms: vercel, azure" -ForegroundColor Yellow }
    }
}

# ============================================================================
# PROMPT ENHANCEMENT
# ============================================================================

function prompt {
    $ctx = Get-ProjectContext
    $branch = Get-SmartBranch
    $status = Get-GitStatus
    
    $prompt = ""
    
    # Git branch indicator
    if ($branch) {
        $branchColor = if ($status.Modified -gt 0 -or $status.Untracked -gt 0) { "Yellow" } else { "Green" }
        $prompt += "[$branch] " | Write-Host -ForegroundColor $branchColor -NoNewline
    }
    
    # Environment indicator
    if ($ctx.Environment -ne "unknown") {
        $envColor = switch ($ctx.Environment) {
            "production" { "Red" }
            "staging" { "Yellow" }
            default { "Green" }
        }
        $prompt += "[$($ctx.Environment)] " | Write-Host -ForegroundColor $envColor -NoNewline
    }
    
    # Status indicator
    if ($status.Modified -gt 0 -or $status.Added -gt 0 -or $status.Deleted -gt 0) {
        $prompt += "⚡ " | Write-Host -ForegroundColor Yellow -NoNewline
    }
    
    # Directory
    $prompt += "$(Split-Path -Leaf $PWD) " | Write-Host -ForegroundColor Cyan -NoNewline
    
    return "❯ "
}

# ============================================================================
# INITIALIZATION
# ============================================================================

Write-Host "🧠 Enhanced Terminal Intelligence v$TerminalVersion loaded" -ForegroundColor Cyan
Write-Host "   Type 'hb' for quick status, 'hb-help' for commands" -ForegroundColor Gray

function Show-TerminalHelp {
    Write-Host "
🧠 Enhanced Terminal Intelligence Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STATUS & MONITORING
  hb                    Show project status and git info
  hb-health             Show detailed project health
  hb-monitor            Start continuous health monitoring
  hb-diagnose <issue>   Diagnose common issues

🚀 DEVELOPMENT
  hb-dev [package]      Start dev environment
  hb-build [package]    Build project
  hb-lint               Run linter
  hb-test               Run tests

🌿 GIT OPERATIONS
  hb-status             Show git status with suggestions
  hb-pull               Smart pull with auto-update
  hb-push [msg]         Smart push with commit suggestions
  hb-commit             Get commit message suggestions

🚀 DEPLOYMENT
  hb-deploy [platform]  Deploy to Vercel or Azure
  hb-rollback [steps]   Rollback deployments
  hb-health             Check deployment readiness

🧹 MAINTENANCE
  hb-clean              Clear all caches
  hb-monitor            Monitor project health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
" -ForegroundColor Cyan
}

Set-Alias -Name hb-help -Value Show-TerminalHelp -Force

Export-ModuleMember -Function @(
    'Invoke-HomebaseCommand',
    'Start-SmartDev',
    'Invoke-SmartBuild',
    'Invoke-SmartLint',
    'Invoke-SmartTest',
    'Invoke-SmartDeploy',
    'Show-TerminalHelp'
)
