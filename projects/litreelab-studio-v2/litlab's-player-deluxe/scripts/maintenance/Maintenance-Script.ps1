# ═══════════════════════════════════════════════════════════════════
# AUTOMATED PC MAINTENANCE SCRIPT
# Runs every Sunday at 2 AM
# ═══════════════════════════════════════════════════════════════════

param(
    [switch]$EmailReport = $false,
    [string]$EmailTo = ""
)

$StartTime = Get-Date
$LogFile = "C:\Users\litre\AppData\Local\Logs\PC-Maintenance-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').log"
$LogDir = Split-Path $LogFile
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Line = "[$Timestamp] [$Level] $Message"
    Write-Host $Line
    Add-Content -Path $LogFile -Value $Line
}

function Get-SizeGB {
    param([long]$Bytes)
    [math]::Round($Bytes / 1GB, 2)
}

Log "╔════════════════════════════════════════════════════════════════╗" "INFO"
Log "║     🤖 AUTOMATED PC MAINTENANCE STARTED                        ║" "INFO"
Log "╚════════════════════════════════════════════════════════════════╝" "INFO"
Log "" "INFO"

# Get initial disk space
$DiskBefore = Get-Volume -DriveLetter C | Select-Object @{Name="FreeGB";Expression={[math]::Round($_.SizeRemaining / 1GB, 2)}}
Log "📊 Initial disk space: $($DiskBefore.FreeGB) GB free" "INFO"

# ═══════════════════════════════════════════════════════════════════
# 1. DOCKER CLEANUP
# ═══════════════════════════════════════════════════════════════════
Log "`n🐳 DOCKER CLEANUP" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

try {
    $dockerStatus = docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Log "✓ Docker is running, starting cleanup..." "INFO"
        
        # Remove unused containers
        Log "  Removing unused containers..." "INFO"
        docker container prune -f 2>&1 | Out-Null
        
        # Remove unused images
        Log "  Removing unused images..." "INFO"
        docker image prune -a -f 2>&1 | Out-Null
        
        # Remove unused volumes
        Log "  Removing unused volumes..." "INFO"
        docker volume prune -f 2>&1 | Out-Null
        
        # Remove unused networks
        Log "  Removing unused networks..." "INFO"
        docker network prune -f 2>&1 | Out-Null
        
        # Clean build cache
        Log "  Clearing build cache..." "INFO"
        docker builder prune -a -f 2>&1 | Out-Null
        
        Log "✓ Docker cleanup complete" "SUCCESS"
    } else {
        Log "⚠ Docker not running, skipping Docker cleanup" "WARNING"
    }
} catch {
    Log "✗ Docker cleanup failed: $_" "ERROR"
}

# ═══════════════════════════════════════════════════════════════════
# 2. NPM CACHE CLEANUP
# ═══════════════════════════════════════════════════════════════════
Log "`n📦 NPM CACHE CLEANUP" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

try {
    $npmVersion = npm -v 2>$null
    if ($npmVersion) {
        Log "  Clearing npm cache..." "INFO"
        npm cache clean --force 2>&1 | Out-Null
        Log "✓ npm cache cleared" "SUCCESS"
    } else {
        Log "⚠ npm not found, skipping npm cleanup" "WARNING"
    }
} catch {
    Log "✗ npm cleanup failed: $_" "ERROR"
}

# ═══════════════════════════════════════════════════════════════════
# 3. TEMPORARY FILES CLEANUP
# ═══════════════════════════════════════════════════════════════════
Log "`n🗑️  TEMPORARY FILES CLEANUP" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

