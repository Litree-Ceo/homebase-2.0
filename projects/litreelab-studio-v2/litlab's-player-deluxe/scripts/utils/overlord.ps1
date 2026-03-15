param(
    [Parameter()]
    [ValidateSet("vision","web","server","grid","all","sync","status","kill","remote","deploy")]
    [string]$Command = "status"
)

$IP = (Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.*" } | Select-Object -First 1).IPAddress
if (-not $IP) { $IP = "localhost" }

$ProjectDir = "C:\Users\litre\projects"
$GitLabUrl = "https://gitlab.com/YOUR_USERNAME"

function Start-Remote {
    Write-Host "🌐 Activating Remote Mode..." -ForegroundColor Cyan
    
    # 1. Start Tailscale
    Write-Host "  🛡️ Checking Tailscale..."
    $tsStatus = tailscale status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️ Tailscale stopped. Starting..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Tailscale\tailscale.exe" -ArgumentList "up" -Verb RunAs
    } else {
        Write-Host "  ✅ Tailscale: ONLINE" -ForegroundColor Green
    }

    # 2. Start VS Code Tunnel
    Write-Host "  🚇 Starting VS Code Tunnel..." -ForegroundColor Yellow
    Start-Process code -ArgumentList "tunnel","--accept-server-license-terms" -WindowStyle Hidden
    
    # 3. Get Tailscale IP
    $tsIP = (tailscale ip -4)
    Write-Host "`n🚀 REMOTE READY" -ForegroundColor Green
    Write-Host "------------------------------------"
    Write-Host "📱 Phone (Termux) SSH Command:"
    Write-Host "ssh -i ~/.ssh/trae_termux_key -L 5000:localhost:5000 -L 3000:localhost:3000 litre@$tsIP" -ForegroundColor Yellow
    Write-Host "`n💻 VS Code Web URL:"
    Write-Host "https://vscode.dev/tunnel/home-dev" -ForegroundColor Cyan
    Write-Host "------------------------------------"
}

function Start-Deploy {
    Write-Host "🚢 Preparing HomeBase11 for Vercel..." -ForegroundColor Cyan
    $path = "C:\Users\litre\homebase-3.0\HomeBase11\HomeBase11"
    
    if (-not (Test-Path $path)) {
        Write-Host "❌ Project path not found: $path" -ForegroundColor Red
        return
    }

    Set-Location $path
    
    Write-Host "  🛠️  Building Blazor Client..." -ForegroundColor Yellow
    dotnet publish ..\HomeBase11.Client\HomeBase11.Client.csproj -c Release -o .\wwwroot
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        return
    }

    Write-Host "  🚀  Pushing to Vercel..." -ForegroundColor Green
    vercel --prod --yes
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Vercel deployment failed!" -ForegroundColor Red
    } else {
        Write-Host "✅ Deployment Complete!" -ForegroundColor Cyan
    }
}

function Sync-Projects {
    Write-Host "🔄 Syncing with GitLab..." -ForegroundColor Cyan
    $repos = @("vision-board", "web", "my-server", "L1T_GRID")
    
    foreach ($repo in $repos) {
        $path = "$ProjectDir\$repo"
        if (Test-Path "$path\.git") {
            Write-Host "  📥 Pulling $repo..."
            Set-Location $path
            git pull
            git push
        } else {
            Write-Host "  ⚠️  $repo not found, cloning..."
            Set-Location $ProjectDir
            git clone "$GitLabUrl/$repo.git"
        }
    }
    Write-Host "✅ Sync complete" -ForegroundColor Green
}

function Start-Vision {
    Write-Host "🚀 Starting Vision Board..." -ForegroundColor Cyan
    $path = "$ProjectDir\vision-board"
    if (-not (Test-Path $path)) { Write-Host "❌ $path not found"; return }
    Set-Location $path
    git pull 2>$null
    Get-Process | Where-Object { $_.ProcessName -match "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Process npm -ArgumentList "run","dev" -WorkingDirectory $path -WindowStyle Hidden
    Start-Sleep 3
    Write-Host "✅ Vision Board: http://$IP`:3000" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    $processes = @("node", "next", "vite")
    foreach ($proc in $processes) {
        $running = Get-Process | Where-Object { $_.ProcessName -match $proc } | Measure-Object
        if ($running.Count -gt 0) {
            Write-Host "  ✅ $proc : RUNNING" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $proc : STOPPED" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "📡 PC IP: $IP" -ForegroundColor Yellow
}

function Kill-All {
    Write-Host "💀 Killing all Node processes..." -ForegroundColor Red
    Get-Process | Where-Object { $_.ProcessName -match "node|next|vite" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All stopped" -ForegroundColor Green
}

switch ($Command) {
    "sync" { Sync-Projects }
    "vision" { Start-Vision }
    "status" { Show-Status }
    "kill" { Kill-All }
    "remote" { Start-Remote }
    "deploy" { Start-Deploy }
    "all" { 
        Sync-Projects
        Start-Vision
        Start-Remote
        Write-Host ""
        Write-Host "📊 Services starting..." -ForegroundColor Green
    }
}

Set-Location $HOME
