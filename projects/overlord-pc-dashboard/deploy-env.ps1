# deploy-env.ps1 - Deploy to specific Firebase environment
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("prod", "main", "dev", "test", "overlord", "gemini", "")]
    [string]$Environment = "",
    
    [string]$Message = "",
    
    [switch]$List,
    [switch]$Status
)

$ErrorActionPreference = 'Stop'

# Environment configurations - 4 Firebase projects
$envConfig = @{
    prod = @{
        name = "Production (Main)"
        projectId = "studio-6082148059-d1fec"
        url = "https://studio-6082148059-d1fec.web.app"
        color = "Green"
        purpose = "Live site - stable releases only"
    }
    main = @{
        name = "Main Project"
        projectId = "studio-6082148059-d1fec"
        url = "https://studio-6082148059-d1fec.web.app"
        color = "Cyan"
        purpose = "Same as prod - primary deployment"
    }
    gemini = @{
        name = "Production"
        projectId = "studio-6082148059-d1fec"
        url = "https://studio-6082148059-d1fec.web.app"
        color = "Green"
        purpose = "Same as prod - Gemini integration"
    }
    overlord = @{
        name = "Overlord (Backup)"
        projectId = "overlord-dashboard"
        url = "https://overlord-dashboard.web.app"
        color = "Blue"
        purpose = "Backup/failover if prod down"
    }
    dev = @{
        name = "Development"
        projectId = "your-firebase-project-id"
        url = "https://your-firebase-project-id.web.app"
        color = "Yellow"
        purpose = "Daily experiments - can break"
    }
    test = @{
        name = "Testing/Preview"
        projectId = "your-test-project-id"
        url = "https://your-test-project-id.web.app"
        color = "Magenta"
        purpose = "PR previews, QA testing"
    }
}

# List environments
if ($List) {
    Write-Host ""
    Write-Host "Firebase Projects (4 total - all free tier)" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($env in $envConfig.GetEnumerator() | Sort-Object Key) {
        if ($env.Key -in @('main', 'gemini')) { continue }  # Skip aliases
        
        Write-Host "  $($env.Key)" -ForegroundColor $env.Value.color -NoNewline
        Write-Host " -> $($env.Value.name)" -ForegroundColor White
        Write-Host "     Project: $($env.Value.projectId)" -ForegroundColor DarkGray
        Write-Host "     URL: $($env.Value.url)" -ForegroundColor DarkGray
        Write-Host "     Purpose: $($env.Value.purpose)" -ForegroundColor DarkGray
        Write-Host ""
    }
    exit 0
}

# Check current status
if ($Status) {
    Write-Host ""
    Write-Host "Current Firebase Status" -ForegroundColor Cyan
    Write-Host ""
    
    $current = firebase use 2>&1 | Select-String "Using project" 
    if ($current) {
        Write-Host "  Active: $current" -ForegroundColor Green
    }
    else {
        Write-Host "  No active project (will use default)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Configured Aliases (.firebaserc)" -ForegroundColor Cyan
    $config = Get-Content .\.firebaserc | ConvertFrom-Json
    $config.projects.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name) -> $($_.Value)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Tip: Use 'firebase use <alias>' to switch projects" -ForegroundColor DarkGray
    Write-Host ""
    exit 0
}

# Validate environment
if (-not $Environment) {
    Write-Host ""
    Write-Host "Error: Please specify an environment" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\deploy-env.ps1 -Environment prod"
    Write-Host "  .\deploy-env.ps1 -Environment dev -Message 'WIP feature'"
    Write-Host "  .\deploy-env.ps1 -List"
    Write-Host "  .\deploy-env.ps1 -Status"
    Write-Host ""
    exit 1
}

$config = $envConfig[$Environment]

Write-Host ""
Write-Host "========================================" -ForegroundColor $config.color
Write-Host "  Deploying to: $($config.name)" -ForegroundColor $config.color
Write-Host "========================================" -ForegroundColor $config.color
Write-Host ""
Write-Host "  Project: $($config.projectId)" -ForegroundColor Gray
Write-Host "  URL: $($config.url)" -ForegroundColor Gray
Write-Host "  Purpose: $($config.purpose)" -ForegroundColor DarkGray
Write-Host ""

# Confirm for production
if ($Environment -in @("prod", "main", "gemini")) {
    $confirm = Read-Host "Deploy to PRODUCTION? Type 'yes' to confirm"
    if ($confirm -ne "yes") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Switch to environment
Write-Host "-> Switching to $Environment..." -ForegroundColor Yellow
firebase use $Environment | Out-Null

# Build deploy command
$deployCmd = "firebase deploy --only hosting"
if ($Message) {
    $deployCmd += " --message `"$Message`""
}

Write-Host "-> Deploying..." -ForegroundColor Yellow
Write-Host "   $deployCmd" -ForegroundColor DarkGray
Write-Host ""

# Execute deployment
Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Live at: $($config.url)" -ForegroundColor Cyan
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
