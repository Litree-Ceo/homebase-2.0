/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Overlord dark theme
        'overlord': {
          900: '#0a0a0f',
          800: '#13131f',
          700: '#1e1e2f',
          600: '#2a2a3f',
          500: '#3a3a55',
          400: '#4a4a6a',
        },
        // Neon accents
        'neon': {
          cyan: '#00d4ff',
          pink: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffff00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
