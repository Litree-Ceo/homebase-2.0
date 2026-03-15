#requires -Version 5.1
<#
.SYNOPSIS
    Project Overlord Watchtower - Windows Service Monitor
.DESCRIPTION
    Monitors all Overlord services and pushes telemetry to Firebase
    Auto-restarts failed services via NSSM
#>

$ErrorActionPreference = "SilentlyContinue"
$ProgressPreference = "SilentlyContinue"

# Configuration
$Config = @{
    FirebaseUrl = "https://your-firebase-project-default-rtdb.firebaseio.com/overlord/status.json"
    Services = @(
        @{Name = "Dashboard"; Port = 8080; NssmName = "Overlord-Dashboard"; Critical = $true},
        @{Name = "SocialHub"; Port = 3000; NssmName = "Overlord-SocialHub"; Critical = $true},
        @{Name = "Grid"; Port = 5000; NssmName = "Overlord-Grid"; Critical = $true}
    )
    Interval = 30
    Hostname = $env:COMPUTERNAME
    IpAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -match "192\.168\."}).IPAddress
    LogPath = "C:\Overlord\logs\watchdog.log"
}

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $Config.LogPath -Value $logEntry
    if ($Level -eq "ERROR") { Write-Host $logEntry -ForegroundColor Red }
    elseif ($Level -eq "WARN") { Write-Host $logEntry -ForegroundColor Yellow }
    else { Write-Host $logEntry -ForegroundColor Green }
}

# Test service health
function Test-ServiceHealth {
    param($Service)
    $url = "http://localhost:$($Service.Port)/health"
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10 -ErrorAction Stop
        return @{
            Name = $Service.Name
            Status = "healthy"
            Uptime = $response.uptime
            Memory = $response.memory
            Requests = $response.requests
            Version = $response.version
            ResponseTime = $null
            LastCheck = Get-Date -Format "o"
        }
    } catch {
        return @{
            Name = $Service.Name
            Status = "down"
            Error = $_.Exception.Message
            LastCheck = Get-Date -Format "o"
        }
    }
}

# Restart service via NSSM
function Restart-OverlordService {
    param($Service)
    Write-Log "Attempting restart of $($Service.Name) via NSSM..." "WARN"
    try {
        Stop-Service -Name $Service.NssmName -Force -ErrorAction Stop
        Start-Sleep -Seconds 3
        Start-Service -Name $Service.NssmName -ErrorAction Stop
        Start-Sleep -Seconds 5
        Write-Log "$($Service.Name) restarted successfully" "INFO"
        return $true
    } catch {
        Write-Log "Failed to restart $($Service.Name): $_" "ERROR"
        return $false
    }
}

# Push to Firebase
function Push-Status {
    param($Status)
    try {
        $json = $Status | ConvertTo-Json -Depth 10 -Compress
        Invoke-RestMethod -Uri $Config.FirebaseUrl -Method Put -Body $json -ContentType "application/json" -TimeoutSec 10 | Out-Null
        return $true
    } catch {
        Write-Log "Firebase push failed: $_" "ERROR"
        return $false
    }
}

# Main Loop
Write-Log "Overlord Watchtower started on $($Config.Hostname) ($($Config.IpAddress))"

while ($true) {
    $status = @{
        timestamp = Get-Date -Format "o"
        host = $Config.Hostname
        ip = $Config.IpAddress
        platform = "windows"
        services = @()
        system = @{
            cpu = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue
            memoryTotal = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
            memoryFree = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
            uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime | Select-Object Days, Hours, Minutes
        }
        alerts = @()
    }

    foreach ($svc in $Config.Services) {
        $health = Test-ServiceHealth -Service $svc
        
        if ($health.Status -eq "down") {
            Write-Log "$($svc.Name) is DOWN: $($health.Error)" "ERROR"
            $status.alerts += @{
                service = $svc.Name
                severity = "critical"
                message = "Service unreachable: $($health.Error)"
                timestamp = Get-Date -Format "o"
            }
            
            if ($svc.Critical) {
                $restarted = Restart-OverlordService -Service $svc
                if ($restarted) {
                    Start-Sleep -Seconds 3
                    $health = Test-ServiceHealth -Service $svc
                    if ($health.Status -eq "healthy") {
                        $status.alerts += @{
                            service = $svc.Name
                            severity = "info"
                            message = "Auto-recovery successful"
                            timestamp = Get-Date -Format "o"
                        }
                    }
                }
            }
        }
        
        $status.services += $health
    }

    # Calculate overall health
    $healthyCount = ($status.services | Where-Object {$_.Status -eq "healthy"}).Count
    $status.overallHealth = if ($healthyCount -eq $Config.Services.Count) { "healthy" } elseif ($healthyCount -gt 0) { "degraded" } else { "critical" }
    
    Push-Status -Status $status
    
    Start-Sleep -Seconds $Config.Interval
}
