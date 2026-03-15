# 🤖 Gemini CLI Deployment Guide

## Quick Start

### Option 1: One-Click Deploy (Local)
```powershell
# From PowerShell in homebase-2.0 folder
.\deploy-with-gemini.ps1
```

### Option 2: Cloud Shell Deploy
```powershell
.\deploy-with-gemini.ps1 -CloudShell
```
Then copy the commands to https://shell.cloud.google.com

### Option 3: Use Gemini Interactive
```bash
# Get AI help with deployment
gemini "Help me deploy my Next.js app to Firebase hosting"

# Or with specific project context
gemini -p "Deploy project studio-6082148059-d1fec to Firebase"
```

---

## Gemini CLI Commands for This Project

### Analyze Configuration
```bash
gemini "Check if my Firebase configuration is correct for project studio-6082148059-d1fec"
```

### Build & Deploy
```bash
gemini "Build and deploy the web app in github/apps/web to Firebase"
```

### Troubleshoot
```bash
gemini "Firebase deployment failed, what are common fixes?"
```

---

## Setup Gemini CLI

### 1. Install
```bash
npm install -g @google/gemini-cli
```

### 2. Authenticate
```bash
gemini auth login
```

### 3. Configure Project
```bash
# Set default project
gemini config set project studio-6082148059-d1fec
```

---

## PowerShell Shortcuts

Add to your `$PROFILE`:

```powershell
# Gemini shortcuts
function gemini-deploy {
    & "$env:USERPROFILE\homebase-2.0\deploy-with-gemini.ps1"
}

function gemini-ask($question) {
    gemini -p $question
}

function gemini-fix {
    gemini -p "Check the homebase-2.0 project for common issues and suggest fixes"
}
```

Then use:
- `gemini-deploy` - Deploy with Gemini
- `gemini-ask "question"` - Ask Gemini anything
- `gemini-fix` - Get AI troubleshooting

---

## Common Gemini Prompts

### Deployment
```
"Deploy my Next.js app from github/apps/web to Firebase project studio-6082148059-d1fec"
```

### Debugging
```
"The build is failing with TypeScript errors in useAuth.ts, help me fix it"
```

### Optimization
```
"How can I optimize my Firebase hosting configuration for a Next.js app?"
```

### Security
```
"Review my .env files for any security issues before deployment"
```

---

## Automation Scripts

### Full Automation
```powershell
# deploy-with-gemini.ps1 does:
1. ✅ Check prerequisites (firebase, node, pnpm)
2. ✅ Configure Gemini project
3. ✅ Set Firebase project
4. ✅ Install dependencies
5. ✅ Build project
6. ✅ Get Gemini insights
7. ✅ Deploy to Firebase
8. ✅ Post-deployment summary
```

---

## Troubleshooting

### "gemini: command not found"
```bash
npm install -g @google/gemini-cli
# Restart terminal
```

### "Not authenticated"
```bash
gemini auth login
```

### "Firebase project not found"
```bash
firebase use studio-6082148059-d1fec
# Or
.\deploy-with-gemini.ps1
```

---

## Your Deployed URLs

| Environment | URL |
|-------------|-----|
| Production | https://studio-6082148059-d1fec.web.app |
| Fallback | https://studio-6082148059-d1fec.firebaseapp.com |

---

## Next Steps

1. Run `.\deploy-with-gemini.ps1` to deploy
2. Visit your site at https://studio-6082148059-d1fec.web.app
3. Use `gemini "Help me add custom domain"` for custom domain setup
