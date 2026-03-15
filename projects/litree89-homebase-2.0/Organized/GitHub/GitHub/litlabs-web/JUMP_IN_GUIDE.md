# 🏃 JUMP-IN GUIDE - For Developers

**Read this first if you want to start coding immediately.**

---

## 📍 You Are Here

✅ **Architecture**: Complete
✅ **Backend**: Implemented
✅ **Types**: Defined
✅ **APIs**: Ready
❌ **UI**: Not started
❌ **Components**: Need you

**Your job**: Build React components using the architecture we just created.

---

## ⚡ 5-Minute Quick Start

### 1. Copy All Files

```bash
# All files are in the workspace already
# Just make sure you have:
#   - types/
#   - config/
#   - lib/
#   - app/api/
#   - .env.example
#   - tsconfig.json
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env.local`

```bash
cp .env.example .env.local
# Then fill in your actual keys
```

### 4. Start Server

```bash
npm run dev
# http://localhost:3000
```

### 5. Start Coding

```bash
# Create: components/auth/LoginForm.tsx
# See template below ↓
```

---

## 🎯 What to Build (In Order)

### 🔴 CRITICAL (Do These First)

#### 1. Authentication UI (2 hours)

```
components/auth/
├── LoginForm.tsx          ← Email/password login
├── SignupForm.tsx         ← Email/password register
└── PasswordReset.tsx      ← Forgot password

app/auth/
├── page.tsx               ← Auth layout
├── login/page.tsx         ← Login page
└── signup/page.tsx        ← Signup page

lib/
└── authContext.ts         ← React context for current user
```

**Why First?** Users can't access anything without authentication.

#### 2. Dashboard (2 hours)

```
app/dashboard/
└── page.tsx               ← Show user profile, worlds, stats

components/dashboard/
├── StatsCard.tsx
├── RecentWorlds.tsx
└── AIQuickChat.tsx
```

**Why Second?** Shows users what they created. Motivates them.

#### 3. World Creation (3 hours)

```
app/worlds/
├── page.tsx               ← List worlds
└── [worldId]/page.tsx     ← Edit world

components/worlds/
├── WorldList.tsx
├── WorldCard.tsx
├── WorldEditor.tsx        ← ⭐ Core feature
└── CreateWorldModal.tsx
```

**Why Third?** Core value proposition. "Create your world."

---

## 📝 Code Templates

### Template 1: Simple Component

```typescript
// components/hello/HelloWorld.tsx
'use client';

export default function HelloWorld() {
  return <h1>Hello, World!</h1>;
}
```

### Template 2: Component with Data

```typescript
// components/dashboard/UserCard.tsx
'use client';

import { useAuth } from '@/lib/authContext';

export default function UserCard() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### Template 3: Component with API Call

```typescript
// components/worlds/WorldList.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/authContext';
import type { World } from '@/types/world';

