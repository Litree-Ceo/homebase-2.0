# HomeBase 2.0 Copilot Instructions

## Quick Start
```bash
pnpm install                    # Install all workspace dependencies
pnpm -C api start              # Start Azure Functions API (port 7071)
pnpm -C apps/web dev           # Start Next.js frontend (port 3000)
pnpm -w test                   # Run all tests
pnpm lint                      # Check code quality with ESLint
```

Or use auto-boot task: **LITLABS: Start Dev Environment** (Ctrl+Shift+B)

## Architecture Overview

**Monorepo Structure** (pnpm workspaces defined in [pnpm-workspace.yaml](../pnpm-workspace.yaml)):

| Package | Purpose | Tech | Port |
|---------|---------|------|------|
| api/ | Azure Functions backend with bot trading, crypto APIs, webhooks | TypeScript, Node 20+, Azure SDK | 7071 |
| apps/web/ | Next.js 14.2.7 frontend with Meta OAuth, social feeds, bot UI | React 18+, TypeScript, App Router | 3000 |
| packages/core/ | Shared utilities, types, constants | TypeScript | — |

**Data Flow**:
```
Browser → Next.js Frontend (Auth: Azure B2C + Meta OAuth)
    ↓
Azure Functions API (REST/JSON)
    ↓
Azure Services: Cosmos DB, Storage Blob, Key Vault, Grok API
    ↓
External APIs: Facebook Graph API, Exchange APIs (Binance, Coinbase, etc.)
```

**Why This Architecture**:
- Monorepo enables efficient dependency sharing and atomic deployments
- TypeScript + strict mode throughout for type safety
- Azure Functions for serverless scalability; Next.js for SEO and user experience
- Cosmos DB for global, low-latency access; Key Vault for secrets management
- Fully integrated Meta OAuth + Facebook Graph API for social features
- Trading bots with multiple exchange connectors (Binance, Coinbase, Kraken, etc.)

---

## Critical Implementation Details

### ✅ Meta/Facebook Integration (Fully Implemented)

**OAuth Flow**:
- File: [apps/web/src/lib/meta-oauth.ts](../apps/web/src/lib/meta-oauth.ts)
- Implements PKCE-based token exchange with error recovery
- Auto-refreshes access tokens; handles token expiration gracefully
- Scopes: `public_profile`, `email`, `user_posts`, `instagram_business_content_access`

**Graph API Client**:
- File: [apps/web/src/lib/meta-graph-api.ts](../apps/web/src/lib/meta-graph-api.ts)
- Wraps Facebook Graph API endpoints: posts, insights, followers, profiles
- Automatic rate-limit handling with exponential backoff
- Caches API responses in Cosmos DB for performance

**Webhook Handler**:
- File: [apps/web/src/pages/api/webhooks/meta.ts](../apps/web/src/pages/api/webhooks/meta.ts)
- HMAC-SHA256 signature verification for security
- Handles 7+ event types: post_created, post_updated, followers_change, etc.
- Stores events in Cosmos DB with TTL for audit/replay

**Token Persistence**:
- Function: `saveMetaToken()` in [apps/web/src/lib/cosmos.ts](../apps/web/src/lib/cosmos.ts)
- Encrypts tokens at rest in Cosmos DB
- TTL: 90 days (auto-cleanup); refreshed on each API call
- Keyed by: `userId` partition, `tokenId` unique within partition

**Configuration**:
- App ID: `1989409728353652`
- App Secret: stored in `.env.local` (dev) or Azure Key Vault (prod)
- Redirect URI: `http://localhost:3000/auth/meta/callback` (dev) or `https://yourdomain.com/auth/meta/callback` (prod)
- Update scopes in `apps/web/src/components/` (Meta OAuth component)

### Azure Functions API Structure

**HTTP Triggers**:
- Location: [api/src/functions/](../api/src/functions/)
- Examples: `bot-api.ts`, `crypto.ts`, `health.ts`, `meta-webhook.ts`
- Each function exports default HTTP trigger handler

