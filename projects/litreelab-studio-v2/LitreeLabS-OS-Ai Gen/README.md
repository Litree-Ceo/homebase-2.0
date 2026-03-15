# LiTreeLab Studio - Prompt-to-Metaverse Generation Engine

A sophisticated AI-powered Metaverse UI generation platform using Google Gemini API.

## 🚀 Features

- **AI-Powered Generation**: Create stunning Metaverse UI widgets from natural language prompts
- **3D Metaverse Dashboard**: Interactive 3D scene with React Three Fiber
- **Multiple Style Variations**: Generates 3 unique design directions per prompt
- **Real-time Streaming**: Watch your UI components generate in real-time
- **Secure API Proxy**: API keys protected on backend, never exposed to frontend
- **Modern Architecture**: React + TypeScript + Vite + Express

## 📁 Project Structure

```
LitreeLabS-OS-Ai Gen/
├── components/           # React components
│   ├── ArtifactCard.tsx
│   ├── DottedGlowBackground.tsx
│   ├── ErrorToast.tsx         # NEW: Error notifications
│   ├── Icons.tsx
│   ├── LoadingSpinner.tsx     # NEW: Animated loader
│   ├── SideDrawer.tsx
│   └── StreamingCodeBlock.tsx # NEW: Code streaming effect
├── hooks/                # NEW: Custom React hooks
│   ├── useGeminiSession.ts    # Session management
│   ├── usePlaceholders.ts     # Placeholder cycling
│   ├── useStreamingText.ts    # Text streaming effect
│   └── index.ts
├── server/               # NEW: Secure backend proxy
│   ├── server.js
│   └── package.json
├── constants.ts          # App constants
├── types.ts              # TypeScript types
├── utils.ts              # Utilities
├── index.tsx             # Main app (refactored)
├── index.css             # Styles (enhanced)
├── package.json          # Dependencies & scripts
├── vite.config.ts        # NEW: Vite configuration
├── tsconfig.json         # NEW: TypeScript config
└── .env                  # API keys (not committed)
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This starts both:
   - Backend proxy server on http://localhost:3001
   - Frontend Vite dev server on http://localhost:3000

## 🔐 Security

**CRITICAL**: The API key is now stored only on the backend server (`server/.env`) and never exposed to the frontend. All Gemini API calls are proxied through the secure Express server.

### API Endpoints

- `POST /api/generate-styles` - Generate 3 design style variations
- `POST /api/generate-artifact` - Generate HTML/CSS for a specific style

## 🎨 Architecture Improvements

### 1. Custom Hooks
- `useGeminiSession` - Manages AI session state and API calls
- `useStreamingText` - Animated text streaming effect
- `usePlaceholders` - Cycling placeholder text

### 2. Enhanced Components
- **ErrorToast** - User-friendly error notifications with auto-dismiss
- **StreamingCodeBlock** - Animated code display with syntax highlighting
- **LoadingSpinner** - Animated loading indicator

### 3. Better Error Handling
- API errors are caught and displayed to users
- Network failures show clear messages
- Graceful fallbacks for failed generations

### 4. Code Organization
- Separated concerns: hooks, components, types
- TypeScript for type safety
- Modular component architecture

## 🚀 Usage

1. Open http://localhost:3000
2. Enter a prompt like "Design a minimalist weather card"
3. Watch as 3 unique Metaverse UI variations are generated
4. Click on any artifact to focus it
5. Click "Source" to view the streaming code
6. Click "Full Site" to see the 3D Metaverse dashboard

## 📝 Environment Variables

Create a `.env` file in the root:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=3001
NODE_ENV=development
```

Get your API key from: https://aistudio.google.com/app/apikey

## 🏗️ Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## 📜 License

Apache-2.0
