# LiTreeLab Studio™

**Your Content. Your Empire.**

A unified creator platform combining studio tools, 3D metaverse, ProfitPilot automated trading, and AI assistance.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (port 3002)
pnpm dev

# Or from root
pnpm dev:studio-metaverse
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (Hero)
│   ├── layout.tsx            # Root layout with Firebase
│   ├── (studio)/
│   │   ├── dashboard/        # Creator analytics + ProfitPilot
│   │   ├── create/           # Content creation
│   │   ├── drops/            # Scheduled releases
│   │   └── files/            # Asset management
│   ├── (metaverse)/
│   │   └── hub/              # 3D metaverse entry
│   ├── (ai)/
│   │   └── chat/             # Agent Zero AI chat
│   └── api/
│       └── profitpilot/      # Trading API proxy
├── components/
│   ├── HeroSection.tsx       # Animated landing
│   ├── ProfitPilotWidget.tsx # Live trading stats
│   ├── MetaverseScene.tsx    # Three.js 3D scene
│   └── ...
├── lib/
│   └── firebase.tsx          # Firebase auth provider
└── hooks/
    └── useProfitPilot.ts     # Trading data hook
```

## 🎨 Features

- **Creator Studio**: Dashboard, content creation, analytics
- **3D Metaverse**: React Three Fiber immersive spaces
- **ProfitPilot Integration**: Live trading widgets, earnings tracking
- **AI Tools**: Agent Zero chat integration
- **Firebase Auth**: Secure authentication

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 🌐 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero |
| `/dashboard` | Creator studio dashboard |
| `/create` | Content creation |
| `/drops` | Scheduled releases |
| `/files` | Asset management |
| `/hub` | Metaverse entry |
| `/chat` | AI assistant |

## 🚀 Deployment

```bash
pnpm build
```

## 📄 License

MIT - LiTree Labs
