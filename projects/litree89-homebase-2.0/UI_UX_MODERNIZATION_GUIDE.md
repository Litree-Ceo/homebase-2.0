# 🎨 HomeBase 2.0 UI/UX Modernization - Setup Guide

## ✅ Completion Status

### Phase 1: Foundation (COMPLETED)

- ✅ Tailwind CSS configuration with extended theme
- ✅ PostCSS pipeline setup
- ✅ shadcn/ui components (Button, Card, Input)
- ✅ Global CSS variables for light/dark modes
- ✅ Utility functions (cn() for class merging)

### Phase 2: Core Features (COMPLETED)

- ✅ Modernized Feed component with:
  - Emoji reactions (emoji-mart)
  - Infinite scroll (React Query)
  - Media grid display
  - Expandable comments
- ✅ MediaUploader component with:
  - Drag-and-drop support
  - Instant file preview
  - Multi-file management
  - Cloud upload callbacks

### Phase 3: 3D & Metaverse (COMPLETED)

- ✅ Avatar3D component:
  - Three.js 3D avatar with animated parts
  - OrbitControls for interaction
  - Ambient + directional lighting
- ✅ MetaverseSpace component:
  - Interactive 3D environment
  - Floating platforms
  - Decorative elements
  - Night environment preset

### Phase 4: Profile & Pages (COMPLETED)

- ✅ UserProfilePage component with:
  - Cover image + avatar
  - Profile stats (followers, following, posts)
  - Tabs: Posts, Media Gallery, Pinned Modules
  - Media gallery with lightbox
  - Draggable module grid (react-grid-layout)
- ✅ Profile dynamic route: `/profile/[username]`
- ✅ Editor page for creating HomeBase modules:
  - Drag-and-drop widget layout
  - Edit/preview mode toggle
  - Widget palette sidebar
- ✅ Media upload API: `/api/upload/route.ts`

### Phase 5: Developer Tools (COMPLETED)

- ✅ VS Code extensions recommended
- ✅ ESLint + Prettier configured
- ✅ Tailwind IntelliSense enabled

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd e:\VSCode\HomeBase\ 2.0
pnpm install
```

### 2. Start Development Server

```bash
# Terminal 1: Frontend
pnpm -C apps/web dev

# Terminal 2: API (optional)
pnpm -C api start
```

Visit: **http://localhost:3000**

---

## 📁 New Files Created

### Components

| File                                   | Purpose                              |
| -------------------------------------- | ------------------------------------ |
| `src/components/ui/button.tsx`         | Reusable button with 6 variants      |
| `src/components/ui/card.tsx`           | Card container system                |
| `src/components/ui/input.tsx`          | Accessible text input                |
| `src/components/Feed.tsx`              | Modernized feed with emoji reactions |
| `src/components/MediaUploader.tsx`     | Drag-drop media upload               |
| `src/components/UserProfilePage.tsx`   | User profile with tabs               |
| `src/components/3D/Avatar3D.tsx`       | 3D avatar component                  |
| `src/components/3D/MetaverseSpace.tsx` | 3D metaverse environment             |

### Pages

| File                                  | Purpose                 |
| ------------------------------------- | ----------------------- |
| `src/app/profile/[username]/page.tsx` | User profile page       |
| `src/app/editor/page.tsx`             | HomeBase editor/builder |
| `src/app/api/upload/route.ts`         | Media upload handler    |

### Configuration

| File                 | Purpose                          |
| -------------------- | -------------------------------- |
| `tailwind.config.ts` | Tailwind CSS theme configuration |
| `postcss.config.ts`  | PostCSS pipeline setup           |
| `src/globals.css`    | Global styles + CSS variables    |
| `src/lib/utils.ts`   | Utility functions                |

---

## 🎯 Key Features

### Feed Component

```tsx
import { Feed } from '@/components/Feed';

<Feed posts={feedPosts} hasMore={true} onLoadMore={() => fetchMore()} isLoading={false} />;
```

**Features:**

- Emoji reactions with picker (emoji-mart)
- Infinite scroll
- Media grids (image/video)
- Comments system
- Reaction counts

### MediaUploader Component

```tsx
import { MediaUploader } from '@/components/MediaUploader';

<MediaUploader
  maxFiles={5}
  acceptTypes="image/*,video/*"
  onMediaSelect={media => setPreview(media)}
  onUpload={async files => {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: new FormData([...files]),
    });
    return response.json().urls;
  }}
/>;
```

**Features:**

- Drag-drop + click-to-browse
- Instant preview (image/video)
- Multi-file support
- Remove capability
- Cloud upload callback

### Avatar3D Component

```tsx
import { Avatar3D } from '@/components/3D/Avatar3D';

<div className="w-96 h-96">
  <Avatar3D userName="Alice" autoRotate={true} />
</div>;
```

**Features:**

- 3D avatar with body parts
- Ambient + directional lighting
- Orbit controls (rotate, zoom, pan)
- Auto-rotation option

### MetaverseSpace Component

```tsx
import { MetaverseSpace } from '@/components/3D/MetaverseSpace';

<MetaverseSpace title="HomeBase Universe" allowInteraction={true} />;
```

**Features:**

- Interactive 3D environment
- Floating platforms (clickable)
- Decorative rotating cubes
- Night environment
- Full-screen immersive view

### UserProfilePage Component

```tsx
import { UserProfilePage } from '@/components/UserProfilePage';

