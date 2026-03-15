# HomeBase 2.0 Operations Playbook

Keep control of every runway: the web storefront, bots, and API all live in this workspace, so this page points you to the fastest commands and folders when you want to feel "on top of the world."

## Directory Intelligence

- **apps/web** – the Next.js marketing storefront and dashboard. Use `pnpm dev:web` for local dev (runs `next dev`) and `pnpm dev:web -- --hostname 0.0.0.0` when you need external device previews.
- **api** – the Azure Functions package that powers bots, timers, and server-side logic. Build with `pnpm --filter api build`, then `pnpm --filter api start` for a local Functions host.
- **workspace/docs/Labs-Ai** – the bot studio, automation scripts, and money-making helpers. `activate-all-bots.ps1` wires together the key flows (run from PowerShell inside that folder).
- **workspace/src** – shared ML, bot, and utility scripts (`chatbot.py`, `bot_manager.py`, etc.). Think of this as the research bin for new revenue flows.

## Show Me Website (Command Center)

1. Run `pnpm dev:web` from the repo root to spin up the storefront on port 3000.
2. Open [http://localhost:3000](http://localhost:3000) to inspect the UI powered by `apps/web`.
3. When it is time to ship, run `pnpm --filter web build` and then `pnpm --filter web start` to exercise the production build locally.
4. Need an HTTPS preview? Use `pnpm --filter web dev -- --hostname 0.0.0.0 --port 3000` with your tunneling tool.
5. Use `pnpm lint` and `pnpm build` from the root to keep the entire workspace aligned before demos.

## Bots Bring Me Money (Automation Launchpad)

1. `cd workspace/docs/Labs-Ai` and refresh secrets before launching bots (re-run any `refresh-env.ps1`, `reset-config.ps1`, or equivalent script you keep there).
2. Run `activate-all-bots.ps1` (or `trigger-all-bots.ps1` if present) to align Guardian, Spark, WhatsApp, and other revenue bots with the latest code in `lib/`.
3. Each bot sits inside `workspace/docs/Labs-Ai/lib/` (e.g., `guardian-bot.ts`, `spark-bot.ts`, `whatsapp-bot.ts`). Update the TypeScript or PowerShell files there and rerun the activation script.
4. Exported helpers in `workspace/src` (like `bot_manager.py`) let you script health checks, log payouts, or orchestrate cross-platform launches.
5. After you tweak a bot, rerun the PowerShell script so every deploy target ingests the new bundle and revenue data flows stay accurate.

## Command Shortcuts to Memorize

- `pnpm dev:web` – live website for demos, QA, and investor walkthroughs.
- `pnpm --filter api start` – local Functions runtime for bot APIs and triggers.
- `workspace/docs/Labs-Ai/activate-all-bots.ps1` – relaunch the bot fleet from PowerShell.
- `pnpm lint`, `pnpm build` – verify the entire monorepo once in a while.

## Smart Folder Habits

- Treat `apps/web` as your customer-facing zone. Keep UI docs, design notes, and marketing copy nearby so you can answer "show me website" with confidence.
- Keep each bot’s function under `api/src/functions` aligned with its trigger so that deployments stay predictable.
- Reserve the `workspace/docs/Labs-Ai` directory for monetization flows; list new bots inside `lib/` and document their triggers and revenue models in the same folder.
- Use `workspace/src` for reusable utilities, helpers, and scripts that orchestrate multiple bots or data stores.
- When you say "show me website" or "bots bring money," open this playbook so the right commands are one click away.

## Next Moves

- Add new bots under `workspace/docs/Labs-Ai/lib/` and document their value in this playbook so the money-making map stays fresh.
- Keep the `apps/web` README and release notes updated so every `pnpm dev:web` session answers your toughest product questions immediately.
- Drop new automation helpers into `workspace/src` and tie the scripts back into the `activate-all-bots.ps1` flow so the fleet reloads cleanly.# HomeBase 2.0 Operations Playbook

Keep control of every runway: the web storefront, bots, and API all live in this workspace, so this page points you to the fastest commands and folders when you want to feel "on top of the world.”

## Directory Intelligence

- **apps/web** – the Next.js marketing storefront and dashboard. Use `pnpm dev:web` for local dev (runs `next dev`) and `pnpm dev:web -- --hostname 0.0.0.0` when you need external device previews.
- **api** – Azure Functions package that powers bots, timers, and server-side logic. Build with `pnpm --filter api build`, then `pnpm --filter api start` for a local Functions host.
- **workspace/docs/Labs-Ai** – the bot studio, automation scripts, and money-making helpers. `activate-all-bots.ps1` wires together the key flows (run from PowerShell inside that folder).
- **workspace/src** – shared ML, bot, and utility scripts (chatbot.py, bot_manager.py, etc.). Think of this as the research bin for new revenue flows.

## Show Me Website (Command Center)

1. `pnpm dev:web` from the repo root spins up the storefront on port 3000.
2. Open [http://localhost:3000](http://localhost:3000) to inspect the UI powered by [apps/web](apps/web).
3. When it’s time to ship, `pnpm --filter web build` followed by `pnpm --filter web start` runs the production build.
4. Need an HTTPS preview? Use `pnpm --filter web dev -- --hostname 0.0.0.0 --port 3000` and grab the URL from your tunneling service.

## Bots Bring Me Money (Automation Launchpad)

1. `cd workspace/docs/Labs-Ai` and run `.

- Tie new revenue streams back into this playbook so the next time you ask the repo for “bots,” you know exactly which script to run.- If you add a new bot, list it under **workspace/docs/Labs-Ai/lib/** and document its trigger here.## Next Actions- `pnpm lint` and `pnpm build` from the root keep every workspace in sync.- `workspace/docs/Labs-Ai/activate-all-bots.ps1` – relaunch bots in PowerShell.- `pnpm --filter api build && pnpm --filter api start` – local Azure Functions host.- `pnpm dev:web` – live website; ideal for demos.## Command Shortcuts to Memorize- When you say “show me website” or “bots bring money,” point your IDE at this file so the commands are always within reach.- Reserve `workspace/docs/Labs-Ai` for monetization flows; drop new bots into `lib/` and document their behavior inside `docs/Labs-Ai` so future teammates can follow the money.- Keep `api/src/functions/*` aligned with each bot function name so triggers are clear.- Treat `apps/web` as the customer-facing zone; add UI docs there before anything else.## Smart Folder Habits4. Use `workspace/src/bot_manager.py` to script cross-platform checks or to log wallet hits from the AI services.3. When you tweak `lib/bot-builder.ts` or `lib/guardian-bot.ts`, rerun `activate-all-bots.ps1` so the updated bundles reload everywhere.2. `workps1` scripts in that folder orchestrate Guardian, Spark, WhatsApp, and other bot families while logging revenue hits to `public/robots.txt` landmarks.efresh-env.ps1`(if it exists) before invoking`activate-all-bots.ps1` so every bot has fresh secrets.