**Shared Business Logic**:
- **Trading Engine**: [api/src/bots/engine.ts](../api/src/bots/engine.ts)
  - Strategy management, portfolio tracking, order execution
  - Backtesting framework for strategy validation
  - Risk management: position sizing, stop-loss, take-profit
  
- **Strategies**: [api/src/bots/strategies/](../api/src/bots/strategies/)
  - MomentumStrategy, RSIStrategy, MovingAverageCrossover, etc.
  - Custom strategy interface for extensibility
  
- **Exchange Connectors**: Unified interfaces for BinanceExchange, CoinbaseExchange, KrakenExchange

**TypeScript Strict Mode**:
- All files enforce `strict: true` in `tsconfig.json`
- No `any` types; all variables and functions must have explicit types

**Dependencies** (selected):
- `@azure/cosmos` - Cosmos DB client
- `@azure/storage-blob` - Azure Blob Storage
- `@azure/identity` - Azure authentication (DefaultAzureCredential)
- `@azure/functions` - Azure Functions SDK
- `axios` - HTTP client
- `ccxt` - Unified cryptocurrency exchange API
- `cryptography` - Encryption/decryption utilities

**Build & Deploy**:
- Local: `pnpm -C api build` → TypeScript → JavaScript in `dist/`
- Run: `func start` (Azure Functions Core Tools) or `pnpm -C api start`
- Deploy: GitHub Actions [.github/workflows/deploy-azure.yml](workflows/deploy-azure.yml) → Docker → Azure Container Registry → Azure Container Apps

**Environment Variables**:
- **Development**: Load from `.env.local` (git-ignored)
- **Production**: Load from Azure Key Vault at runtime
- **Startup Validation**: All required env vars checked on app start; fail fast if missing

### Next.js Frontend Structure

**Routing**:
- **App Router** (preferred): Pages in [apps/web/src/app/](../apps/web/src/app/) with file-based routing
- **Pages Router**: Legacy support in [apps/web/src/pages/](../apps/web/src/pages/) for API routes and special cases
- Server components by default; use `'use client'` directive sparingly for interactivity

**Components** ([apps/web/src/components/](../apps/web/src/components/)):
- `MetaLoginButton.tsx` - Facebook OAuth login button
- `SocialFeed.tsx` - Display user posts from Meta
- `BotDashboard.tsx` - Trading bot UI
- `Portfolio.tsx` - User asset allocation and P&L

**Custom Hooks** ([apps/web/src/hooks/](../apps/web/src/hooks/)):
- `useMetaAuth()` - Check if user is authenticated with Meta OAuth
- `useMetaGraphAPI()` - Fetch posts, insights, followers
- `useCosmosDB()` - Query user data, save tokens, etc.
- `useBots()` - Manage trading bot strategies

**Libraries** ([apps/web/src/lib/](../apps/web/src/lib/)):
- `meta-oauth.ts` - PKCE OAuth flow, token refresh
- `meta-graph-api.ts` - Facebook Graph API wrapper
- `cosmos.ts` - Cosmos DB CRUD, token encryption
- `crypto-utils.ts` - Encryption/decryption for sensitive data

**Authentication**:
- **Primary**: Azure B2C (enterprise SSO)
- **Social**: Meta/Facebook OAuth (consumer login)
- **Session**: HTTP-only secure cookies (HttpOnly, Secure, SameSite=Strict)
- **Token Storage**: Access token in memory; refresh token in secure cookie or Cosmos DB

**Build**:
- Output: Standalone Next.js in `out/` (static + API routes)
- Optimizations: Image optimization, code splitting, ISR (Incremental Static Regeneration)
- Docker: Multi-stage build in [docker/Dockerfile.web](../docker/Dockerfile.web)

---

## Essential Workflows

### Adding a New API Endpoint

