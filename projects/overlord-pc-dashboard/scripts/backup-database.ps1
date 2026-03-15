#!/usr/bin/env powershell
# Overlord Dashboard Database Backup Script
# Backs up the SQLite database with rotation

param(
    [string]$BackupDir = "../backups",
    [int]$RetentionDays = 30,
    [string]$DbPath = "../overlord.db"
)

$ErrorActionPreference = "Stop"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "✓ Created backup directory: $BackupDir" -ForegroundColor Green
}

# Generate backup filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "overlord_backup_$timestamp.db"

# Check if database exists
if (-not (Test-Path $DbPath)) {
    Write-Host "✗ Database not found at: $DbPath" -ForegroundColor Red
    exit 1
}

# Create backup
try {
    Copy-Item -Path $DbPath -Destination $backupFile -Force
    $size = (Get-Item $backupFile).Length / 1MB
    Write-Host "✓ Backup created: $backupFile ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backup failed: $_" -ForegroundColor Red
    exit 1
}

# Clean up old backups
$cutoff = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem -Path $BackupDir -Filter "overlord_backup_*.db" | 
    Where-Object { $_.LastWriteTime -lt $cutoff }

foreach ($backup in $oldBackups) {
    Remove-Item $backup.FullName -Force
    Write-Host "✓ Removed old backup: $($backup.Name)" -ForegroundColor Yellow
}

Write-Host "`nBackup Summary:" -ForegroundColor Cyan
Write-Host "  - New backup: $backupFile"
Write-Host "  - Retention: $RetentionDays days"
Write-Host "  - Old backups removed: $($oldBackups.Count)"
