# 🚀 GETTING STARTED: LITLAB Development Environment

**Quick Setup Guide for Windows 11**

---

## Phase 1: Install Prerequisites (5 minutes)

### Step 1: Open PowerShell as Administrator

```powershell
# Press Win+X, select "Windows PowerShell (Admin)"
```

### Step 2: Run Installation Script

```powershell
cd "e:\VSCode\HomeBase 2.0"
.\setup-litlab-homebase.ps1
```

**What This Installs**:
- ✅ VS Code 1.107+
- ✅ Git 2.52+
- ✅ Node.js LTS (20.x)
- ✅ Azure CLI
- ✅ Azure Functions Core Tools
- ✅ pnpm (package manager)
- ✅ 11 VS Code extensions (Copilot, GitLens, ESLint, Prettier, Azure tools)

**Expected Output**:
```
✓ VS Code 1.107.2 installed
✓ Git 2.52.0 installed
✓ Node 20.18.1 installed
✓ Azure CLI 2.70.0 installed
✓ 11 extensions installed
```

**If Installation Hangs**: Press Ctrl+C and re-run the script. It's idempotent (safe to re-run).

---

## Phase 2: Create Repository (2 minutes)

### Option A: New Repository

```powershell
.\new-litlab-bootstrap.ps1 -RepoName "litlab-prod"
```

This creates:
```
litlab-prod/
├── apps/
│   └── web/          # Next.js/React frontend
├── packages/
│   ├── api/          # Azure Functions backend
│   └── core/         # Shared utilities
├── functions/        # Additional Azure Functions
├── .github/
│   └── workflows/    # CI/CD (GitHub Actions)
├── .vscode/          # VS Code config
├── package.json      # Root workspace
└── pnpm-workspace.yaml
```

### Option B: Existing Repository

If you already have the repo cloned, skip to Phase 3.

---

## Phase 3: Configure Environment Variables (2 minutes)

### Step 1: Copy Environment Templates

```powershell
cd "e:\VSCode\HomeBase 2.0\apps\web"
Copy-Item .env.example .env.local
```

```powershell
cd "..\..\\packages\api"
Copy-Item .env.example .env.local
```

### Step 2: Fill in Secrets

**apps/web/.env.local**:
```env
# Get these from Azure Portal
COSMOS_ENDPOINT=https://YOUR-ACCOUNT.documents.azure.com:443/
COSMOS_KEY=YOUR-PRIMARY-KEY

# Local development
API_BASE_URL=http://localhost:7071

# For payments (if using Stripe)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY

# For authentication
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=YOUR_CLIENT_ID
NEXT_PUBLIC_AZURE_AD_TENANT_ID=YOUR_TENANT_ID
```

**packages/api/.env.local** (same as above plus):
```env
JWT_SECRET=your-random-secret-key
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

**Where to Find Credentials**:

| Service | Location |
|---------|----------|
| Cosmos DB | Azure Portal → Cosmos DB Account → Keys |
| Storage Account | Azure Portal → Storage Account → Access Keys |
| Azure AD | Azure Portal → App Registrations → Your App |
| Stripe | https://dashboard.stripe.com → API Keys |

---

## Phase 4: Boot Development Environment (1 minute)

```powershell
cd "e:\VSCode\HomeBase 2.0"
.\litlab-first-run.ps1
```

**Expected Output**:
```
✓ Dependencies installed
✓ API starting on http://localhost:7071
✓ Web starting on http://localhost:3000
✓ Copilot ready for coding
```

**Two PowerShell windows will open**:
1. **API Server** (Azure Functions) - http://localhost:7071
2. **Web Server** (Next.js) - http://localhost:3000

---

## Phase 5: Open in VS Code (1 minute)

```powershell
code e:\VSCode\HomeBase 2.0
```

Or use VS Code UI:
1. File → Open Folder
2. Select `e:\VSCode\HomeBase 2.0`
3. Wait for Extensions to load (30 seconds)
4. See "Recommended Extensions" notification → Install

---

## ✅ Verification Checklist

- [ ] Two terminal windows open (API + Web)
- [ ] Browser shows http://localhost:3000
- [ ] VS Code opens without errors
- [ ] "GitHub Copilot" extension shows as installed
- [ ] `.vscode/mcp.json` is recognized (blue icon in Explorer)

---

## 🤖 Using Copilot

### Generate a New API Endpoint

1. **Open Copilot Chat**: Ctrl+Shift+I
2. **Copy prompt from** [.github/copilot-seeds.md](.github/copilot-seeds.md)
3. **Paste** in Copilot Chat:

```
@workspace Generate New API Endpoint

Create a GET /api/users endpoint that:
- Queries the 'users' container in Cosmos DB
- Filters by status (active/inactive)
- Validates JWT token
- Returns paginated results with count
```

4. **Copilot generates**:
   - Handler function
   - Validation logic
   - Error handling
   - JSDoc comments
   - Unit tests

5. **Copy → Paste** into your project and adapt

### Debug a Failed Request

1. **Copy error** or stack trace
2. **Open Copilot Chat**: Ctrl+Shift+I
3. **Paste**:

```
@debugger Debug this error

