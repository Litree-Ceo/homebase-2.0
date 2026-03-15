# 🎮 LiTreeStudio CLI - Quick Reference

## Installation (One-Time Setup)

```powershell
# Allow scripts to run
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Go to project
cd c:\Users\dying\LiTreeStudio

# Install everything
.\litree.ps1 dev-start
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `.\litree.ps1` | Show menu |
| `.\litree.ps1 proj` | Go to project root |
| `.\litree.ps1 dev-start` | Install all dependencies |
| `.\litree.ps1 build` | Build entire project |
| `.\litree.ps1 func-start` | Start Azure Functions API |
| `.\litree.ps1 test-run` | Run test suite |
| `.\litree.ps1 lint` | Check code quality |
| `.\litree.ps1 format` | Auto-fix code |
| `.\litree.ps1 proj-status` | See project health |
| `.\litree.ps1 swa-deploy` | Prepare for Azure deployment |

## Git Shortcuts

| Command | Equivalent |
|---------|-----------|
| `.\litree.ps1 gs` | `git status` |
| `.\litree.ps1 gp` | `git push` |
| `.\litree.ps1 gl` | `git log --oneline -10` |
| `.\litree.ps1 ga .` | `git add .` |
| `.\litree.ps1 gc "message"` | `git commit -m "message"` |

## Development Workflow

```powershell
# 1. Check status
.\litree.ps1 proj-status

# 2. Make code changes
# (edit files in VS Code)

# 3. Check quality before committing
.\litree.ps1 lint       # Find issues
.\litree.ps1 format     # Auto-fix formatting

# 4. Run tests
.\litree.ps1 test-run

# 5. Commit changes
.\litree.ps1 ga .
.\litree.ps1 gc "feat: add new feature"

# 6. Push to GitHub
.\litree.ps1 gp
# → GitHub Actions runs automatically!
```

## Detailed Setup

See [SETUP.md](./SETUP.md) for complete documentation including:
- ✅ Project structure
- ✅ Testing configuration  
- ✅ Code quality standards
- ✅ Environment setup
- ✅ Troubleshooting

## What's New

✨ **These files were added for you:**

- `litree.ps1` - Master CLI script (all your commands)
- `.eslintrc.json` - Code quality rules
- `.prettierrc` - Code formatting rules
- `jest.config.js` - Testing configuration
- `.babelrc` - Babel transpiler config
- `.github/workflows/ci-cd.yml` - Automatic GitHub Actions pipeline
- `SETUP.md` - Complete setup guide
- `QUICK_REFERENCE.md` - This file!

## npm Scripts (For Developers)

```bash
npm run install:all       # Install all dependencies
npm run build            # Build all projects
npm run dev              # Start development (frontend)
npm run api:start        # Start API

npm run test             # Run tests with coverage
npm run test:watch       # Run tests (watch mode)
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix code
npm run format           # Format code
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
npm run start:all        # Run frontend + API together
npm run clean            # Clean build artifacts
```

## GitHub Actions (Automatic)

Every push triggers:
1. ✅ Code quality checks (ESLint, Prettier)
2. ✅ Build test
3. ✅ Unit tests + coverage
4. ✅ Security scan
5. 🚀 Deploy to Azure (main branch only)

Monitor at: **GitHub → Actions tab**

## 🚀 Next Steps

1. `.\litree.ps1 dev-start` - Install dependencies
2. `cd app && npm run dev` - Start frontend on http://localhost:5173
3. `cd api && npm start` - Start API on http://localhost:7071
4. Make changes and commit with `.\litree.ps1 gc "message"`
5. Push with `.\litree.ps1 gp` - auto-deploy to Azure!

---

**Need more help?** Read [SETUP.md](./SETUP.md) for complete documentation.
