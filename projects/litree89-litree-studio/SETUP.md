# 🚀 LiTreeStudio - Development Setup Guide

## Quick Start

### 1. **First Time Setup**
```powershell
# Navigate to project root
cd c:\Users\dying\LiTreeStudio

# Run the CLI script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\litree.ps1 dev-start

# Check project status
.\litree.ps1 proj-status
```

### 2. **Daily Development**
```powershell
# Start developing
.\litree.ps1

# See all available commands (automatically shown)
```

---

## 📋 Available CLI Commands

### Project Management
```powershell
.\litree.ps1 proj          # Navigate to project root
.\litree.ps1 proj-status   # Show project status (Node version, git status, dependencies)
.\litree.ps1 clean         # Clean build artifacts
```

### Development & Building
```powershell
.\litree.ps1 dev-start     # Install all Node dependencies
.\litree.ps1 build         # Build all projects
.\litree.ps1 func-start    # Start Azure Functions API (port 7071)
```

### Code Quality
```powershell
.\litree.ps1 lint          # Run ESLint (report issues)
.\litree.ps1 format        # Auto-format code with Prettier
.\litree.ps1 test-run      # Run test suite with coverage
```

### Deployment
```powershell
.\litree.ps1 swa-deploy    # Prepare for Azure Static Web Apps deployment
```

### Git Shortcuts
```powershell
.\litree.ps1 gs            # git status
.\litree.ps1 gp            # git push
.\litree.ps1 gl            # git log --oneline (last 10)
.\litree.ps1 ga <files>    # git add <files>
.\litree.ps1 gc <message>  # git commit -m <message>

# Examples:
.\litree.ps1 ga .
.\litree.ps1 gc "feat: add new feature"
```

---

## 🏗️ Project Structure

```
LiTreeStudio/
├── app/                    # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React Context (auth, etc)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── styles/        # CSS modules
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── api/                    # Azure Functions backend
│   ├── auth-signup.js
│   ├── auth-login.js
│   ├── copilot-prompt.js
│   ├── hello.js
│   ├── users.js
│   ├── package.json
│   └── host.json
│
├── litree.ps1             # Main CLI script (NEW)
├── .eslintrc.json         # ESLint configuration (NEW)
├── .prettierrc             # Prettier configuration (NEW)
├── jest.config.js         # Jest testing configuration (NEW)
├── jest.setup.js          # Jest setup file (NEW)
├── .babelrc               # Babel configuration (NEW)
│
├── package.json           # Root package.json (UPDATED)
├── server.js              # Node development server
└── .github/
    └── workflows/
        └── ci-cd.yml      # GitHub Actions pipeline (NEW)
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test
# Coverage report in: ./coverage/lcov-report/index.html
```

### Example Test File
Create `app/src/components/Button.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

---

## 📝 Code Quality Standards

### ESLint Rules
- ✅ No unused variables (warning)
- ✅ Semicolons required
- ✅ Double quotes preferred
- ✅ 2-space indentation
- ✅ No debugger in production code
- ✅ No console.log in production code

### Run Linting
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier Formatting
```bash
# Format entire project
npm run format

# Check formatting only
npm run format:check
```

---

## 🔧 Environment Setup

### Required Tools
- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **Git** (check: `git --version`)

### Recommended Tools
- **Visual Studio Code** (editor)
- **Azure Functions Core Tools** (for local Azure Functions)
- **Azure Static Web Apps CLI** (for local SWA testing)

### Install Azure Tools (Optional but Recommended)
```bash
# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli
```

---

## 🌐 Local Development

### 1. Start the Dev Environment
```bash
# Terminal 1 - Start frontend dev server
cd app
npm run dev
# ✓ Runs on http://localhost:5173

# Terminal 2 - Start backend API
cd api
npm start
# ✓ Runs on http://localhost:7071
```

### 2. Access the App
- **Frontend:** http://localhost:5173
- **API:** http://localhost:7071
- Vite proxies `/api/*` to Functions automatically

### 3. Test Sign-Up
1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Enter any email/password
4. Complete onboarding
5. Access Homebase dashboard

---

## 🚀 GitHub Actions CI/CD

### What It Does
On every push to `main` or `develop`:
1. ✅ Code quality checks (ESLint, Prettier, TypeScript)
2. ✅ Build all projects
3. ✅ Run test suite with coverage
4. ✅ Security scans (npm audit, Trivy)
5. 🚀 Deploy to Azure Static Web Apps (main branch only)

### Setup Deployment
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Get token from Azure Portal → Static Web App → Manage Deployment Token
3. Push to `main` branch - deployment automatic!

### Monitor Pipeline
- Go to repo → Actions tab
- See live build/test logs
- Click on workflow to see details

---

## 📚 Useful Commands Reference

### Frontend Development
```bash
cd app

npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run frontend tests
```

### Backend Development
```bash
cd api

npm start               # Start Azure Functions locally
npm test               # Run API tests (when available)
```

### Root Level
```bash
npm run install:all     # Install all dependencies
npm run build           # Build entire project
npm run test            # Run all tests
npm run start:all       # Start frontend + backend together
npm run clean           # Remove all build artifacts
```

---

## 🐛 Troubleshooting

### Issue: PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: npm ERR! code EACCES (Permission Denied)
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install:all
```

### Issue: Port Already in Use
```bash
# Find process on port 5173 (frontend)
Get-NetTCPConnection -LocalPort 5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port:
cd app
npm run dev -- --port 3000
```

### Issue: Build Fails After Changes
```bash
# Clean everything and rebuild
npm run clean
npm run install:all
npm run build
```

---

## 📊 Checking Code Coverage

```bash
npm run test
# Opens coverage report in browser automatically
# File: ./coverage/lcov-report/index.html
```

**Coverage Goals:**
- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

---

## 🔐 Security Best Practices

### Before Committing
```bash
# Run linter
npm run lint:fix

# Check formatting
npm run format

# Run tests
npm run test

# Check for security issues
npm audit
```

### Before Pushing
```bash
# Make sure everything builds
npm run build

# Verify tests pass
npm run test
```

---

## 📖 Next Steps

1. **Run setup:** `.\litree.ps1 dev-start`
2. **Check status:** `.\litree.ps1 proj-status`
3. **Start developing:** `cd app && npm run dev`
4. **Make changes** and test locally
5. **Commit & push** - GitHub Actions handles the rest!

---

## 🆘 Need Help?

- Check `PHASE1_IMPLEMENTATION.md` for feature details
- Check `FULL_IMPLEMENTATION_GUIDE.md` for roadmap
- Review `.github/workflows/ci-cd.yml` for what CI/CD does
- Read ESLint config in `.eslintrc.json` for code rules

---

**Happy coding! 🚀**
