# Scripts Directory

This directory contains automation scripts for common development, deployment, and maintenance tasks.

## 📁 Script Categories

### 🔧 [setup/](./setup/)

Initial setup and configuration scripts.

- Install dependencies
- Environment configuration
- Infrastructure bootstrap
- Integration setup (Google Cloud, Grok, etc.)

**Usage:**

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/setup/[script-name].ps1
```

### 🧹 [cleanup/](./cleanup/)

Clean up and reset scripts.

- Remove build artifacts
- Clean temporary files
- Reset configurations
- Full cleanup utilities

**Usage:**

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/cleanup/[script-name].ps1
# or
./[script-name].bat
```

### 🚀 [deploy/](./deploy/)

Deployment automation scripts.

- Trigger multi-platform deployment
- Deploy to specific platforms
- Pre-deployment verification
- Post-deployment checks

**Usage:**

```bash
git push origin main  # Auto-triggers GitHub Actions
# or manually:
powershell -ExecutionPolicy Bypass -File ./scripts/deploy/[script-name].ps1
```

### 🔍 [diagnostics/](./diagnostics/)

Diagnostics and troubleshooting scripts.

- Health checks
- Verification scripts
- Status monitoring
- Issue detection

**Usage:**

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/diagnostics/[script-name].ps1
```

### 🛠️ [utilities/](./utilities/)

General utility scripts.

- Performance optimization
- Configuration management
- Quick references
- Helper utilities

**Usage:**

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/utilities/[script-name].ps1
```

## 📝 Common Tasks

### Start Development Environment

```bash
pnpm install
pnpm dev
```

### Deploy to Production

```bash
git add .
git commit -m "your-message"
git push origin main
# GitHub Actions automatically deploys
```

### Run Diagnostics

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/diagnostics/[check-script].ps1
```

### Clean Up Local Environment

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/cleanup/[cleanup-script].ps1
```

## ⚠️ Important Notes

- Most scripts require PowerShell 5.0+ on Windows
- Some scripts need administrator privileges
- Always review script contents before running
- Test in development environment first
- Keep scripts up to date with project changes

## 🔗 Related Documentation

- [Deployment Guide](../docs/deployment/)
- [Development Guide](../docs/development/)
- [Operations Guide](../docs/operations/)

---

**Last Updated:** January 5, 2026  
**Version:** 1.0