[paste error message]

It happened when calling GET /api/items
Environment: local development
Steps: Open http://localhost:3000, click "Load Items" button
```

4. **Copilot suggests**:
   - Root cause
   - Step-by-step fix
   - Code changes needed
   - Test verification

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `apps/web/src/lib/cosmos.ts` | 🗄️ Database wrapper (copy for backend) |
| `apps/web/src/app/api/items/route.ts` | 🔌 API route example (copy pattern) |
| `.github/copilot-seeds.md` | 🌱 Copilot prompt library (use for all patterns) |
| `.env.local` | 🔑 Your local secrets (never commit) |
| `package.json` | 📦 Root workspace config |
| `.github/workflows/ci-cd.yml` | 🚀 Auto deployment pipeline |

---

## 🔧 Common Commands

```bash
# Install dependencies
pnpm install

# Start development (use litlab-first-run.ps1 instead)
pnpm -w run dev

# Build for production
pnpm -w run build

# Run tests
pnpm -w test

# Lint code
pnpm -w lint

# Format code
pnpm -w format
```

---

## 🆘 Troubleshooting

### "Node version mismatch"
```powershell
node --version  # Should be 20.x or higher
```
If not, re-run `.\setup-litlab-homebase.ps1`

### "Cosmos DB connection failed"
1. Check `.env.local` has correct `COSMOS_ENDPOINT` and `COSMOS_KEY`
2. Verify Cosmos DB account is accessible from your IP
3. Check firewall rules in Azure Portal

### "Port 7071 already in use"
```powershell
netstat -ano | findstr :7071  # Find process ID
taskkill /PID <PID> /F        # Kill process
.\litlab-first-run.ps1        # Restart
```

### "Copilot extensions not loading"
1. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"
2. Check: Extensions → GitHub Copilot (should show ✓)
3. Re-run: `.\setup-litlab-homebase.ps1`

### "npm install fails"
```powershell
# Clear cache and retry
pnpm store prune
pnpm install
```

---

## 📚 Learn More

- **Cosmos DB**: [Learn Module](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- **Next.js**: [Docs](https://nextjs.org/docs)
- **Azure Functions**: [Docs](https://learn.microsoft.com/en-us/azure/azure-functions/)
- **GitHub Copilot**: [Tips & Tricks](https://github.com/features/copilot)
- **pnpm Monorepo**: [Guide](https://pnpm.io/workspaces)

---

## 🎯 Next Steps

1. ✅ Run setup script (Phase 1)
2. ✅ Create/verify repo structure (Phase 2)
3. ✅ Configure `.env.local` (Phase 3)
4. ✅ Boot development servers (Phase 4)
5. 👉 **Open `.github/copilot-seeds.md`** and start building!

---

## 💬 Example: Add a Comments Feature

Using Copilot to scaffold the full feature:

### 1. Open Copilot Chat
```
Ctrl+Shift+I
```

### 2. Paste this prompt (from `copilot-seeds.md`):

```
@workspace Scaffold Full Feature

Create a comments feature:
- API: GET/POST /api/comments (Cosmos DB container)
- React component: CommentsList.tsx with form
- Validation: Required fields (content, postId)
- Real-time updates via WebSockets (if SignalR available)
- Tests: Unit + integration for auth flow
- Documentation: JSDoc comments
```

### 3. Copilot generates all files:
- `apps/web/src/components/CommentsList.tsx`
- `apps/web/src/app/api/comments/route.ts`
- `packages/api/functions/comments/index.js`
- `apps/web/__tests__/CommentsList.test.ts`
- `README.md` with usage examples

### 4. Copy → Paste → Run tests → Done!

---

## 📞 Getting Help

**For Errors**:
1. Read: [BLUEPRINT_IMPLEMENTATION_COMPLETE.md](BLUEPRINT_IMPLEMENTATION_COMPLETE.md) → Troubleshooting section
2. Search: `copilot-seeds.md` for matching error pattern
3. Use: Copilot Chat with `@debugger` prompt (paste your error)

**For Features**:
1. Open: `.github/copilot-seeds.md`
2. Find: Matching @workspace prompt
3. Copy → Paste into Copilot Chat
4. Customize and generate code

---

## ✍️ Quick Reference

| Task | Command | Time |
|------|---------|------|
| Install tools | `.\setup-litlab-homebase.ps1` | 5 min |
| Create repo | `.\new-litlab-bootstrap.ps1` | 2 min |
| Configure secrets | Edit `.env.local` | 2 min |
| Start development | `.\litlab-first-run.ps1` | 1 min |
| Generate endpoint | Use `copilot-seeds.md` | 2 min |
| Deploy | `git push origin main` | CI/CD |

---

**You're now ready to develop with LITLAB!**

Start with [.github/copilot-seeds.md](.github/copilot-seeds.md) and build amazing features.

**Questions?** See [BLUEPRINT_IMPLEMENTATION_COMPLETE.md](BLUEPRINT_IMPLEMENTATION_COMPLETE.md) for detailed guide.

Good luck! 🎉

