/** @type {import('tailwindcss').Config} */ 
 module.exports = { 
   content: [ 
     './src/pages/**/*.{js,ts,jsx,tsx,mdx}', 
     './src/components/**/*.{js,ts,jsx,tsx,mdx}', 
     './src/app/**/*.{js,ts,jsx,tsx,mdx}', 
   ], 
   theme: { 
     extend: { 
       colors: { 
         makt: { 
           gold: '#FFD700', 
           goldDark: '#B8860B', 
           cyan: '#00FFFF', 
           cyanDark: '#008B8B', 
           black: '#0A0A0A', 
           gray: '#1A1A1A', 
           purple: '#8B5CF6' 
         } 
       }, 
       backgroundImage: { 
         'makt-gradient': 'linear-gradient(135deg, #FFD700 0%, #00FFFF 100%)', 
         'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)' 
       }, 
       animation: { 
         'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', 
         'float': 'float 6s ease-in-out infinite', 
         'shimmer': 'shimmer 2s linear infinite', 
       }, 
       keyframes: { 
         pulseGold: { 
           '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }, 
           '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)' }, 
         }, 
         float: { 
           '0%, 100%': { transform: 'translateY(0)' }, 
           '50%': { transform: 'translateY(-10px)' }, 
         }, 
         shimmer: { 
           '0%': { backgroundPosition: '-1000px 0' }, 
           '100%': { backgroundPosition: '1000px 0' }, 
         } 
       } 
     }, 
   }, 
   plugins: [], 
 }