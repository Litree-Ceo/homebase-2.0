# Workspace Configuration Fixer
# Fixes workspace paths and cleans up duplicate files

$WorkspaceFile = "HomeBase.code-workspace"
$BackupFile = "HomeBase.code-workspace.backup"

# Backup original
if (Test-Path $WorkspaceFile) {
    Copy-Item $WorkspaceFile $BackupFile -Force
    Write-Host "✓ Backed up workspace to $BackupFile" -ForegroundColor Green
}

# Read and parse workspace
$workspace = Get-Content $WorkspaceFile | ConvertFrom-Json

# Fix folder paths
$workspace.folders = @(
    @{ name = "HomeBase Root"; path = "." },
    @{ name = "API Backend"; path = "api" },
    @{ name = "LitLabs Web"; path = "apps/litlabs-web" },
    @{ name = "Labs AI"; path = "apps/labs-ai" },
    @{ name = "HoneyComb Home"; path = "apps/honey-comb-home" },
    @{ name = "HoneyComb Blueprint"; path = "apps/honeycomb-blueprint" },
    @{ name = "LitTree Unified"; path = "apps/litree-unified" },
    @{ name = "LitReeLabs Firebase"; path = "apps/litreelabsfirebase" },
    @{ name = "LitRee Studio"; path = "apps/litreestudio" },
    @{ name = "Web"; path = "apps/web" }
)

# Save corrected workspace
$workspace | ConvertTo-Json -Depth 10 | Set-Content $WorkspaceFile
Write-Host "✓ Fixed workspace folder paths" -ForegroundColor Green

# Clean up duplicate files
$duplicatePatterns = @(
    "* - Copy.*",
    "*- Copy.*",
    "*.backup*",
    "*.old"
)

$cleaned = 0
foreach ($pattern in $duplicatePatterns) {
    Get-ChildItem -Recurse -Include $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.FullName -notmatch "\.git|node_modules") {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
            $cleaned++
            Write-Host "  Removed: $($_.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host "✓ Cleaned up $cleaned duplicate files" -ForegroundColor Green

# Verify structure
Write-Host "`n📋 Verified app structure:" -ForegroundColor Cyan
$workspace.folders | Where-Object { $_.path -ne "." } | ForEach-Object {
    $exists = Test-Path $_.path
    $status = if ($exists) { "✓" } else { "✗" }
    Write-Host "  $status $($_.name) ($($_.path))" -ForegroundColor $(if ($exists) { "Green" } else { "Red" })
}
