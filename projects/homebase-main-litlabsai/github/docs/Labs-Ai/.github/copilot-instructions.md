> **Purpose**: This file provides comprehensive guidelines for GitHub Copilot coding agents and developers contributing to the LitLabs AI project. It covers development standards, security requirements, architectural patterns, and workflow conventions.
>
> **For Contributors**: If you're a human developer, also see [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
>
> **For Copilot**: These instructions apply to all code you generate. Follow them strictly to maintain code quality, security, and consistency.

## Project Overview

LitLabs (Labs-Ai) is a Next.js-based AI-powered platform for content creators, beauty professionals, and small businesses to generate content, manage clients, and monetize their services. The platform integrates with Firebase, Stripe, Google AI, and various third-party services.

## Tech Stack

## Project Directory Structure

````
Labs-Ai/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # Copilot instructions (this file)
│   ├── agents/                 # Custom agent definitions
│   └── workflows/              # GitHub Actions workflows
├── app/                        # Next.js App Router pages
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   ├── billing/                # Billing and subscription pages
│   ├── dashboard/              # Dashboard pages
│   └── [other routes]/         # Other application routes
├── components/                 # React components
│   ├── ui/                     # Reusable UI components

│   └── dashboard/              # Dashboard-specific components
├── context/                    # React Context providers
├── lib/                        # Utility functions and integrations
│   ├── firebase*.ts            # Firebase client/admin/server
│   ├── stripe.ts               # Stripe integration
│   ├── ai.ts                   # AI generation
│   ├── guardian-bot.ts         # Security analysis
│   ├── rateLimiter.ts          # Rate limiting
│   └── [other utils]           # Other utilities

## Getting Started
- Google AI API key for content generation

### Local Development Setup
2. Copy `.env.example` to `.env.local`
3. Fill in required environment variables (see `ENVIRONMENT_SETUP.md`)
4. Run `npm install` to install dependencies
6. Open http://localhost:3000 in your browser

## Git Workflow

- **Bug fixes**: `fix/<description>` or `bugfix/<description>`
- **Hotfixes**: `hotfix/<description>`
- **Refactoring**: `refactor/<description>`

### Pull Request Process
1. Create a branch following the naming convention above
3. Run `npm run lint` to check for linting errors
4. Run `npm run build` to ensure the project builds successfully
5. Open a PR with a clear description of changes
## Coding Standards

### TypeScript
- **Always use strict TypeScript**: All compiler options in `tsconfig.json` must be respected
- **Prefer type safety**: Use explicit types over `any`, use `unknown` for error catching
- **Use proper type imports**: Import types with `import type` when possible

### React & Next.js
- **Use "use client" directive**: Add at the top of files that use client-side hooks (useState, useEffect, etc.)
  - Add `export const maxDuration = 60;` for long-running operations

### Code Style
- **Unused variables**: ESLint warns on unused vars - clean them up
- **Naming conventions**:
  - Components: PascalCase (e.g., `SiteHeader`, `DashboardLayout`)
  - Functions: camelCase (e.g., `generateContent`, `checkRateLimit`)
  - Constants: UPPER_SNAKE_CASE for true constants (e.g., `MAX_PER_WINDOW`)
  - Files: kebab-case for utilities, PascalCase for components
- **Exports**: Use named exports for components and utilities, default export for page components

### Comments & Documentation
- **Add comments sparingly**: Only when logic is complex or non-obvious
- **Prefer self-documenting code**: Use descriptive variable and function names
- **Document complex algorithms**: Explain the "why" not the "what"
- **JSDoc for public APIs**: Add JSDoc comments for exported functions with complex parameters

## Security Requirements ⚠️

**CRITICAL**: Security is paramount. Always follow these practices:

- **Never skip auth checks**: All API routes must verify user authentication
- **Use `getUserFromRequest`**: Import from `@/lib/auth-helper` for consistent auth
- **Check permissions**: Verify user has permission before accessing resources
- **Rate limiting**: All public API endpoints must use rate limiting

