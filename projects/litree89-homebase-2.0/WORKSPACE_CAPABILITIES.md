# 🏠 HomeBase 2.0 Workspace Capabilities

## 🎨 Theme & Design System

### Honeycomb Theme (Purple, Black, Gold)

Your workspace now features a **premium honeycomb-themed design** with:

- **Black Base**: `#0a0a0a` - Deep, immersive background
- **Purple Gradient**: `#1a0033` (dark) → `#a855f7` (light) - Elegant depth and energy
- **Gold Accents**: `#fbbf24` (main) → `#fcd34d` (bright) - Premium highlights

### Tailwind Configuration

Located at: `apps/web/tailwind.config.js`

Available color utilities:

```css
/* Use these in your components */
bg-honeycomb-black
bg-honeycomb-darkPurple
bg-honeycomb-purple
bg-honeycomb-lightPurple
text-honeycomb-gold
text-honeycomb-brightGold
```

### CSS Classes Available

Located at: `apps/web/src/globals.css`

- `.honeycomb-bg` - Full honeycomb gradient background
- `.honeycomb-glow` - Purple & gold glow effect
- `.honeycomb-border` - Gold border styling
- `.honeycomb-accent` - Gold text color
- `.honeycomb-text` - Gradient text (purple → gold)
- `.honeycomb-grid` - Responsive honeycomb grid layout
- `.honeycomb-cell` - Individual cell with hover effects & shimmer
- `.honeycomb-float` - Floating animation
- `.honeycomb-pulse` - Pulsing glow animation

---

## 🚀 Development Environment

### Core Applications

#### 1. **Frontend Web App** (`apps/web`)

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Status**: Ready to develop
- **Dev Command**: `pnpm -C apps/web dev`

#### 2. **API Backend** (`api`)

- **Framework**: Azure Functions (Node.js)
- **Type**: TypeScript
- **Status**: Production-ready
- **Dev Command**: `pnpm -C api start`

#### 3. **Bot Engine** (`api/src/bots`)

- Cryptocurrency trading bot
- Market data integration
- Paper trading & live trading
- Multiple exchange support (Binance, Coinbase, etc.)

---

## 📋 Available Tasks

### Auto-Start & Development

| Task                   | Command                          | Purpose                               |
| ---------------------- | -------------------------------- | ------------------------------------- |
| **Auto-Start Dev Env** | `🔥 Auto-Start Dev Environment`  | Starts all dev services automatically |
| **Start Frontend**     | `LITLABS: Start Frontend`        | Runs Next.js dev server               |
| **Start API**          | `LITLABS: Start API`             | Runs Azure Functions backend          |
| **Start Full Env**     | `LITLABS: Start Dev Environment` | Parallel start (frontend + API)       |

### Building

| Task                | Command                 | Purpose                           |
| ------------------- | ----------------------- | --------------------------------- |
| **Build API**       | `pnpm: build - api`     | Compiles TypeScript to JavaScript |
| **Watch API**       | `pnpm: watch - api`     | Auto-recompile on changes         |
| **Build Functions** | `npm build (functions)` | Production build                  |

### Installation

| Task                     | Command                              | Purpose              |
| ------------------------ | ------------------------------------ | -------------------- |
| **Install Dependencies** | `Setup: Install Dependencies (pnpm)` | Initial setup        |
| **Install Functions**    | `npm install (functions)`            | Backend dependencies |

### Website Management

| Task             | Command                  | Purpose             |
| ---------------- | ------------------------ | ------------------- |
| **Show Website** | `Show Website (Litlabs)` | Opens dev website   |
| **Bots Manager** | `Bots Manager`           | Manage trading bots |

### Azure & Cloud

| Task                         | Command                           | Purpose                       |
| ---------------------------- | --------------------------------- | ----------------------------- |
| **Login to Azure**           | `Azure: Login`                    | Authenticate with Azure       |
| **Bootstrap Infrastructure** | `Azure: Bootstrap Infrastructure` | Initialize Azure resources    |
| **Setup Grok Integration**   | `Azure: Setup Grok Integration`   | Configure Grok AI integration |
| **Test Grok Function**       | `Azure: Test Grok Function`       | Verify Grok is working        |

### Google Cloud

| Task                   | Command                              | Purpose       |
| ---------------------- | ------------------------------------ | ------------- |
| **Setup Google Cloud** | `🌐 Setup: Google Cloud Integration` | Configure GCP |

### Deployment

| Task               | Command                                        | Purpose                 |
| ------------------ | ---------------------------------------------- | ----------------------- |
| **Deploy**         | `🚀 Deploy: Trigger Multi-Platform Deployment` | Deploy to all platforms |
| **Monitor Status** | `📊 Monitor: View Deployment Status`           | Check deployment status |

---

## 💻 What You Can Do

### 🎨 Frontend Development

- **Create pages** in `apps/web/src/app/`
- **Build components** in `apps/web/src/components/`
- **Style with honeycomb theme** using Tailwind + CSS utilities
- **Use TypeScript** for type safety
- **Hot reload** during development

### 🔌 API Development

- **Build serverless functions** in `api/src/functions/`
- **Integrate services**: Cosmos DB, Azure Blob Storage, Auth
- **Create endpoints** for frontend consumption
- **Handle real-time data** (crypto, trading, notifications)

### 🤖 Bot Management

- **Configure trading bots** in `api/src/bots/`
- **Connect exchanges**: Binance, Coinbase, Kraken, etc.
- **Implement strategies** (scalping, swing trading, etc.)
- **Monitor performance** with profit tracking
- **Paper trade** before going live