try {
    # Windows Temp
    Log "  Clearing Windows Temp..." "INFO"
    Remove-Item "C:\Users\litre\AppData\Local\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Windows Prefetch
    Log "  Clearing Prefetch..." "INFO"
    Remove-Item "C:\Windows\Prefetch\*" -Force -ErrorAction SilentlyContinue
    
    # Browser cache
    Log "  Clearing browser cache..." "INFO"
    Remove-Item "C:\Users\litre\AppData\Local\Google\Chrome\User Data\Default\Cache\*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "C:\Users\litre\AppData\Local\Microsoft\Edge\User Data\Default\Cache\*" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Recycle Bin
    Log "  Emptying Recycle Bin..." "INFO"
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
    
    Log "✓ Temporary files cleaned" "SUCCESS"
} catch {
    Log "✗ Temp cleanup failed: $_" "ERROR"
}

# ═══════════════════════════════════════════════════════════════════
# 4. DISK OPTIMIZATION
# ═══════════════════════════════════════════════════════════════════
Log "`n💿 DISK OPTIMIZATION" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

try {
    Log "  Running disk optimization..." "INFO"
    Optimize-Volume -DriveLetter C -Defrag -ErrorAction SilentlyContinue
    Log "✓ Disk optimization complete" "SUCCESS"
} catch {
    Log "✗ Disk optimization failed: $_" "ERROR"
}

# ═══════════════════════════════════════════════════════════════════
# 5. SYSTEM LOGS CLEANUP
# ═══════════════════════════════════════════════════════════════════
Log "`n📋 SYSTEM LOGS CLEANUP" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

try {
    Log "  Clearing old Overlord logs..." "INFO"
    Remove-Item "C:\Users\litre\Desktop\Overlord-Pc-Dashboard\overlord*.log" -Force -ErrorAction SilentlyContinue
    
    Log "✓ Old logs cleaned" "SUCCESS"
} catch {
    Log "✗ Log cleanup failed: $_" "ERROR"
}

# ═══════════════════════════════════════════════════════════════════
# 6. FINAL STATS
# ═══════════════════════════════════════════════════════════════════
Log "`n📊 FINAL STATISTICS" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

$DiskAfter = Get-Volume -DriveLetter C | Select-Object @{Name="FreeGB";Expression={[math]::Round($_.SizeRemaining / 1GB, 2)}}
$SpaceFreed = $DiskAfter.FreeGB - $DiskBefore.FreeGB
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Log "✓ Disk space before: $($DiskBefore.FreeGB) GB free" "INFO"
Log "✓ Disk space after: $($DiskAfter.FreeGB) GB free" "INFO"
Log "✓ Space freed: $SpaceFreed GB" "INFO"
Log "✓ Duration: $($Duration.TotalMinutes.ToString('0.00')) minutes" "INFO"

# ═══════════════════════════════════════════════════════════════════
# 7. SYSTEM STATUS
# ═══════════════════════════════════════════════════════════════════
Log "`n🖥️  SYSTEM STATUS" "INFO"
Log "─────────────────────────────────────────────────────────────────" "INFO"

$os = Get-CimInstance Win32_OperatingSystem
$usedRAM = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 2)
$totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$cpuLoad = (Get-CimInstance Win32_Processor | Select-Object -ExpandProperty LoadPercentage)[0]

Log "✓ RAM: $usedRAM GB / $totalRAM GB used" "INFO"
Log "✓ CPU Load: $cpuLoad%" "INFO"
Log "✓ Disk: $($DiskAfter.FreeGB) GB free" "INFO"

Log "`n╔════════════════════════════════════════════════════════════════╗" "INFO"
Log "║     ✅ MAINTENANCE COMPLETED SUCCESSFULLY                       ║" "INFO"
Log "╚════════════════════════════════════════════════════════════════╝" "INFO"
Log "`nLog file: $LogFile" "INFO"

# Return summary
@{
    Success = $true
    Duration = $Duration.TotalMinutes
    SpaceFreed = $SpaceFreed
    DiskBefore = $DiskBefore.FreeGB
    DiskAfter = $DiskAfter.FreeGB
    RAM = "$usedRAM GB / $totalRAM GB"
    CPU = "$cpuLoad%"
}
