# ========================================
# LiTreeStudio // Ultra Matrix Console
# ========================================
# Master CLI for all development operations

param(
    [Parameter(Position = 0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

# Determine script directory - works even when called differently
$ScriptPath = $PSScriptRoot
if (-not $ScriptPath) {
    $ScriptPath = Get-Location
}

$RootDir = $ScriptPath
$AppDir = Join-Path $RootDir "app"
$ApiDir = Join-Path $RootDir "api"

# Color scheme
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Info    = "Cyan"
    Warning = "Yellow"
    Debug   = "Magenta"
}

function Write-Status($Message, $Type = "Info") {
    Write-Host "► $Message" -ForegroundColor $Colors[$Type]
}

function Show-Menu {
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "LiTreeStudio // Ultra Matrix Console" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta
    
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  proj              - Navigate to project"
    Write-Host "  dev-start         - Install deps for all Node projects"
    Write-Host "  func-start        - Start Azure Functions"
    Write-Host "  test-run          - Run tests"
    Write-Host "  proj-status       - Show project status"
    Write-Host "  lint              - Run ESLint + Prettier"
    Write-Host "  format            - Auto-format code"
    Write-Host "  swa-deploy        - Deploy Static Web App (LiTreeLabStudio)"
    Write-Host "  build             - Build all projects"
    Write-Host "  clean             - Clean build artifacts"
    Write-Host "  help              - Show this menu"
    Write-Host ""
    Write-Host "Git shortcuts:" -ForegroundColor Cyan
    Write-Host "  gs                - git status"
    Write-Host "  gp                - git push"
    Write-Host "  gl                - git log --oneline -10"
    Write-Host "  ga <files>        - git add <files>"
    Write-Host "  gc <message>      - git commit -m <message>"
    Write-Host ""
}

function Invoke-Proj {
    Set-Location $RootDir
    Write-Status "Navigated to project root: $RootDir" "Success"
}

function Invoke-DevStart {
    Write-Status "Installing dependencies for all Node projects..." "Info"
    
    # Root
    Write-Status "Installing root dependencies..." "Debug"
    Set-Location $RootDir
    npm install
    
    # App
    Write-Status "Installing app dependencies..." "Debug"
    Set-Location $AppDir
    npm install
    
    # API
    Write-Status "Installing API dependencies..." "Debug"
    Set-Location $ApiDir
    npm install
    
    Write-Status "All dependencies installed successfully!" "Success"
    Set-Location $RootDir
}

function Invoke-FuncStart {
    Write-Status "Starting Azure Functions (API)..." "Info"
    Set-Location $ApiDir
    npm run start
}

function Invoke-TestRun {
    Write-Status "Running tests..." "Info"
    Set-Location $RootDir
    npm run test
}

function Invoke-ProjStatus {
    Write-Status "Project Status Report" "Info"
    Write-Host ""
    
    # Check Node version
    $nodeVersion = node --version
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Green
    
    # Check npm version
    $npmVersion = npm --version
    Write-Host "npm Version: $npmVersion" -ForegroundColor Green
    
    # Git status
    Write-Host ""
    Write-Status "Git Status:" "Info"
    Set-Location $RootDir
    git status
    
    # Check if node_modules exist
    Write-Host ""
    Write-Status "Dependencies Status:" "Info"
    
    if (Test-Path (Join-Path $RootDir "node_modules")) {
        Write-Host "✓ Root node_modules exists" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Root node_modules missing" -ForegroundColor Red
    }
    
    if (Test-Path (Join-Path $AppDir "node_modules")) {
        Write-Host "✓ App node_modules exists" -ForegroundColor Green
    }
    else {
        Write-Host "✗ App node_modules missing" -ForegroundColor Red
    }
    
    if (Test-Path (Join-Path $ApiDir "node_modules")) {
        Write-Host "✓ API node_modules exists" -ForegroundColor Green
    }
    else {
        Write-Host "✗ API node_modules missing" -ForegroundColor Red
    }
}

function Invoke-Lint {
    Write-Status "Running ESLint..." "Info"
    Set-Location $RootDir
    npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Linting passed!" "Success"
    }
    else {
        Write-Status "Linting issues found. Run 'format' to auto-fix." "Warning"
    }
}

function Invoke-Format {
    Write-Status "Auto-formatting code with Prettier..." "Info"
    Set-Location $RootDir
    npx prettier --write . --ignore-path .gitignore 2>$null
    Write-Status "Formatting complete!" "Success"
}

function Invoke-Build {
    Write-Status "Building all projects..." "Info"
    
    # Build app
    Write-Status "Building React app..." "Debug"
    Set-Location $AppDir
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Status "App build failed!" "Error"
        return
    }
    
    Write-Status "All builds completed successfully!" "Success"
    Set-Location $RootDir
}

function Invoke-Clean {
    Write-Status "Cleaning build artifacts..." "Info"
    
    # Remove dist folders
    $distPaths = @(
        (Join-Path $RootDir "dist"),
        (Join-Path $AppDir "dist"),
        (Join-Path $AppDir ".vite")
    )
    
    foreach ($path in $distPaths) {
        if (Test-Path $path) {
            Remove-Item -Recurse -Force $path
            Write-Host "Removed: $path" -ForegroundColor Green
        }
    }
    
    Write-Status "Cleanup complete!" "Success"
}

function Invoke-SWADeploy {
    Write-Status "Preparing Static Web App deployment..." "Info"
    
    # Build first
    Invoke-Build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Build failed, aborting deployment" "Error"
        return
    }
    
    Write-Status "Ready to deploy to Azure Static Web Apps" "Success"
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Ensure you have SWA CLI installed: npm install -g @azure/static-web-apps-cli"
    Write-Host "2. Run: swa deploy --deployment-token <TOKEN>"
    Write-Host "3. Or use GitHub Actions for automatic deployment"
}

function Invoke-GitShortcut($GitCommand, $GitArgs) {
    Set-Location $RootDir
    switch ($GitCommand) {
        "gs" { git status }
        "gp" { git push }
        "gl" { git log --oneline -10 }
        "ga" { git add $GitArgs }
        "gc" { git commit -m "$GitArgs" }
        default { Write-Status "Unknown git shortcut: $GitCommand" "Error" }
    }
}

# Main command router
if (-not $Command) {
    Show-Menu
    return
}

switch ($Command.ToLower()) {
    "proj" { Invoke-Proj }
    "dev-start" { Invoke-DevStart }
    "func-start" { Invoke-FuncStart }
    "test-run" { Invoke-TestRun }
    "proj-status" { Invoke-ProjStatus }
    "lint" { Invoke-Lint }
    "format" { Invoke-Format }
    "build" { Invoke-Build }
    "clean" { Invoke-Clean }
    "swa-deploy" { Invoke-SWADeploy }
    "help" { Show-Menu }
    { @("gs", "gp", "gl", "ga", "gc") -contains $_ } { Invoke-GitShortcut $Command $Args }
    default { 
        Write-Status "Unknown command: $Command" "Error"
        Show-Menu
    }
}
