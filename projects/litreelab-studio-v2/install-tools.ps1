# PowerShell script to install all required CLI tools
# Run as administrator if needed

Write-Host "Installing Node.js..."
winget install -e --id OpenJS.NodeJS.LTS

Write-Host "Installing Python..."
winget install -e --id Python.Python.3.10

Write-Host "Installing Docker Desktop..."
winget install -e --id Docker.DockerDesktop

Write-Host "Installing Azure CLI..."
winget install -e --id Microsoft.AzureCLI

Write-Host "Installing Git..."
winget install -e --id Git.Git

Write-Host "Installing Git LFS..."
winget install -e --id GitHub.GitLFS

Write-Host "All tools installed!"
