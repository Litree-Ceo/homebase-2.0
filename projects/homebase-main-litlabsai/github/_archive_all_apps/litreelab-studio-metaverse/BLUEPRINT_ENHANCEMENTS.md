# LiTreeLab Studio: Visual, Auditory, and Video Enhancement Blueprint

This document outlines the strategy for integrating high-fidelity visual avatars, immersive audio feedback, and robust video streaming into the LiTreeLab Studio platform.

## I. Visual Enhancements (Avatars & Imagery)

### 1. Image Generator Selection
We recommend the following AI-powered tools for generating high-quality avatars and website imagery.

| Tool | Pricing Model | Features & Capabilities | Integration | Output Quality |
| :--- | :--- | :--- | :--- | :--- |
| **Midjourney** | Subscription ($10-120/mo) | Best-in-class artistic style, painterly aesthetics, highly detailed textures. Excellent for "hero" images and stylized avatars. | **Manual/Discord**: No official API. Must generate externally and upload to app. | ⭐⭐⭐⭐⭐ (Cinematic/Artistic) |
| **DALL-E 3 (via OpenAI)** | Pay-per-use (API) / Subscription (ChatGPT) | Excellent prompt adherence, handles text within images well. Good for diverse styles (photorealism to cartoon). | **High**: Simple REST API integration directly into the web app. | ⭐⭐⭐⭐ (Clean/Accurate) |
| **Stability AI (Stable Diffusion)** | Pay-per-credit (API) / Open Source | Infinite customizability. Can fine-tune models on specific "LiTree" art styles. Best for consistent character generation. | **High**: Robust API and control over seed/steps. | ⭐⭐⭐⭐ (Versatile) |

**Evaluation Criteria:**
*   **Artistic Style:** Midjourney wins for "vibrant/metaverse" aesthetics. DALL-E 3 is safer for general use.
*   **Commercial License:** All three allow commercial use for paid tiers.
*   **Customization:** Stability AI allows for "Image-to-Image" (upload a selfie -> generate avatar), which is ideal for user profiles.

### 2. Avatar Implementation Strategy

**Integration Points:**
*   **User Profile:** Users generate a unique "Metaverse Identity" upon signup.
*   **Comments/Social:** Small circular thumbnails in `SocialFeed`.
*   **Gamification:** Unlock special accessories (halo, glowing eyes) based on "ProfitPilot" earnings.

**Technical Requirements:**
*   **Optimization:** Convert all uploads to **WebP** format.
*   **Storage:** Firebase Storage bucket `avatars/{userId}/current.webp`.
*   **Caching:** Use Next.js `<Image>` component with `loader` for automatic resizing and caching.
*   **Responsive:** Serve 64x64px for comments, 256x256px for profiles, 1024px for full view.

---

## II. Auditory Enhancements (Website Sounds)

### 1. Sound Design Strategy
The goal is "Functional Audio" — sounds that confirm actions without annoying the user.

*   **Primary Interaction:**
    *   *Click/Tap:* Subtle "tick" or "thud" (low frequency).
    *   *Success:* Rising major chord (short, <0.5s).
    *   *Error:* Dissonant "bloop" or soft buzzer.
    *   *Notification:* Glassy "ping".
*   **Ambient:**
    *   *Metaverse Viewer:* Low hum/drone (wind or synth pad) only when active.

### 2. Sound Asset Sourcing
*   **Epidemic Sound:** High-quality, royalty-free subscription. Best for background tracks.
*   **Mixkit / Freesound:** Free, individual SFX files. Good for UI clicks.
*   **Criteria:**
    *   **Format:** **MP3** (good compatibility) or **OGG** (better compression).
    *   **Size:** UI sounds < 50KB. Background loops < 2MB.

### 3. Technical Implementation

We will use **Howler.js** for robust cross-browser audio management.

**Architecture:**
*   `SoundContext`: A React Context provider that loads sounds once.
*   `useSound` Hook: Easy access for components.
*   **Global Mute:** Persisted in `localStorage` and User Settings.

```typescript
// Example usage
const { play } = useSound();
<button onClick={() => play('click')}>Save</button>
```

---

## III. Video Streaming Capabilities

### 1. Hosting & Streaming Solutions

| Platform | Pricing | Features | Best For |
| :--- | :--- | :--- | :--- |
| **Mux** | Pay-as-you-go ($0.003/min streaming) | Developer-first API. Auto-encoding into HLS/Dash. Instant startup. | **Custom Video Features** (User uploads) |
| **Cloudflare Stream** | $5/1000 minutes stored | extremely cheap storage + delivery. Global CDN included. | **High Volume** storage. |
| **YouTube (Embedded)** | Free | Zero cost, familiar UI. Ads are a downside. | **Public Marketing** content. |

**Recommendation:** **Mux** for user-generated content (seamless integration), **YouTube** for official LiTree tutorials.

### 2. Video Player Implementation
We will use **`react-player`** for a unified interface that handles YouTube, Vimeo, and direct files (MP4/HLS).

**Features:**
*   **Adaptive Streaming:** HLS support for buffering-free playback on slow networks.
*   **Lazy Loading:** Only load the heavy player code when the video enters the viewport.
*   **Custom Skin:** Hide default YouTube controls; use custom Tailwind-styled buttons.

### 3. CDN Strategy
*   **Video:** Use the platform's CDN (Mux/Cloudflare).
*   **Static Assets (Avatars/Audio):** Firebase Hosting CDN (Fastly backed) is sufficient.
*   **Optimization:** Set `Cache-Control: public, max-age=31536000, immutable` for all media assets.

---

## IV. Overall Integration Blueprint

### 1. Technology Stack
*   **Frontend:** Next.js 16 (App Router) + Tailwind CSS v4.
*   **Backend:** Firebase Functions (for API calls to Image Generators).
*   **Database:** Firestore (User profiles, settings, media metadata).
*   **State Management:** React Context (Audio state, Player state).

### 2. Performance Strategy
1.  **Code Splitting:** Dynamic imports for heavy components (`next/dynamic`).
    ```typescript
    const MetaverseViewer = dynamic(() => import('./MetaverseViewer'), { ssr: false });
    ```
2.  **Asset Optimization:**
    *   Audio: Preload only critical UI sounds (`click`, `success`). Lazy load ambient tracks.
    *   Images: Use `next/image` with `placeholder="blur"`.
3.  **Server Actions:** Handle API keys for DALL-E/Midjourney securely on the server.

### 3. UX/UI Principles
*   **Consent:** Audio is **MUTED by default** or asks for permission ("Enable Sound?").
*   **Feedback:** Visual cues (ripples, glow) must accompany audio cues for accessibility.
*   **Loading States:** Skeleton screens for video players and avatar generators.

### 4. Security
*   **API Keys:** Never expose OpenAI/Stability keys in client-side code.
*   **Content Safety:** Use automated moderation (OpenAI Moderation API) for generated avatars to prevent inappropriate content.
*   **Rate Limiting:** Prevent users from spamming the "Generate Image" button (cost control).
