# Quick Start - Enhanced Terminal Intelligence Setup
# Run this to get everything up and running immediately

Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║          🧠 Enhanced Terminal Intelligence - Quick Start Setup             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Step 1: Verify PowerShell version
Write-Host "`n📋 Step 1: Checking PowerShell version..." -ForegroundColor Yellow
$psVersion = $PSVersionTable.PSVersion
Write-Host "  PowerShell: $psVersion" -ForegroundColor Green

if ($psVersion.Major -lt 7) {
    Write-Host "  ⚠️  Recommended: PowerShell 7+ for best performance" -ForegroundColor Yellow
}

# Step 2: Verify project structure
Write-Host "`n📋 Step 2: Verifying project structure..." -ForegroundColor Yellow
$checks = @{
    "pnpm-workspace.yaml" = Test-Path "pnpm-workspace.yaml"
    "package.json" = Test-Path "package.json"
    "turbo.json" = Test-Path "turbo.json"
    ".git" = Test-Path ".git"
    "api/" = Test-Path "api"
    "apps/" = Test-Path "apps"
}

$allGood = $true
$checks.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "✓" } else { "✗" }
    Write-Host "  $status $($_.Key)" -ForegroundColor $(if ($_.Value) { "Green" } else { "Red" })
    if (-not $_.Value) { $allGood = $false }
}

if (-not $allGood) {
    Write-Host "`n❌ Not in HomeBase root directory!" -ForegroundColor Red
    Write-Host "   Please run from: C:\Users\litre\homebase-2.0\github" -ForegroundColor Yellow
    exit 1
}

# Step 3: Load terminal intelligence
Write-Host "`n📋 Step 3: Loading terminal intelligence modules..." -ForegroundColor Yellow

$modulePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$modules = @(
    "terminal-intelligence\context-awareness.ps1",
    "terminal-intelligence\git-intelligence.ps1",
    "terminal-intelligence\deployment-intelligence.ps1",
    "terminal-intelligence\emergency-intelligence.ps1",
    "smart-terminal-enhanced.ps1"
)

$loaded = 0
foreach ($module in $modules) {
    $fullPath = Join-Path $modulePath $module
    if (Test-Path $fullPath) {
        . $fullPath
        Write-Host "  ✓ Loaded: $module" -ForegroundColor Green
        $loaded++
    } else {
        Write-Host "  ✗ Missing: $module" -ForegroundColor Red
    }
}

if ($loaded -lt $modules.Count) {
    Write-Host "`n⚠️  Some modules missing. Run from correct directory." -ForegroundColor Yellow
}

# Step 4: Verify aliases
Write-Host "`n📋 Step 4: Verifying aliases..." -ForegroundColor Yellow
$aliases = @("hb", "hb-dev", "hb-build", "hb-status", "hb-deploy", "hb-clean", "hb-help")
$aliasCount = 0

foreach ($alias in $aliases) {
    if (Get-Alias $alias -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ $alias" -ForegroundColor Green
        $aliasCount++
    }
}

Write-Host "  Loaded: $aliasCount/$($aliases.Count) aliases" -ForegroundColor $(if ($aliasCount -eq $aliases.Count) { "Green" } else { "Yellow" })

# Step 5: Show quick status
Write-Host "`n📋 Step 5: Project status..." -ForegroundColor Yellow
try {
    $ctx = Get-ProjectContext
    Write-Host "  Environment: $($ctx.Environment)" -ForegroundColor Green
    Write-Host "  Monorepo: $($ctx.IsMonorepo)" -ForegroundColor Green
    Write-Host "  Packages: $($ctx.Packages.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not get project context" -ForegroundColor Yellow
}

# Step 6: Show next steps
Write-Host "`n
╔════════════════════════════════════════════════════════════════════════════╗
║                          🎉 Setup Complete!                               ║
╚════════════════════════════════════════════════════════════════════════════╝

📚 Quick Commands:

  hb                    Show project status
  hb-help               Show all commands
  hb-health             Check project health
  hb-dev                Start development
  hb-status             Git status
  hb-clean              Clear caches

📖 Documentation:

  TERMINAL_SETUP_GUIDE.md      - Complete setup guide
  WORKSPACE_AUDIT_REPORT.md    - Audit results

🚀 Next Steps:

  1. Type 'hb' to see your project status
  2. Type 'hb-help' to see all available commands
  3. Read TERMINAL_SETUP_GUIDE.md for detailed documentation
  4. Run 'hb-health' to verify everything is working

💡 Pro Tips:

  • Use 'hb-dev' to start development
  • Use 'hb-status' for git information
  • Use 'hb-diagnose' if something goes wrong
  • Use 'hb-monitor' for continuous health monitoring

" -ForegroundColor Cyan

Write-Host "✅ Enhanced Terminal Intelligence is ready to use!" -ForegroundColor Green
Write-Host "   Type 'hb' to get started" -ForegroundColor Gray