### 📊 Data Management

- **Cosmos DB**: User data, profiles, chat history
- **Azure Blob Storage**: Media, files, assets
- **Real-time updates**: WebSockets & subscriptions

### 🔐 Authentication & Security

- **User authentication** system in place
- **Secure API endpoints**
- **Role-based access control**
- **Environment variables** for secrets

### 📱 Multi-Platform Support

- **Web**: Next.js (primary)
- **Azure**: Container Apps deployment
- **Google Cloud**: Run deployment
- **GitHub**: CI/CD automation

---

## 📁 Key Directory Structure

```
HomeBase-2.0/
├── apps/web/                    # Frontend Next.js app
│   ├── src/
│   │   ├── app/                # Pages & routing
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── globals.css         # Global styles & theme
│   ├── tailwind.config.js      # Tailwind configuration
│   └── next.config.js          # Next.js configuration
│
├── api/                         # Backend Azure Functions
│   ├── src/
│   │   ├── functions/          # Azure Function triggers
│   │   ├── bots/               # Trading bot engine
│   │   ├── shared/             # Shared utilities
│   │   └── types.d.ts          # TypeScript types
│   └── tsconfig.json           # TypeScript config
│
├── scripts/                     # Automation scripts
│   ├── Auto-Start-DevEnvironment.ps1
│   └── ...
│
└── package.json                # Root package configuration
```

---

## 🎯 Quick Start Guide

### 1. **First Time Setup**

```bash
# Install all dependencies
pnpm install

# Bootstrap Azure infrastructure (if needed)
task: Azure: Bootstrap Infrastructure
```

### 2. **Start Development**

```bash
# Option A: Auto-start everything
task: 🔥 Auto-Start Dev Environment

# Option B: Manual start
task: LITLABS: Start Dev Environment
```

### 3. **View Your Site**

```bash
# Open in browser
task: Show Website (Litlabs)
# URL: http://localhost:3000
```

### 4. **API Development**

- Make changes in `api/src/`
- Watch task auto-compiles: `pnpm: watch - api`
- Functions reload automatically

### 5. **Theme Development**

- Edit colors in: `apps/web/tailwind.config.js`
- Add CSS effects in: `apps/web/src/globals.css`
- Use honeycomb classes in components

---

## 🎨 Using the Honeycomb Theme

### Example Component with Theme

```tsx
// apps/web/src/components/MyComponent.tsx
export default function MyComponent() {
  return (
    <div className="honeycomb-bg min-h-screen p-8">
      <h1 className="honeycomb-text text-4xl font-bold mb-8">Welcome to HomeBase</h1>

      <div className="honeycomb-grid">
        <div className="honeycomb-cell honeycomb-float">
          <h2 className="honeycomb-accent text-xl mb-4">Feature 1</h2>
          <p>Your content here...</p>
        </div>

        <div className="honeycomb-cell honeycomb-pulse">
          <h2 className="honeycomb-accent text-xl mb-4">Feature 2</h2>
          <p>Your content here...</p>
        </div>
      </div>
    </div>
  );
}
```

### Tailwind Utility Classes

```html
<!-- Background & Colors -->
<div class="bg-honeycomb-black text-honeycomb-brightGold">Premium styling</div>

<!-- Gradients & Effects -->
<h1 class="honeycomb-text">Gradient text (purple → gold)</h1>

<!-- Grid Layouts -->
<div class="honeycomb-grid">
  <div class="honeycomb-cell honeycomb-glow">Cell 1</div>
  <div class="honeycomb-cell">Cell 2</div>
</div>

<!-- Animations -->
<div class="honeycomb-float">Floating element</div>
<div class="honeycomb-pulse">Pulsing element</div>
```

---

## 🔗 Integration Points

### Cosmos DB

- User profiles & authentication
- Chat history & conversations
- Bot trading records
- Real-time data

### Azure Blob Storage

- Media uploads
- Asset management
- User avatars

### Trading Exchanges

- Binance (primary)
- Coinbase
- Kraken
- Bybit

### AI Services

- Grok AI integration
- Google Cloud AI
- Prompt engineering

### External APIs

- Market data feeds
- Cryptocurrency prices
- User notifications

---

## 📊 Monitoring & Debugging

### Logs & Diagnostics

```bash
# View API logs
task: Azure: Test Grok Function

# Monitor deployment
task: 📊 Monitor: View Deployment Status
```

### Development Tools

- Browser DevTools (F12)
- VS Code Debugger
- Azure Functions Core Tools
- Cosmos DB Explorer (Azure extension)

---

## 🚀 Deployment

### All Platforms

```bash
task: 🚀 Deploy: Trigger Multi-Platform Deployment
```

### Individual Platforms

- **GitHub**: Push to `main` branch → GitHub Actions
- **Azure**: Container Apps deployment
- **Google Cloud**: Cloud Run deployment

---

## 📚 Resources

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Azure Functions**: https://learn.microsoft.com/azure/azure-functions
- **TypeScript**: https://www.typescriptlang.org/docs
- **React**: https://react.dev

---

## 💡 Tips & Best Practices

1. **Always run tests** before pushing
2. **Use TypeScript** for type safety
3. **Follow honeycomb theme** in new components
4. **Commit frequently** with clear messages
5. **Keep environment variables** secure
6. **Test on multiple devices** before deploying
7. **Monitor API costs** on Azure & GCP
8. **Regular backups** of Cosmos DB data

---

**Last Updated**: January 6, 2026

🎉 **Your workspace is ready!** Start building with the honeycomb theme!
