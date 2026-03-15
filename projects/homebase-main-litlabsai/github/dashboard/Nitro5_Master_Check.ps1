# Nitro5 Master Check Script
# Verifies power plan, CPU/GPU/RAM, disks, volumes, and startup items
# Safe: does not modify registry or system settings

Write-Host "Checking Power Plan..."
Get-CimInstance -Namespace root\cimv2\power -ClassName Win32_PowerPlan | Select-Object ElementName, IsActive

Write-Host "Checking CPU Info..."
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

Write-Host "Checking GPU Info..."
Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion

Write-Host "Checking RAM Info..."
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed

Write-Host "Checking Disks & Volumes..."
Get-CimInstance Win32_DiskDrive | Select-Object Model, Size
Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, Size, FreeSpace

Write-Host "Startup Items..."
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location

Write-Host "Verification Complete!"
