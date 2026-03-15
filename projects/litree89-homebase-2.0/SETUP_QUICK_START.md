# 🚀 Quick Start Guide

## First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env.local
cp .env.production.example .env.production

# 3. Add your Paddle API credentials to .env files
# Edit .env.local and .env.production with your keys
```

## Development Mode

```bash
# Start everything (Web + API)
pnpm dev

# OR run separately:
# Terminal 1 - Web (port 3000)
pnpm -C apps/web dev

# Terminal 2 - API (port 7071)
pnpm -C api start
```

## Project Structure

```
HomeBase 2.0/
├── 🏠 Root              Main configuration & entry point
├── 📁 api/              Azure Functions backend (Node.js/TypeScript)
├── 📁 apps/
│   └── web/             Next.js 14+ frontend (React)
├── 📁 packages/         Shared utilities
├── 📁 workspace/        Extended projects & workspace resources
├── 📁 docs/             Documentation
└── 📁 functions/        Azure Functions definitions
```

## Key Endpoints

### Web App

- **Development**: http://localhost:3000
- **Production**: Deploy to Azure via CI/CD

### API Backend

- **Local**: http://localhost:7071
- **Endpoints**: `/api/*` (see API documentation)

## Payment Integration (Paddle)

All payment handling is done through Paddle:

- **Checkout**: `apps/web/src/components/Checkout.jsx`
- **Subscriptions**: `apps/web/src/components/SubscriptionManager.jsx`
- **API Webhook**: `api/src/functions/paddle.ts`

### Setting up Paddle

1. Sign up at [paddle.com](https://paddle.com)
2. Create an API key
3. Add to `.env.local`:
   ```
   PADDLE_API_KEY=your_key_here
   PADDLE_WEBHOOK_SECRET=your_secret_here
   ```
4. Test with Paddle's sandbox mode

## VS Code Setup

Open `HomeBase.code-workspace` for optimized development with:

- ✅ Multi-root workspace
- ✅ Recommended extensions
- ✅ Optimized settings
- ✅ Launch configurations

## Common Commands

```bash
# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Clean cache & node_modules
pnpm clean
```

## Troubleshooting

### Port Already in Use

```bash
# Change port for web
PORT=3001 pnpm -C apps/web dev

# Azure Functions use different approach
# Edit api/local.settings.json
```

### Dependency Issues

```bash
# Reinstall everything
pnpm install --force
pnpm build
```

### Environment Variables Not Loaded

```bash
# Make sure files exist in root:
# .env.local, .env.production

# Check they contain required variables:
# PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET, etc.
```

## Documentation

- **Root README**: [README.md](README.md) - Overview
- **Workspace**: [workspace/README.md](workspace/README.md) - Extended projects
- **More Docs**: [docs/](docs/) - Technical documentation

## Need Help?

1. Check the docs/ folder
2. Review example .env files
3. Check component READMEs in apps/ and packages/

---

**Happy Coding! 🎉**
