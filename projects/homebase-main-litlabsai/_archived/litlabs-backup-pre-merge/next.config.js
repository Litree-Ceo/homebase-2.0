/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    level: 'error'
  },
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  staticPageGenerationTimeout: 240
};

module.exports = nextConfig;
