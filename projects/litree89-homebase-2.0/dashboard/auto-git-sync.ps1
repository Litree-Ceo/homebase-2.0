# Auto Git Sync Script
# Run this script in your EverythingHomebase folder to auto-pull, add, commit, and push changes

$repoPath = "G:/My Drive/EverythingHomebase"
Set-Location $repoPath

git pull

git add .
$commitMsg = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMsg

git push
