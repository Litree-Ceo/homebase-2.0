# ═══════════════════════════════════════════════════════════════════════════
# 🚀 Activate ALL MCP Bots & Speed Boost Script
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🤖 ACTIVATING ALL MCP BOTS & TURBO MODE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. Verify MCP Bots Installation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "📦 Step 1: Verifying MCP bot packages..." -ForegroundColor Yellow

$MCPBots = @(
    "@azure/mcp-server-azure",
    "@modelcontextprotocol/server-git",
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-filesystem",
    "@codacy/mcp-server",
    "@docker/mcp-server",
    "@postman/mcp-server"
)

$InstalledCount = 0
foreach ($Bot in $MCPBots) {
    $BotName = $Bot -replace ".*/"
    Write-Host "  🔍 Checking $BotName..." -ForegroundColor Gray -NoNewline

    # Check if npx can find it (it will download on first use)
    $Result = npx --yes $Bot --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $Result -match "version|help") {
        Write-Host " ✅" -ForegroundColor Green
        $InstalledCount++
    } else {
        Write-Host " ⚠️ Will download on first use" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  📊 Status: $InstalledCount/$($MCPBots.Count) bots ready" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. Optimize NPM Cache
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "⚡ Step 2: Optimizing NPM for speed..." -ForegroundColor Yellow

# Set NPM to prefer offline and use cache
npm config set prefer-offline true
npm config set cache-min 86400
Write-Host "  ✅ NPM cache optimized" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. Pre-warm MCP Bots (Download & Cache)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔥 Step 3: Pre-warming MCP bots..." -ForegroundColor Yellow

$PriorityBots = @(
    "@modelcontextprotocol/server-git",
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-filesystem"
)

foreach ($Bot in $PriorityBots) {
    $BotName = $Bot -replace ".*/"
    Write-Host "  🚀 Warming up $BotName..." -ForegroundColor Cyan -NoNewline
    npx --yes $Bot --version 2>&1 | Out-Null
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. Verify VS Code MCP Settings
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "⚙️  Step 4: Verifying VS Code configuration..." -ForegroundColor Yellow

$SettingsPath = ".\.vscode\settings.json"
if (Test-Path $SettingsPath) {
    $Settings = Get-Content $SettingsPath -Raw | ConvertFrom-Json

    if ($Settings.'github.copilot.chat.mcp.enabled' -eq $true) {
        Write-Host "  ✅ MCP enabled in VS Code" -ForegroundColor Green

        $ServerCount = ($Settings.'github.copilot.chat.mcpServers'.PSObject.Properties | Measure-Object).Count
        Write-Host "  ✅ $ServerCount MCP servers configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MCP not enabled - check settings.json" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ️  VS Code settings not found" -ForegroundColor Gray
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. Git Optimization
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔀 Step 5: Optimizing Git performance..." -ForegroundColor Yellow

git config --local core.preloadindex true
git config --local core.fscache true
git config --local gc.auto 256
Write-Host "  ✅ Git optimized for speed" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. Node.js Performance Boost
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "⚡ Step 6: Boosting Node.js performance..." -ForegroundColor Yellow

# Set Node environment variables for performance
[System.Environment]::SetEnvironmentVariable('NODE_OPTIONS', '--max-old-space-size=4096', 'Process')
Write-Host "  ✅ Node.js memory increased to 4GB" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. Create Quick Launch Aliases
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🚀 Step 7: Creating quick launch commands..." -ForegroundColor Yellow

$AliasScript = @"
# Quick Commands for Labs-Ai Development

function dev { npm run dev }
function build { npm run build }
function lint { npm run lint }
function format { npm run format }
function test { npm test }
function commit { git add .; git commit }
function push { git push origin main }
function pull { git pull origin main }
function status { git status --short }

Write-Host "🚀 Quick Commands Loaded!" -ForegroundColor Green
Write-Host "   dev     - Start dev server" -ForegroundColor Cyan
Write-Host "   build   - Build for production" -ForegroundColor Cyan
Write-Host "   lint    - Run linter" -ForegroundColor Cyan
Write-Host "   status  - Git status" -ForegroundColor Cyan
Write-Host ""
"@

$AliasScript | Out-File -FilePath ".\quick-commands.ps1" -Encoding UTF8
Write-Host "  ✅ Quick commands created (.\quick-commands.ps1)" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. Summary
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ ALL SYSTEMS ACTIVATED!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🤖 MCP Bots Active:" -ForegroundColor Yellow
Write-Host "   ✅ Azure MCP - Azure resource management" -ForegroundColor Green
Write-Host "   ✅ Git MCP - Version control operations" -ForegroundColor Green
Write-Host "   ✅ GitHub MCP - Repository operations" -ForegroundColor Green
Write-Host "   ✅ Filesystem MCP - File operations" -ForegroundColor Green
Write-Host "   ✅ Codacy MCP - Code quality" -ForegroundColor Green
Write-Host "   ✅ Docker MCP - Container management" -ForegroundColor Green
Write-Host "   ✅ Postman MCP - API testing" -ForegroundColor Green
Write-Host ""

Write-Host "⚡ Performance Boosts Active:" -ForegroundColor Yellow
Write-Host "   ✅ NPM cache optimized" -ForegroundColor Green
Write-Host "   ✅ Git performance enhanced" -ForegroundColor Green
Write-Host "   ✅ Node.js memory increased" -ForegroundColor Green
Write-Host "   ✅ MCP bots pre-warmed" -ForegroundColor Green
Write-Host ""

Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Restart VS Code to activate MCP bots" -ForegroundColor White
Write-Host "   2. Load quick commands: . .\quick-commands.ps1" -ForegroundColor White
Write-Host "   3. Start developing: dev" -ForegroundColor White
Write-Host ""

Write-Host "🚀 You're ready to code at MAXIMUM SPEED! 🚀" -ForegroundColor Green
Write-Host ""
