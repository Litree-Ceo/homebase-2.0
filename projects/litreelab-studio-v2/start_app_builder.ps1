$labStudio = "C:\Users\litre\source\repos\HomeBase3\Projects\LiTreeLabStudio"

# Start Backend
Write-Output "Starting Backend on http://localhost:8000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $labStudio; $env:PYTHONPATH = '.'; python app_builder/main.py"

# Start Frontend
Write-Output "Starting Frontend on http://localhost:3000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $labStudio/app_builder/web; npm run dev"

Write-Output "App Builder is launching! Check the new windows."
