import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        overlord: {
          dark: '#0a0e27',
          darker: '#1a1540',
          cyan: '#00ffc8',
          magenta: '#ff00ff',
        },
      },
      backgroundImage: {
        'overlord-gradient': 'linear-gradient(135deg, #0a0e27 0%, #1a1540 50%, #0d0a1f 100%)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        overlord: {
          primary: '#00ffc8',
          secondary: '#ff00ff',
          accent: '#00d9a3',
          neutral: '#1a1540',
          'base-100': '#0a0e27',
          'base-200': '#0d0a1f',
          'base-300': '#1a1540',
        },
      },
    ],
  },
}
export default config
