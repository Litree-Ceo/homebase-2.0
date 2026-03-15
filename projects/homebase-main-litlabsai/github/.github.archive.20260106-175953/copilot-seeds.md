# Copilot Seeds — LITLAB (HomeBase 2.0)

This file documents focused Copilot prompts aligned to your monorepo structure, endpoints, libraries, and common debugging tasks. Use these as starting points in VS Code Copilot Chat (Ctrl+Shift+I).

## Repository Map (for Copilot Context)

- **Frontend**: `apps/web/` (Next.js React, TypeScript, App Router)
- **API Backend**: `packages/api/` (Azure Functions v4, Node 20, REST endpoints)
- **Shared Libraries**: `packages/api/lib/` (database, auth, storage, websocket, middleware)
- **Monorepo Root**: pnpm workspaces, GitHub Actions CI/CD
- **Azure Resources**: Cosmos DB, Blob Storage, Static Web Apps, Azure Functions, SignalR, Stripe

## API Endpoints Reference

Current endpoints in `packages/api/`:

- `/api/auth/*` — Authentication (login, logout, refresh token, verify JWT)
- `/api/users/*` — User profiles and management
- `/api/games/*` — Game data and state
- `/api/videos/*` — Video metadata and streaming
- `/api/bots/*` — Bot configuration and commands
- `/api/posts/*` — User posts and content
- `/api/realtime/*` — WebSocket/SignalR channels
- `/api/stripe/*` — Stripe payment hooks
- `/api/traces/*` — Structured logging and tracing
- `/api/health` — Health check (Cosmos, Storage, auth status)

## 🏢 @workspace Prompts (Scaffolding & Structure)

Use these to generate new endpoints, pages, or refactor patterns.

### 1. Generate New API Endpoint

```text
@workspace
You're an expert LITLAB API developer. I need a new Azure Function endpoint: /api/posts

Requirements:
- Pattern: Follow api/auth/index.js and packages/api/lib/middleware.js (auth, validation, rate-limiting)
- Cosmos DB: Use the 'posts' container; implement GET all + POST create
- Validation: Use Zod or simple schema validation
- Tracing: Add structured logging to /api/traces container
- Error handling: 400 for validation, 401 for auth, 500 for server errors
- Docs: Add brief JSDoc comments

Output:
1) packages/api/posts/index.js (handler)
2) packages/api/lib/posts-schema.js (validation)
3) packages/api/package.json (if dependencies needed)
4) Update docs/API.md with endpoint spec
```

### 2. Audit & Simplify Middleware

```text
@workspace
Scan packages/api/lib/ and provide:
1. Summary of middleware layers (auth, rate-limit, validation, error handling)
2. Identify duplicated or conflicting logic
3. Propose a clean, composable middleware stack
4. Generate a helper for attaching middleware to new endpoints consistently
```

### 3. Generate React Component with Azure Integration

```text
@workspace
Create a React component in apps/web/src/components/ItemsList that:
- Fetches items from /api/items (using SWR or React Query)
- Displays a paginated table
- Add/Edit/Delete buttons with optimistic updates
- Error boundary for failed requests
- Follows existing component conventions
```

### 4. Scaffold Full Feature (UI + API)

```text
@workspace
Add a new "Comments" feature to LITLAB:

Frontend (apps/web):
- Page: app/comments/page.tsx with Comment list, form, real-time updates
- Component: CommentCard.tsx (render single comment with like/reply)
- API call: src/lib/commentApi.ts with create/read/update/delete

Backend (packages/api):
- Endpoint: /api/comments (GET, POST, PUT, DELETE)
- Cosmos container: comments
- Real-time: Push updates via SignalR

Output: Full file list with code for each.
```

---

## 🐛 @debugger Prompts (Troubleshooting & Fixes)

Use these to diagnose and fix issues in your monorepo.

### 1. Debug JWT Auth Flow

```text
@debugger
Local login is failing. Here's what I see:
- Frontend: POST /api/auth/login returns 200, but token is undefined
- Browser console: "JWT verify failed"
- .env.local: JWT_SECRET is set

Reproduce with curl, identify the bug, and fix with tests.
```

### 2. Trace Request End-to-End

```text
@debugger
A request to POST /api/posts is timing out. Trace the flow:
1. apps/web/src/lib/postsApi.ts (client call)
2. packages/api/posts/index.js (handler)
3. Cosmos DB insert (write latency?)
4. /api/traces logging (where is it failing?)

Add request IDs so I can correlate logs across layers. Suggest fixes.
```

### 3. Fix Cosmos DB Permission Error

```text
@debugger
Getting "Forbidden (403)" when querying Cosmos DB from local Functions:
- .env has COSMOS_ENDPOINT and COSMOS_KEY
- Container is 'items'
- Code: await container.items.query(...).fetchAll()

Check: Key validity, container name, partition key mismatch. Fix it.
```

### 4. Debug WebSocket Connection

```text
@debugger
SignalR connection fails in local dev (packages/api/lib/websocket.js):
- Client (apps/web) → Server (SignalR hub)
- Error: "ERR_INVALID_PROTOCOL"
- Port might be wrong?

Verify endpoint, port, CORS settings. Provide fix + test.
```

