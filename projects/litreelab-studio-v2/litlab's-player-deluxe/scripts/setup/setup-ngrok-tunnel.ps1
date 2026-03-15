# Ngrok Tunnel Setup for Overlord Dashboard
# Alternative to Cloudflare - easier setup, free tier available

param(
    [int]$Port = 4001,
    [string]$Region = "us"
)

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║        NGROK TUNNEL SETUP - Alternative Solution               ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if ngrok is installed
$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrok) {
    Write-Host "📦 ngrok not found. Installing..." -ForegroundColor Yellow
    
    $downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    $zipPath = "$env:TEMP\ngrok.zip"
    $extractPath = "$env:LOCALAPPDATA\ngrok"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        Remove-Item $zipPath
        
        # Add to PATH
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*ngrok*") {
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$extractPath", "User")
            Write-Host "✅ Added ngrok to PATH (restart terminal to use directly)" -ForegroundColor Green
        }
        
        $ngrokPath = "$extractPath\ngrok.exe"
    } catch {
        Write-Host "❌ Installation failed: $_" -ForegroundColor Red
        Write-Host "   Download manually from: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
} else {
    $ngrokPath = $ngrok.Source
    Write-Host "✅ ngrok found: $ngrokPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Port: $Port" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host ""

# Check for auth token
Write-Host "📋 ngrok requires a free auth token." -ForegroundColor Yellow
Write-Host "   1. Sign up at: https://dashboard.ngrok.com/signup" -ForegroundColor White
Write-Host "   2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
Write-Host ""

$token = Read-Host "Enter your ngrok auth token (or press ENTER to skip if already configured)"

if ($token) {
    & $ngrokPath config add-authtoken $token
    Write-Host "✅ Auth token configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "SELECT TUNNEL TYPE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. FREE TIER - Random URL (changes every restart)" -ForegroundColor Yellow
Write-Host "   ✅ No credit card required" -ForegroundColor Green
Write-Host "   ❌ URL changes each time (you'll need to update n8n)" -ForegroundColor Red
Write-Host ""
Write-Host "2. PAID TIER - Static Domain (permanent URL)" -ForegroundColor Yellow
Write-Host "   ✅ Permanent subdomain (e.g., yourname.ngrok.io)" -ForegroundColor Green
Write-Host "   💳 Requires paid plan ($8/month)" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Select option (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting ngrok with RANDOM URL..." -ForegroundColor Cyan
        Write-Host "   ⚠️  URL will change on restart - you'll need to update n8n" -ForegroundColor Yellow
        Write-Host "   📋 Copy the HTTPS URL from below for your n8n workflow" -ForegroundColor White
        Write-Host "   🛑 Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
        
        & $ngrokPath http $Port --region $Region
    }
    
    "2" {
        $domain = Read-Host "Enter your static domain (e.g., yourname.ngrok.io)"
        
        Write-Host ""
        Write-Host "🚀 Starting ngrok with STATIC DOMAIN..." -ForegroundColor Cyan
        Write-Host "   URL: https://$domain" -ForegroundColor Green
        Write-Host "   n8n workflow URL: https://$domain/api/stats" -ForegroundColor Yellow
        Write-Host "   🛑 Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        
        & $ngrokPath http --domain=$domain $Port
    }
    
    default {
        Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}
