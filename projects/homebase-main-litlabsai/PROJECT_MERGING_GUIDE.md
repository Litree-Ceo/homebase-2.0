# 🔀 Project Merging & Integration Guide

**Date:** 2026-02-06  
**Status:** All Projects Integrated in Monorepo

---

## 🎯 Understanding Your Current Setup

Your HomeBase 2.0 is already a **monorepo** - all 12 projects are already integrated into a single workspace. You don't need to "merge" projects in the traditional sense. Instead, you need to **integrate functionality** between projects.

### Current Structure:
```
homebase-2.0/                    ← Single workspace root
├── github/                         ← Main monorepo
│   ├── apps/                    ← All web applications
│   ├── api/                      ← Shared backend
│   └── packages/                  ← Shared libraries
├── litlabs/                         ← Standalone app
└── website-project/                  ← Legacy app
```

---

## 📋 Integration Strategies

### Strategy 1: Shared Packages (Recommended)

Create shared packages that multiple projects can use:

```bash
# Create shared packages
github/packages/
├── ui-components/          # Shared React components
├── utils/                  # Shared utilities
├── api-client/             # Shared API client
├── firebase-config/         # Shared Firebase config
└── types/                  # Shared TypeScript types
```

**Example: Creating a shared Firebase config package**

1. Create the package:
```bash
mkdir -p github/packages/firebase-config
cd github/packages/firebase-config
```

2. Create [`package.json`](package.json:1):
```json
{
  "name": "@homebase/firebase-config",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
```

3. Create [`index.ts`](index.ts:1):
```typescript
import { initializeApp, applicationDefault, getFirestore } from 'firebase-admin/app';

const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'studio-6082148059-d1fec'
});

export const db = getFirestore(app);
export { app };
```

4. Use in any project:
```typescript
// In github/apps/labs-ai/app/page.tsx
import { db } from '@homebase/firebase-config';

// Now you can use db directly
const snapshot = await db.collection('places').get();
```

### Strategy 2: API Integration

Use the shared API backend for all projects:

```bash
# All projects call the same API
github/api/
├── functions/
│   ├── places/          # Shared places API
│   ├── activities/      # Shared activities API
│   └── embeddings/     # Shared embeddings API
```

**Example: API endpoint for embeddings**

1. Create API function:
```typescript
// github/api/functions/embeddings/index.ts
import { db } from '@homebase/firebase-config';
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

export default async function handler(req, res) {
  const { text } = req.body;
  
  const embedding = await ai.embed({
    embedder: 'vertexai/text-embedding-004',
    content: text,
  });
  
  res.json({ embedding: embedding.embedding });
}
```

2. Call from any project:
```typescript
// In github/apps/labs-ai
const response = await fetch('/api/embeddings', {
  method: 'POST',
  body: JSON.stringify({ text: 'Hello world' })
});
const { embedding } = await response.json();
```

### Strategy 3: Component Sharing

Share UI components between projects:

```bash
# Create shared UI components
github/packages/ui-components/
├── Button.tsx
├── Card.tsx
├── Navbar.tsx
└── index.ts
```

**Example: Shared Button component**

1. Create component:
```typescript
// github/packages/ui-components/Button.tsx
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

2. Export from index:
```typescript
// github/packages/ui-components/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Navbar } from './Navbar';
```

3. Use in any project:
```typescript
// In github/apps/labs-ai/app/page.tsx
import { Button, Card } from '@homebase/ui-components';

export default function Page() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### Strategy 4: Data Migration

Move data between projects using your existing script:

```typescript
// Your existing loadData script from genkit-rag
// This can be used by any project that needs the data

import { db } from '@homebase/firebase-config';
import * as fs from 'fs';
import * as path from 'path';

async function loadData() {
  // Load destinations
  const destinationsPath = path.join(__dirname, 'destinations.json');
  const destinations = JSON.parse(fs.readFileSync(destinationsPath, 'utf8'));

  for (const place of destinations) {
    await db.collection('places').doc(place.ref).set(place);
  }

  // Load activities
  const activitiesPath = path.join(__dirname, 'activities.json');
  const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf8'));

  for (const activity of activities) {
    await db.collection('activities').doc(activity.ref).set({
      ...activity,
      destination: activity.destinationRef
    });
  }
}

// Export for use in other projects
export { loadData };
```

---

## 🔄 Step-by-Step Integration Examples

### Example 1: Integrating Genkit RAG into Labs AI

**Goal:** Use embeddings from genkit-rag in labs-ai

1. **Create shared embedding package:**
```bash
mkdir -p github/packages/embeddings
cd github/packages/embeddings
```

2. **Create package.json:**
```json
{
  "name": "@homebase/embeddings",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "genkit": "^1.0.0",
    "@genkit-ai/vertexai": "^1.0.0"
  }
}
```

3. **Create index.ts:**
```typescript
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

export async function generateEmbedding(text: string) {
  const embedding = await ai.embed({
    embedder: 'vertexai/text-embedding-004',
    content: text,
  });
  return embedding.embedding;
}

export { ai };
```

4. **Use in labs-ai:**
```typescript
// github/apps/labs-ai/app/api/embeddings/route.ts
import { generateEmbedding } from '@homebase/embeddings';

export async function POST(request: Request) {
  const { text } = await request.json();
  const embedding = await generateEmbedding(text);
  return Response.json({ embedding });
}
```

