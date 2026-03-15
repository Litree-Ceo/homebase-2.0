<#
.SYNOPSIS
    Install Overlord services as systemd units in WSL
.DESCRIPTION
    Registers Dashboard and Social Hub as auto-starting systemd services
#>

$ProjectRoot = $PSScriptRoot
$DashboardDir = "$ProjectRoot\modules\dashboard"
$SocialDir = "$ProjectRoot\modules\social"

Write-Host "💀 OVERLORD SYSTEMD INSTALLER" -ForegroundColor Magenta
Write-Host "═════════════════════════════════════" -ForegroundColor DarkMagenta
Write-Host ""

# Copy service files to WSL
Write-Host "[1/4] Copying service files to WSL /etc/systemd/system..." -ForegroundColor Cyan

$DashService = Get-Content "$DashboardDir\overlord-dashboard.service"
$SocialService = Get-Content "$SocialDir\overlord-social.service"

wsl -e bash -c "sudo tee /etc/systemd/system/overlord-dashboard.service > /dev/null <<'EOF'
$DashService
EOF"

wsl -e bash -c "sudo tee /etc/systemd/system/overlord-social.service > /dev/null <<'EOF'
$SocialService
EOF"

Write-Host "✅ Service files installed" -ForegroundColor Green
Write-Host ""

# Reload systemd daemon
Write-Host "[2/4] Reloading systemd daemon..." -ForegroundColor Cyan
wsl -e sudo systemctl daemon-reload
Write-Host "✅ Daemon reloaded" -ForegroundColor Green
Write-Host ""

# Enable services for auto-start
Write-Host "[3/4] Enabling services for auto-start..." -ForegroundColor Cyan
wsl -e sudo systemctl enable overlord-dashboard.service
wsl -e sudo systemctl enable overlord-social.service
Write-Host "✅ Services enabled" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "[4/4] Starting services..." -ForegroundColor Cyan
wsl -e sudo systemctl start overlord-dashboard.service
wsl -e sudo systemctl start overlord-social.service
Start-Sleep -Seconds 2
Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "═════════════════════════════════════" -ForegroundColor DarkMagenta
Write-Host "📊 SERVICE STATUS" -ForegroundColor Yellow
Write-Host "═════════════════════════════════════" -ForegroundColor DarkMagenta
Write-Host ""

wsl -e sudo systemctl status overlord-dashboard.service --no-pager | Select-String "Active|loaded|running" | ForEach-Object { Write-Host "Dashboard: $_" -ForegroundColor Green }
wsl -e sudo systemctl status overlord-social.service --no-pager | Select-String "Active|loaded|running" | ForEach-Object { Write-Host "Social: $_" -ForegroundColor Green }

Write-Host ""
Write-Host "✅ SYSTEMD INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   Services now auto-start on WSL boot" -ForegroundColor Gray
Write-Host "   Auto-restart on crash enabled" -ForegroundColor Gray
Write-Host "   Access from phone: http://192.168.0.77:8080 (Dashboard)" -ForegroundColor Gray
Write-Host "   Access from phone: http://192.168.0.77:3000 (Social)" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Useful systemd commands:" -ForegroundColor Cyan
Write-Host "   wsl -e sudo systemctl status overlord-dashboard" -ForegroundColor DarkGray
Write-Host "   wsl -e sudo systemctl restart overlord-dashboard" -ForegroundColor DarkGray
Write-Host "   wsl -e sudo systemctl stop overlord-dashboard" -ForegroundColor DarkGray
Write-Host "   wsl -e sudo journalctl -u overlord-dashboard -f" -ForegroundColor DarkGray
Write-Host ""
