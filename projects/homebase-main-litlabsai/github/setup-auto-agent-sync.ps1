# Self-elevate if not running as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
	Write-Host 'Restarting as administrator...'
	$psi = New-Object System.Diagnostics.ProcessStartInfo
	$psi.FileName = (Get-Process -Id $PID).Path
	$psi.Arguments = '"' + $MyInvocation.MyCommand.Definition + '"'
	$psi.Verb = 'runas'
	try {
		[System.Diagnostics.Process]::Start($psi) | Out-Null
	} catch {
		Write-Error 'User cancelled UAC prompt or elevation failed.'
		exit 1
	}
	exit 0
}
# PowerShell script to register a Windows Task Scheduler job for CookingAIAgent
$Action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c start-cooking-agent.bat'
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
Register-ScheduledTask -TaskName 'StartCookingAIAgent' -Action $Action -Trigger $Trigger -Principal $Principal -Description 'Auto-start CookingAIAgent at login' -Force
Write-Host 'Scheduled task created. The agent will auto-start at login.'
