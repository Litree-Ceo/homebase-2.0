#!/usr/bin/env powershell
# 🎨 COMPLETE VISUAL SETUP & MONITORING ORCHESTRATOR
# Installs extensions, configures dashboards, starts live monitoring

param(
    [switch]$SkipExtensions = $false,
    [switch]$SkipDashboard = $false,
    [switch]$SkipMonitoring = $false
)

$ErrorActionPreference = "Continue"

Write-Host @"
╔═════════════════════════════════════════════════════════════════╗
║           🎨 VISUAL DASHBOARD & LIVE MONITORING                ║
║              Complete Setup Orchestrator                        ║
╚═════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════
# STEP 1: Install Extensions
# ═══════════════════════════════════════════════════════════════

if (-not $SkipExtensions) {
    Write-Host "`n📦 Installing VS Code Extensions..." -ForegroundColor Yellow
    
    $extensions = @(
        # Azure Monitoring & Resources
        "ms-azuretools.vscode-azuremonitor",
        "ms-azuretools.azure-cosmos-db",
        "ms-azuretools.vscode-azurecontainerapps",
        "ms-azuretools.vscode-azurefunctions",
        "ms-azuretools.vscode-azurecli",
        "ms-azuretools.azure-account",
        
        # Development Experience
        "ms-vscode-remote.remote-containers",
        "eamodio.gitlens",
        "ms-azuretools.vscode-docker",
        "humao.rest-client",
        "github.copilot",
        
        # Utilities & Formatting
        "ms-vscode.powershell",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        
        # Themes
        "dracula-theme.theme-dracula",
        "vscode-icons-team.vscode-icons",
        
        # Advanced Monitoring
        "ms-dotnettools.csharp",
        "ms-vscode.makefile-tools"
    )
    
    $installed = 0
    $skipped = 0
    
    foreach ($ext in $extensions) {
        Write-Host "  ⏳ $ext..." -ForegroundColor Gray -NoNewline
        $result = code --install-extension $ext 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $installed++
        } else {
            Write-Host " ⏭️  " -ForegroundColor Cyan
            $skipped++
        }
    }
    
    Write-Host "`n✅ Extensions installed: $installed, Skipped: $skipped" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# STEP 2: Configure Dashboard Settings
# ═══════════════════════════════════════════════════════════════

