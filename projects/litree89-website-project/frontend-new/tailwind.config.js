/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./mobile/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00ffea",
        accent: "#7f5af0",
        green: "#00ff99",
        background: "#0f172a",
        dark: "#10131a",
        glass: "rgba(255,255,255,0.08)",
        glassLight: "rgba(255,255,255,0.18)",
        glassBorder: "rgba(255,255,255,0.22)",
        neonBlue: "#3a8fff",
        neonPink: "#ff3afc",
        neonLime: "#aaff00",
        vaporPurple: "#a259ff",
        vaporCyan: "#00ffe7",
        vaporPink: "#ff6ec7",
        // Merged from the nested mess
        glassDark: 'rgba(24,26,32,0.7)',
        neumorph: '#181A20',
        bento: '#23272F',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        neumorph: '8px 8px 24px #14161c, -8px -8px 24px #23272f',
        neon: '0 0 16px #00eaff, 0 0 32px #7f5af0',
        bento: '0 2px 16px #0003',
      },
      backgroundImage: {
        'gradient-hero': "url('/backgrounds/hero-bg-1.jpg')",
        'gradient-hero2': "url('/backgrounds/hero-bg-2.jpg')",
        'mesh-gradient': 'linear-gradient(135deg, #7f5af0 0%, #00eaff 100%)',
        'grainy': 'url("/backgrounds/grain.png")',
      },
      backdropBlur: {
        glass: '16px',
      },
      borderRadius: {
        glass: '1.5rem',
        neumorph: '1.25rem',
      },
      transitionProperty: {
        glass: 'background, box-shadow, backdrop-filter',
      },
    },
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
};
