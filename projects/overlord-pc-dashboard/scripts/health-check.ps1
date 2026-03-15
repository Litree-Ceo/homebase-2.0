#!/usr/bin/env powershell
# Overlord Dashboard Health Check Script
# Monitors server health and sends alerts if needed

param(
    [string]$ServerUrl = "http://localhost:8999",
    [string]$LogFile = "../health-check.log",
    [int]$Timeout = 10,
    [switch]$AlertOnFailure
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Level - $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
}

# Check if server is responding
try {
    $response = Invoke-RestMethod -Uri "$ServerUrl/api/health" -Method GET -TimeoutSec $Timeout
    
    if ($response.status -eq "healthy") {
        Write-Log "✓ Server is healthy (version: $($response.version))" -Level "INFO"
        
        # Check system stats (if authenticated)
        $apiKey = $env:API_KEY
        if ($apiKey) {
            $headers = @{ "X-API-Key" = $apiKey }
            $stats = Invoke-RestMethod -Uri "$ServerUrl/api/stats" -Method GET -Headers $headers -TimeoutSec $Timeout
            
            if ($stats.cpu) {
                $cpu = $stats.cpu.percent
                $ram = $stats.ram.percent
                Write-Log "  CPU: $cpu%, RAM: $ram%" -Level "INFO"
                
                # Alert on high resource usage
                if ($cpu -gt 90) {
                    Write-Log "⚠ HIGH CPU USAGE: $cpu%" -Level "WARN"
                }
                if ($ram -gt 90) {
                    Write-Log "⚠ HIGH RAM USAGE: $ram%" -Level "WARN"
                }
            }
        }
        
        exit 0
    } else {
        Write-Log "✗ Server reported unhealthy status" -Level "ERROR"
        exit 1
    }
} catch {
    Write-Log "✗ Health check failed: $_" -Level "ERROR"
    
    if ($AlertOnFailure) {
        # Could integrate with email/webhook notifications here
        Write-Log "Alert: Server may be down!" -Level "ERROR"
    }
    
    exit 1
}
