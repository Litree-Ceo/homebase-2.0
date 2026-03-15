# scripts/smart-start.ps1
Write-Host "Initializing LiTreeLab Smart Environment..." -ForegroundColor Cyan

# Define the apps and their start commands
$apps = @(
    @{ Name = "WEB"; Command = "cd github/apps/web && pnpm dev"; Color = "cyan" },
    @{ Name = "META"; Command = "cd github/apps/litreelab-studio-metaverse && pnpm dev"; Color = "blue" },
    @{ Name = "LIT"; Command = "cd litlabs && pnpm dev"; Color = "magenta" },
    @{ Name = "AZ"; Command = "docker start -a agent-zero"; Color = "yellow" },
    @{ Name = "AI"; Command = "pnpm optimize"; Color = "green" }
)

# Construct the concurrently command
$concurrentlyCmd = "npx concurrently"
$names = @()
$colors = @()
$cmds = @()

foreach ($app in $apps) {
    $names += $app.Name
    $colors += $app.Color
    $cmds += "`"$($app.Command)`""
}

$namesStr = $names -join ","
$colorsStr = $colors -join ","
$cmdsStr = $cmds -join " "

# Execute
Write-Host "Launching agents: $namesStr" -ForegroundColor Green
Invoke-Expression "$concurrentlyCmd $cmdsStr --names `"$namesStr`" --prefix-colors `"$colorsStr`""
