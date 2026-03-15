# Open Cloud Shell in browser
Start-Process "https://shell.cloud.google.com/?project=studio-6082148059-d1fec"

Write-Host @"
🚀 Cloud Shell will open in your browser.

Once it loads, COPY & PASTE these commands:

# 1. Go to your repo
cd ~/homebase-2.0/github

# 2. Pull latest changes
git pull origin merge-github-content

# 3. Install & build
pnpm install
pnpm build:web

# 4. Deploy
firebase deploy --only hosting

"@ -ForegroundColor Cyan
