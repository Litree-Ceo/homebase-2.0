/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Honeycomb Theme: Purple, Black, Gold
        honeycomb: {
          black: '#0a0a0a',
          darkPurple: '#1a0033',
          purple: '#6b21a8',
          lightPurple: '#a855f7',
          gold: '#fbbf24',
          brightGold: '#fcd34d',
          darkGold: '#d97706',
        },
        honey: {
          dark: '#08070d',
          amber: '#f59e0b',
          bright: '#fcd34d',
          deep: '#d97706',
          electric: '#a3e635',
        },
        neon: {
          cyan: '#7df9ff',
          pink: '#ff5fb7',
          blue: '#38bdf8',
          purple: '#a78bfa',
          green: '#22d3ee',
        },
      },
      fontFamily: {
        display: ['Unbounded', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251,191,36,0.4), 0 0 40px rgba(251,191,36,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(251,191,36,0.6), 0 0 60px rgba(251,191,36,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(251,191,36,0.35), 0 0 40px rgba(251,191,36,0.2)',
        'glow-lg': '0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(251,191,36,0.3)',
        neon: '0 0 15px rgba(125,249,255,0.5), 0 0 30px rgba(125,249,255,0.3)',
      },
    },
  },
  plugins: [],
};
