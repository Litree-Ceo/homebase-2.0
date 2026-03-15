# 🤖 Copilot Instructions for LitreeLabs (litlabs-web)

## 🚀 Big Picture

- **Modern SaaS platform**: TypeScript + Next.js 14 (App Router), Firebase (Firestore/Auth/Analytics), Stripe, OpenAI GPT-4o-mini, and real-time collaboration.
- **Major domains**: Worlds (customizable workspaces), Widgets (drag/drop, extensible), Marketplace (buy/sell worlds, themes, widgets, personas), Multi-persona AI chat, Subscriptions/payments, Team presence/chat.
- **Architecture**: All business logic is type-safe, config-driven, and API-first. See `ARCHITECTURE_TYPESCRIPT_NEXTJS.md` and `VISUAL_SUMMARY.md` for diagrams and data flows.

## 🗂️ Key Structure & Patterns

- **Types**: All core models in `types/` (world, user, payments, marketplace, widget). Use these for all data and API contracts.
- **Config**: Centralized in `config/` (subscriptions, themes, widgets, paymentProviders). Add new features by extending these files.
- **APIs**: Next.js API routes in `app/api/` (worlds, ai/chat, payments, marketplace, presence). All client data mutations go through these endpoints.
- **Libs**: `lib/db.ts` (Firestore CRUD, user/world/marketplace), `lib/payments.ts` (Stripe, Coinbase, on-chain), `lib/auth.ts` (auth helpers).
- **Components**: Reusable React components in `components/`, organized by domain (auth, dashboard, worlds, widgets, payment, ai, layout).

## 🛠️ Developer Workflow

- **Setup**: `npm install` → copy `.env.example` to `.env.local` and fill in keys → `npm run dev` (see `JUMP_IN_GUIDE.md` for step-by-step)
- **Build**: Use TypeScript everywhere. Start with UI in `components/` and `app/` pages. Use provided templates in `JUMP_IN_GUIDE.md`.
- **Test**: Use Stripe CLI for payment webhooks. Debug with console logs and type checks. See `SMOKE_TEST_GUIDE.md` for manual test flows.
- **Deploy**: `npm run build` then `firebase deploy` (Firebase Hosting)

## 🧩 Project-Specific Conventions

- **Type imports**: Always import types from `@/types/*`.
- **API calls**: Use fetch to `/api/*` endpoints, not direct DB access from client.
- **Widget registry**: Add new widgets to `config/widgets.ts` and implement in `components/widgets/`.
- **Theme system**: Add new themes to `config/themes.ts`.
- **Payments**: All payment logic via `lib/payments.ts` and `/api/payments/*` routes.
- **Presence**: Real-time presence via Firebase RTDB, see `lib/db.ts` and `app/api/presence/`.
- **AI personas**: Add/modify in `app/api/ai/chat/route.ts` and `config/widgets.ts` (for MoneyBot).

## 🔗 Key Files & References

- `ARCHITECTURE_TYPESCRIPT_NEXTJS.md` – Full architecture, data models, flows
- `JUMP_IN_GUIDE.md` – Quick start, coding order, templates
- `VISUAL_SUMMARY.md` – Diagrams, feature maps, data flows
- `IMPLEMENTATION_CHECKLIST.md` – Task breakdown, status
- `COMPLETE_DELIVERABLES.md` – File inventory, what’s done
- `SMOKE_TEST_GUIDE.md` – Manual test flows

## 🏁 Examples

- **Add a widget**: Extend `config/widgets.ts`, create React component in `components/widgets/`, register in widget registry.
- **New payment provider**: Add config to `config/paymentProviders.ts`, implement logic in `lib/payments.ts`.
- **API endpoint**: Add route in `app/api/`, use types from `types/`, validate input/output.

## ⚠️ Gotchas

- Do not bypass API routes for DB writes.
- Always use TypeScript types for all data.
- Check `.env.local` for all required keys before running.
- Stripe webhooks must be tested with Stripe CLI.
- Use provided templates for new components (see `JUMP_IN_GUIDE.md`).

---

For any unclear patterns, check the referenced markdown files or ask for clarification.
