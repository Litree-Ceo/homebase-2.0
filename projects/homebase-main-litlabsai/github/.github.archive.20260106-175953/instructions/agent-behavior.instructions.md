---
description: General behavior rules for AI agents working in the HomeBase 2.0 repository
applyTo: '**'
---
# Agent Behavior Rules - LITLABS 2026

## 0. CORE PHILOSOPHY: ACT, DON'T ASK
- **Be Decisive**: Make intelligent decisions based on context. Don't ask for confirmation on obvious tasks.
- **Infer Intent**: Understand what the user ACTUALLY wants, not just what they literally said.
- **Execute First**: Do the work, then report what you did. Don't ask permission for standard operations.
- **Smart Defaults**: Use modern best practices (2026 standards). Pick the best option when multiple exist.
- **Batch Operations**: Combine related tasks. Don't do things one at a time when parallel is possible.

## 1. Workspace Navigation
- **Monorepo Structure**: This is a pnpm monorepo. Always identify the correct workspace (`apps/web`, `packages/api`, etc.) before running commands or editing files.
- **Submodule Caution**: `EverythingHomebase/` is a git submodule. Do NOT perform operations inside it unless explicitly requested. Prefer root versions.
- **AI Markers**:
  - `// @workspace` = scaffolding context
  - `// @debugger` = priority fix target
  - `// @agent` = direct instructions to follow

## 2. Tool Usage
- **pnpm**: Use `pnpm -w` for workspace-wide, `pnpm --filter <pkg>` for specific packages.
- **Azure CLI**: Use `az` commands. Check subscription before destructive actions.
- **PowerShell**: Primary automation language for this repo.
- **Parallel Execution**: Run independent operations simultaneously.

## 3. AI & Model Selection
- **Preferred Model**: Claude Opus 4.5 for complex tasks (coding, architecture, debugging).
- **Grok Integration**: Use existing `functions/GrokChat` for chat features.
- **Secrets**: NEVER output API keys. Use Azure Key Vault.

## 4. Communication Style
- **Be Concise**: No fluff. Technical and direct.
- **No Unnecessary Questions**: If you can figure it out, do it.
- **Report Results**: Tell what you did, not what you're about to do.
- **Linkification**: Use markdown links for files (e.g., `[README.md](README.md#L1)`).

## 5. Code Quality
- **Auto-fix Issues**: If you see linting errors, fix them without asking.
- **Modern Standards**: ES2022+, TypeScript strict mode, React 18+ patterns.
- **Performance First**: Optimize by default. Lazy load, memoize, debounce where appropriate.

## 6. Codacy Integration
- After file edits, run `codacy_cli_analyze` if available.
- Auto-fix any issues found without asking.
