# Project Rules & Configuration

## Environment
- **Node Version**: >=18.17.0
- **Package Manager**: pnpm
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Hosting**: Firebase Hosting

## Commands
- **Development**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Deploy**: `firebase deploy`

## Configuration Files
- **Dependencies**: `package.json`
- **Next.js Config**: `next.config.js`
- **Firebase Config**: `firebase.json`
- **TypeScript Config**: `tsconfig.json`
- **Environment Variables**: `.env.local` (do not commit real keys)
- **Bot Config**: `openclaw.json` (managed via CLI)

## Architecture
- **Apps**: `apps/litlabs-web`
- **Bot Automation**: OpenClaw (Telegram integration enabled)
- **State**: React Context / Hooks
- **Styling**: Tailwind CSS
- **Database**: Firestore
- **Auth**: Firebase Auth
- **Payments**: Stripe, Coinbase

## Deployment
The project is configured to deploy to Firebase Hosting.
Ensure `firebase-tools` is installed globally (`npm install -g firebase-tools`).
Run `firebase login` before deploying.