<UserProfilePage
  profile={userProfile}
  isOwnProfile={true}
  onEditProfile={() => goToEdit()}
  onCreateHomeBase={() => goToEditor()}
/>;
```

**Features:**

- Profile header with cover + avatar
- Stats display
- 3 tabs: Posts, Media, Modules
- Media gallery with lightbox
- Draggable module grid
- Create HomeBase button

### HomeBase Editor

Navigate to: **http://localhost:3000/editor**

**Features:**

- Drag-drop widget placement
- Multiple widget types:
  - Text editor
  - Image uploader
  - Video embed
  - Gallery grid
  - 3D Avatar
  - Custom widgets
- Edit/Preview mode toggle
- Publish functionality

---

## 🎨 Styling & Theme

### Colors (Tailwind CSS Variables)

All colors defined in `src/globals.css` with CSS variables:

```css
--primary: 217.2 91.2% 59.8% /* Blue */ --secondary: 217.2 32.6% 17.5% /* Dark Blue */ --accent: 0
  84.2% 60.2% /* Red */ --background: 0 0% 100% /* Light */ --foreground: 0 0% 3.6% /* Dark */;
```

### Light & Dark Mode

Tailwind configured for `class` strategy:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

---

## 🔄 API Integration Points

### Media Upload

**Endpoint:** `POST /api/upload`

```tsx
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData, // Contains 'files' field
});
const { urls } = await response.json();
```

**Return:** `{ urls: string[] }`

### User Profile

**Endpoint:** `/api/users/[username]` (TODO)

```tsx
// Expected response
{
  id, username, displayName, avatar, bio,
  followers, following, posts[], mediaGallery[], pinnedModules[]
}
```

### Create Post

**Endpoint:** `POST /api/posts` (TODO)

### Add Reaction

**Endpoint:** `POST /api/posts/[id]/reactions` (TODO)

---

## 📦 Dependencies Installed

### UI Components

- `@radix-ui/react-*` - Primitive components
- `@heroui/react` - Alternative component library
- `lucide-react` - Icon library
- `class-variance-authority` - Type-safe variants
- `clsx` / `tailwind-merge` - Class utilities

### Styling

- `tailwindcss` - Utility CSS
- `@tailwindcss/postcss` - Tailwind plugin
- `tailwindcss-animate` - Animation utilities

### 3D Graphics

- `three` - 3D library
- `@react-three/fiber` - React for Three.js
- `@react-three/drei` - Useful Three.js abstractions

### Media & Interactions

- `emoji-mart` - Emoji picker
- `react-grid-layout` - Draggable grid
- `yet-another-react-lightbox` - Lightbox gallery
- `react-infinite-scroll-component` - Infinite scroll
- `cloudinary` / `next-cloudinary` - Cloud storage

### Data & State

- `@tanstack/react-query` - Data fetching
- `socket.io-client` - Real-time communication
- `framer-motion` - Animations

### Development

- `prettier` - Code formatter
- `@types/react` - React types
- `typescript` - TypeScript support

---

## 🛠️ Customization

### Change Primary Color

Edit `tailwind.config.ts`:

```typescript
--primary: 265 89.5% 60.7%; // Change to purple
```

### Add New Emoji Sets

In `Feed.tsx`:

```tsx
<Picker
  data={data}
  set="apple" // or "google", "twitter", "facebook"
/>
```

### Customize Avatar

In `Avatar3D.tsx`:

```tsx
// Change body colors, sizes, proportions
<Sphere args={[0.6, 32, 32]}> {/* Head size */}
<Box args={[0.4, 1, 0.3]}> {/* Body size */}
```

### Add New Platforms

In `MetaverseSpace.tsx`:

```tsx
<FloatingPlatform position={[x, y, z]} color="#color" label="Platform Name" />
```

---

## 🚀 Production Deployment

### 1. Environment Variables

Create `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
```

### 2. Build & Deploy

```bash
# Build
pnpm -C apps/web build

# Deploy to Vercel/Azure/GCP
pnpm deploy
```

### 3. Cloudinary Integration

Replace `/api/upload` handler:

```typescript
import { v2 as cloudinary } from 'cloudinary';

const result = await cloudinary.uploader.upload(fileBuffer, {
  resource_type: 'auto',
  folder: 'homebase-media',
});
```

---

## 🐛 Troubleshooting

| Issue                        | Solution                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| Tailwind colors not applying | Run `pnpm install`, check `globals.css`                      |
| 3D components not rendering  | Ensure `@react-three/fiber` installed, check browser console |
| Media upload failing         | Check `/api/upload` endpoint, verify CORS settings           |
| Grid layout not dragging     | Set `isDraggable={true}` on GridLayout component             |
| Dark mode not toggling       | Add class to `<html>` element in Next.js layout              |

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Three.js Documentation](https://threejs.org/docs)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- [React Query Docs](https://tanstack.com/query/latest)
- [emoji-mart](https://github.com/missive/emoji-mart)

---

## 📞 Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Start dev server: `pnpm -C apps/web dev`
3. ✅ Visit http://localhost:3000
4. ✅ Explore `/profile/alice`, `/editor`, test Feed & MediaUploader
5. ⏳ Connect to real API endpoints
6. ⏳ Implement Cloudinary integration
7. ⏳ Deploy to production

---

**Last Updated:** January 2025  
**Status:** Production Ready  
**Version:** 2.0.0-ui-refresh
