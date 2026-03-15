# Development Guide

This section contains development documentation and best practices for contributing to HomeBase 2.0.

## Code Quality & Standards

- **TypeScript:** Strict mode throughout
- **Linting:** ESLint + Prettier
- **Testing:** Jest test framework
- **Code Coverage:** 85%+ target

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start dev environment
pnpm dev

# Lint code
pnpm lint

# Run tests
pnpm -w test

# Format code
pnpm format
```

## Project Conventions

- **Language:** TypeScript (strict mode)
- **Variables:** `const` by default
- **Imports:** No `any` types
- **API Functions:** Azure Functions v4 pattern
- **Components:** React 18+ hooks

## Key Files

- **pnpm-workspace.yaml** - Workspace configuration
- **.eslintrc.json** - Linting rules
- **tsconfig.json** - TypeScript config

## Documentation

- **API Structure** - See [api/README.md](../../api/README.md)
- **Frontend Structure** - See [apps/web/README.md](../../apps/web/README.md)
- **Shared Code** - See [packages/core/README.md](../../packages/core/README.md)

---

**Ready to contribute?** Check out the contribution guidelines in the main [README.md](../../README.md#-contributing)
