# LitLabs Project Blueprint

## 1. Existing Components Overview

### **Core Application: LitLabs Web**
*   **Path**: `apps/litlabs-web`
*   **Tech Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Firebase (Auth/Firestore), Google Vertex AI.
*   **Purpose**: The primary user-facing platform for the LitLabs ecosystem. It serves as the gateway to virtual worlds, a digital marketplace, and AI-driven interactions.

### **Modules & Features**

#### **1. Authentication & User Management**
*   **Status**: Planned/Partial
*   **Scope**: User registration, login, profile management.
*   **Dependencies**: Firebase Auth.

#### **2. AI Chat Interface**
*   **Status**: Implemented
*   **Path**: `components/ai/AIChatWidget.tsx`, `app/api/ai/chat/route.ts`
*   **Scope**: Real-time streaming chat with a virtual assistant using Gemini 2.5 Flash Lite.
*   **Dependencies**: Google Vertex AI SDK, Native `ReadableStream` for SSE.

#### **3. Dashboard**
*   **Status**: Scaffolding
*   **Path**: `app/dashboard/page.tsx`
*   **Scope**: Central hub for user stats, recent activity, and notifications.

#### **4. Worlds Engine (Frontend)**
*   **Status**: Prototype (Static Data)
*   **Path**: `app/worlds/page.tsx`
*   **Scope**: Discovery portal for immersive 3D environments. Users can browse, filter, and enter worlds.

#### **5. Marketplace**
*   **Status**: Prototype (Static Data)
*   **Path**: `app/marketplace/page.tsx`
*   **Scope**: E-commerce platform for digital assets (3D models, audio, scripts).

#### **6. OpenClaw Integration**
*   **Status**: Configuration
*   **Path**: `openclaw.json` (External)
*   **Scope**: Bridge between LitLabs AI agents and external platforms like Telegram.

---

## 2. "Worlds" Content Blueprint

The "Worlds" section represents the immersive experiences available on the platform.

### **Data Structure & Schema**

```typescript
interface World {
  id: string;               // Unique UUID
  title: string;            // Display name of the world
  slug: string;             // URL-friendly identifier
  description: string;      // Full description (Markdown supported)
  shortDescription: string; // Brief summary for cards
  
  creator: {
    id: string;
    username: string;
    avatarUrl: string;
    verified: boolean;
  };
  
  media: {
    thumbnailUrl: string;   // 16:9 Aspect ratio image for grids
    coverUrl: string;       // Large banner image
    gallery: string[];      // Array of screenshot URLs
    videoPreview?: string;  // Optional trailer URL
  };
  
  technical: {
    engine: "Unity" | "Unreal" | "WebXR";
    version: string;
    fileSize: number;       // In bytes
    assetUrl: string;       // URL to the actual world bundle
  };
  
  stats: {
    activeUsers: number;    // Real-time count
    totalVisits: number;    // Cumulative
    likes: number;
    rating: number;         // 0-5 stars
  };
  
  metadata: {
    tags: string[];         // e.g., ["Sci-Fi", "Social", "Game"]
    category: "Game" | "Social" | "Education" | "Art";
    isPublic: boolean;
    maxCapacity: number;
    createdAt: string;      // ISO Date
    updatedAt: string;      // ISO Date
  };
}
```

### **Data Sources**
1.  **Primary**: Firestore Database (`worlds` collection).
2.  **Asset Storage**: Firebase Storage (for images/bundles).
3.  **Real-time Stats**: Firebase Realtime Database (for active user counts).

---

## 3. "Marketplace" Content Blueprint

The "Marketplace" allows creators to buy and sell assets for use in Worlds.

### **Data Structure & Schema**

```typescript
interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  
  pricing: {
    amount: number;
    currency: "USD" | "LIT"; // LIT is platform token
    isFree: boolean;
    discount?: number;       // Percentage off
  };
  
  seller: {
    id: string;
    username: string;
    rating: number;
  };
  
  type: "3D Model" | "Audio" | "Texture" | "Script" | "UI Kit";
  
  files: {
    previewUrl: string;      // Public accessible image/audio
    downloadUrl: string;     // Protected URL (requires purchase)
    format: string[];        // e.g., [".fbx", ".obj", ".wav"]
    size: number;
  };
  
  stats: {
    sales: number;
    views: number;
    rating: number;
    reviewsCount: number;
  };
  
  metadata: {
    tags: string[];
    license: "Personal" | "Commercial" | "Exclusive";
    createdAt: string;
    updatedAt: string;
  };
}
```

---

## 4. Data Population Strategy

### **Phase 1: Seed Data (Current)**
*   **Method**: Static JSON files.
*   **Action**: Create `data/worlds.json` and `data/marketplace.json` with high-quality mock data (10-20 items each).
*   **Goal**: Enable frontend development of filtering, sorting, and detail views without backend dependency.

### **Phase 2: Admin Dashboard Injection**
*   **Method**: Create a hidden `/admin` route in Next.js.
*   **Tools**: Simple form interfaces to POST data to Firestore.
*   **Validation**: Use `zod` schemas to ensure data integrity before database insertion.

### **Phase 3: User Generation**
*   **Method**: Public "Create" flows.
*   **Validation**:
    *   **Automated**: File size checks, format verification, malware scanning.
    *   **Manual**: Moderation queue for offensive content.

### **Tools & Tech**
*   **Data Generation**: Faker.js (for generating user profiles/stats).
*   **Validation**: `zod` (already installed).
*   **Database Seeding**: Custom Node.js script using `firebase-admin`.

---

## 5. Technical Architecture

### **Data Flow**
1.  **Client**: Next.js App fetches data via Server Actions or API Routes.
2.  **API Layer**: Validates request -> Queries Firestore -> Returns Typed JSON.
3.  **Real-time**: Listeners on Firestore for live updates (e.g., active user counts).

### **User Flows**
*   **World Discovery**: Landing -> Explore Page -> Filter by Tag -> World Detail -> "Enter World" (Launch Client).
*   **Purchase Asset**: Marketplace -> Search/Filter -> Asset Detail -> "Buy Now" -> Stripe/Crypto Payment -> Unlock Download.

### **Documentation Requirements**
*   **API Docs**: OpenAPI spec for internal API routes.
*   **DB Schema**: Firestore rules and index definitions.
