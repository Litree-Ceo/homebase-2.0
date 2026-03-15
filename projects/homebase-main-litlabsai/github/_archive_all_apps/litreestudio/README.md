# 📚 LiTreeStudio Documentation Index

## 🚀 Start Here

1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐ **START HERE**
   - All CLI commands in one place
   - Common workflows
   - What's new summary
   - ~5 min read

2. **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)**
   - What was installed
   - Getting started guide
   - Verification checklist
   - Troubleshooting
   - ~10 min read

## 📖 Detailed Documentation

### Development & Operations
- **[SETUP.md](./SETUP.md)** - Complete setup guide
  - Project structure
  - Testing configuration
  - Code quality standards
  - Environment setup
  - Local development
  - Security checklist
  - ~30 min read

### Product & Features
- **[FULL_IMPLEMENTATION_GUIDE.md](./FULL_IMPLEMENTATION_GUIDE.md)** - Master blueprint
  - All 5 phases (MVP through Expansion)
  - Features breakdown
  - Architecture evolution
  - Data models (PostgreSQL)
  - Deployment strategy
  - Success metrics
  - ~45 min read

- **[PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md)** - Phase 1 deep dive
  - Component details
  - API endpoints
  - Design system
  - User flows
  - Known limitations
  - Code examples
  - ~40 min read

## 🔧 Configuration Files

- **.eslintrc.json** - Code quality rules (ESLint)
- **.prettierrc** - Code formatting (Prettier)
- **jest.config.js** - Testing framework (Jest)
- **jest.setup.js** - Jest setup
- **.babelrc** - Code transpilation
- **.github/workflows/ci-cd.yml** - GitHub Actions pipeline

## 🎮 CLI Reference

### Main Script: `litree.ps1`

**Project Management**
```powershell
.\litree.ps1                    # Show menu
.\litree.ps1 help              # Show menu
.\litree.ps1 proj              # Navigate to project
.\litree.ps1 proj-status       # Check project health
.\litree.ps1 clean             # Remove build artifacts
```

**Development**
```powershell
.\litree.ps1 dev-start         # Install all dependencies
.\litree.ps1 build             # Build entire project
.\litree.ps1 func-start        # Start Azure Functions API
```

**Code Quality**
```powershell
.\litree.ps1 lint              # Run ESLint
.\litree.ps1 format            # Auto-format code
.\litree.ps1 test-run          # Run test suite
```

**Deployment**
```powershell
.\litree.ps1 swa-deploy        # Deploy to Azure
```

**Git Shortcuts**
```powershell
.\litree.ps1 gs                # git status
.\litree.ps1 gp                # git push
.\litree.ps1 gl                # git log (last 10)
.\litree.ps1 ga <files>        # git add
.\litree.ps1 gc <message>      # git commit
```

## 📦 npm Scripts

In root package.json:

```bash
npm run install:all            # Install all dependencies
npm run build                  # Build all projects
npm run dev                    # Start frontend dev server
npm run api:start              # Start API
npm run test                   # Run tests with coverage
npm run test:watch             # Watch mode testing
npm run lint                   # Check code quality
npm run lint:fix               # Auto-fix code
npm run format                 # Format code
npm run format:check           # Check formatting
npm run type-check             # TypeScript checking
npm run start:all              # Run frontend + API together
npm run clean                  # Clean build artifacts
```

## 🏗️ Project Structure

```
LiTreeStudio/
├── app/                        # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # UI components
│   │   ├── contexts/          # React Context
│   │   ├── hooks/             # Custom hooks
│   │   └── styles/            # CSS modules
│   ├── package.json
│   └── vite.config.js
│
├── api/                        # Azure Functions backend
│   ├── auth-*.js              # Auth endpoints
│   ├── copilot-*.js           # Copilot endpoint
│   ├── package.json
│   └── host.json
│
├── Documentation/
│   ├── QUICK_REFERENCE.md     # Quick commands
│   ├── SETUP_COMPLETE.md      # Installation summary
│   ├── SETUP.md               # Detailed guide
│   ├── FULL_IMPLEMENTATION_GUIDE.md  # Phases 1-5
│   └── PHASE1_IMPLEMENTATION.md      # Phase 1 specs
│
├── Configuration/
│   ├── litree.ps1             # CLI script
│   ├── .eslintrc.json         # ESLint rules
│   ├── .prettierrc             # Prettier rules
│   ├── jest.config.js         # Jest config
│   ├── .babelrc               # Babel config
│   └── .gitlab-ci.yml         # GitLab CI/CD
│
└── package.json               # Root package.json
```

## 🚀 Quick Start

### First Time
```powershell
cd c:\Users\dying\LiTreeStudio
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\litree.ps1 dev-start
```