### Input Validation
- **Validate all inputs**: Use Zod schemas for request validation
- **Sanitize user input**: Never trust user input, always validate and sanitize
- **Guardian bot**: Use `Guardian.getInstance()` for security analysis on sensitive operations
- **Prevent injection**: Use parameterized queries, never string concatenation for DB queries

### API Security Pattern
```typescript
import { getUserFromRequest } from '@/lib/auth-helper';
import { Guardian } from '@/lib/guardian-bot';
import { canPerformActionServer, incrementUsageServer } from '@/lib/firebase-server';

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Security analysis (for sensitive operations)
  // 4. Execute operation
  // ... your code ...


- **Never commit secrets**: Use environment variables for all sensitive data
- **Check `.env.example`**: Reference for required environment variables
- **No hardcoded keys**: API keys, tokens, passwords must be in env vars

### Error Handling
- **Use Sentry**: Import and use `captureError` from `@/lib/sentry` for errors
- **Never expose sensitive data**: Error messages must not leak implementation details
- **Graceful degradation**: Handle errors without breaking the user experience

## Firebase Integration

### Client-side Firebase
- **Import from `@/lib/firebase`**: For client-side operations
- **Use Firestore SDK properly**: Import specific functions from `firebase/firestore`
- **Authentication**: Use Firebase Auth for user management

### Server-side Firebase
- **Import from `@/lib/firebase-admin`**: For server-side operations (API routes)
- **Import from `@/lib/firebase-server`**: For server-side utility functions
- **Usage tracking**: Use `canPerformActionServer` and `incrementUsageServer`

### Firestore Patterns
- **Collections**: Main collections are `users`, `templates`, `usage`, `subscriptions`
- **Security rules**: Defined in `firestore.rules` - respect them
- **Timestamps**: Use Firebase Timestamps, convert to Date when needed
- **Queries**: Use `query`, `where`, `orderBy` from `firebase/firestore`

## Tier System & Usage Limits

The platform has a tiered subscription system:
- **free**: Limited features, demo access
- **starter**: Basic features
- **creator**: More features
- **pro**: Advanced features
- **agency**: White-label capabilities
- **education**: Special tier for educational use

**Always check usage limits** before performing paid operations:
- AI generations
- DM replies
- Money plays
- Image generations

Use `lib/usage-tracker.ts` and `lib/tier-limits.ts` for limit enforcement.

## Build & Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
````

### Build

```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Linting

```bash
npm run lint         # Run ESLint
```

### Important Notes

- **No test framework**: Currently no automated tests - manual testing required
- **Environment setup**: Copy `.env.example` to `.env.local` for local development
- **Firebase setup**: Requires Firebase project configuration
- **Stripe setup**: Requires Stripe API keys for billing features

### Code Quality Expectations

- **All code must build**: Run `npm run build` and fix any errors before committing
- **Lint-free code**: Run `npm run lint` and address all warnings
- **Type safety**: Fix all TypeScript errors, no `@ts-ignore` without justification
- **Manual testing**: Test your changes in the browser before submitting
- **Security review**: Ensure all security practices are followed
- **Documentation**: Update relevant docs if you change functionality

## Key Areas Requiring Extra Attention

### 1. Rate Limiting (`lib/rateLimiter.ts`)

- In-memory token bucket implementation
- Critical for preventing abuse
- Default: 20 requests per 60 seconds for demo users

### 2. Guardian Bot (`lib/guardian-bot.ts`)

- Security analysis system
- Detects suspicious behavior patterns
- Use on sensitive operations (payments, account changes, god mode)

### 3. AI Generation (`lib/ai.ts`)

- Google Generative AI integration
- Content generation for various use cases
- Rate limited per user tier

### 4. Stripe Integration (`lib/stripe.ts`)

- Payment processing
- Subscription management
- Webhook handling (critical - must be secure)

### 5. Template Library (`lib/template-library.ts`)

- User-saved content management
- Content types: caption, script, dm, moneyPlay, image
- Firestore-backed storage

## Component Structure

### UI Components (`components/ui/`)

