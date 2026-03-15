param(
    [ValidateSet('install', 'start', 'stop', 'restart', 'status', 'passphrase', 'open', 'logs')]
    [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'

$ContainerName = 'nextcloud-aio-mastercontainer'
$Image = 'nextcloud/all-in-one:latest'
$PortHttp = 9000
$PortAio = 9080
$PortHttps = 8443
$DataPath = 'E:\Sync'

function Test-PortFree {
    param([int]$Port)
    return -not (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Ensure-Prereqs {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Docker is not installed or not on PATH.'
    }
}

function Ensure-Paths {
    if (-not (Test-Path $DataPath)) {
        New-Item -ItemType Directory -Path $DataPath | Out-Null
    }
}

function Install-Aio {
    Ensure-Prereqs
    Ensure-Paths

    if (docker ps -a --format '{{.Names}}' | Select-String -SimpleMatch $ContainerName) {
        Write-Host "Container '$ContainerName' already exists. Use action 'start' or 'restart'." -ForegroundColor Yellow
        return
    }

    foreach ($port in @($PortHttp, $PortAio, $PortHttps)) {
        if (-not (Test-PortFree -Port $port)) {
            throw "Port $port is already in use. Free it first, then retry."
        }
    }

    docker pull $Image | Out-Null

    docker run `
        --sig-proxy=false `
        --name $ContainerName `
        --restart always `
        --publish "${PortHttp}:80" `
        --publish "${PortAio}:8080" `
        --publish "${PortHttps}:8443" `
        --env SKIP_DOMAIN_VALIDATION=true `
        --volume nextcloud_aio_mastercontainer:/mnt/docker-aio-config `
        --volume "//./pipe/docker_engine://./pipe/docker_engine" `
        --volume /var/run/docker.sock:/var/run/docker.sock:ro `
        --volume "E:/Sync:/mnt/ncdata" `
        $Image | Out-Null

    Write-Host 'Nextcloud AIO installed and started.' -ForegroundColor Green
}

function Start-Aio {
    Ensure-Prereqs
    docker start $ContainerName | Out-Null
    Write-Host 'Nextcloud AIO started.' -ForegroundColor Green
}

function Stop-Aio {
    Ensure-Prereqs
    docker stop $ContainerName | Out-Null
    Write-Host 'Nextcloud AIO stopped.' -ForegroundColor Yellow
}

function Restart-Aio {
    Ensure-Prereqs
    docker restart $ContainerName | Out-Null
    Write-Host 'Nextcloud AIO restarted.' -ForegroundColor Green
}

function Show-Status {
    Ensure-Prereqs
    docker ps -a --filter "name=$ContainerName" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    $configuredDomain = $null
    try {
        $json = docker exec $ContainerName cat /mnt/docker-aio-config/data/configuration.json 2>$null
        if ($json) {
            $cfg = $json | ConvertFrom-Json
            $configuredDomain = $cfg.domain
        }
    }
    catch {
    }
    Write-Host ''
    Write-Host "AIO URL:       https://localhost:$PortAio" -ForegroundColor Cyan
    if ($configuredDomain) {
        Write-Host "Nextcloud URL: https://$configuredDomain" -ForegroundColor Cyan
    }
    else {
        Write-Host 'Nextcloud URL: https://localhost (after Start containers)' -ForegroundColor Cyan
    }
    Write-Host "Data path:     $DataPath" -ForegroundColor Cyan
}

function Show-Passphrase {
    Ensure-Prereqs
    $json = docker exec $ContainerName cat /mnt/docker-aio-config/data/configuration.json 2>$null
    if (-not $json) {
        throw 'Could not read AIO configuration. Is the container running?'
    }
    $cfg = $json | ConvertFrom-Json
    if ($cfg.password) {
        Write-Host "Initial passphrase: $($cfg.password)" -ForegroundColor Yellow
    }
    else {
        Write-Host 'No passphrase found in configuration.' -ForegroundColor Yellow
    }
}

function Open-Aio {
    Start-Process "https://localhost:$PortAio"
}

function Show-Logs {
    Ensure-Prereqs
    docker logs -f $ContainerName
}

switch ($Action) {
    'install' { Install-Aio }
    'start' { Start-Aio }
    'stop' { Stop-Aio }
    'restart' { Restart-Aio }
    'status' { Show-Status }
    'passphrase' { Show-Passphrase }
    'open' { Open-Aio }
    'logs' { Show-Logs }
}
