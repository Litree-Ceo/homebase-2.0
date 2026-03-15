# Uninstall problematic extensions
$extensionsToRemove = @(
    "ms-azuretools.vscode-containers",
    "ms-vscode-remote.remote-containers",
    "ms-vscode-remote.vscode-remote-extensionpack",
    "ms-vscode-remote.remote-wsl"
)

Write-Host "Uninstalling problematic extensions..." -ForegroundColor Cyan
Write-Host "────────────────────────────────────" -ForegroundColor Gray

foreach ($ext in $extensionsToRemove) {
    Write-Host "Uninstalling: $ext" -ForegroundColor Yellow
    & code --uninstall-extension $ext --force 2>&1 | Out-Null
    if ($?) {
        Write-Host "  ✓ Success" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed or not found (OK if not installed)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Extension cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close VS Code completely"
Write-Host "2. Restart VS Code"
Write-Host "3. Verify no timeout errors on shutdown"