1. **Create function** at [api/src/functions/my-feature.ts](../api/src/functions/):
   ```typescript
   import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
   
   export async function myFeature(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
     try {
       // @agent: Add business logic here
       const result = await processData(request);
       return { body: JSON.stringify(result), status: 200 };
     } catch (error) {
       context.error(`Error in myFeature: ${error.message}`);
       return { body: JSON.stringify({ error: "Internal Server Error" }), status: 500 };
     }
   }
   ```

2. **Register** in [api/src/index.ts](../api/src/index.ts):
   ```typescript
   import { myFeature } from "./functions/my-feature";
   app.http("myFeature", { methods: ["POST"], route: "my-feature", handler: myFeature });
   ```

3. **Test locally**:
   ```bash
   pnpm -C api start
   curl -X POST http://localhost:7071/api/my-feature -H "Content-Type: application/json" -d '{"data":"test"}'
   ```

4. **Add secrets** to `.env.local` and validate on startup

5. **Write unit test** in `api/src/functions/__tests__/` with Jest

### Adding a New Next.js Page

1. **Create page** at [apps/web/src/app/my-page/page.tsx](../apps/web/src/app/):
   ```typescript
   import { getMyData } from "@/lib/cosmos";
   
   export default async function MyPage() {
     const data = await getMyData(); // Server component - safe to call APIs
     return <div>{JSON.stringify(data)}</div>;
   }
   ```

2. **Add client component** if interactivity needed:
   ```typescript
   'use client'; // Enable client-side features
   import { useState } from 'react';
   
   export function MyComponent() {
     const [count, setCount] = useState(0);
     return <button onClick={() => setCount(count + 1)}>{count}</button>;
   }
   ```

3. **Test locally**:
   ```bash
   pnpm -C apps/web dev
   # Visit http://localhost:3000/my-page
   ```

### Connecting to Meta Graph API

1. **Check authentication** with `useMetaAuth()` hook:
   ```typescript
   const { isAuthenticated, accessToken } = useMetaAuth();
   if (!isAuthenticated) return <LoginButton />;
   ```

2. **Fetch data** using `metaGraphAPI`:
   ```typescript
   const posts = await metaGraphAPI.getPosts(accessToken);
   const insights = await metaGraphAPI.getInsights(accessToken, postId);
   ```

3. **Handle token refresh**:
   ```typescript
   try {
     const data = await metaGraphAPI.getPosts(accessToken);
   } catch (error) {
     if (error.code === "TOKEN_EXPIRED") {
       await refreshAccessToken();
       // Retry request
     }
   }
   ```

4. **Cache in Cosmos DB**:
   ```typescript
   // Save to DB for offline access and reduced API calls
   await cosmosDB.saveMetaPosts(userId, posts, { ttl: 3600 }); // 1 hour TTL
   ```

### Scaling Trading Bots

1. **Add strategy** at [api/src/bots/strategies/my-strategy.ts](../api/src/bots/strategies/):
   ```typescript
   export class MyStrategy implements TradingStrategy {
     async execute(portfolio: Portfolio, marketData: MarketData): Promise<Order[]> {
       // @agent: Implement strategy logic
       return orders;
     }
   }
   ```

2. **Register** in [api/src/bots/engine.ts](../api/src/bots/engine.ts):
   ```typescript
   engine.registerStrategy("my-strategy", MyStrategy);
   ```

3. **Add exchange connector** with unified interface for new exchange

4. **Test** with backtesting framework, then deploy with auto-scaling rules

---

## Project Conventions & Patterns

### AI Markers

- **`// @workspace`**: Scaffolding signal for new endpoint/page/component structure
- **`// @debugger`**: Priority debugging/testing areas—examine these when troubleshooting
- **`// @agent`**: Direct instructions to AI agents (follow explicitly)

