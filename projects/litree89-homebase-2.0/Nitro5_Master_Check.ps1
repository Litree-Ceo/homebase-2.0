# Nitro5_Master_Check.ps1
# Acer Nitro AN515-54 Verification Script
# Safe: Does not modify system, only verifies and reports

Write-Host "==== Nitro5 Master Check ====" -ForegroundColor Cyan

# Power Plan
Write-Host "\n[Power Plan]" -ForegroundColor Yellow
powercfg /GETACTIVESCHEME

# CPU Info
Write-Host "\n[CPU Info]" -ForegroundColor Yellow
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed | Format-List

# GPU Info
Write-Host "\n[GPU Info]" -ForegroundColor Yellow
Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion | Format-List

# RAM Info
Write-Host "\n[RAM Info]" -ForegroundColor Yellow
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed | Format-Table

# Disks & Volumes
Write-Host "\n[Disks & Volumes]" -ForegroundColor Yellow
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size | Format-Table
Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, SizeRemaining, Size | Format-Table

# Startup Items
Write-Host "\n[Startup Items]" -ForegroundColor Yellow
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location | Format-Table

Write-Host "\n[Permanent Memory Anchor]" -ForegroundColor Green
Write-Host "This script helps you remember and verify your optimal Nitro 5 setup. No changes are made to your system."

Write-Host "\n==== Check Complete ====" -ForegroundColor Cyan
