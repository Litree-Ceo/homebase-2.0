# 🏠 HomeBase 2.0 - Production-Grade Development Platform

[![Code Quality](https://img.shields.io/badge/Code%20Quality-99.4%25-brightgreen)](https://github.com/LiTree89/HomeBase-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

HomeBase 2.0 is a comprehensive development platform that integrates multiple applications, services, and tools into a unified workspace.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- pnpm 9.x (recommended) or npm
- Git with LFS support

### Installation
```bash
# Clone the repository
git clone https://github.com/LiTree89/HomeBase-2.0.git
cd homebase-2.0

# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

---

## 📁 Project Structure

```
HomeBase-2.0/
├── github/                 # Main development workspace
│   ├── api/               # Azure Functions backend
│   ├── apps/              # Application modules
│   │   ├── web/           # Main web application
│   │   ├── litlabs-web/   # Web platform
│   │   ├── litree-unified/ Unified dashboard
│   │   ├── labs-ai/       # AI platform
│   │   ├── agent-zero/    # AI Agent with Web API
│   │   └── ...
│   ├── docs/              # Comprehensive documentation
│   ├── scripts/           # Automation scripts
│   └── packages/          # Shared packages
├── litlabs/               # Next.js application
├── docs/                  # Documentation site
├── agent-zero/           # AI Development Assistant
├── openclaw/             # Code Intelligence
└── scripts/              # Automation scripts
```

---

## 🌐 Applications

| App | Port | Description | Status |
|-----|------|-------------|--------|
| **Main Web** | 3000 | Primary web application | ✅ Ready |
| **Litlabs** | 3001 | Creative platform | ✅ Ready |
| **Litree Unified** | 3002 | Unified dashboard | ✅ Ready |
| **Agent Zero** | 8000 | AI Agent API | ✅ Ready |
| **OpenClaw** | 18789 | Code Intelligence | ✅ Ready |

---

## 🛠️ Development Commands

### Core Commands
```bash
# Development
pnpm dev                   # Start all development servers
pnpm build                 # Build all projects
pnpm test                  # Run all tests
pnpm lint                  # Lint all code

# Specific Projects
pnpm -C github/api start   # Azure Functions API
pnpm -C litlabs dev        # Next.js application
pnpm -C github/apps/web dev # Main web app
```

### Available Commands
```powershell
pnpm dev:web         # Start main web app
pnpm dev:litlabs     # Start litlabs
pnpm dev:agent-zero  # Start Agent Zero Docker
pnpm start:all       # Start ALL servers

pnpm build           # Build main projects
pnpm build:all       # Build everything
pnpm build:agent-zero # Build Agent Zero Docker

pnpm sync:git        # Sync all remotes
pnpm sync:git:push   # Push to all platforms
pnpm sync:git:pull   # Pull from all platforms

pnpm agent-zero:start  # Start Agent Zero
pnpm openclaw:start    # Start OpenClaw
pnpm cleanup           # Clean temp files
pnpm doctor            # Run diagnostics
```

---

## 🏗️ Architecture

### Core Technologies
- **Frontend**: Next.js 14+, React, TypeScript
- **Backend**: Azure Functions, Node.js
- **Database**: Azure Cosmos DB, Firebase
- **Cloud**: Azure, Google Cloud Platform
- **AI/ML**: OpenAI, Azure Cognitive Services
- **DevOps**: GitHub Actions, Azure DevOps

### Key Features
- ✅ **Monorepo Structure** - Unified workspace management
- ✅ **TypeScript First** - Type-safe development
- ✅ **AI Integration** - Multiple AI service providers
- ✅ **Cloud Native** - Multi-cloud deployment ready
- ✅ **Automated Workflows** - CI/CD and git automation
- ✅ **Comprehensive Documentation** - 50+ guides and references

---

## 🤖 AI & Automation

### Integrated AI Services
- **OpenAI GPT** - Text generation and analysis
- **Azure Cognitive Services** - Vision and speech
- **Custom Agents** - Specialized task automation

### Automation Features
- **Auto Git Sync** - Scheduled repository synchronization
- **Code Quality** - Automated linting and formatting
- **Deployment** - CI/CD pipeline automation
- **Monitoring** - Health checks and alerts

---

## 🌐 Multi-Platform Git

Sync your code across GitHub, GitLab, and Azure DevOps:

```powershell
# Check status
.\Unified-Git-Sync.ps1 -Status

# Push to all platforms
.\Unified-Git-Sync.ps1 -Push -Message "Update"

# Pull from all
.\Unified-Git-Sync.ps1 -Pull
```

---

## 🔧 Configuration

### Environment Setup
1. Copy environment templates:
   ```bash
   cp github/.env.example github/.env.local
   cp litlabs/.env.local.example litlabs/.env.local
   ```

2. Configure required services:
   - Azure subscription and resource groups
   - Firebase project setup
   - API keys for external services

3. Run setup script:
   ```bash
   # Windows
   .\github\scripts\Setup-DevEnvironment.ps1
   
   # Linux/macOS
   ./github/scripts/setup.sh
   ```

---

## 🚀 Deployment

### Supported Platforms
- **Azure Container Apps** - Primary deployment target
- **Google Cloud Run** - Secondary platform
- **Vercel/Netlify** - Frontend deployments
- **GitHub Pages** - Documentation hosting

### Quick Deploy
```bash
# Automated deployment (requires setup)
git push origin main  # Triggers CI/CD pipeline

# Manual deployment
pnpm build
pnpm deploy
```

---

## 📝 Documentation

- [Quick Start Guide](QUICK_START.md)
- [Git Sync Guide](GIT-SYNC-README.md)
- [Agent Zero Setup](github/apps/agent-zero/AGENT_ZERO_SETUP.md)
- [OpenClaw Setup](OPENCLAW_SETUP.md)
- [Architecture Overview](TRAE_ARCHITECTURE.md)

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript 5
- **Styling**: Tailwind CSS, CSS Modules
- **Backend**: Azure Functions, Node.js
- **AI**: OpenAI, Anthropic, Google AI
- **Database**: Firebase, Azure Cosmos DB
- **DevOps**: Docker, GitHub Actions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

---

## 📊 Project Stats

- **Languages**: TypeScript, JavaScript, Python, PowerShell
- **Frameworks**: Next.js, React, Azure Functions
- **Cloud Providers**: Azure, Google Cloud, Firebase
- **Documentation**: 50+ guides and references
- **Automation Scripts**: 30+ PowerShell and shell scripts

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies and cloud platforms
- Inspired by best practices from the developer community
- Powered by AI and automation tools

---

**Status**: ✅ Production Ready | **Version**: 2.0.0 | **Last Updated**: January 2026

For detailed setup instructions, see [github/docs/getting-started/](github/docs/getting-started/)