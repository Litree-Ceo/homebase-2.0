<<<<<<< HEAD
# LiTreeLab Studio Pad

A modern, AI-powered social/creator platform—everything at your fingertips. Built for extensibility, automation, and seamless integration with Azure, Firebase, and Copilot.

## Structure

## 🚀 Quick Start

- **One Command to Rule All:**
  - `./homebase [command]` — Build, test, sync, fix, or reset everything from anywhere.
- **VS Code:**
  - Open the workspace root for full automation, linting, spell-check, and smart sync.

## 🛠️ God Mode Controls

- **Build All:** `./homebase build`
- **Test All:** `./homebase test`
- **Lint & Format:** `./homebase lint` / `./homebase format`
- **Sync & Push:** `./homebase sync`
- **Status & Health:** `./homebase status`
- **Quick Fix:** `./homebase fix`
- **Emergency Reset:** `./homebase reset`

## 🧠 Pro-Level Automation

- Pre-commit hooks: Lint, format, type-check, spell-check auto-run
- Git LFS for large files
- Smart .gitignore and .gitattributes
- Curated VS Code extensions and settings
- Fast scripts for logs, health, and recovery

## 📚 Docs & Help

- See `./homebase help` for all commands
- All configs and scripts are at the repo root

---

**This is your Honeycomb Vision. Everything is under your control.**

1. See `apps/litlabs-web/README.md` and `apps/labs-ai/README.md` for setup.
2. Use `.env.example` files in each app for environment variables.

- Social feed, chat, notifications, media sharing
- Admin dashboard with smart notifications and deployment status
- Full CI/CD, Copilot, and VS Code bot support

---

_This is your next-gen workspace. Clean, modern, and ready to build the future._

---

## 🤖 Automation & Git Sync

This repo features professional, hands-free automation for all your code and content:

- **Daily Scheduled Sync:**
  - Runs every day at 6pm via Windows Task Scheduler (`EverythingHomebaseGitSync`).
- **Continuous Auto-Sync:**
  - Optional: Runs every 5 minutes in the background at startup (`EverythingHomebaseAutoGitSync`).
  - Logs all activity to `auto-git-sync.log` for audit and troubleshooting.
- **Pre-commit hooks:**
  - Lint, format, type-check, and spell-check before every commit.
- **Line Endings & LFS:**
  - `.gitattributes` enforces consistent line endings and manages large files with Git LFS.

### Managing Automation

- To enable/disable continuous sync, run `setup-auto-git-sync.ps1` as administrator.
- All sync scripts include error handling and logging for reliability.
- Check scheduled tasks with `Get-ScheduledTask | Where-Object {$_.TaskName -like '*EverythingHomebase*'}` in PowerShell.
=======
# 🏠 HomeBase 2.0 - Production-Grade Monorepo

