# HomeBase Portfolio

React + Vite frontend with Firebase Cloud Functions backend.

## Requirements

- Node.js 20.x recommended
- npm 9+

## One-time setup

```bash
npm run setup
```

This installs dependencies for both root and `functions/`.

## Build

```bash
# Frontend only
npm run build

# Functions only
npm run build:functions

# Both
npm run build:all
```

## Development

```bash
# Frontend dev server
npm run dev

# Preview production build
npm run preview
```

## Quality checks

```bash
npm run lint
npm run check:all
npm run sync:check
```

## Deployment helpers

```bash
npm run deploy:prod
npm run deploy:staging
npm run deploy:prod:functions
```

## AI token-saving mode (Groq)

Set these env vars in your Functions environment (or local shell) to lower cost:

```bash
GROQ_TOKEN_SAVER=true
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_COMPLETION_TOKENS=256
GROQ_MAX_INPUT_CHARS=2200
```

Behavior when token saver is enabled:

- Uses a smaller model by default
- Caps output tokens
- Trims oversized user input
- Uses a compact system prompt

## Groq connectivity test

```bash
# Ensure GROQ_API_KEY is set first
npm run token:test
```
