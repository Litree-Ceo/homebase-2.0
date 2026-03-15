Build/Lint/Test (from repo root):
- Setup: cd github && pnpm install (Node 20, pnpm 9)
- Dev: pnpm dev (all), pnpm dev:web, pnpm dev:api
- Build: pnpm build
- Lint: pnpm lint
- Tests: api only uses Jest -> cd github/api && pnpm test
- Single Jest test: cd github/api && pnpm test -- path/to/test.test.ts -t "test name"

Architecture/Structure:
- Primary monorepo is in github/ using pnpm workspace + Turborepo.
- apps/web = Next.js 14 App Router frontend.
- api/ = Azure Functions v4 TypeScript API (Node 20).
- packages/core = shared utilities.
- Additional apps under github/apps/* and github/apps/litmaster1/*.

Code style/conventions:
- TypeScript first; prefer shared types and config-driven models.
- For web app, use Next.js API routes for mutations; avoid direct DB access from client.
- Keep logic in shared libs/config where possible; add new widgets/themes/configs in config/.
- Follow local Copilot rules in: github/.github/copilot-instructions.md; github/apps/honey-comb-home/.github/copilot-instructions.md; github/apps/litlabs-web/.github/copilot-instructions.md; litlabs/apps/honey-comb-home/.github/copilot-instructions.md.