### Monorepo Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install all dependencies |
| `pnpm -w test` | Run all tests (API + web) |
| `pnpm -C api start` | Start Azure Functions API |
| `pnpm -C apps/web dev` | Start Next.js dev server |
| `pnpm add <pkg>` | Add pkg to root (shared) |
| `pnpm add <pkg> --filter api` | Add pkg to API only |
| `pnpm lint` | Lint all workspaces |

### Code Style

| Aspect | Rule |
|--------|------|
| **Language** | TypeScript (strict mode everywhere) |
| **No `any` types** | All variables/functions must have explicit types |
| **Variables** | `const` by default; mutable state in Cosmos DB |
| **Async** | Use async/await; handle errors with try/catch |
| **Logging** | `console.log()`, `context.log()` (Azure Functions) |
| **Components** | React 18+ hooks; server components preferred |
| **API Functions** | Azure Functions v4 patterns; HTTP triggers |

### Environment Variables

**Development** (`.env.local`—git-ignored):
```env
COSMOS_ENDPOINT=https://your-cosmos.documents.azure.com:443/
COSMOS_KEY=your-primary-key-here
FACEBOOK_APP_ID=1989409728353652
FACEBOOK_APP_SECRET=your-secret-here
GROK_API_KEY=your-api-key-here
```

**Production** (Azure Key Vault):
- All env vars fetched from Key Vault at runtime
- Never hardcode secrets in code or config files
- Validated on app startup; fail fast if missing

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| API Functions | snake-case | `bot-api.ts`, `meta-webhook.ts` |
| React Components | PascalCase | `MetaLoginButton.tsx`, `SocialFeed.tsx` |
| Utilities | camelCase | `metaOAuth.ts`, `cosmosDb.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT_MS` |
| Types/Interfaces | PascalCase | `MetaPost`, `TradeOrder`, `BotConfig` |

### Submodule Management

- `EverythingHomebase/` is a git submodule
- **Avoid duplicating work** between root and submodule
- Work in root directory by default
- Only modify submodule if explicitly requested

### Grok Integration

- Production-ready Grok API integration via Azure Functions
- Key files: Grok integration in `functions/` directory, see deployment guide
- Refer to `GROK_INTEGRATION_GUIDE.md` for AI-related feature requests

---

## Agentic Workflow Rules (CRITICAL)

1. **Context First**: Read relevant `README.md` or `GUIDE.md` before architectural changes; check existing integrations (Meta, Grok) for patterns
2. **Monorepo Awareness**: Use `pnpm -w` for workspace-wide commands; `pnpm -C api` or `pnpm -C apps/web` for specific packages; never mix pnpm and npm
3. **Azure Safety**: Never hardcode secrets; use `.env.local` (dev) or Key Vault (prod); validate env vars on startup; encrypt sensitive data in Cosmos DB
4. **Idempotency**: All scripts and deploy steps must be idempotent; use `--if-not-exists` patterns for DB/storage operations
5. **Documentation**: Update `README.md` or `GUIDE.md` when adding features; maintain parity between code and docs
6. **Test Coverage**: Add unit tests for new functions; use Jest; place in `__tests__` folders; run `pnpm -w test` before pushing
7. **Code Quality**: Run `pnpm lint` and fix issues before committing; Husky enforces linting; resolve all `// @debugger` markers

---

## Testing and CI/CD

### Unit Tests

- **Framework**: Jest
- **Location**: `__tests__` folders (e.g., `api/src/bots/__tests__/engine.test.ts`)
- **Run**: `pnpm -w test` (all), `pnpm -C api test` (API only), `pnpm -w test:watch` (watch mode)

**Example Test**:
```typescript
import { myFeature } from "../my-feature";

jest.mock("@azure/cosmos");

test("myFeature returns 200 on success", async () => {
  const mockRequest = { body: { data: "test" } };
  const mockContext = { error: jest.fn(), log: jest.fn() };
  const result = await myFeature(mockRequest, mockContext);
  expect(result.status).toBe(200);
  expect(result.body).toContain("success");
});
```

