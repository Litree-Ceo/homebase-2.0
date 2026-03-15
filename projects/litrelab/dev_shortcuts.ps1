# Dev Shortcuts for Litrelab

function Start-Backend {
    Write-Host "Starting FastAPI backend..."
    Push-Location "./litreelab-backend"
    uvicorn main:app --host 0.0.0.0 --port 8000
    Pop-Location
}

function Start-Frontend {
    Write-Host "Starting Astro frontend..."
    Push-Location "./litreelab-studio"
    pnpm dev
    Pop-Location
}

function Open-MySite {
    Write-Host "Opening site in browser..."
    start http://localhost:4321
}

function Deploy {
    Write-Host "Deploying with Docker Compose..."
    docker-compose up --build
}

Set-Alias dev-backend Start-Backend
Set-Alias dev-frontend Start-Frontend
Set-Alias dev-site Open-MySite
Set-Alias dev-deploy Deploy

Write-Host "Dev shortcuts loaded! Use dev-backend, dev-frontend, dev-site, dev-deploy."