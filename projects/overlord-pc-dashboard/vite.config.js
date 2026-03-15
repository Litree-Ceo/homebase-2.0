import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000, // Frontend runs on a different port
    proxy: {
      // Proxy API requests to the FastAPI backend (port 8000)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Legacy API fallback (port 9090)
      '/legacy': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
});
