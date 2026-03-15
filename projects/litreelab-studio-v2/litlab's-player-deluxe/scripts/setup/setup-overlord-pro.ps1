# Overlord Monolith - Pro Setup Script (Robust)
# Unifies ports, installs Nginx, configures services.
# RUN AS ADMINISTRATOR

$ErrorActionPreference = "Stop"

# Paths
$root = $PSScriptRoot
$toolsDir = "$root\tools"
$nginxDir = "$toolsDir\nginx"
# We need to be careful with paths. If we download nssm, it usually comes in a versioned folder.
# We will download it and ensure we find the exe.

$nginxUrl = "https://nginx.org/download/nginx-1.24.0.zip"
$nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"

# Helper Function: Run-Command
function Run-Command($exe, $argsList) {
    if (-not $exe) { 
        Write-Warning "Executable not found for command."
        return 
    }
    Write-Host "Running: $exe $argsList" -ForegroundColor Gray
    try {
        # Using specific call operator for better compatibility
        $proc = Start-Process -FilePath $exe -ArgumentList $argsList -NoNewWindow -PassThru -Wait
        if ($proc.ExitCode -ne 0) {
            Write-Warning "Command failed with exit code $($proc.ExitCode): $exe $argsList"
        }
    }
    catch {
        Write-Warning "Command threw exception: $_"
    }
}

# Check Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator!"
    Exit 1
}

# 1. Download Tools (Nginx + NSSM)
if (-not (Test-Path "$toolsDir")) { New-Item -ItemType Directory -Force "$toolsDir" | Out-Null }

# Download NSSM
$nssmZip = "$toolsDir\nssm.zip"
# We'll look for nssm.exe recursively in tools to find it.
$nssmExe = Get-ChildItem "$toolsDir" -Filter "nssm.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not $nssmExe) {
    Write-Host "Downloading NSSM..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip
    Expand-Archive -Path $nssmZip -DestinationPath $toolsDir -Force
    Remove-Item $nssmZip
    $nssmExe = Get-ChildItem "$toolsDir" -Filter "nssm.exe" -Recurse | Where-Object { $_.FullName -like "*win64*" } | Select-Object -First 1 -ExpandProperty FullName
}

# Download Nginx
if (-not (Test-Path "$nginxDir\nginx.exe")) {
    Write-Host "Downloading Nginx..." -ForegroundColor Cyan
    $nginxZip = "$toolsDir\nginx.zip"
    Invoke-WebRequest -Uri $nginxUrl -OutFile $nginxZip
    Microsoft.PowerShell.Archive\Expand-Archive -Path $nginxZip -DestinationPath $toolsDir -Force
    # Rename extracted folder (e.g. nginx-1.24.0 -> nginx)
    $extracted = Get-ChildItem "$toolsDir\nginx-*" | Where-Object { $_.PSIsContainer } | Select-Object -First 1
    if ($extracted.Name -ne "nginx") { Rename-Item $extracted.FullName "nginx" }
    Remove-Item $nginxZip
}
$nginxExe = "$nginxDir\nginx.exe"


# 2. Stop Legacy Services (Using the nssm we found)
Write-Host "Stopping legacy services..." -ForegroundColor Cyan
Run-Command $nssmExe "stop OverlordSocial confirm"
Run-Command $nssmExe "remove OverlordSocial confirm"

# Ensure ports are free
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) { Stop-Process -Id $port3000.OwningProcess -Force }

$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) { Stop-Process -Id $port8080.OwningProcess -Force } # Kill any lingering python

$port80 = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
if ($port80) {
    if ($port80.OwningProcess -eq 4) {
        # PID 4 is the System process (HTTP.sys). We cannot kill it.
        # This usually means IIS or another service is using Port 80.
        Write-Warning "Port 80 is occupied by Process ID 4 (System/HTTP.sys)."
        Write-Warning "Checking for World Wide Web Publishing Service (W3SVC)..."
        if (Get-Service W3SVC -ErrorAction SilentlyContinue) {
            Write-Host "Stopping IIS (W3SVC) to free Port 80..." -ForegroundColor Yellow
            Stop-Service W3SVC -Force
        }
        else {
            Write-Error "Could not identify what service is holding Port 80 via HTTP.sys configuration."
            Write-Error "Please manually stop any web services (IIS, Skype, TeamViewer) using Port 80."
            Exit 1
        }
    }
    else {
        # Normal process, kill it
        Stop-Process -Id $port80.OwningProcess -Force 
    }
}

# 3. Setup Dashboard Service (Port 8080)
Write-Host "Configuring OverlordDashboard service..." -ForegroundColor Cyan
$pythonPath = (Get-Command python).Source
$dashScript = "$root\modules\dashboard\server.py"
$dashDir = "$root\modules\dashboard"

# Log dirs must exist
if (-not (Test-Path "$dashDir\logs")) { New-Item -ItemType Directory -Force "$dashDir\logs" | Out-Null }

Run-Command $nssmExe "stop OverlordDashboard"
Run-Command $nssmExe "remove OverlordDashboard confirm"
# Fresh Install
Run-Command $nssmExe "install OverlordDashboard `"$pythonPath`" `"$dashScript`""
Run-Command $nssmExe "set OverlordDashboard AppDirectory `"$dashDir`""
Run-Command $nssmExe "set OverlordDashboard AppStdout `"$dashDir\logs\service.log`""
Run-Command $nssmExe "set OverlordDashboard AppStderr `"$dashDir\logs\error.log`""
Run-Command $nssmExe "start OverlordDashboard"


# 4. Configure Nginx
Write-Host "Configuring Nginx..." -ForegroundColor Cyan
$rootForwardSlash = $root -replace '\\', '/'
$nginxConf = @"
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            proxy_pass http://127.0.0.1:8080/;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
        }

        # Social Hub - Static
        location /social/ {
            alias "$rootForwardSlash/modules/social/";
            index index.html;
            try_files `$uri `$uri/ /social/index.html;
        }

        # Grid - Static
        location /grid/ {
            alias "$rootForwardSlash/modules/grid/";
            index index.html;
        }
    }
}
"@

if (-not (Test-Path "$nginxDir\conf")) { New-Item -ItemType Directory -Force "$nginxDir\conf" | Out-Null }
if (-not (Test-Path "$nginxDir\logs")) { New-Item -ItemType Directory -Force "$nginxDir\logs" | Out-Null }
Set-Content -Path "$nginxDir\conf\nginx.conf" -Value $nginxConf

# 5. Install Nginx Service
Write-Host "Installing Nginx Service..." -ForegroundColor Cyan
Run-Command $nssmExe "stop OverlordNginx"
Run-Command $nssmExe "remove OverlordNginx confirm"
Run-Command $nssmExe "install OverlordNginx `"$nginxDir\nginx.exe`""
Run-Command $nssmExe "set OverlordNginx AppDirectory `"$nginxDir`""
Run-Command $nssmExe "start OverlordNginx"


Write-Host "---------------------------------------------------" -ForegroundColor Green
Write-Host "OVERLORD PRO SETUP COMPLETE (ROBUST)" -ForegroundColor Green
Write-Host "Dashboard: http://localhost/"
Write-Host "Social Hub: http://localhost/social/"
Write-Host "Grid: http://localhost/grid/"
Write-Host "---------------------------------------------------"
Start-Sleep -Seconds 5
