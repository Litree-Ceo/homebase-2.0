# ═══════════════════════════════════════════════════════════════════
# SETUP SCHEDULED MAINTENANCE TASK
# Run this script ONCE to schedule automatic cleanup
# ═══════════════════════════════════════════════════════════════════

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║     ⏰ SCHEDULING AUTOMATIC PC MAINTENANCE                     ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if running as admin
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "❌ This script must run as Administrator!" -ForegroundColor Red
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$ScriptPath = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard\Maintenance-Script.ps1"
$TaskName = "PC-Maintenance-Weekly"
$TaskDescription = "Automated weekly PC maintenance: Docker cleanup, temp files, disk optimization"

# Check if task already exists
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "`n⚠️  Task '$TaskName' already exists." -ForegroundColor Yellow
    $Response = Read-Host "Recreate it? (y/n)"
    if ($Response -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host "Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false | Out-Null
}

# Create task action
Write-Host "`nCreating scheduled task..." -ForegroundColor Cyan
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Create task trigger (every Sunday at 2 AM)
$Trigger = New-ScheduledTaskTrigger `
    -Weekly `
    -DaysOfWeek Sunday `
    -At "2:00 AM"

# Create task settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -RunOnlyIfIdle -IdleWaitTimeout (New-TimeSpan -Minutes 10)

# Register the task
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description $TaskDescription `
    -RunLevel Highest `
    -Force | Out-Null

Write-Host "`n✅ Task scheduled successfully!" -ForegroundColor Green

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║              📅 SCHEDULE DETAILS                              ║
╠════════════════════════════════════════════════════════════════╣
║ Task Name:    $TaskName
║ Schedule:     Every Sunday at 2:00 AM
║ Script:       $ScriptPath
║ Privilege:    Administrator
║                                                               ║
║ What it does:                                                ║
║ ✓ Docker cleanup (images, containers, volumes, cache)      ║
║ ✓ npm cache cleanup                                          ║
║ ✓ Windows temp files cleanup                                ║
║ ✓ Browser cache cleanup                                     ║
║ ✓ Disk defragmentation                                      ║
║ ✓ Old log cleanup                                           ║
║ ✓ Recycle bin empty                                         ║
║                                                               ║
║ Logs saved to:                                               ║
║ C:\Users\litre\AppData\Local\Logs\PC-Maintenance-*.log      ║
║                                                               ║
║ Status:                                                       ║
║ ✓ Active and will run next Sunday at 2 AM                   ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

Write-Host "`n🔧 MANAGEMENT COMMANDS:" -ForegroundColor Yellow
Write-Host "  Run manually:  powershell -ExecutionPolicy Bypass -File `"$ScriptPath`""
Write-Host "  View task:     Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  View logs:     Get-ChildItem 'C:\Users\litre\AppData\Local\Logs\PC-Maintenance*'"
Write-Host "  Disable task:  Disable-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Delete task:   Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
