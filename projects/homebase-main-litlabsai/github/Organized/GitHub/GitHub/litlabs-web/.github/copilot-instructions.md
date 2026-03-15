# 🤖 Copilot Coding Agent Instructions: LitreeLabs (litlabs-web)

## 🚀 Big Picture & Architecture

- **Stack:** TypeScript, Next.js 14 (App Router), Firebase (Firestore/Auth/Analytics), Stripe, OpenAI GPT-4o-mini, real-time presence
- **Core Domains:** Worlds (workspaces), Widgets (drag/drop, extensible), Marketplace (buy/sell), Multi-persona AI chat, Subscriptions, Team chat/presence
- **Type Safety:** All data and API contracts use types in `types/`
- **Config-Driven:** Extend features via `config/` (widgets, themes, payments, subscriptions)
- **API-First:** All mutations go through Next.js API routes in `app/api/` (never direct DB writes from client)

## 🗂️ Structure & Patterns

- **Types:** `types/` (world, user, payments, marketplace, widget)
- **Config:** `config/` (subscriptions, themes, widgets, paymentProviders)
- **APIs:** `app/api/` (worlds, ai/chat, payments, marketplace, presence)
- **Libs:** `lib/db.ts` (Firestore CRUD), `lib/payments.ts` (payments), `lib/auth.ts` (auth helpers)
- **Components:** `components/` by domain (auth, dashboard, worlds, widgets, payment, ai, layout)

## 🛠️ Developer Workflow

1. `npm install` → copy `.env.example` to `.env.local` → fill in keys
2. `npm run dev` (see `JUMP_IN_GUIDE.md` for step-by-step)
3. Use TypeScript everywhere; start UI in `components/` and `app/` pages
4. Test payments with Stripe CLI; see `SMOKE_TEST_GUIDE.md` for manual flows
5. Deploy: `npm run build` then `firebase deploy`

## 🧩 Project Conventions

- **Type imports:** Always use `@/types/*`
- **API calls:** Use fetch to `/api/*`, never direct DB from client
- **Widget registry:** Add to `config/widgets.ts` and `components/widgets/`
- **Themes:** Add to `config/themes.ts`
- **Payments:** All logic via `lib/payments.ts` and `/api/payments/*`
- **Presence:** Real-time via Firebase RTDB (`lib/db.ts`, `app/api/presence/`)
- **AI personas:** Add/modify in `app/api/ai/chat/route.ts` and `config/widgets.ts`

## 🔗 Key References

- [ARCHITECTURE_TYPESCRIPT_NEXTJS.md](../ARCHITECTURE_TYPESCRIPT_NEXTJS.md) – Architecture, data models, flows
- [JUMP_IN_GUIDE.md](../JUMP_IN_GUIDE.md) – Quick start, coding order, templates
- [VISUAL_SUMMARY.md](../VISUAL_SUMMARY.md) – Diagrams, feature maps
- [IMPLEMENTATION_CHECKLIST.md](../IMPLEMENTATION_CHECKLIST.md) – Task breakdown
- [COMPLETE_DELIVERABLES.md](../COMPLETE_DELIVERABLES.md) – File inventory
- [SMOKE_TEST_GUIDE.md](../SMOKE_TEST_GUIDE.md) – Manual test flows

## 🏁 Examples

- **Add widget:** Extend `config/widgets.ts`, create in `components/widgets/`, register in config
- **New payment provider:** Add to `config/paymentProviders.ts`, implement in `lib/payments.ts`
- **API endpoint:** Add route in `app/api/`, use types from `types/`, validate input/output

## ⚠️ Gotchas

- Never bypass API routes for DB writes
- Always use TypeScript types for all data
- Check `.env.local` for all required keys before running
- Stripe webhooks must be tested with Stripe CLI
- Use provided templates for new components (`JUMP_IN_GUIDE.md`)

---

For any unclear patterns, check the referenced markdown files or ask for clarification.
