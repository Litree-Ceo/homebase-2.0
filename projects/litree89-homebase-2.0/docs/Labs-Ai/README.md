# LitLabs AI

LitLabs AI is an AI-powered platform for content creators, beauty professionals, and small businesses to generate content, manage clients, and monetize their services.

## Features

- **AI Content Generation**: Automatically generate posts, videos, images, and music
- **Multi-Channel Deployment**: Publish to TikTok, Instagram, YouTube, and more
- **Bot Builder**: Create WhatsApp, Discord, and custom bots
- **Analytics Dashboard**: Real-time insights into performance and engagement
- **Marketplace**: Buy, sell, and monetize AI content and services
- **Subscription Management**: Built-in payment processing with Stripe
- **Rate Limiting & Security**: Enterprise-grade security with rate limiting and validation

## Tech Stack

- **Frontend**: Next.js 16.0.7, React 19.2.1, TypeScript, Tailwind CSS 4.1.17
- **Backend**: Node.js, Firebase, Firestore
- **AI/ML**: OpenAI API, Google AI, Music generation APIs
- **Payments**: Stripe, PayPal
- **Deployment**: Vercel, Docker, Google Play Store (Android app included)

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Stripe account (for payments)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/LiTree89/Labs-Ai.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with the following:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# APIs
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_key
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run typecheck    # Type check with TypeScript

# Testing
npm run test         # Run unit tests
```

## Project Structure

```
.
├── app/              # Next.js app directory
│   ├── api/          # API routes (37 endpoints)
│   ├── admin/        # Admin dashboard
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # User dashboard
│   └── ...           # Other pages
├── lib/              # Utility functions and services
│   ├── firebase.ts   # Firebase configuration
│   ├── stripe.ts     # Stripe integration
│   ├── ai/           # AI service integrations
│   ├── bots/         # Bot builders (WhatsApp, Discord, etc)
│   └── middleware/   # Express middleware (rate limiting, CORS)
├── components/       # React components
├── public/           # Static assets
└── package.json      # Dependencies
```

## API Routes

The application includes 37 comprehensive API endpoints:

- **Authentication**: User signup, login, verification
- **Payments**: Stripe & PayPal checkout, webhooks
- **AI Features**: Content generation, image generation, video generation
- **Bots**: WhatsApp, Discord, and custom bot management
- **Analytics**: Real-time metrics and performance data
- **Admin**: User and system management
- **Webhooks**: Stripe, PayPal, WhatsApp integrations

See `SECURITY.md` for security details and `AUDIT_REPORT.md` for comprehensive audit results.

## Security

- ✅ 0 npm vulnerabilities
- ✅ Rate limiting (3-tier system)
- ✅ CORS configuration with whitelist
- ✅ Zod input validation on all endpoints
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ Webhook signature verification
- ✅ Environment variable validation

See [SECURITY.md](./SECURITY.md) for detailed security information.

## Deployment

### Vercel

```bash
vercel deploy --prod
```

### Docker

```bash
docker build -t labs-ai .
docker run -p 3000:3000 labs-ai
```

### Android App

A signed Android APK is available in `android-app/` directory, ready for Google Play Store submission.

## Performance

- **Build Size**: 624.86 MB (optimized)
- **Routes**: 50+ prerendered pages
- **Build Tool**: Next.js 16.0.7 with Turbopack
- **TypeScript**: Strict mode, zero errors

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](./CODE_OF_CONDUCT.md).

## Support

- 📖 [Documentation](./docs)
- 🐛 [Report a bug](https://github.com/LiTree89/Labs-Ai/issues)
- 💡 [Request a feature](https://github.com/LiTree89/Labs-Ai/discussions)

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Next.js and Vercel
- Firebase and Google Cloud
- OpenAI and Anthropic
- Stripe and PayPal
- Community contributors

---

**Status**: ✅ Production Ready  
**Last Updated**: December 4, 2025  
**Version**: 1.0.0
