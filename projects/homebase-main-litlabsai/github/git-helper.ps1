# PowerShell Git & Sync Helper Script
# Place this script in your EverythingHomebase root directory

# Change to repo directory
goto-repo() {
    Set-Location -Path "g:\My Drive\EverythingHomebase"
}

# Stage all changes
git-stage() {
    goto-repo
    git add .
}

# Commit with a message
git-commit() {
    param([string]$msg)
    goto-repo
    git commit -m $msg
}

# Push to GitHub
git-push() {
    goto-repo
    git push
}

# Pull from GitHub
git-pull() {
    goto-repo
    git pull
}

# Full sync (stage, commit, push)
git-sync() {
    param([string]$msg = "Sync changes")
    git-stage
    git-commit -msg $msg
    git-push
}

Write-Host "Git helper functions loaded. Use git-sync 'your message' to sync changes."