### CI/CD Pipeline

- **Trigger**: Push to `main` branch
- **Workflow**: [.github/workflows/deploy-azure.yml](workflows/deploy-azure.yml)
- **Steps**:
  1. Checkout code
  2. Setup Node.js v20
  3. Install dependencies: `pnpm install --frozen-lockfile`
  4. Lint: `pnpm lint`
  5. Test: `pnpm -w test`
  6. Build: `pnpm -w build`
  7. Build Docker images for API and Web
  8. Push to Azure Container Registry (homebasecontainers.azurecr.io)
  9. Deploy to Azure Container Apps
  10. Deploy to Google Cloud Run

**Secrets in GitHub** (Settings → Secrets):
- `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`
- `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`

---

## Integration and Dependencies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | Azure Functions, Node 20+, TypeScript | Serverless backend, bot trading |
| **Frontend** | Next.js 14, React 18, TypeScript | Web UI, authentication, social feeds |
| **Database** | Azure Cosmos DB (SQL API) | User data, tokens, bot configs, trade history |
| **Storage** | Azure Blob Storage | Uploads, file storage |
| **Secrets** | Azure Key Vault | API keys, credentials |
| **Auth** | Azure B2C, Meta OAuth | User authentication |
| **External APIs** | Facebook Graph API, exchange APIs | Social data, trading |
| **Messaging** | Azure SignalR (optional) | Real-time updates |

---

## Key Files/Directories

| File/Directory | Purpose |
|---|---|
| [pnpm-workspace.yaml](../pnpm-workspace.yaml) | Workspace definitions |
| [api/src/functions/](../api/src/functions/) | Azure Function HTTP triggers |
| [api/src/bots/](../api/src/bots/) | Trading engine, strategies, exchange connectors |
| [apps/web/src/app/](../apps/web/src/app/) | Next.js pages (App Router) |
| [apps/web/src/lib/meta-oauth.ts](../apps/web/src/lib/meta-oauth.ts) | Meta OAuth handler |
| [apps/web/src/lib/meta-graph-api.ts](../apps/web/src/lib/meta-graph-api.ts) | Facebook Graph API client |
| [apps/web/src/lib/cosmos.ts](../apps/web/src/lib/cosmos.ts) | Cosmos DB integration |
| [.github/workflows/deploy-azure.yml](workflows/deploy-azure.yml) | CI/CD pipeline |
| [.vscode/settings.json](../.vscode/settings.json) | Editor/terminal config |
| [README.md](../README.md) | Project overview |

---

## Deployment & Monitoring

### Deployment Process

1. **Push to main** branch
2. GitHub Actions triggers [.github/workflows/deploy-azure.yml](workflows/deploy-azure.yml)
3. Builds Docker images → pushes to Azure Container Registry
4. Deploys to Azure Container Apps + Google Cloud Run

### Monitoring

- **Azure Portal**: Container Apps dashboard, logs, metrics
- **Google Cloud Console**: Cloud Run services, logs
- **GitHub Actions**: [Actions tab](https://github.com) → see deployment status

### Local Development

- **API**: `pnpm -C api start` (auto-reload on file changes)
- **Web**: `pnpm -C apps/web dev` (hot-reload on code changes)
- **Both**: Run **LITLABS: Start Dev Environment** task (Ctrl+Shift+B)

---

## Additional Notes

- **Never commit secrets** or `.env` files; use `.env.example` as template
- **New workspaces**: Add path to [pnpm-workspace.yaml](../pnpm-workspace.yaml) and create directory
- **Reload VS Code** after merging settings or workspace file changes
- **Security**: Check [SECURITY_ADVISORY.md](../SECURITY_ADVISORY.md) before handling sensitive data
- **AI Features**: Refer to deployment guide for Grok API integration
- **Monorepo expansion**: See [DEPLOYMENT_SETUP_FINAL.md](../DEPLOYMENT_SETUP_FINAL.md) for advanced setup
