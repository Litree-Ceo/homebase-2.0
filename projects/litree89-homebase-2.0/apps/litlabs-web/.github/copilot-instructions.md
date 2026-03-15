---
# 🤖 Copilot Instructions for EverythingHomebase (Litlabs-web)

## 🚀 Big Picture

- **Workspace**: Multi-app, AI-powered platform for creators and automation. Major domains: Worlds, Widgets, Marketplace, Multi-persona AI chat, Payments, Team presence.
- **Tech stack**: TypeScript, Next.js 14 (App Router), Firebase (Firestore/Auth/Analytics), Stripe, OpenAI GPT-4o-mini, PowerShell scripts for automation.
- **Architecture**: Type-safe, config-driven, API-first. See `ARCHITECTURE_TYPESCRIPT_NEXTJS.md`, `VISUAL_SUMMARY.md` for diagrams and data flows.

## 🗂️ Key Structure & Patterns

- **Types**: Core models in `types/` (world, user, payments, marketplace, widget). Use for all data/API contracts.
- **Config**: Centralized in `config/` (subscriptions, themes, widgets, paymentProviders). Extend these for new features.
- **APIs**: Next.js API routes in `app/api/` (worlds, ai/chat, payments, marketplace, presence). All client mutations via these endpoints.
- **Libs**: `lib/db.ts` (Firestore CRUD), `lib/payments.ts` (Stripe, Coinbase, on-chain), `lib/auth.ts` (auth helpers).
- **Components**: Reusable React components in `components/`, organized by domain.
- **Scripts**: Workspace root PowerShell scripts (`homebase`, `auto-git-sync.ps1`, etc.) for build, test, sync, reset, and recovery.

## 🛠️ Developer Workflow

- **Setup**: `npm install` → copy `.env.example` to `.env.local` → fill in keys → `npm run dev`. See `JUMP_IN_GUIDE.md` for step-by-step.
- **Build/Test**: Use `./homebase build`, `./homebase test` for workspace-wide automation. Lint/format: `./homebase lint` / `./homebase format`.
- **Sync/Push**: `./homebase sync` for smart git sync. Status: `./homebase status`. Emergency: `./homebase reset`.
- **Manual Testing**: Use Stripe CLI for payment webhooks. See `SMOKE_TEST_GUIDE.md` for manual flows.
- **Deploy**: `npm run build` then `firebase deploy` (Firebase Hosting).

## 🧩 Project-Specific Conventions

- **Type imports**: Always import types from `@/types/*`.
- **API calls**: Use fetch to `/api/*` endpoints, never direct DB access from client.
- **Widget registry**: Add widgets to `config/widgets.ts`, implement in `components/widgets/`.
- **Theme system**: Add themes to `config/themes.ts`.
- **Payments**: All payment logic via `lib/payments.ts` and `/api/payments/*` routes.
- **Presence**: Real-time via Firebase RTDB (`lib/db.ts`, `app/api/presence/`).
- **AI personas**: Add/modify in `app/api/ai/chat/route.ts` and `config/widgets.ts`.
- **Scripts**: Use workspace root scripts for automation, not ad-hoc commands.

## 🔗 Key Files & References

- `ARCHITECTURE_TYPESCRIPT_NEXTJS.md` – Architecture, data models, flows
- `JUMP_IN_GUIDE.md` – Quick start, coding order, templates
- `VISUAL_SUMMARY.md` – Diagrams, feature maps, data flows
- `IMPLEMENTATION_CHECKLIST.md` – Task breakdown, status
- `COMPLETE_DELIVERABLES.md` – File inventory, what’s done
- `SMOKE_TEST_GUIDE.md` – Manual test flows
- Workspace root scripts: `homebase`, `auto-git-sync.ps1`, etc.

## 🏁 Examples

- **Add a widget**: Extend `config/widgets.ts`, create React component in `components/widgets/`, register in widget registry.
- **New payment provider**: Add config to `config/paymentProviders.ts`, implement logic in `lib/payments.ts`.
- **API endpoint**: Add route in `app/api/`, use types from `types/`, validate input/output.
- **Workspace automation**: Use `./homebase [command]` for build, test, sync, fix, reset.

## ⚠️ Gotchas

- Never mutate Firestore directly from client; always use API routes.
- Always use provided types and configs for new features.
- Use workspace scripts for all automation—avoid manual git or npm commands.
- Check `JUMP_IN_GUIDE.md` and workspace root for latest conventions.
---
- Do not bypass API routes for DB writes.
- Always use TypeScript types for all data.
- Check `.env.local` for all required keys before running.
- Stripe webhooks must be tested with Stripe CLI.
- Use provided templates for new components (see `JUMP_IN_GUIDE.md`).

---

For any unclear patterns, check the referenced markdown files or ask for clarification.
