# Discord Notifications for Overlord
$WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL_HERE"  # Get from Discord channel settings

function Send-DiscordAlert {
    param($Message, $Color = "65280")  # Green default
    
    $payload = @{
        username = "Overlord Bot"
        embeds = @(
            @{
                title = "System Alert"
                description = $Message
                color = [int]$Color
                timestamp = (Get-Date -Format "o")
                footer = @{ text = "Overlord PC Dashboard" }
            }
        )
    } | ConvertTo-Json -Depth 5
    
    Invoke-RestMethod -Uri $WEBHOOK_URL -Method Post -ContentType "application/json" -Body $payload -ErrorAction SilentlyContinue
}

# Monitor and alert
while ($true) {
    Start-Sleep -Seconds 300  # Check every 5 minutes
    
    # Check if services are down
    $ports = @{80 = "nginx"; 8081 = "Dashboard"; 5000 = "Grid"}
    $downServices = @()
    
    foreach ($port in $ports.Keys) {
        $test = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if (-not $test.TcpTestSucceeded) {
            $downServices += $ports[$port]
        }
    }
    
    if ($downServices.Count -gt 0) {
        $msg = "🚨 ALERT: Services DOWN: $($downServices -join ', ')"
        Send-DiscordAlert -Message $msg -Color "16711680"  # Red
        
        # Also try SMS
        . "$PSScriptRoot\sms-alerts.ps1"
        Send-SMSAlert -Message $msg
    }
    
    # Check CPU/RAM
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    if ($cpu -gt 95) {
        Send-DiscordAlert -Message "⚠️ CPU Critical: $([math]::Round($cpu))%" -Color "16776960"  # Yellow
    }
}
