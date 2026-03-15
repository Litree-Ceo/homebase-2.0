# ⚡ Quick Reference - HomeBase 2.0 Dev Setup

## 🎯 Current Status

✅ **Ready for Development**

- Frontend: http://localhost:3000
- API: http://localhost:7071/api
- Database: Cosmos DB (configured)

---

## 🚀 Quick Start Commands

```powershell
# Start everything
pnpm -w dev

# Or start separately
pnpm -C api start          # Terminal 1
pnpm -C apps/web dev       # Terminal 2

# Run tests
pnpm -w test

# Check code quality
pnpm lint
pnpm format

# Build for production
pnpm build
```

---

## 📂 Key Files to Know

| File                 | Purpose               |
| -------------------- | --------------------- |
| `apps/web/src/app/`  | Next.js pages         |
| `api/src/functions/` | API endpoints         |
| `api/src/bots/`      | Trading bot engine    |
| `.env.local`         | Environment variables |
| `tsconfig.json`      | TypeScript config     |

---

## 🔧 Troubleshooting

**Port in use?**

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found?**

```powershell
cd apps/web
rm -r node_modules .next
pnpm install
```

**TypeScript error?**

```powershell
pnpm -w build
pnpm -w tsc --noEmit
```

---

## 📚 Full Documentation

- **Full Summary:** [COMPREHENSIVE_SESSION_SUMMARY.md](./COMPREHENSIVE_SESSION_SUMMARY.md)
- **Project README:** [README.md](./README.md)
- **Security:** [SECURITY_ADVISORY.md](./SECURITY_ADVISORY.md)
- **Deployment:** [DEPLOYMENT_SETUP_FINAL.md](./DEPLOYMENT_SETUP_FINAL.md)
- **Dev Guide:** [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## ✅ What's Working

- ✅ Next.js frontend (port 3000)
- ✅ Azure Functions API (ready)
- ✅ Cosmos DB integration
- ✅ Meta/Facebook OAuth
- ✅ TypeScript strict mode
- ✅ ESLint & Prettier
- ✅ Git repository
- ✅ All dependencies installed

---

## 📊 Development Environment

```
Frontend:    Next.js 16.1.1 (TypeScript, React 18)
Backend:     Azure Functions v4 (Node.js 20)
Database:    Cosmos DB (SQL API)
Auth:        Azure B2C + Meta OAuth 2.0
Package Mgr: pnpm (v9.15.4)
Language:    TypeScript (strict mode)
```

---

**Last Updated:** January 5, 2026  
**Status:** ✅ Production Ready
