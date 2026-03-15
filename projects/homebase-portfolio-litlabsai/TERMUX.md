# 📱 Termux Development Guide

Develop and deploy HomeBase Pro directly from your Android device using Termux.

## Quick Setup

```bash
# Run the setup script
curl -fsSL https://raw.githubusercontent.com/Litlabsai/homebase-portfolio/main/termux-setup.sh | bash
```

Or manually:

```bash
# Install dependencies
pkg update && pkg install -y git nodejs-lts

# Clone repo
cd ~/projects
git clone https://github.com/Litlabsai/homebase-portfolio.git
cd homebase-portfolio

# Install & run
npm install
npm run dev
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build

# Git workflow
git pull origin main     # Pull latest
git add .                # Stage changes
git commit -m "msg"      # Commit
git push origin main     # Push

# Firebase (if using)
firebase login           # Authenticate
firebase deploy          # Deploy to hosting
```

## Access From Other Devices

```bash
# Find your phone's IP
ifconfig

# Dev server is accessible at:
# http://YOUR_PHONE_IP:5173
```

## SSH Key Setup (Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH & GPG Keys → New SSH Key

# Then use SSH for git:
git remote set-url origin git@github.com:Litlabsai/homebase-portfolio.git
```

## Tips

- Use `termux-wake-lock` to keep CPU awake during builds
- Install `termux-api` for extra device features
- Use `nano` or `vim` for editing files
- `ls -la` to see all files
- `cd -` to go back to previous directory