- Reusable UI components
- Should be framework-agnostic when possible
- Use Tailwind CSS for styling

### Dashboard Components (`components/dashboard/`)

- Dashboard-specific features
- May have more complex state management
- Often client components ("use client")

### Page Components (`app/`)

- Next.js App Router structure
- `page.tsx` for routes
- `layout.tsx` for shared layouts
- `error.tsx` for error boundaries

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

try {
  setLoading(true);
  setError("");
  // ... operation
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  setError(message);
} finally {
  setLoading(false);
}
```

### API Calls

```typescript
import { callFunctionName } from "@/lib/functionsClient";

const result = await callFunctionName(params);
```

### Firestore Queries

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const q = query(collection(db, "collectionName"), where("field", "==", value));
const snapshot = await getDocs(q);
```

## What to Avoid

❌ **Don't bypass security checks**: Every API route needs authentication
❌ **Don't hardcode limits**: Use tier limits from `lib/tier-limits.ts`
❌ **Don't ignore errors**: Always handle and log errors properly
❌ **Don't use `any` type**: Use proper TypeScript types or `unknown`
❌ **Don't skip input validation**: Validate all user input
❌ **Don't commit secrets**: Never commit `.env.local` or API keys
❌ **Don't remove error boundaries**: Pages should have error handling
❌ **Don't skip rate limiting**: Public endpoints must be rate limited

## Best Practices

✅ **Check existing patterns**: Look at similar files before implementing new features
✅ **Use existing utilities**: Don't reinvent the wheel (auth, firebase, rate limiting, etc.)
✅ **Follow the tier system**: Respect subscription limits
✅ **Log important events**: Use proper logging for debugging
✅ **Handle edge cases**: Empty states, loading states, error states
✅ **Mobile-first**: Ensure responsive design with Tailwind
✅ **Accessibility**: Use semantic HTML and ARIA labels where needed
✅ **Performance**: Lazy load components, optimize images, minimize client-side JS

## Documentation References

- **Detailed setup**: See `README_LITLABS.md` and `README_LITLABS_FINAL.md`
- **Security policies**: See `SECURITY.md`
- **Environment setup**: See `ENVIRONMENT_SETUP.md`
- **Deployment**: See `DEPLOYMENT_SUCCESS.md` and `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Template packs**: See `TEMPLATE_PACK_*.md` files
- **Troubleshooting**: See `TROUBLESHOOTING.md`

## Working with This Repository

When assigned tasks:

1. **Understand the context**: Read relevant documentation files first
2. **Check existing patterns**: Look at similar implementations
3. **Follow security guidelines**: Never compromise on security
4. **Test thoroughly**: Manual testing is required (no automated tests yet)
5. **Update documentation**: Keep documentation in sync with code changes
6. **Respect the architecture**: Follow the established patterns and conventions

## GitHub Copilot Agent Guidelines

When working on tasks via GitHub Copilot:

### Issue Assignment

- Issues can be assigned to `@copilot` on GitHub.com
- Copilot creates a branch (prefixed with `copilot/`) and opens a PR
- Review Copilot's PRs like any peer developer's work

### Best Results with Copilot

- **Well-scoped issues**: Provide clear descriptions, acceptance criteria, and specific file/feature references
- **Iterative feedback**: Comment on PRs with `@copilot` mentions for refinements
- **Start small**: Begin with bug fixes, documentation, or refactoring tasks
- **Security first**: All security practices in this document apply to Copilot-generated code

### CI/CD Integration

- All Copilot PRs run through standard CI/CD workflows
- Build and lint checks must pass before merge
- Human approval required for all automated workflows

### Custom Agents

- Custom agents can be defined in `.github/agents/` directory
- Use `.agent.md` extension for agent definitions
- Agents provide specialized guidance for specific tasks or domains

## Questions or Clarifications?

If you encounter ambiguous requirements or need clarification:

- Check the documentation files in the root directory
- Look for similar implementations in the codebase
- Ensure your changes align with the security and coding standards above
- When in doubt, prefer security and type safety over convenience