### Daily Development
```powershell
# Terminal 1: Frontend
cd app && npm run dev
# Opens http://localhost:5173

# Terminal 2: Backend
cd api && npm start
# Runs on http://localhost:7071

# Terminal 3: Commands
cd c:\Users\dying\LiTreeStudio
.\litree.ps1 lint
.\litree.ps1 format
.\litree.ps1 test-run
```

### Before Pushing
```powershell
.\litree.ps1 lint      # Check code
.\litree.ps1 format    # Auto-fix
.\litree.ps1 test-run  # Run tests
.\litree.ps1 ga .      # Stage all
.\litree.ps1 gc "msg"  # Commit
.\litree.ps1 gp        # Push → Auto-deploys to Azure!
```

## 🧪 Testing

### Run Tests
```bash
npm run test           # Run once with coverage
npm run test:watch    # Watch mode
```

### Coverage Reports
After running tests, open:
```
./coverage/lcov-report/index.html
```

### Example Test
```jsx
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders text", () => {
    render(<MyComponent />);
    expect(screen.getByText("text")).toBeInTheDocument();
  });
});
```

## 🔒 Security

### Before Committing
```bash
npm run lint              # Check code quality
npm run format           # Auto-fix formatting
npm run type-check       # Check types
npm run test             # Run tests
npm audit                # Check dependencies
```

### Automatic (via GitLab CI/CD)
- ESLint and Prettier checks
- Build verification
- Test execution
- Security scanning (Trivy)
- npm audit analysis

## 📊 GitLab CI/CD

Automatic on every push:

1. **Code Quality** - ESLint, Prettier, TypeScript
2. **Build** - Compile all projects
3. **Tests** - Run Jest with coverage
4. **Security** - npm audit, Trivy scan
5. **Deploy** - Push to production (main branch only)

Monitor: **GitLab → CI/CD → Pipelines**

## 🎯 Phases

### Phase 1: MVP ✅ Complete
- Authentication & signup
- Onboarding wizard
- Homebase dashboard
- Copilot v1 (mock responses)
- Global navigation
- Explore page
- Responsive design

**Read:** [PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md)

### Phase 2: Community 🚧 Next
- Guilds and forums
- Posts and feeds
- Missions and gamification
- Creator studio
- Chat and voice

### Phase 3: Immersion 🔮
- 3D worlds and rooms
- Media platform
- LITBIT wallet
- Advanced analytics

### Phase 4: Economy 🏛️
- Marketplace
- Trading system
- Staking and yields
- DAO governance

### Phase 5: Expansion 🚀
- Grok API integration
- Developer ecosystem
- Plugin marketplace
- Advanced automation

**Read:** [FULL_IMPLEMENTATION_GUIDE.md](./FULL_IMPLEMENTATION_GUIDE.md)

## 🔍 Finding Information

| I want to... | Read this |
|---|---|
| Know available commands | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Set up my dev environment | [SETUP.md](./SETUP.md) |
| Understand what was installed | [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) |
| See the product roadmap | [FULL_IMPLEMENTATION_GUIDE.md](./FULL_IMPLEMENTATION_GUIDE.md) |
| Learn Phase 1 details | [PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md) |
| See code quality rules | `.eslintrc.json` |
| Check testing setup | `jest.config.js` |
| Understand CI/CD | `.github/workflows/ci-cd.yml` |

## 💬 FAQ

**Q: How do I start developing?**  
A: Run `.\litree.ps1 dev-start`, then `cd app && npm run dev`

**Q: How do I run tests?**  
A: `npm run test` or `npm run test:watch`

**Q: How do I check code quality?**  
A: `.\litree.ps1 lint` to check, `.\litree.ps1 format` to fix

**Q: How do I deploy?**  
A: Push to `main` branch - GitHub Actions handles it automatically!

**Q: Where are API endpoints?**  
A: In `api/` folder - `auth-*.js`, `copilot-*.js`

**Q: How do I add a new component?**  
A: Create file in `app/src/components/`, import in `App.jsx`

**Q: How do I build for production?**  
A: `npm run build` - creates `app/dist/` folder

**Q: Can I use TypeScript?**  
A: Yes! Rename `.jsx` to `.tsx` and add types

## 🆘 Need Help?

1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands
2. Read [SETUP.md](./SETUP.md) for detailed setup
3. Review [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for troubleshooting
4. See [FULL_IMPLEMENTATION_GUIDE.md](./FULL_IMPLEMENTATION_GUIDE.md) for features

## ✨ What's Next?

1. Run `.\litree.ps1 dev-start`
2. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Start `cd app && npm run dev`
4. Make changes and commit with `.\litree.ps1 gc "message"`
5. Push with `.\litree.ps1 gp` - auto-deploys!

---

**Happy coding! 🚀**

*LiTreeStudio - Phase 1 Complete. Phases 2-5 Ready to Build.*
