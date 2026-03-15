# Cloudflare Tunnel Setup for Overlord Dashboard
# This creates a stable, permanent tunnel to your local server

param(
    [int]$Port = 4001,
    [string]$TunnelName = "overlord-dashboard"
)

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║     CLOUDFLARE TUNNEL SETUP - Stable n8n Integration           ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if cloudflared is installed
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflared) {
    Write-Host "📦 Cloudflare Tunnel not found. Installing..." -ForegroundColor Yellow
    
    # Download and install cloudflared
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    $installPath = "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"
    
    # Create directory if needed
    New-Item -ItemType Directory -Path "$env:LOCALAPPDATA\cloudflared" -Force | Out-Null
    
    Write-Host "⬇️  Downloading cloudflared..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installPath -UseBasicParsing
        Write-Host "✅ Downloaded to $installPath" -ForegroundColor Green
        
        # Add to PATH
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*cloudflared*") {
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$env:LOCALAPPDATA\cloudflared", "User")
            Write-Host "✅ Added to PATH (restart terminal to use 'cloudflared' command)" -ForegroundColor Green
        }
        
        $cloudflaredPath = $installPath
    } catch {
        Write-Host "❌ Download failed: $_" -ForegroundColor Red
        Write-Host "   Please download manually from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Yellow
        exit 1
    }
} else {
    $cloudflaredPath = $cloudflared.Source
    Write-Host "✅ Cloudflare Tunnel found: $cloudflaredPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Local Server Port: $Port" -ForegroundColor White
Write-Host "   Tunnel Name: $TunnelName" -ForegroundColor White
Write-Host ""

# Check if server is running
$serverRunning = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded

if (-not $serverRunning) {
    Write-Host "⚠️  WARNING: No server detected on port $Port" -ForegroundColor Yellow
    Write-Host "   Make sure your Overlord server is running before starting the tunnel" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 0 }
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "SETUP OPTIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Quick Tunnel (Temporary URL - expires when stopped)" -ForegroundColor Yellow
Write-Host "   ✅ Fastest setup - no account needed" -ForegroundColor Green
Write-Host "   ❌ URL changes every time you restart" -ForegroundColor Red
Write-Host ""
Write-Host "2. Named Tunnel (Permanent URL - requires Cloudflare account)" -ForegroundColor Yellow
Write-Host "   ✅ Permanent URL that never changes" -ForegroundColor Green
Write-Host "   ✅ Best for n8n workflows" -ForegroundColor Green
Write-Host "   ⚠️  Requires free Cloudflare account" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Select option (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting QUICK TUNNEL..." -ForegroundColor Cyan
        Write-Host "   Your server will be available at a temporary URL" -ForegroundColor Yellow
        Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        
        & $cloudflaredPath tunnel --url "http://localhost:$Port"
    }
    
    "2" {
        Write-Host ""
        Write-Host "🔐 Setting up NAMED TUNNEL..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You'll need to:" -ForegroundColor Yellow
        Write-Host "   1. Login to Cloudflare (browser will open)" -ForegroundColor White
        Write-Host "   2. Select your domain" -ForegroundColor White
        Write-Host "   3. Create the tunnel" -ForegroundColor White
        Write-Host ""
        
        $login = Read-Host "Press ENTER to start login (or 's' to skip to manual setup)"
        
        if ($login -ne 's') {
            # Login
            & $cloudflaredPath tunnel login
            
            Write-Host ""
            Write-Host "✅ Login complete!" -ForegroundColor Green
            Write-Host ""
            
            # Create tunnel
            Write-Host "📦 Creating tunnel '$TunnelName'..." -ForegroundColor Cyan
            & $cloudflaredPath tunnel create $TunnelName
            
            Write-Host ""
            Write-Host "⚙️  Configuring tunnel..." -ForegroundColor Cyan
            
            # Get the tunnel ID
            $tunnelInfo = & $cloudflaredPath tunnel list | Select-String $TunnelName
            Write-Host "   Tunnel: $tunnelInfo" -ForegroundColor Gray
            
            # Configure route
            $hostname = Read-Host "Enter your desired subdomain (e.g., overlord.yourdomain.com)"
            
            & $cloudflaredPath tunnel route dns $TunnelName $hostname
            
            # Create config file
            $configContent = @"
tunnel: $TunnelName
credentials-file: %USERPROFILE%\.cloudflared\$TunnelName.json

ingress:
  - hostname: $hostname
    service: http://localhost:$Port
  - service: http_status:404
"@
            
            $configPath = "$env:USERPROFILE\.cloudflared\config.yml"
            $configContent | Out-File -FilePath $configPath -Encoding UTF8
            
            Write-Host ""
            Write-Host "✅ Configuration saved to $configPath" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Starting tunnel..." -ForegroundColor Cyan
            Write-Host "   Your server will be available at: https://$hostname" -ForegroundColor Green
            Write-Host "   Update your n8n workflow URL to: https://$hostname/api/stats" -ForegroundColor Yellow
            Write-Host ""
            
            & $cloudflaredPath tunnel run $TunnelName
        }
    }
    
    default {
        Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}