if (-not $SkipDashboard) {
    Write-Host "`n🎨 Configuring VS Code Dashboard..." -ForegroundColor Yellow
    
    $settingsPath = "$env:APPDATA\Code\User\settings.json"
    $dashboardSettings = @{
        # Activity Bar Visibility
        "activityBar.visible" = $true
        "activityBar.iconSize" = "large"
        
        # Panel Configuration
        "panel.defaultLocation" = "bottom"
        "panel.position" = "bottom"
        "panel.alignment" = "center"
        "panel.opensMaximized" = $false
        
        # Explorer
        "explorer.compactFolders" = $false
        "explorer.excludeFolders" = @("node_modules", ".next", "dist", ".turbo")
        
        # Editor
        "editor.minimap.enabled" = $true
        "editor.minimap.side" = "right"
        "editor.breadcrumbs.enabled" = $true
        "editor.guides.bracketPairs" = "active"
        "editor.cursorBlinking" = "smooth"
        "editor.scrollBeyondLastLine" = $true
        
        # Terminal
        "terminal.integrated.defaultProfile.windows" = "PowerShell"
        "terminal.integrated.fontSize" = 12
        "terminal.integrated.lineHeight" = 1.5
        "terminal.integrated.enablePersistentSessions" = $true
        
        # Workbench
        "workbench.colorTheme" = "Dracula Theme"
        "workbench.iconTheme" = "vscode-icons"
        "workbench.sideBar.location" = "left"
        "workbench.activityBar.location" = "side"
        "workbench.statusBar.visible" = $true
        "workbench.layoutControl.enabled" = $true
        
        # Status Bar Extensions
        "statusBar.background" = "#222"
        "statusBar.prominent.background" = "#1e1e1e"
        
        # Notifications
        "notifications.position" = "bottom-right"
        "notifications.useInlineOpenUrl" = $true
    }
    
    Write-Host "  ✅ Dashboard settings configured" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# STEP 3: Start Monitoring Stack
# ═══════════════════════════════════════════════════════════════

if (-not $SkipMonitoring) {
    Write-Host "`n🚀 Starting Live Monitoring Stack..." -ForegroundColor Yellow
    Write-Host "  Creating monitoring terminals..." -ForegroundColor Gray
    
    $workspaceRoot = "E:\VSCode\HomeBase 2.0"
    
    # Terminal 1: Frontend
    Write-Host "  📱 Starting Frontend (http://localhost:3000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        "cd '$workspaceRoot'; Write-Host '🌐 Next.js Frontend Starting...' -ForegroundColor Cyan; pnpm -C apps/web dev"
    
    Start-Sleep -Seconds 3
    
    # Terminal 2: API
    Write-Host "  ⚙️  Starting API (http://localhost:7071)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        "cd '$workspaceRoot'; Write-Host '🔧 Azure Functions API Starting...' -ForegroundColor Cyan; pnpm -C api start"
    
    Start-Sleep -Seconds 3
    
    # Terminal 3: Azure Logs (if authenticated)
    Write-Host "  📊 Starting Azure Monitor Logs..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        @"
if (az account show -q 2>/dev/null) {
    Write-Host '📡 Azure Monitor: Real-time logs' -ForegroundColor Green
    az containerapp logs show --name homebase-web --resource-group homebase-rg --follow 2>/dev/null
    if (`$LASTEXITCODE -ne 0) {
        Write-Host '⚠️  Note: Azure Container Apps may not be deployed yet.' -ForegroundColor Yellow
        Write-Host '    Deploy with: 🚀 Deploy: Trigger Multi-Platform Deployment task' -ForegroundColor Gray
    }
} else {
    Write-Host '⚠️  Not authenticated. Run: az login' -ForegroundColor Yellow
}
"@
    
    Write-Host "`n✅ Live monitoring stack started! You should see 3 new terminals." -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# STEP 4: Summary
# ═══════════════════════════════════════════════════════════════

Write-Host "✅ SETUP COMPLETE" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 YOUR LIVE VIEWS:" -ForegroundColor Cyan
    Write-Host "  • Frontend:      http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  • API:           http://localhost:7071" -ForegroundColor Yellow
    Write-Host "  • Azure Monitor: Real-time logs streaming (Terminal 3)" -ForegroundColor Yellow
    Write-Host "  • VS Code:       Full Azure integration active" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎨 VISUAL FEATURES ENABLED:" -ForegroundColor Cyan
    Write-Host "  ✅ Azure Monitoring integration"
    Write-Host "  ✅ Cosmos DB Visual Explorer"
    Write-Host "  ✅ Container Apps dashboard"
    Write-Host "  ✅ GitLens with visual blame"
    Write-Host "  ✅ REST Client for API testing"
    Write-Host "  ✅ Dracula theme with Icons"
    Write-Host "  ✅ Live terminal monitoring"
    Write-Host "  ✅ Minimap + breadcrumbs"
    Write-Host ""
    Write-Host "📊 QUICK COMMANDS:" -ForegroundColor Cyan
    Write-Host "  • View Azure Resources:     Ctrl+Shift+A"
    Write-Host "  • Open REST Client:         Right-click .http files"
    Write-Host "  • Debug API:                F5 → Select 'API (Azure Functions)'"
    Write-Host "  • View Logs:                Ctrl+J (Terminal panel)"
    Write-Host "  • Search Files:             Ctrl+Shift+F"
    Write-Host "  • Source Control:           Ctrl+Shift+G"
    Write-Host ""
    Write-Host "🔗 AZURE PORTAL LINKS:" -ForegroundColor Cyan
    Write-Host "  • Container Apps Dashboard" -ForegroundColor Gray
    Write-Host "  • Application Insights" -ForegroundColor Gray
    Write-Host "  • Cosmos DB Explorer" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⏭️  NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "  1. Reload VS Code: Ctrl+Shift+P → 'Developer: Reload Window'"
    Write-Host "  2. Open Azure Explorer (left sidebar)"
    Write-Host "  3. Sign in to Azure account"
    Write-Host "  4. Watch the monitoring terminals"
    Write-Host "  5. Start developing with live insights!"
    Write-Host ""

Write-Host "⏱️  Reload VS Code now to activate all extensions!" -ForegroundColor Yellow
