import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow development access from WSL/Docker/local network
  allowedDevOrigins: ['http://172.25.32.1:3000', 'http://localhost:3000'],
  // Enable experimental features for faster builds
  experimental: {
    // Faster module resolution
    webpackMemoryOptimizations: true,
  },
  typescript: {
    // Skip type checking during Vercel builds (we check locally)
    ignoreBuildErrors: true,
  },
  // Generate unique build IDs for cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  async headers() {
    return [
      {
        // HTML pages - no caching, always fetch fresh
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Prevent caching of HTML pages to ensure fresh content on new deployments
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        // Static assets - can be cached (they have hash in filename)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
