import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    env: {
      // This is required to load .env.test variables
      // See: https://github.com/vitejs/vite/issues/11494
      VITE_USER_NODE_ENV: 'development',
    },
  },
});