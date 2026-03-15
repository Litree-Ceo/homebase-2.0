# Overlord Monolith - Safe Cleanup Script
# Moves unused files to _archive instead of deleting them.

$archiveDir = "_archive"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Force $archiveDir
}

# List of patterns/files to archive
$patterns = @(
    "*termux*",
    "setup-ssh.sh",
    "setup-syncthing.sh",
    "setup-vscode-remote.ps1",
    "setup-shared-storage.sh",
    "modules/social/node_modules", 
    "modules/social/package-lock.json"
)

foreach ($pattern in $patterns) {
    if ($pattern -like "*modules*") {
        # Handle specific paths
        if (Test-Path $pattern) {
            Write-Host "Archiving $pattern..."
            Move-Item -Path $pattern -Destination $archiveDir -Force
        }
    } else {
        # Handle root wildcard patterns
        Get-ChildItem -Path . -Filter $pattern -Recurse | ForEach-Object {
            $dest = Join-Path $archiveDir $_.Name
            Write-Host "Archiving $($_.FullName) -> $dest"
            Move-Item -Path $_.FullName -Destination $archiveDir -Force
        }
    }
}

Write-Host "Cleanup Complete! Check _archive folder before deleting permanently."
