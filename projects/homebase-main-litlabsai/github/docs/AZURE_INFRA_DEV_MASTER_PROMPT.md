# Azure, Infrastructure & Dev Server Master Prompt

This new guide ties together the Azure setup steps, Function App deployment, infrastructure Bicep artifacts, and the “how to start the dev server” workflow that your VS Code environment keeps asking about. Use it as a single reference or paste the **Master Prompt** section straight into an LLM/Copilot session to surface the same checklist.

## 1. Azure resource management checklist
- Authenticate with Azure and ensure the **Azure Account** extension can see a default subscription (pick one in the blue dropdown or run `az account set --subscription <name>`). Confirm `az account show` succeeds.
- Use `AZURE_SETUP_GUIDE.md` (see `docs/AZURE_SETUP_GUIDE.md`) for the canonical script-by-script flow:
  1. Assign Key Vault roles (Key Vault Administrator or Secrets Officer).
  2. Write the COSMOS-ENDPOINT, SIGNALR-CONN, and GROK-API-KEY secrets into `EverythingHomebase-kv`.
  3. Enable the Function App’s system-assigned identity and authorize it to read from Key Vault.
  4. Point `EverythingHomebase-func`’s settings at `@Microsoft.KeyVault(...)` references.
  5. Wire Application Insights and Log Analytics (instrumentation key + smart-detection action group).
  6. Deploy `functions/GrokChat/index.js` via `func azure functionapp publish EverythingHomebase-func --build remote`.
  7. Test the deployment by hitting the function URL or listing `az functionapp function show ... GrokChat`.
- Keep this doc nearby whenever Azure tasks are in progress because the VS Code assistant repeatedly checks steps 1–6.

## 2. Function App deployment & runtime
- The function code lives in `functions/GrokChat/index.js`; it expects `GROK_API_KEY` and the Key Vault–backed settings configured above.
- Deploy by running `func azure functionapp publish EverythingHomebase-func --build remote` from `functions/`.
- After deployment, verify the `GrokChat` function is healthy via `az functionapp function show … --function-name GrokChat` and inspect logs in Application Insights.
- Restart or redeploy whenever dependencies change; the VS Code “Check for Java and Maven” step is unrelated to this function but the Azure checks rely on the same pipeline.

## 3. Infrastructure Bicep references
- `infrastructure-function-app.bicep` (root) defines the Function App, Key Vault, Application Insights, and linked storage pieces. Use `az deployment group create --template-file infrastructure-function-app.bicep ...` to redeploy if needed.
- `main.bicep` wires together higher-level infrastructure (Resource Group, Cosmos DB, SignalR, etc.). Review the parameters at the top before running `az deployment sub create ...` and keep an eye on `litree` naming conventions.
- When editing either file, validate with `bicep build` or `az bicep build --file <path>` before redeploying so the Azure CLI can detect schema/parameter issues.

## 4. Development server flow
1. **Install dependencies**: run your preferred package manager (`pnpm install`, or `npm install` / `yarn install`). This ensures all workspace packages (Next.js, shared libs) are linked.
2. **Configure secrets**: copy `/apps/whatever/.env.example` or the workspace-wide `.env.example` into `.env.local` (or `.env`) and fill in API keys, Firebase config, etc. This mirrors the “Read project files” step that the agent mentions while scanning `.env` files.
3. **Start the server**: run `pnpm dev` (or `npm run dev`/`yarn dev`). The default Next.js host is `http://localhost:3000`. Watch the terminal (with shell integration enabled) so VS Code can attach command decorations and quick fixes if a port is blocked.
4. **Optional tooling**:
   - Firebase emulators: `firebase emulators:start` after `firebase login` / `firebase init`.
   - Docker: `docker compose up --build` if you prefer containerized environments.
   - Use `Ctrl+Shift+P` → `Developer: Reload Window` after changing `.env` or `pnpm install` so VS Code refreshes state.

## 5. Generative site automation answer
Yes, you can auto-generate visuals, copy, and even completed layouts from text. Typical architecture:
1. Use AI image services (Midjourney, DALL·E 3, Stability) or stock libraries (Envato) to output PNGs/WebP.
2. Generate short looping videos with Runway ML, Pika Labs, or Synthesia scripts and store URLs.
3. Drive copy and section structure via GPT-4 prompts or specialized tools (V0.dev, Builder.io, Locofy.ai).
4. Build Next.js templates that accept JSON (hero copy, testimonial arrays, asset URLs) and feed them the generated assets.
This “text-to-site” flow matches what you described—hook the prompt into your deployment pipeline, run generation scripts, and the site self-populates.

## 6. Master prompt (LLM / Copilot ready)
Use this when you want an AI companion to walk through the work automatically:

```
You are an EverythingHomebase 2.0 setup assistant. Execute the following checklist:
1. Confirm the Azure CLI is logged in (`az account show`), select the correct subscription, and assign the Key Vault role if missing.
2. Push COSMOS-ENDPOINT, SIGNALR-CONN, GROK-API-KEY secrets into EverythingHomebase-kv, then assign the EverythingHomebase-func system identity and grant it Key Vault secret permissions.
3. Update EverythingHomebase-func settings to reference Key Vault values and add APPINSIGHTS_INSTRUMENTATIONKEY plus other env vars.
4. Link Application Insights to the Grok Function via smart detection action groups and Log Analytics.
5. Deploy `functions/GrokChat/index.js` with `func azure functionapp publish EverythingHomebase-func --build remote` and verify using `az functionapp function show ... --function-name GrokChat`.
6. Review `infrastructure-function-app.bicep` and `main.bicep`, rerun `bicep build` if necessary, and redeploy via `az deployment` commands when infrastructure drift is detected.
7. For local development, run `pnpm install`, copy `.env.example` to `.env.local`, start the server with `pnpm dev`, and optionally run Firebase emulators or Docker compose if those targets are available.
8. If the user asks about generative rich media, explain how AI image/video services plus GPT-based copywriting can feed a Next.js template to auto-fill entire pages.
```

Drop this doc into your workspace to stop the VS Code assistant from complaining—each section follows the same steps the UI highlights and makes them easy to re-run whenever Copilot or Gemini stalls out.
