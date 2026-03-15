import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Navigation.css'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  if (!user || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') {
    return null // Hide nav on landing/auth pages
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { label: 'Homebase', path: '/homebase', icon: '🏠' },
    { label: 'Explore', path: '/explore', icon: '🔍' },
    { label: 'Worlds', path: '/worlds', icon: '🌍' },
    { label: 'Media', path: '/media', icon: '🎬' },
    { label: 'Create', path: '/create', icon: '✨' },
    { label: 'Community', path: '/community', icon: '👥' },
    { label: 'Missions', path: '/missions', icon: '🎯' },
    { label: 'Marketplace', path: '/marketplace', icon: '🛍️' },
    { label: 'Wallet', path: '/wallet', icon: '💳' }
  ]

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate('/homebase')}>
            🌳 LiTreeLab'Studio™
          </div>

          <div className="nav-items">
            {navItems.map(item => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <input
            type="text"
            className="nav-search"
            placeholder="Search..."
          />
          <button className="nav-icon-btn" title="Notifications">
            🔔
          </button>
          <button className="nav-icon-btn" title="Messages">
            💬
          </button>
          <div className="nav-profile">
            <button className="profile-btn" title={user.email}>
              👤
            </button>
            <div className="profile-menu">
              <button onClick={() => navigate('/settings')}>⚙️ Settings</button>
              <button onClick={() => navigate('/pricing')}>⭐ Upgrade</button>
              <button onClick={handleLogout}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
