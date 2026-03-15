param(
    [string]$RootPath = "$PSScriptRoot",
    [string[]]$ExcludeFolders = @("node_modules", ".git", ".next", ".vscode", "dist", "build", "coverage", "_duplicates_backup"),
    [switch]$Delete = $false
)

$LogFile = "$PSScriptRoot\duplicate_scan_log_$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$BackupDir = "$PSScriptRoot\_duplicates_backup_$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Create log file immediately
New-Item -Path $LogFile -ItemType File -Force | Out-Null

function Log-Message {
    param([string]$Message)
    $Msg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Output $Msg
    Add-Content -Path $LogFile -Value $Msg
}

Log-Message "Starting Comprehensive Double Scan in: $RootPath"
Log-Message "Log file: $LogFile"

# 1. Gather Files
Log-Message "Phase 1: Gathering files..."
try {
    # Get all files first, then filter. This is safer but slower.
    # Using -Directory first to exclude might be faster but more complex in PS 5.1
    $Files = Get-ChildItem -Path $RootPath -Recurse -File -ErrorAction SilentlyContinue
    
    $FilteredFiles = @()
    foreach ($f in $Files) {
        $path = $f.FullName
        $skip = $false
        foreach ($exclude in $ExcludeFolders) {
            if ($path -like "*\$exclude\*") { $skip = $true; break }
        }
        if (-not $skip) { $FilteredFiles += $f }
    }
    $Files = $FilteredFiles
    
    Log-Message "Found $($Files.Count) files to analyze."
}
catch {
    Log-Message "Error gathering files: $_"
    exit 1
}

# 2. First Scan (SHA256)
Log-Message "Phase 2: First Scan (SHA256)..."
$HashMap = @{}

$Counter = 0
foreach ($File in $Files) {
    $Counter++
    if ($Counter % 100 -eq 0) { Write-Progress -Activity "Hashing Files (SHA256)" -Status "$Counter / $($Files.Count)" -PercentComplete (($Counter / $Files.Count) * 100) }
    
    try {
        $Hash = (Get-FileHash -Path $File.FullName -Algorithm SHA256).Hash
        if ($HashMap.ContainsKey($Hash)) {
            $HashMap[$Hash] += $File
        } else {
            $HashMap[$Hash] = @($File)
        }
    } catch {
        Log-Message "Error hashing file $($File.FullName): $_"
    }
}

# Identify potential duplicates
$PotentialDuplicates = $HashMap.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }

# 3. Second Scan (MD5 verification)
Log-Message "Phase 3: Second Scan (MD5 Cross-Verification)..."
$ConfirmedDuplicates = @{}
$SpaceRecoverable = 0

foreach ($Group in $PotentialDuplicates) {
    $HashSHA256 = $Group.Key
    $FileList = $Group.Value
    
    $MD5Map = @{}
    foreach ($File in $FileList) {
        try {
            $MD5 = (Get-FileHash -Path $File.FullName -Algorithm MD5).Hash
            if ($MD5Map.ContainsKey($MD5)) {
                $MD5Map[$MD5] += $File
            } else {
                $MD5Map[$MD5] = @($File)
            }
        } catch {
            Log-Message "Error hashing MD5 for $($File.FullName): $_"
        }
    }
    
    foreach ($MD5Group in $MD5Map.GetEnumerator()) {
        if ($MD5Group.Value.Count -gt 1) {
            $ConfirmedDuplicates[$HashSHA256] = $MD5Group.Value
            
            $FileSize = $MD5Group.Value[0].Length
            $Count = $MD5Group.Value.Count
            $SpaceRecoverable += ($FileSize * ($Count - 1))
        }
    }
}

Log-Message "Found $($ConfirmedDuplicates.Count) groups of duplicates."
Log-Message "Potential space reclaimable: $([math]::Round($SpaceRecoverable / 1MB, 2)) MB"

# 4. Deletion Strategy (Move to Backup)
if ($ConfirmedDuplicates.Count -gt 0) {
    Log-Message "Preparing backup directory: $BackupDir"
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    foreach ($GroupKey in $ConfirmedDuplicates.Keys) {
        $Files = $ConfirmedDuplicates[$GroupKey]
        
        # Keep shortest path
        $Keep = $Files | Sort-Object { $_.FullName.Length }, CreationTime | Select-Object -First 1
        $Remove = $Files | Where-Object { $_.FullName -ne $Keep.FullName }
        
        Log-Message "Duplicate Group (SHA256: $GroupKey):"
        Log-Message "  KEEP: $($Keep.FullName)"
        
        foreach ($File in $Remove) {
            try {
                # Recreate folder structure
                $RelPath = $File.FullName.Substring($RootPath.Length)
                if ($RelPath.StartsWith("\")) { $RelPath = $RelPath.Substring(1) }
                $BackupDest = Join-Path $BackupDir $RelPath
                $BackupDestDir = Split-Path $BackupDest
                
                if (-not (Test-Path $BackupDestDir)) {
                    New-Item -ItemType Directory -Path $BackupDestDir -Force | Out-Null
                }
                
                Log-Message "  MOVE TO BACKUP: $($File.FullName) -> $BackupDest"
                Move-Item -Path $File.FullName -Destination $BackupDest -Force -ErrorAction Stop
            }
            catch {
                Log-Message "FAILED to move $($File.FullName): $_"
            }
        }
    }
    Log-Message "Duplicates moved to backup: $BackupDir"
} else {
    Log-Message "No duplicates found."
}

Log-Message "Scan Complete."
