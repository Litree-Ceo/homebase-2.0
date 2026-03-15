import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import CopilotDock from './components/CopilotDock'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Homebase from './pages/Homebase'
import Explore from './pages/Explore'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <CopilotDock />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Auth Routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* App Routes (Phase 1) */}
          <Route path="/homebase" element={<Homebase />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/worlds" element={<div style={{ padding: '100px', textAlign: 'center' }}>🌍 Worlds Coming Soon</div>} />
          <Route path="/media" element={<div style={{ padding: '100px', textAlign: 'center' }}>🎬 Media Coming Soon</div>} />
          <Route path="/create" element={<div style={{ padding: '100px', textAlign: 'center' }}>✨ Create Coming Soon</div>} />
          <Route path="/community" element={<div style={{ padding: '100px', textAlign: 'center' }}>👥 Community Coming Soon</div>} />
          <Route path="/missions" element={<div style={{ padding: '100px', textAlign: 'center' }}>🎯 Missions Coming Soon</div>} />
          <Route path="/marketplace" element={<div style={{ padding: '100px', textAlign: 'center' }}>🛍️ Marketplace Coming Soon</div>} />
          <Route path="/wallet" element={<div style={{ padding: '100px', textAlign: 'center' }}>💳 Wallet Coming Soon</div>} />
          <Route path="/pricing" element={<div style={{ padding: '100px', textAlign: 'center' }}>⭐ Pricing Coming Soon</div>} />
          <Route path="/settings" element={<div style={{ padding: '100px', textAlign: 'center' }}>⚙️ Settings Coming Soon</div>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