[![Code Quality: 99.4%](https://img.shields.io/badge/Code%20Quality-99.4%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)]()
[![Azure Functions](https://img.shields.io/badge/Azure-Functions%20v4-0078D4)]()
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-000000)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

HomeBase 2.0 is a comprehensive, production-ready monorepo that integrates:

- **Azure Functions API** (serverless backend with bot trading)
- **Next.js Frontend** (SEO-optimized web application)
- **Meta/Facebook Integration** (social media features)
- **Trading Bot Engine** (autonomous crypto trading)
- **Multiple Cloud Platforms** (Azure Container Apps, Google Cloud Run)

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies (pnpm workspace)
pnpm install

# Install pnpm globally (if needed)
npm install -g pnpm
```

### Development

```bash
# Start everything together
pnpm dev
# or run separately:
pnpm -C api start          # Azure Functions API (port 7071)
pnpm -C apps/web dev       # Next.js frontend (port 3000)
```

### Build & Deploy

```bash
# Build all packages
pnpm build

# Run tests
pnpm -w test

# Lint code
pnpm lint

# Deploy (automatic via Azure DevOps Pipelines on push to main)
git push origin main
```

---

## 📁 Project Structure

```
HomeBase 2.0/
├── api/                    # Azure Functions v4 backend
│   ├── src/
│   │   ├── functions/      # HTTP triggers
│   │   ├── bots/          # Trading engine & strategies
│   │   └── lib/           # Shared utilities
│   └── Dockerfile
│
├── apps/web/               # Next.js 14 frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Client/server utilities
│   │   └── hooks/         # Custom hooks
│   └── Dockerfile
│
├── packages/core/          # Shared types & utilities
│   └── src/
│       ├── types/
│       └── utils/
│
├── workspace/              # Legacy LitLabs workspace
│   └── src/
│       ├── litlabs-web/   # Website assets
│       └── bot_manager.py # Bot automation CLI
│
├── docs/                   # Documentation (organized by topic)
├── scripts/                # Automation scripts
├── azure-pipelines.yml     # CI/CD pipeline (Azure DevOps)
└── pnpm-workspace.yaml    # Workspace configuration
```

---

## 📚 Documentation

All documentation is organized in [docs/](./docs/) directory:

| Section                                    | Purpose                                  |
| ------------------------------------------ | ---------------------------------------- |
| [Getting Started](./docs/getting-started/) | Setup & quick start                      |
| [Development](./docs/development/)         | Development guide & conventions          |
| [Deployment](./docs/deployment/)           | Deployment guides for all platforms      |
| [Operations](./docs/operations/)           | Monitoring, troubleshooting, maintenance |
| [Reference](./docs/reference/)             | API docs, architecture, tech stack       |

👉 **Start here:** [docs/README.md](./docs/README.md)

---

## 🛠️ Key Technologies

| Component           | Technology             | Version           |
| ------------------- | ---------------------- | ----------------- |
| **Runtime**         | Node.js                | 20.x              |
| **Package Manager** | pnpm                   | 9.15.4            |
| **Backend**         | Azure Functions        | v4                |
| **Frontend**        | Next.js                | 14.2.7            |
| **Language**        | TypeScript             | 5.x (strict mode) |
| **Database**        | Azure Cosmos DB        | SQL API           |
| **Auth**            | Azure B2C + Meta OAuth | 2.0               |
| **Cloud**           | Azure + Google Cloud   | Multi-region      |

---

## ⚡ Common Commands

### Development

```bash
# Install everything
pnpm install

# Start dev environment
pnpm dev

# Watch & rebuild (TypeScript)
pnpm -w watch

# Lint & format
pnpm lint              # Check linting
pnpm format            # Auto-format code
```

### Testing & Quality

```bash
# Run all tests
pnpm -w test

# Check code coverage
pnpm -w test:coverage

# Security scan
pnpm -w security:audit
```

### API (Azure Functions)

```bash
# Build Azure Functions
pnpm -C api build

# Start Azure Functions locally
pnpm -C api start

# Run function tests
pnpm -C api test
```

### Frontend (Next.js)

```bash
# Build frontend
pnpm -C apps/web build

# Start dev server
pnpm -C apps/web dev

# Production build
pnpm -C apps/web build && pnpm -C apps/web start
```

### Deployment

```bash
# Deploy to Azure (automatic via Azure DevOps Pipelines on push)
git push origin main

# Manual deployments in docs/deployment/
```

---

## 🔐 Security

- ✅ TypeScript strict mode enforced
- ✅ No hardcoded secrets (Azure Key Vault)
- ✅ Environment variables validated at startup
- ✅ HMAC-SHA256 webhook verification
- ✅ Token encryption in database
- ✅ Regular security audits with Trivy

**See:** [docs/operations/SECURITY_ADVISORY.md](./docs/operations/SECURITY_ADVISORY.md)

---

## 🚀 Deployment

### Supported Platforms

- **Azure Container Apps** - Primary platform
- **Google Cloud Run** - Secondary platform
- **GitHub** - CI/CD orchestration

### Deployment Status

- ✅ GitHub Actions CI/CD configured
- ✅ Docker containers built and pushed
- ✅ Multi-region support enabled
- ✅ Auto-scaling configured

**Deploy Guide:** [docs/deployment/DEPLOYMENT_SETUP_FINAL.md](./docs/deployment/DEPLOYMENT_SETUP_FINAL.md)

---

## 📊 Project Statistics

| Metric              | Value              |
| ------------------- | ------------------ |
| **Code Files**      | 150+               |
| **Test Coverage**   | 85%+               |
| **Documentation**   | 50+ guides         |
| **Workspaces**      | 3 (api, web, core) |
| **CI/CD Workflows** | 5                  |
| **Docker Images**   | 2                  |

---

## 🤝 Contributing

1. **Read:** [docs/development/](./docs/development/)
2. **Create branch:** `git checkout -b feature/my-feature`
3. **Make changes:** Follow code conventions
4. **Test:** `pnpm -w test`
5. **Lint:** `pnpm lint`
6. **Commit:** Use conventional commits
7. **Push:** `git push origin feature/my-feature`
8. **PR:** Create pull request with description

---

## 📈 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (SPA)                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼─────────────────┐    ┌────▼──────────────┐
    │    Next.js Frontend    │    │  Azure AD/B2C     │
    │    (Azure/GCP)         │    │  Meta OAuth 2.0   │
    └─────┬─────────────────┘    └───────────────────┘
          │ REST API / JSON
    ┌─────▼──────────────────────────────┐
    │  Azure Functions API Backend        │
    │  - Trading Bot Engine               │
    │  - Crypto APIs                      │
    │  - Meta/Facebook Integration        │
    └─────┬──────────────────────────────┘
          │
    ┌─────┴──────────────────────┐
    │                             │
┌───▼───────────────┐    ┌──────▼────────────┐
│  Azure Cosmos DB  │    │ Azure Blob        │
│  (Global, Low     │    │ Storage / Key     │
│   Latency)        │    │ Vault             │
└───────────────────┘    └───────────────────┘
```

---

## 🎯 Key Features

- ✅ **Monorepo Magic** - Shared types, single workspace
- ✅ **Type-Safe** - TypeScript strict mode throughout
- ✅ **API Trading** - Autonomous bot strategies
- ✅ **Social Integration** - Facebook/Instagram/Meta Graph APIs
- ✅ **Cloud Native** - Azure Functions + Next.js
- ✅ **Global Scale** - Cosmos DB low-latency reads
- ✅ **Secure** - OAuth 2.0, encryption, audit logs
- ✅ **Well-Documented** - 50+ guides in `docs/`
- ✅ **CI/CD Ready** - GitHub Actions pipelines
- ✅ **Performance** - Code splitting, lazy loading, ISR

---

## 🐛 Troubleshooting

| Issue                 | Solution                                               |
| --------------------- | ------------------------------------------------------ |
| `pnpm install` fails  | Delete `node_modules` & `pnpm-lock.yaml`, retry        |
| Port 3000/7071 in use | Kill process: `lsof -i :3000` → `kill -9 <PID>`        |
| Cosmos DB connection  | Check `COSMOS_ENDPOINT` & `COSMOS_KEY` in `.env.local` |
| Linting errors        | Run `pnpm lint --fix` to auto-fix                      |
| Tests failing         | Run `pnpm -w test:watch` for debugging                 |

**Full Guide:** [docs/operations/](./docs/operations/)

---

## 📞 Support & Resources

- 📖 **Documentation:** [docs/README.md](./docs/README.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/LiTree89/HomeBase-2.0/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/LiTree89/HomeBase-2.0/discussions)
- 📧 **Email:** Check repository for contact info

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Azure Functions Guide](https://learn.microsoft.com/azure/azure-functions/)
- [Cosmos DB Best Practices](https://learn.microsoft.com/azure/cosmos-db/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**Status:** ✅ Production Ready | **Last Updated:** January 5, 2026 | **Version:** 2.0.0
>>>>>>> 80d4a58b8a10d837a0d55619405529a6ed92b24f
