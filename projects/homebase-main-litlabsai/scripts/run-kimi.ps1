$env:PYTHONUTF8 = "1"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$kimiPath = "C:\Users\litre\AppData\Local\Python\pythoncore-3.14-64\Scripts\kimi.exe"

if (Test-Path $kimiPath) {
    # Forward all arguments to the executable
    & $kimiPath $args
} else {
    Write-Error "Kimi executable not found at $kimiPath. Please install kimi-cli."
    exit 1
}
