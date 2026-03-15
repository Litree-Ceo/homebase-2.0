# Getting Started Guide

Welcome to HomeBase 2.0! This section contains everything you need to get up and running.

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/LiTree89/HomeBase-2.0.git
cd HomeBase-2.0

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start development
pnpm dev
```

You're done! Open:

- Frontend: http://localhost:3000
- API: http://localhost:7071

## Setup Guides

- **START_HERE.md** - Initial project walkthrough
- **Development environment setup** - Detailed local setup
- **Environment variables** - Complete .env reference

## Architecture Overview

HomeBase 2.0 is organized as a pnpm monorepo with:

**Packages:**

- `api/` - Azure Functions backend
- `apps/web/` - Next.js frontend
- `packages/core/` - Shared utilities

**Key Integrations:**

- Meta/Facebook OAuth and Graph API
- Azure Cosmos DB for data
- Trading bot engine with multiple strategies

## Next Steps

1. **Read:** [START_HERE.md](./START_HERE.md)
2. **Review:** [docs/development/](../development/) for conventions
3. **Explore:** The [api/](../../api/) and [apps/web/](../../apps/web/) directories
4. **Deploy:** Check [docs/deployment/](../deployment/) when ready

---

**New to monorepos?** pnpm uses workspaces to manage multiple packages. Learn more at [pnpm.io/workspaces](https://pnpm.io/workspaces)
