import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from 'astro/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get API URL from environment or default to localhost
const apiTarget = process.env.PUBLIC_API_URL || "http://localhost:8001";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "server",
  adapter: cloudflare(),
  server: {
    host: true,
    port: 4000, // Primary development port
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 4321, // Lock preview port as well
  },

  vite: {
    server: {
      fs: {
        // Prevent serving files from parent directories
        allow: ['.'],
      },
    },
    build: {
      minify: true,
      cssMinify: true,
      brotliSize: true,
    },
  },
});