### 5. Fix Test Failures

```text
@debugger
Running `npm test` in packages/api fails:
- Error: "Cannot find module '@azure/cosmos'"
- Output: [snippet of test log]

Dependencies not installed? Mock setup wrong? Show fix + explanation.
```

---

## 📝 Tests Prompts (Writing & Validating Tests)

Use these to generate tests and ensure quality.

### 1. Unit Tests for Middleware

```text
Add Jest tests for packages/api/lib/middleware.js covering:
- auth validation (valid token, expired token, missing token)
- rate limiting (single user, multiple users, reset)
- error handling (Cosmos down, Stripe API error)

Output: packages/api/__tests__/middleware.test.js with 5+ test cases
```

### 2. Integration Test for Auth Flow

```text
Generate an integration test that:
1. Boots the Azure Functions host locally (func start)
2. POST /api/auth/login with test credentials
3. Verify JWT token in response
4. Use token to GET /api/users/me
5. Verify user data

Output: packages/api/__tests__/auth-integration.test.js with setup/teardown
```

### 3. E2E Test with Playwright

```text
Write a Playwright test (apps/web/e2e/login.spec.ts) that:
1. Navigate to http://localhost:3000/login
2. Fill email + password
3. Click submit
4. Verify redirect to /dashboard
5. Check localStorage for token

Output: Full test file with fixtures for test user
```

### 4. Add Type-Safe API Tests

```text
Generate tests for /api/items endpoint using Zod schemas:
- Validate request body shape before sending
- Assert response matches expected DTO
- Test error cases (missing id, invalid status)

Output: packages/api/__tests__/items.test.js + types/items.ts
```

---

## 🚀 Copilot Agent Prompts (Use with `#github-pull-request_copilot-coding-agent`)

For complex, multi-file changes, use the Copilot coding agent:

```text
#github-pull-request_copilot-coding-agent

Title: Add Cosmos DB Posts API

Body:
Add a complete /api/posts endpoint to LITLAB:
- New endpoint: GET /api/posts (list), POST /api/posts (create)
- Cosmos DB container: posts
- Schema: postId (id), userId, title, content, createdAt
- Auth: JWT required
- Validation: Zod schema
- Tests: Jest unit test
- Docs: Update docs/API.md

The agent will:
1. Create a new branch
2. Generate api/posts/index.js
3. Add validation schema
4. Write tests
5. Update API docs
6. Open a PR for review
```

---

## 🛠 AI Tools & Model Best Practices

### When to Use `@workspace`

- Scaffolding new features (endpoints, pages, components)
- Refactoring to a new pattern
- Generating boilerplate (tests, types, middleware)

### When to Use `@debugger`

- Fixing runtime errors or unexpected behavior
- Tracing requests across layers
- Diagnosing intermittent issues

### When to Use Agents (Coding Agent)

- Multi-file refactors (e.g., "add Comments feature end-to-end")
- Cross-workspace changes (frontend + backend at once)
- Complex migrations (TypeScript, database schema updates)

### Copilot Best Practices for LITLAB

1. **Be Specific**: Reference files, endpoints, and error messages
2. **Provide Context**: Paste relevant code snippets (80-100 lines max)
3. **Clarify Intent**: "I want to" vs. "What happens if"
4. **Iterate**: Use follow-ups; Copilot improves with context
5. **Validate Output**: Test generated code before committing

---

## 📚 Quick Reference: Common Patterns

### Cosmos DB Query (in API)

```javascript
// From packages/api/lib/database.js
const { resources } = await container.items
  .query('SELECT * FROM c WHERE c.userId = @userId', [
    { name: '@userId', value: userId },
  ])
  .fetchAll();
```

### Middleware Stack (in API)

```javascript
// From packages/api/lib/middleware.js
const stack = [
  authMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  errorHandlerMiddleware,
];
```

### React Hook for Data Fetching (in Web)

```typescript
// From apps/web/src/lib/cosmos.ts
const items = await queryItems('items', 'SELECT * FROM c');
```

### NextJS API Route (in Web)

```typescript
// From apps/web/src/app/api/items/route.ts
export async function GET(request: NextRequest) {
  const items = await queryItems('items', 'SELECT * FROM c');
  return NextResponse.json(items);
}
```

---

## 🔗 Related Documentation

- **API Guide**: [docs/API.md](../docs/API.md)
- **Setup**: [GETTING_STARTED.md](../GETTING_STARTED.md)
- **Azure Services**: [AZURE_SETUP_GUIDE.md](../AZURE_SETUP_GUIDE.md)
- **Copilot Instructions**: [.github/copilot-instructions.md](../.github/copilot-instructions.md)

---

## Tips for Effective Prompting

1. **Copy/paste the prompt** into Copilot Chat and modify as needed
2. **Use code blocks** when sharing errors or snippets
3. **Ask for specific output** (file names, format, tests, docs)
4. **Iterate quickly** — Copilot improves with follow-ups
5. **Test generated code** before merging (always runs tests first)

---

Last updated: January 2, 2026 | LITLAB Homebase 2.0
