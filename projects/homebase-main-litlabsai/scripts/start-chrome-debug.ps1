# Script to launch Chromium with remote debugging enabled
$chromePath = "$env:LOCALAPPDATA\Chromium\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "$env:LOCALAPPDATA\ms-playwright\chromium-1200\chrome-win64\chrome.exe"
}
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chromePath)) {
    $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}

if (-not (Test-Path $chromePath)) {
    Write-Error "Chromium/Chrome executable not found."
    exit 1
}

Write-Host "Launching Chromium/Chrome ($chromePath) with remote debugging on port 9222..."
# Using a separate user data directory ensures it doesn't conflict with your main Chrome instance
$userDataDir = "$env:TEMP\chrome-debug-profile"
# Added --remote-allow-origins=* to ensure tools can connect
Start-Process -FilePath $chromePath -ArgumentList "--remote-debugging-port=9222", "--remote-allow-origins=*", "--user-data-dir=$userDataDir", "http://localhost:3000"
