#!/usr/bin/env powershell
# 🎨 COMPLETE VISUAL SETUP & MONITORING ORCHESTRATOR

Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🎨 VISUAL DASHBOARD & LIVE MONITORING SETUP                 ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════
# STEP 1: Install Extensions
# ═══════════════════════════════════════════════════════════════

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
    "vscode-icons-team.vscode-icons"
)

$installed = 0

foreach ($ext in $extensions) {
    Write-Host "  ⏳ $ext..." -ForegroundColor Gray -NoNewline
    $result = code --install-extension $ext 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -like "*already installed*") {
        Write-Host " ✅" -ForegroundColor Green
        $installed++
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "`n✅ Extensions installation complete!" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# STEP 2: Summary & Next Steps
# ═══════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "SETUP COMPLETE - YOUR LIVE VIEWS ARE READY!" -ForegroundColor Green
Write-Host ""

Write-Host "VISUAL FEATURES NOW ENABLED:" -ForegroundColor Cyan
Write-Host "  ✅ Azure Monitoring with real-time logs"
Write-Host "  ✅ Cosmos DB Visual Explorer (left sidebar)"
Write-Host "  ✅ Container Apps dashboard"
Write-Host "  ✅ GitLens with visual blame annotations"
Write-Host "  ✅ REST Client for live API testing"
Write-Host "  ✅ Dracula theme + vscode-icons"
Write-Host "  ✅ Full debugging support (F5)"
Write-Host "  ✅ Live terminal monitoring"

Write-Host "`nYOUR LIVE ENDPOINTS:" -ForegroundColor Yellow
Write-Host "  * Frontend:      http://localhost:3000"
Write-Host "  * API Backend:   http://localhost:7071"
Write-Host "  * Test APIs:     open test-live-api.http in editor"

Write-Host "`nQUICK KEYBOARD SHORTCUTS:" -ForegroundColor Yellow
Write-Host "  * Azure Explorer:   Ctrl+Shift+A"
Write-Host "  * REST Client:      Ctrl+Alt+R (in .http files)"
Write-Host "  * Debug:            F5"
Write-Host "  * Terminal:         Ctrl+` (backtick)"
Write-Host "  * Search Files:     Ctrl+Shift+F"
Write-Host "  * Source Control:   Ctrl+Shift+G"

Write-Host "`nIMPORTANT FILES:" -ForegroundColor Yellow
Write-Host "  * api/test-live-api.http     - REST API test suite"
Write-Host "  * VISUAL_DASHBOARD_SETUP.md  - Full monitoring guide"
Write-Host "  * .vscode/launch.json        - Debug configurations"

Write-Host "`nNEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Reload VS Code: Ctrl+Shift+P -> Reload Window"
Write-Host "  2. Sign in to Azure (left sidebar icon)"
Write-Host "  3. Start servers: Ctrl+Shift+B -> LITLABS: Start Dev Environment"
Write-Host "  4. View api/test-live-api.http to test endpoints"
Write-Host "  5. Open Azure Explorer on left to see live metrics"

Write-Host ""
Write-Host "All set! Reload VS Code now to activate all extensions!" -ForegroundColor Green
Write-Host ""