export default function WorldList() {
  const { user } = useAuth();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWorlds = async () => {
      try {
        const data = await db.getUserWorlds(user.id);
        setWorlds(data);
      } catch (error) {
        console.error('Error loading worlds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorlds();
  }, [user]);

  if (loading) return <p>Loading worlds...</p>;

  return (
    <div>
      <h1>My Worlds ({worlds.length})</h1>
      <div className="grid">
        {worlds.map(world => (
          <WorldCard key={world.id} world={world} />
        ))}
      </div>
    </div>
  );
}
```

### Template 4: Component with Form

```typescript
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { loginWithEmail } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Template 5: Component with Drag & Drop

```typescript
// components/worlds/WorldEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/authContext';
import type { World } from '@/types/world';
import { WIDGETS } from '@/config/widgets';

export default function WorldEditor({ worldId }: { worldId: string }) {
  const { user } = useAuth();
  const [world, setWorld] = useState<World | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadWorld = async () => {
      const data = await db.getWorld(user.id, worldId);
      setWorld(data);
    };

    loadWorld();
  }, [user, worldId]);

  const handleAddWidget = (widgetId: string) => {
    if (!world) return;

    const widget = WIDGETS[widgetId];
    if (!widget) return;

    const newWidget = {
      id: `widget_${Date.now()}`,
      type: widgetId,
      position: { x: 0, y: 0 },
      config: widget.defaultConfig || {},
      isVisible: true,
    };

    setWorld({
      ...world,
      widgets: [...world.widgets, newWidget],
    });
  };

  const handleSave = async () => {
    if (!world || !user) return;

    try {
      await db.saveWorld(user.id, world);
      alert('World saved!');
    } catch (error) {
      alert('Failed to save world');
    }
  };

  if (!world) return <p>Loading world...</p>;

  return (
    <div>
      <h1>{world.name}</h1>

      {/* Widget Selector */}
      <div className="widget-selector">
        <p>Add Widget:</p>
        {Object.entries(WIDGETS).map(([id, widget]) => (
          <button
            key={id}
            onClick={() => handleAddWidget(id)}
          >
            + {widget.name}
          </button>
        ))}
      </div>

      {/* World Canvas */}
      <div className="world-canvas">
        {world.widgets.map(widget => (
          <div
            key={widget.id}
            className="widget"
            style={{
              left: `${widget.position.x}px`,
              top: `${widget.position.y}px`,
            }}
          >
            <p>{WIDGETS[widget.type]?.name}</p>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button onClick={handleSave}>Save World</button>
    </div>
  );
}
```

---

## 🔗 How the Backend Works (Reference)

### Database Operations

```typescript
import { db } from "@/lib/db";

// Get current user
const user = await db.getCurrentUser();

// Get user profile
const profile = await db.getUserProfile(userId);

// Save a world
await db.saveWorld(userId, world);

// Load user's worlds
const worlds = await db.getUserWorlds(userId);

// Check subscription
const subscription = user.subscription;
const isPro = subscription.planId === "pro";
```

### API Calls

```typescript
// Save world via API
const response = await fetch("/api/worlds/save", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ world, userId }),
});
const { world: savedWorld } = await response.json();

// Chat with AI
const response = await fetch("/api/ai/chat", {
  method: "POST",
  body: JSON.stringify({
    message: "How can I make money?",
    persona: "moneyBot",
    userId,
  }),
});
const { reply } = await response.json();

// Start subscription
const response = await fetch("/api/payments/create-subscription", {
  method: "POST",
  body: JSON.stringify({ planId: "pro", userId, email }),
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

---

## 🎨 Types Reference (What You'll Use)

```typescript
import type { World } from "@/types/world";
import type { UserProfile } from "@/types/user";
import type { MarketplaceItem } from "@/types/marketplace";

// World structure
const world: World = {
  id: "world_123",
  ownerId: "user_456",
  name: "My First World",
  themeId: "cyber",
  widgets: [], // WidgetInstance[]
  visibility: "private",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// User profile structure
const user: UserProfile = {
  id: "user_123",
  email: "user@example.com",
  displayName: "John Doe",
  subscription: {
    planId: "pro",
    status: "active",
    stripeCustomerId: "cus_123",
  },
  glowPoints: 1000,
};

// Marketplace item
const item: MarketplaceItem = {
  id: "item_123",
  type: "world",
  ownerId: "user_456",
  title: "Cyberpunk World Template",
  description: "Ready-to-use world with widgets",
  priceFiatCents: 2999, // $29.99
  visibility: "listed",
};
```

---

## 🚦 Component Checklist

### Week 1: Foundation ✅

- [ ] LoginForm.tsx
- [ ] SignupForm.tsx
- [ ] Root layout (app/layout.tsx)
- [ ] Navbar component
- [ ] Auth context provider
- [ ] Dashboard page

**Checkpoint**: Can sign up, login, see dashboard

### Week 2: Worlds ✅

- [ ] WorldList.tsx
- [ ] WorldCard.tsx
- [ ] CreateWorldModal.tsx
- [ ] WorldEditor.tsx
- [ ] ThemeSwitcher.tsx
- [ ] World save/load integration

**Checkpoint**: Can create worlds, add widgets, see them persisted

### Week 3: Payments ✅

- [ ] SubscribePanel.tsx
- [ ] PricingTable.tsx
- [ ] CheckoutButton.tsx
- [ ] Billing settings page
- [ ] Test subscription flow

**Checkpoint**: Stripe subscription works, webhook syncs Firestore

### Week 4: Features ✅

- [ ] All 8 widgets (implementation)
- [ ] Marketplace UI
- [ ] Presence system
- [ ] Chat widget
- [ ] AI chat panel

**Checkpoint**: Full feature set working

---

## 🐛 Debugging Tips

### "Type error: Cannot find module '@/lib/db'"

**Fix**: Make sure tsconfig.json has `"baseUrl": "."` and `"paths"`

### "Firebase not initialized"

**Fix**: Check `.env.local` has all FIREBASE\_\* variables

### "Stripe webhook test fails"

**Fix**: Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/payments/webhook`

### "Component shows 'Loading...' forever"

**Fix**: Check if `useAuth()` context is set up in root layout

### "API route returns 500"

**Fix**: Check server logs in terminal, look for try/catch errors

---

## 📚 Helpful Resources

### Next.js

- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### React

- Hooks: https://react.dev/reference/react/hooks
- useState: https://react.dev/reference/react/useState
- useEffect: https://react.dev/reference/react/useEffect

### Firebase

- Firestore: https://firebase.google.com/docs/firestore
- Auth: https://firebase.google.com/docs/auth
- Web: https://firebase.google.com/docs/web/setup

### TypeScript

- Handbook: https://www.typescriptlang.org/docs/
- Types: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html

---

## 💬 Common Questions

### Q: Do I need to install more packages?

**A**: The essential ones are already in package.json. You might want:

```bash
npm install dnd-kit  # Drag & drop
npm install tailwindcss  # Styling
npm install react-hot-toast  # Notifications
```

### Q: What CSS framework should I use?

**A**: Tailwind CSS is recommended (pre-configured in most Next.js projects)

### Q: Should I use TypeScript?

**A**: YES. The entire backend is typed. Stay consistent.

### Q: How do I test payments locally?

**A**: Use Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
# Then use Stripe test card: 4242 4242 4242 4242
```

### Q: How do I handle loading states?

**A**: Pattern:

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // do work
  } catch (error) {
    // handle error
  } finally {
    setLoading(false);
  }
};
```

---

## ⚡ Pro Tips

1. **Use TypeScript types** - Don't skip `as any`, fix the type instead
2. **Test APIs in Postman** - Before building UI, test API routes
3. **Console.log early** - Debug issues faster
4. **Commit frequently** - Small, focused commits are easier to debug
5. **Read error messages** - They're usually helpful
6. **Check types first** - 90% of bugs are type mismatches

---

## 🎯 Your First Coding Task

### Build LoginForm Component (1 hour)

```typescript
// components/auth/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '@/lib/db';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginWithEmail(email, password);
      console.log('Logged in:', user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {error && (
        <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <a href="/auth/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
```

**Try it:**

1. Create the file above
2. Create `app/auth/login/page.tsx` that imports & renders `<LoginForm />`
3. Run `npm run dev`
4. Go to http://localhost:3000/auth/login
5. Try logging in with test credentials

---

## 🚀 You're Ready!

You have everything you need:

- ✅ Types (complete)
- ✅ Database (complete)
- ✅ APIs (complete)
- ✅ Config (complete)
- ✅ Templates (above)
- ✅ Documentation (in repo)

**Now build!** 🎉

Questions? Check the markdown files:

- `ARCHITECTURE_TYPESCRIPT_NEXTJS.md` - Big picture
- `IMPLEMENTATION_CHECKLIST.md` - Specific tasks
- `VISUAL_SUMMARY.md` - How it all fits together

**Let's ship this! 🚀**
