# HomeBase 2.0 Operations Playbook

Keep every runway under control: the web storefront, the automation bots, and the API all live in this workspace, so this playbook points you to the fastest folders and commands when you want to feel “on top of the world.”

## Directory Intelligence

- **apps/web** – the Next.js marketing storefront and dashboard. `pnpm dev:web` launches `next dev`, and `pnpm dev:web -- --hostname 0.0.0.0` unlocks external device previews.
- **api** – the Azure Functions package powering bots, timers, and server-side logic. `pnpm --filter api build` then `pnpm --filter api start` spins up a local Functions host.
- **workspace/docs/Labs-Ai** – the bot studio, automation scripts, and revenue helpers. Run `activate-all-bots.ps1` (from PowerShell inside that folder) to align every fanout.
- **workspace/src** – shared ML, bot, and utility scripts (`chatbot.py`, `bot_manager.py`, etc.). Treat this as the research bin for new revenue flows and cross-platform automation.

## Show Me Website (Command Center)

1. Run `pnpm dev:web` from the repo root to spin up the storefront on port 3000.
2. Open [http://localhost:3000](http://localhost:3000) to inspect the UI shipped from `apps/web`.
3. When it is time to ship, run `pnpm --filter web build` and then `pnpm --filter web start` so the production build runs locally.
4. Need an HTTPS preview? Use `pnpm --filter web dev -- --hostname 0.0.0.0 --port 3000` with your tunneling tool.
5. Keep the entire workspace confident by running `pnpm lint` and `pnpm build` from the root before demos.

## Bots Bring Me Money (Automation Launchpad)

1. `cd workspace/docs/Labs-Ai` and refresh any secrets (run `refresh-env.ps1`, `reset-config.ps1`, or the equivalent helper) before launching bots.
2. Execute `activate-all-bots.ps1` (or `trigger-all-bots.ps1` if present) to align Guardian, Spark, WhatsApp, and every revenue bot with the latest code in `lib/`.
3. Update the bot factories under `workspace/docs/Labs-Ai/lib/` (for example, `guardian-bot.ts`, `spark-bot.ts`, or `whatsapp-bot.ts`) and rerun the activation script so the new bundles propagate.
4. Exported helpers in `workspace/src` (e.g., `bot_manager.py`) let you script health checks, log payouts, or orchestrate cross-platform launches.
5. After tweaking a bot, rerun the PowerShell activation script so every deploy target picks up the refreshed revenue data flows.

## Command Shortcuts to Memorize

- `pnpm dev:web` – live website for demos, QA, and investor walkthroughs.
- `pnpm --filter api start` – local Azure Functions runtime for bot APIs and triggers.
- `workspace/docs/Labs-Ai/activate-all-bots.ps1` – relaunch the bot fleet from PowerShell.
- `pnpm lint`, `pnpm build` – verify the entire monorepo from the root in one go.

When you say “show me website” or “bots bring money,” let this playbook live in your IDE so the right commands are one click away.

## Smart Folder Habits

- Treat `apps/web` as your customer-facing zone. Keep UI docs, design notes, and marketing copy beside it so every `pnpm dev:web` session answers product questions immediately.
- Keep each bot’s function inside `api/src/functions` aligned with its trigger so deployments stay predictable across platforms.
- Reserve `workspace/docs/Labs-Ai` for monetization flows; list new bots inside `lib/` and document their triggers and revenue models in that folder.
- Use `workspace/src` for reusable utilities, helpers, and scripts that orchestrate multiple bots or data stores.
- Use `workspace/src/bot_manager.py` to script cross-platform checks, log wallet hits, or orchestrate new revenue launches.
- When you tweak `lib/bot-builder.ts`, `lib/guardian-bot.ts`, or similar helpers, rerun `activate-all-bots.ps1` so updated bundles reload cleanly.

## Next Moves

- Add new bots under `workspace/docs/Labs-Ai/lib/` and document their triggers and payoffs inside this folder so the money map stays fresh.
- Keep the `apps/web` README and release notes updated so every `pnpm dev:web` session can quickly answer investor questions.
- Drop new automation helpers into `workspace/src` and wire them back into the `activate-all-bots.ps1` flow so the fleet reloads cleanly every time.
- Run `pnpm lint` and `pnpm build` regularly from the root to keep every workspace aligned before demos.
