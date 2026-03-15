import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000, // Frontend runs on a different port
    proxy: {
      // Proxy API requests to the Python backend
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
    },
  },
});
