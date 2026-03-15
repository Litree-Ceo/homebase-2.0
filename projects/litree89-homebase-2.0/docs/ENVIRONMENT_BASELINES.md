# Environment Baselines for HomeBase 2.0

This checklist mirrors the “bases” the VS Code copilots keep trying to confirm: the Azure CLI/account layer, the `.env` inventory, and your local Java toolchain. Follow the steps below whenever you need to “fix everything up” after cloning the repo or when the agent stalls on these prompts.

## 1. Confirm Azure CLI and VS Code shell integration
- Install/refresh the **Azure Account** extension so the picker at the top (bright blue dropdown) can surface your subscriptions. Click **Set Default Project** or run `az account set --subscription <name>` to match the VS Code choice.
- In a terminal, run `powershell.exe -Command "az account show"` (or the POSIX equivalent) to ensure the CLI is logged in, has a default subscription, and returns JSON about your tenant.
- If the environment checker keeps asking for shell integration, look for the banner to “Enable shell integration” and accept it so run commands are captured by the onboarding assistant.
- After login, run `az configure --defaults location=<your-region> group=<rg-name>` if the workspace scripts expect defaults and you see “Check Azure CLI and environment configuration” stuck on step 3/6.

## 2. Audit environment configurations
- Run an inventory of `.env` files with `find . -name "*.env*" -not -path "*/node_modules/*"` (or `rg --files -g "*.env*"`). The agent draws on this list when it says “Read project files and searched for text” to know what secrets or samples exist.
- When you see multiple `.env.example` files, copy the relevant one into an `.env` at the app level you plan to work on (e.g., `apps/web/.env`). Document any overrides in `docs/ENV_CONFIGURATION.md`.
- Keep one terminal tab dedicated to `bat`/`powershell` output so you can scroll back to the agent’s command history and confirm that each check completes without errors.

## 3. Verify the Java/Maven baseline
- Run `java -version` and `mvn -version` (or `./mvnw -v`) so VS Code knows a JDK and Maven wrapper are available; this addresses the “Check for Java and Maven installation (1/4)” notification.
- If you use a custom JDK, set `JAVA_HOME` (in `settings.json` or your shell profile) to the installation path so the Spring extensions can resolve it.
- Open the Spring Boot dashboard, click the **Spring PetClinic** sample, and let it download; if that step fails, rerun `./mvnw clean package` from the newly generated sample to show the toolchain works.

## 4. Keep the “main base” context alive
- Add short notes to `docs/QUICK_START_COMMANDS.md` when you solve a blocker so future agents know the setup has already been executed.
- Use the command palette (`Ctrl+Shift+P`) and search for “Developer: Reload Window” after major dependency changes; this keeps status badges (e.g., “Check Azure CLI…”) from freezing.
- When troubleshooting, capture the terminal output to share with teammates instead of re-running the same check repeatedly; this reduces duplicate effort in the shared “main” branch.

Following these steps should resolve the repeated base checks you captured in the screenshot and let the automated helpers mark the setup as complete.
