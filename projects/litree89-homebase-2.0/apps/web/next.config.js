/**
 * Unified Next.js config for Azure
 * - Centralizes API rewrites to Azure backend
 * - Handles image optimization
 * - Production-ready configuration
 */

/**
 * Normalize API base URL once so rewrites work locally and on Azure.
 */
const apiBaseUrl = (() => {
  const raw =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071';
  return raw.replace(/\/$/, '');
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    turbo: {
      root: '../../',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/hub/:path*',
        destination: `${apiBaseUrl}/hub/:path*`,
      },
      {
        source: '/api/hub',
        destination: `${apiBaseUrl}/hub`,
      },
      {
        source: '/api/hub/negotiate',
        destination: `${apiBaseUrl}/hub/negotiate`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
