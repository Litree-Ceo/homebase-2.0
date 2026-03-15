<# 
 .SYNOPSIS 
   Overlord PC maintenance + health script for Windows 11 + WSL2. 
 
 .NOTE 
   Run this as Administrator. It will: 
   - Clean temp files / component store (safe, official tools) 
   - Run SFC / DISM / optional CHKDSK 
   - Trim startup junk (optional) 
   - Check Windows Update status 
   - Offer WSL cleanup + VHDX compaction handoff 
 #> 
 
 # region Helpers 
 $ErrorActionPreference = 'Stop' 
 
 $logRoot = 'C:\Logs\Overlord-PC' 
 if (-not (Test-Path $logRoot)) { New-Item -Path $logRoot -ItemType Directory | Out-Null } 
 $timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss' 
 $logFile = Join-Path $logRoot "pc-clean_$timestamp.log" 
 
 Start-Transcript -Path $logFile -Force | Out-Null 
 
 function Test-IsAdmin { 
     $id   = [Security.Principal.WindowsIdentity]::GetCurrent() 
     $prin = New-Object Security.Principal.WindowsPrincipal($id) 
     return $prin.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) 
 } 
 
 if (-not (Test-IsAdmin)) { 
     Write-Warning "Run this script in an elevated PowerShell session." 
     Stop-Transcript | Out-Null 
     exit 1 
 } 
 
 function Confirm-Step { 
     param( 
         [string]$Message, 
         [switch]$DefaultYes 
     ) 
     $default = $DefaultYes.IsPresent ? 'Y' : 'N' 
     $answer = Read-Host "$Message [y/n] (default: $default)" 
     if ([string]::IsNullOrWhiteSpace($answer)) { $answer = $default } 
     return $answer.ToLower().StartsWith('y') 
 } 
 
 function Write-Section { 
     param([string]$Title) 
     Write-Host "" 
     Write-Host "==================== $Title ====================" -ForegroundColor Cyan 
 } 
 
 # endregion Helpers 
 
 # region 1. Basic info snapshot 
 Write-Section "System snapshot" 
 Get-ComputerInfo | Select-Object OsName, OsVersion, WindowsInstallDateFromRegistry, CsName | 
     Format-List 
 Get-PhysicalDisk | Select FriendlyName, MediaType, HealthStatus, OperationalStatus, Size | 
     Format-Table -AutoSize 
 Get-Volume | Select DriveLetter, FileSystemLabel, FileSystem, SizeRemaining, Size | 
     Format-Table -AutoSize 
 # endregion 
 
 # region 2. Storage cleanup (safe) 
 Write-Section "Storage cleanup" 
 
 if (Confirm-Step "Run Storage Sense style cleanup (temporary files, Delivery Optimization cache, etc.)?" -DefaultYes) { 
     try { 
         Write-Host "Launching cleanmgr / very standard cleanup..." -ForegroundColor Green 
         Start-Process -FilePath "cleanmgr.exe" -ArgumentList "/sagerun:1" -Wait 
     } catch { 
         Write-Warning "cleanmgr failed: $_" 
     } 
 } 
 
 if (Confirm-Step "Run DISM component store cleanup (removes superseded files)?" -DefaultYes) { 
     try { 
         Write-Host "DISM /StartComponentCleanup..." -ForegroundColor Green 
         DISM /Online /Cleanup-Image /StartComponentCleanup 
     } catch { 
         Write-Warning "DISM component cleanup failed: $_" 
     } 
 } 
 # endregion 
 
 # region 3. Startup + background apps 
 Write-Section "Startup and background apps" 
 
 if (Confirm-Step "Show startup apps so you can disable junk in Task Manager later?" -DefaultYes) { 
     Get-CimInstance Win32_StartupCommand | 
         Select-Object Name, Command, Location | 
         Sort-Object Name | 
         Format-Table -AutoSize 
     Write-Host "`nTIP: Use Task Manager → Startup Apps, and Settings → Apps → Startup to disable unneeded entries." -ForegroundColor Yellow 
 } 
 
 # endregion 
 
 # region 4. Integrity: SFC / DISM / optional CHKDSK (C:) 
 Write-Section "System file integrity" 
 
 if (Confirm-Step "Run SFC /SCANNOW (scans and repairs system files)?" -DefaultYes) { 
     try { 
         sfc /scannow 
     } catch { 
         Write-Warning "SFC failed: $_" 
     } 
 } 
 
 if (Confirm-Step "Run DISM /ScanHealth + /RestoreHealth (component store repair)?" -DefaultYes) { 
     try { 
         DISM /Online /Cleanup-Image /ScanHealth 
         DISM /Online /Cleanup-Image /RestoreHealth 
     } catch { 
         Write-Warning "DISM health operations failed: $_" 
     } 
 } 
 
 if (Confirm-Step "Schedule CHKDSK C: /F /R on next reboot (deep disk check)?" ) { 
     try { 
         Write-Host "Scheduling CHKDSK for C: on next reboot..." -ForegroundColor Green 
         cmd.exe /c "echo Y|chkdsk C: /F /R" 
     } catch { 
         Write-Warning "CHKDSK scheduling failed: $_" 
     } 
 } 
 # endregion 
 
 # region 5. Windows Update check 
 Write-Section "Windows Update" 
 
 try { 
     $au = Get-WindowsUpdateLog -ErrorAction SilentlyContinue 
 } catch { 
     # Ignore; not critical 
 } 
 
 try { 
     Import-Module PSWindowsUpdate -ErrorAction SilentlyContinue | Out-Null 
 } catch {} 
 
 if (Get-Module -Name PSWindowsUpdate -ListAvailable) { 
     if (Confirm-Step "Check for pending updates via PSWindowsUpdate (no install yet)?" -DefaultYes) { 
         Get-WindowsUpdate -MicrosoftUpdate -IgnoreUserInput -AcceptAll -Verbose 
     } 
     if (Confirm-Step "Install all important Windows + Microsoft updates now?" ) { 
         Get-WindowsUpdate -MicrosoftUpdate -AcceptAll -Install -AutoReboot:$false 
     } 
 } else { 
     Write-Host "PSWindowsUpdate module not present; use Settings → Windows Update to finish update checks." -ForegroundColor Yellow 
 } 
 # endregion 
 
 # region 6. Quick performance sanity 
 Write-Section "Performance snapshot" 
 
 Get-Process | Sort-Object WorkingSet -Descending | 
     Select-Object -First 15 Name, CPU, WorkingSet | 
     Format-Table -AutoSize 
 
 Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 2 -MaxSamples 3 
 
 # endregion 
 
 # region 7. WSL integration hook 
 Write-Section "WSL integration" 
 
 if (Confirm-Step "Shutdown all WSL instances now?" -DefaultYes) { 
     try { 
         wsl --shutdown 
         Write-Host "WSL instances shut down." -ForegroundColor Green 
     } catch { 
         Write-Warning "WSL shutdown failed: $_" 
     } 
 } 
 
 if (Confirm-Step "Run dedicated WSL cleanup + VHDX compaction script after this?" ) { 
     $wslScript = Join-Path $PSScriptRoot 'wsl-clean.ps1' 
     if (Test-Path $wslScript) { 
         & $wslScript 
     } else { 
         Write-Warning "wsl-clean.ps1 not found in $PSScriptRoot. Create it next." 
     } 
 } 
 
 # endregion 
 
 Write-Section "Done" 
 Write-Host "PC maintenance run complete. Log saved to: $logFile" -ForegroundColor Green 
 Stop-Transcript | Out-Null