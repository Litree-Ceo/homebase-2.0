# setup-litlab-homebase.ps1 - Workstation Setup for LITLABS Development
# Installs all required tools via winget/npm

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

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $ColorInfo
Write-Host "║          LITLABS Workstation Setup                          ║" -ForegroundColor $ColorInfo
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $ColorInfo
Write-Host ""

# ==============================================================================
# Check Windows & winget
# ==============================================================================
Write-Status "Checking system requirements..." $ColorInfo

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Status "winget not found. Install from Microsoft Store (App Installer)" $ColorError
    exit 1
}

Write-Status "winget available" $ColorSuccess

# ==============================================================================
# Install Tools via winget
# ==============================================================================
$wingetPackages = @(
    @{ Id = "Microsoft.VisualStudioCode"; Name = "VS Code" },
    @{ Id = "Git.Git"; Name = "Git" },
    @{ Id = "Microsoft.AzureCLI"; Name = "Azure CLI" },
    @{ Id = "Microsoft.Azure.FunctionsCoreTools"; Name = "Azure Functions Core Tools" },
    @{ Id = "Microsoft.Azurite"; Name = "Azurite Storage Emulator" },
    @{ Id = "OpenJS.NodeJS.LTS"; Name = "Node.js LTS" },
    @{ Id = "pnpm.pnpm"; Name = "pnpm" },
    @{ Id = "Docker.DockerDesktop"; Name = "Docker Desktop" },
    @{ Id = "Axosoft.GitKraken"; Name = "GitKraken" }
)

Write-Status "Installing development tools..." $ColorInfo

foreach ($pkg in $wingetPackages) {
    Write-Host "  Installing $($pkg.Name)..." -NoNewline
    
    $installed = winget list --id $pkg.Id 2>$null
    if ($installed -match $pkg.Id) {
        Write-Host " already installed" -ForegroundColor $ColorSuccess
    } else {
        try {
            winget install --id $pkg.Id --silent --accept-package-agreements --accept-source-agreements
            Write-Host " done" -ForegroundColor $ColorSuccess
        } catch {
            Write-Host " failed" -ForegroundColor $ColorError
        }
    }
}

# ==============================================================================
# Install Global NPM Packages
# ==============================================================================
Write-Status "Installing global npm packages..." $ColorInfo

$npmPackages = @(
    "azure-functions-core-tools@4",
    "typescript",
    "@azure/static-web-apps-cli"
)

# Refresh PATH to pick up Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

foreach ($pkg in $npmPackages) {
    Write-Host "  Installing $pkg..." -NoNewline
    try {
        npm install -g $pkg 2>$null
        Write-Host " done" -ForegroundColor $ColorSuccess
    } catch {
        Write-Host " failed" -ForegroundColor $ColorError
    }
}

# ==============================================================================
# VS Code Extensions
# ==============================================================================
Write-Status "Installing VS Code extensions..." $ColorInfo

$extensions = @(
    "ms-azuretools.vscode-azurefunctions",
    "ms-azuretools.vscode-azurestaticwebapps",
    "ms-azuretools.vscode-cosmosdb",
    "ms-vscode.azure-account",
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "ms-python.python",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
)

foreach ($ext in $extensions) {
    Write-Host "  Installing $ext..." -NoNewline
    try {
        code --install-extension $ext --force 2>$null
        Write-Host " done" -ForegroundColor $ColorSuccess
    } catch {
        Write-Host " skipped" -ForegroundColor $ColorWarning
    }
}

# ==============================================================================
# Verify Installation
# ==============================================================================
Write-Host ""
Write-Status "Verifying installations..." $ColorInfo

$checks = @(
    @{ Cmd = "node --version"; Name = "Node.js" },
    @{ Cmd = "npm --version"; Name = "npm" },
    @{ Cmd = "pnpm --version"; Name = "pnpm" },
    @{ Cmd = "git --version"; Name = "Git" },
    @{ Cmd = "az --version"; Name = "Azure CLI" },
    @{ Cmd = "func --version"; Name = "Functions Core Tools" },
    @{ Cmd = "docker --version"; Name = "Docker" }
)

foreach ($check in $checks) {
    try {
        $version = Invoke-Expression $check.Cmd 2>$null | Select-Object -First 1
        Write-Host "  ✓ $($check.Name): $version" -ForegroundColor $ColorSuccess
    } catch {
        Write-Host "  ✗ $($check.Name): not found" -ForegroundColor $ColorError
    }
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $ColorSuccess
Write-Host "║           Setup Complete!                                   ║" -ForegroundColor $ColorSuccess
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $ColorSuccess
Write-Host ""
Write-Host " Next Steps:" -ForegroundColor $ColorInfo
Write-Host "   1. Restart your terminal/VS Code to refresh PATH" -ForegroundColor Gray
Write-Host "   2. Run: pwsh .\scripts\set-subscription.ps1" -ForegroundColor Gray
Write-Host "   3. Run: pwsh .\scripts\litlab-first-run.auto.ps1" -ForegroundColor Gray
Write-Host ""
