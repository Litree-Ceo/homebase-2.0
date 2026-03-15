#Requires -Version 5.1

<#
.SYNOPSIS
    Backup and repair Windows Terminal settings.json
.DESCRIPTION
    Fixes trailing commas, floating point artifacts, and normalizes opacity values.
#>

# ╔══════════════════════════════════════════════════════════════════╗
# ║  💪 PowerShell Enhanced                                          ║
# ║  Windows Terminal Settings Repair Tool                           ║
# ╠══════════════════════════════════════════════════════════════════╣
# ║  Commands:                                                       ║
# ║  • Repair-WTSettings.ps1          Run this script                ║
# ║  • Get-WindowsTerminalSettings    Get settings path              ║
# ║  • Edit-WindowsTerminalSettings   Open in editor                 ║
# ║  • ls                             List files                     ║
# ║  • ll                             Detailed list                  ║
# ║  • cat settings.json              View raw JSON                  ║
# ║  • code settings.json             Open in VS Code                ║
# ║  • top                            Top memory processes           ║
# ║  • df                             Disk space                     ║
# ║  • touch                          Create file                    ║
# ║  • ccp/pst                        Copy/Paste clipboard           ║
# ║  • gs/ga/gc                       Git shortcuts                  ║
# ║  • dkps                           Docker containers              ║
# ║  • kill-proc                      Kill process by name           ║
# ║                                                                ║
# ║  Search history: Ctrl+R | Autocomplete: Tab                    ║
# ╚══════════════════════════════════════════════════════════════════╝

$paths = @(
    "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json",
    "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json",
    "$env:LOCALAPPDATA\Microsoft\Windows Terminal\settings.json"
)

$settingsPath = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $settingsPath) {
    Write-Error "❌ settings.json not found. Check if WT is installed."
    exit 1
}

Write-Host "📁 Found: $settingsPath" -ForegroundColor Gray

# Backup
$backup = "$settingsPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $settingsPath $backup -Force
Write-Host "💾 Backed up to: $backup" -ForegroundColor Cyan

# Read & repair
$content = Get-Content $settingsPath -Raw

# 1. Fix trailing commas
$content = $content -replace ',(\s*[}\]])', '$1'

# 2. Fix opacity: normalize to 0-100
$content = $content -replace '"opacity"\s*:\s*(\d+(?:\.\d+)?)', {
    $val = [float]$_.Groups[1].Value
    if ($val -le 1) { $val = [math]::Round($val * 100) }
    else { $val = [math]::Round($val) }
    '"opacity": ' + $val
}

# 3. Fix garbage floats (0.94999999999999996 etc.)
$content = $content -replace ':\s*0\.9{13,}6\s*', ': 95'

# Verify BEFORE saving
try {
    $null = $content | ConvertFrom-Json
} catch {
    Write-Error "❌ JSON still invalid: $_"
    Write-Host "🔧 Restoring backup..." -ForegroundColor Yellow
    Copy-Item $backup $settingsPath -Force
    exit 1
}

# Save
$content | Set-Content $settingsPath -Force -Encoding UTF8
Write-Host "JSON validated successfully. Restart Windows Terminal." -ForegroundColor Green
