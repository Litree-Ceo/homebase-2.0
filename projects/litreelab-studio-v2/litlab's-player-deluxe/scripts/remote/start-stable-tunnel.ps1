# Stable Tunnel Launcher for Overlord Dashboard
# Automatically selects the best available tunnel solution

param(
    [int]$Port = 4001,
    [string]$Preferred = "cloudflare"  # cloudflare, ngrok, or localtunnel
)

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║           STABLE TUNNEL LAUNCHER                               ║
║     For n8n Integration - Overlord Dashboard                   ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if server is running
$serverRunning = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded

if (-not $serverRunning) {
    Write-Host "⚠️  WARNING: No server detected on port $Port!" -ForegroundColor Red
    Write-Host "   Start your server first with: python server.py" -ForegroundColor Yellow
    Write-Host ""
    $startServer = Read-Host "Start server now? (y/n)"
    
    if ($startServer -eq 'y') {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python server.py"
        Write-Host "⏳ Waiting for server to start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
    } else {
        exit 0
    }
}

# Function to find command path
function Find-Command($name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    
    # Check common locations
    $paths = @(
        "$env:LOCALAPPDATA\$name\$name.exe",
        "$env:LOCALAPPDATA\ngrok\ngrok.exe",
        "$env:USERPROFILE\AppData\Local\$name\$name.exe"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) { return $path }
    }
    
    return $null
}

Write-Host ""
Write-Host "🔍 Checking available tunnel providers..." -ForegroundColor Cyan

$cloudflared = Find-Command "cloudflared"
$ngrok = Find-Command "ngrok"
$lt = Find-Command "lt"

Write-Host ""
Write-Host "AVAILABLE OPTIONS:" -ForegroundColor Cyan
Write-Host ""

$options = @()
$optNum = 1

if ($cloudflared) {
    Write-Host "$optNum. Cloudflare Tunnel ✅" -ForegroundColor Green
    Write-Host "   📍 $cloudflared" -ForegroundColor Gray
    Write-Host "   🌟 Most stable option - recommended for n8n" -ForegroundColor Yellow
    $options += @{ Name = "Cloudflare"; Path = $cloudflared; Num = $optNum }
    $optNum++
} else {
    Write-Host "  . Cloudflare Tunnel ❌ (run setup-cloudflare-tunnel.ps1)" -ForegroundColor Gray
}

Write-Host ""

if ($ngrok) {
    Write-Host "$optNum. ngrok ✅" -ForegroundColor Green
    Write-Host "   📍 $ngrok" -ForegroundColor Gray
    Write-Host "   👍 Good stability, easy setup" -ForegroundColor Yellow
    $options += @{ Name = "ngrok"; Path = $ngrok; Num = $optNum }
    $optNum++
} else {
    Write-Host "  . ngrok ❌ (run setup-ngrok-tunnel.ps1)" -ForegroundColor Gray
}

Write-Host ""

if ($lt) {
    Write-Host "$optNum. localtunnel ⚠️" -ForegroundColor Yellow
    Write-Host "   📍 $lt" -ForegroundColor Gray
    Write-Host "   ⚠️  Unstable - NOT recommended for n8n" -ForegroundColor Red
    $options += @{ Name = "localtunnel"; Path = $lt; Num = $optNum }
    $optNum++
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray

if ($options.Count -eq 0) {
    Write-Host "❌ No tunnel providers installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install one of these first:" -ForegroundColor Yellow
    Write-Host "   • Cloudflare (recommended): .\setup-cloudflare-tunnel.ps1" -ForegroundColor White
    Write-Host "   • ngrok (easier): .\setup-ngrok-tunnel.ps1" -ForegroundColor White
    exit 1
}

$defaultOption = ($options | Where-Object { $_.Name -eq "Cloudflare" } | Select-Object -First 1)
if (-not $defaultOption) {
    $defaultOption = ($options | Where-Object { $_.Name -eq "ngrok" } | Select-Object -First 1)
}
if (-not $defaultOption) {
    $defaultOption = $options[0]
}

Write-Host ""
$selection = Read-Host "Select provider (number, or ENTER for $($defaultOption.Name))"

if ([string]::IsNullOrWhiteSpace($selection)) {
    $selected = $defaultOption
} else {
    $selected = $options | Where-Object { $_.Num -eq [int]$selection } | Select-Object -First 1
}

if (-not $selected) {
    Write-Host "❌ Invalid selection" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting $($selected.Name) tunnel on port $Port..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

switch ($selected.Name) {
    "Cloudflare" {
        Write-Host "📋 Cloudflare Options:" -ForegroundColor Yellow
        Write-Host "   1. Quick tunnel (temporary URL)" -ForegroundColor White
        Write-Host "   2. Named tunnel (permanent URL)" -ForegroundColor White
        $cfOpt = Read-Host "Select option (1 or 2, default: 1)"
        
        if ($cfOpt -eq "2") {
            $tunnelName = Read-Host "Enter tunnel name (default: overlord)"
            if (-not $tunnelName) { $tunnelName = "overlord" }
            & $selected.Path tunnel run $tunnelName
        } else {
            & $selected.Path tunnel --url "http://localhost:$Port"
        }
    }
    
    "ngrok" {
        & $selected.Path http $Port
    }
    
    "localtunnel" {
        $subdomain = Read-Host "Enter subdomain prefix (optional, press ENTER for random)"
        if ($subdomain) {
            & $selected.Path --port $Port --subdomain $subdomain
        } else {
            & $selected.Path --port $Port
        }
    }
}
