# System Tray Icon for Overlord
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create context menu
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$menu.Items.Add("Status", $null, { overlord-status | Out-GridView -Title "Overlord Status" }) | Out-Null
$menu.Items.Add("Restart", $null, { overlord-restart }) | Out-Null
$menu.Items.Add("Boost", $null, { pc-boost }) | Out-Null
$menu.Items.Add("-") | Out-Null  # Separator
$menu.Items.Add("Exit", $null, { $trayIcon.Visible = $false; exit }) | Out-Null

# Create tray icon
$trayIcon = New-Object System.Windows.Forms.NotifyIcon
$trayIcon.Text = "Overlord Dashboard"
$trayIcon.Icon = [System.Drawing.SystemIcons]::Shield  # Shield icon
$trayIcon.ContextMenuStrip = $menu
$trayIcon.Visible = $true

# Show balloon tip on start
$trayIcon.ShowBalloonTip(3000, "Overlord", "God Mode Active", [System.Windows.Forms.ToolTipIcon]::Info)

# Keep running
[System.Windows.Forms.Application]::Run()
