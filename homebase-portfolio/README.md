# 🚀 HomeBase Pro

**The Future of Portfolio Management** - A modern, responsive, real-time portfolio management platform built with React 19, Vite, and Firebase.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### 🎨 Aurora Design System
- Beautiful glassmorphism UI with smooth animations
- Dark/Light mode support with automatic detection
- Consistent color palette and typography scale
- Accessible design with ARIA labels and keyboard navigation

### 📱 Fully Responsive
- **Mobile-first** approach with progressive enhancement
- **6 breakpoints** for optimal display on all devices:
  - xs: 0px (Mobile)
  - sm: 320px (Small mobile)
  - md: 768px (Tablet)
  - lg: 1024px (Desktop)
  - xl: 1440px (Large desktop)
  - 2xl: 1920px (Ultrawide)
- **Touch-optimized** with 44px minimum touch targets
- **Safe area support** for notched devices (iPhone X+, Android notches)
- **Dynamic viewport** support (dvh units for mobile browsers)

### ⚡ Real-Time Features
- **Live Activity Feed** - See actions as they happen across devices
- **Connection Status** - Real-time network monitoring with quality indicators
- **Real-time Sync** - Firebase Firestore with offline persistence
- **Live Indicators** - Animated pulse indicators for active connections

### 🔧 Developer Experience
- **Vite** for lightning-fast HMR and builds
- **ESLint** configured for code quality
- **Trae IDE** integration with custom rules
- **PWA** ready with service worker and manifest

### 📲 PWA Features
- Installable on iOS, Android, and Desktop
- Offline support with intelligent caching
- Background sync for offline actions
- Push notifications support
- App shortcuts for quick navigation
- Share target for receiving content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/homebase-pro.git
cd homebase-pro/homebase-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

### Firebase Deployment

```bash
npm run build
firebase deploy
```

## 📱 Mobile Development with Termux

HomeBase Pro includes full support for development on Android devices via Termux.

### Setup

```bash
# Make the script executable
chmod +x deploy-termux.sh

# Run setup
./deploy-termux.sh setup
```

### Available Commands

```bash
./deploy-termux.sh dev        # Start development server
./deploy-termux.sh build      # Build for production
./deploy-termux.sh deploy     # Deploy to Firebase
./deploy-termux.sh local      # Deploy locally with HTTP server
./deploy-termux.sh backup     # Create project backup
./deploy-termux.sh health     # Run health check
```

## 🎨 Customization

### Theme Customization

Edit CSS variables in `src/styles/aurora.css`:

```css
:root {
  --accent-primary: #7F5AF0;
  --accent-secondary: #2CB67D;
  --background-primary: #0A0A10;
  /* ... */
}
```

### Adding New Breakpoints

Edit `src/responsive.css`:

```css
@media (min-width: 2560px) {
  /* Your ultra-wide styles */
}
```

## 🏗️ Architecture

### Project Structure

```
homebase-portfolio/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Route pages
│   ├── styles/         # CSS files
│   ├── config/         # Configuration files
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── responsive.css  # Responsive styles
├── public/             # Static assets
├── .trae/              # Trae IDE configuration
├── deploy-termux.sh    # Termux deployment script
└── package.json
```

### Key Hooks

#### useResponsive
Provides real-time responsive information:

```javascript
import { useResponsive } from './hooks/useResponsive';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop,
    breakpoint,
    is,
    responsiveValue 
  } = useResponsive();
  
  // Use responsive values
  const padding = responsiveValue({
    xs: '1rem',
    md: '2rem',
    lg: '3rem'
  });
  
  return <div style={{ padding }}>Content</div>;
}
```

#### useConnection
Monitors network connection:

```javascript
import { useConnection } from './hooks/useResponsive';

function MyComponent() {
  const { online, effectiveType, downlink } = useConnection();
  
  return (
    <div>
      {online ? 'Connected' : 'Offline'}
      Connection: {effectiveType}
    </div>
  );
}
```

## 📊 Performance

### Optimizations
- **Code splitting** with React.lazy()
- **Image optimization** with WebP format
- **Font optimization** with font-display: swap
- **CSS optimization** with purgeCSS in production
- **Tree shaking** for unused code elimination

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🔒 Security

- Firebase Security Rules configured
- Content Security Policy headers
- HTTPS enforcement in production
- Input validation on client and server

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3001
npx kill-port 3001
```

**Node modules issues**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase permission denied**
```bash
# Check Firebase rules in Firebase Console
# Ensure user is authenticated
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Follow the Trae IDE rules in `.trae/rules`
- Use ESLint for code linting
- Write meaningful commit messages
- Test on multiple devices before submitting

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Vite Team for the blazing fast build tool
- Firebase Team for the backend infrastructure
- Framer Motion for smooth animations

---

Made with 💜 by the HomeBase Pro Team