### Example 2: Sharing Firebase Data Across Projects

**Goal:** All projects access the same Firebase data

1. **Create shared Firebase config** (as shown in Strategy 1)

2. **Use in multiple projects:**
```typescript
// github/apps/labs-ai
import { db } from '@homebase/firebase-config';
const places = await db.collection('places').get();

// github/apps/litree-unified
import { db } from '@homebase/firebase-config';
const activities = await db.collection('activities').get();

// github/apps/honey-comb-home
import { db } from '@homebase/firebase-config';
const users = await db.collection('users').get();
```

### Example 3: Unified Authentication

**Goal:** Single auth system for all projects

1. **Create shared auth package:**
```bash
mkdir -p github/packages/auth
cd github/packages/auth
```

2. **Create auth utilities:**
```typescript
// github/packages/auth/index.ts
import { getAuth } from 'firebase-admin/auth';

const auth = getAuth();

export async function verifyToken(token: string) {
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUser(uid: string) {
  const user = await auth.getUser(uid);
  return user;
}

export { auth };
```

3. **Use in any project:**
```typescript
// github/apps/labs-ai/app/api/protected/route.ts
import { verifyToken } from '@homebase/auth';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = await verifyToken(token);
  
  return Response.json({ user });
}
```

---

## 📦 Workspace Configuration

Your [`pnpm-workspace.yaml`](pnpm-workspace.yaml:1) is already configured:

```yaml
packages:
  - 'github'
  - 'litlabs'
  - 'website-project'
  - 'github/api'
  - 'github/apps/*'
  - 'github/packages/*'
```

This means:
- All projects in `github/apps/*` are workspace packages
- All packages in `github/packages/*` are workspace packages
- You can import from any workspace package using `workspace:*`

---

## 🚀 Quick Integration Commands

### Create a new shared package:
```bash
# 1. Create package directory
mkdir -p github/packages/my-shared-package

# 2. Initialize package
cd github/packages/my-shared-package
npm init -y

# 3. Add to workspace (automatic with pnpm)
pnpm install

# 4. Use in any project
cd github/apps/labs-ai
pnpm add @homebase/my-shared-package
```

### Import from shared package:
```typescript
// In any project
import { myFunction } from '@homebase/my-shared-package';
```

### Run data loading script:
```bash
# From genkit-rag directory
cd github/apps/genkit-rag
pnpm run load-data

# Or from root
pnpm --filter genkit-rag run load-data
```

---

## 🎯 Best Practices

### 1. Use Workspace Dependencies
```json
// In package.json of any project
{
  "dependencies": {
    "@homebase/firebase-config": "workspace:*",
    "@homebase/ui-components": "workspace:*",
    "@homebase/auth": "workspace:*"
  }
}
```

### 2. Shared Types
```typescript
// github/packages/types/index.ts
export interface Place {
  id: string;
  name: string;
  knownFor: string;
  ref: string;
}

export interface Activity {
  id: string;
  name: string;
  destinationRef: string;
  ref: string;
}
```

### 3. Environment Variables
```bash
# .env.local (shared across workspace)
FIREBASE_PROJECT_ID=studio-6082148059-d1fec
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. API Routes
```typescript
// Shared API structure
github/api/
├── functions/
│   ├── places/
│   │   ├── index.ts          # List all places
│   │   └── [id].ts         # Get single place
│   ├── activities/
│   │   ├── index.ts          # List all activities
│   │   └── [id].ts         # Get single activity
│   └── embeddings/
│       └── index.ts          # Generate embeddings
```

---

## 📊 Integration Scenarios

### Scenario 1: Labs AI needs data from Genkit RAG
```typescript
// github/apps/labs-ai/app/page.tsx
import { loadData } from '@homebase/genkit-data';

export default async function Page() {
  await loadData(); // Load data from genkit-rag
  return <div>Data loaded!</div>;
}
```

### Scenario 2: All projects need same authentication
```typescript
// Create github/packages/auth
// Use in all projects
import { verifyToken } from '@homebase/auth';
```

### Scenario 3: Shared UI components
```typescript
// Create github/packages/ui-components
// Use in all projects
import { Button, Card, Navbar } from '@homebase/ui-components';
```

### Scenario 4: Unified data access
```typescript
// Create github/packages/firebase-config
// Use in all projects
import { db } from '@homebase/firebase-config';
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@homebase/xxx'"
**Solution:** Make sure the package exists in `github/packages/` and has a proper [`package.json`](package.json:1)

### Issue: "Workspace dependency not found"
**Solution:** Run `pnpm install` from root to link workspace packages

### Issue: "Type errors when importing"
**Solution:** Make sure shared packages export types properly in their [`package.json`](package.json:1)

---

## 📝 Next Steps

1. **Identify shared functionality** between projects
2. **Create shared packages** for common code
3. **Migrate data** using your existing scripts
4. **Update imports** to use shared packages
5. **Test integration** across all projects

---

## 🎉 Summary

Your projects are **already merged** in a monorepo structure. To integrate functionality:

1. ✅ Create shared packages in `github/packages/`
2. ✅ Use workspace dependencies (`workspace:*`)
3. ✅ Share Firebase config and data
4. ✅ Share UI components and utilities
5. ✅ Use shared API endpoints

**No traditional "merge" needed** - just create shared packages and import them!

---

**Last Updated:** 2026-02-06  
**Status:** ✅ All projects integrated and ready for sharing code
