$global:processes = @()

function Start-Process-Background {
    param (
        [string]$Name,
        [string]$Command,
        [string]$Directory,
        [string]$Port
    )

    Write-Host "🚀 Starting $Name on port $Port..." -ForegroundColor Cyan
    $process = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$Directory'; $Command" -PassThru
    $global:processes += $process
}

# Kill existing node processes on ports (simple cleanup)
Write-Host "🧹 Cleaning up existing ports..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000, 3002 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Start Metaverse (Backend for /metaverse route)
Start-Process-Background -Name "Metaverse Studio" -Command "pnpm next dev -p 3002" -Directory "c:\Users\litre\homebase-2.0\github\apps\litreelab-studio-metaverse" -Port "3002"

# Start Main Web App (The "One Site")
Start-Process-Background -Name "LitLabs Web" -Command "pnpm next dev -p 3000" -Directory "c:\Users\litre\homebase-2.0\github\apps\web" -Port "3000"

Write-Host "`n✅ SYSTEM ONLINE" -ForegroundColor Green
Write-Host "🌍 Main Access: http://localhost:3000" -ForegroundColor Green
Write-Host "🌐 Metaverse:   http://localhost:3000/metaverse (Proxied)" -ForegroundColor Gray
Write-Host "⚠️  Do not close this window. Press Ctrl+C in the popup windows to stop servers." -ForegroundColor Yellow
