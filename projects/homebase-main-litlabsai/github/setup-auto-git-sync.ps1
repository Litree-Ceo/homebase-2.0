# PowerShell script to register a scheduled task for continuous auto-git-sync
$Action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-ExecutionPolicy Bypass -File "D:\dev\EverythingHomebase\auto-git-sync.ps1"'
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
Register-ScheduledTask -TaskName 'EverythingHomebaseAutoGitSync' -Action $Action -Trigger $Trigger -Principal $Principal -Description 'Continuously auto-sync EverythingHomebase repo at startup' -Force
Write-Host 'Scheduled task created. Auto-git-sync will run at every startup.'
