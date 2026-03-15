import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Auth.css'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirect to homebase if already logged in
  if (user) {
    navigate('/homebase')
    return null
  }

  const handleSignupClick = () => navigate('/signup')
  const handleLoginClick = () => navigate('/login')
  const handleGuestBrowse = () => navigate('/explore')

  return (
    <div className="landing-page-wrapper">
    <div className="auth-page landing">
      <div className="auth-container">
        <header className="landing-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="landing-logo flash-text-neon" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🌳 LiTreeLabStudio™</div>
        </header>

        <main className="auth-box">
          <div className="hero">
            <h1 className="flash-text-neon">Create. Connect.</h1>
            <p className="auth-subtitle">
              AI-powered immersive platform for creators and explorers.
            </p>

            <div className="cta-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleSignupClick}>
                Start Your Plan
              </button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} onClick={handleLoginClick}>
                Log In
              </button>
              <button className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={handleGuestBrowse}>
                Browse as Guest
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

        <section className="features">
          <h2>What's Inside</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="icon">🤖</span>
              <h3>AI Copilot</h3>
              <p>Your personal AI assistant that learns your style and automates your workflow.</p>
            </div>
            <div className="feature-card">
              <span className="icon">🌍</span>
              <h3>Immersive Worlds</h3>
              <p>Build and explore interactive 3D worlds with voice, media, and real-time collaboration.</p>
            </div>
            <div className="feature-card">
              <span className="icon">🎮</span>
              <h3>Gamification</h3>
              <p>Missions, streaks, badges, and leaderboards to keep you engaged and rewarded.</p>
            </div>
            <div className="feature-card">
              <span className="icon">💰</span>
              <h3>LITBIT Economy</h3>
              <p>Earn, trade, stake, and govern using LITBIT tokens in a player-driven marketplace.</p>
            </div>
            <div className="feature-card">
              <span className="icon">👥</span>
              <h3>Community Guilds</h3>
              <p>Join or create guilds, participate in forums, voice chats, and collaborative events.</p>
            </div>
            <div className="feature-card">
              <span className="icon">🛠️</span>
              <h3>Creator Studio</h3>
              <p>Publish posts, videos, worlds, and assets to the marketplace with AI assistance.</p>
            </div>
          </div>
        </section>

        <section className="tiers">
          <h2>Choose Your Tier</h2>
          <div className="tier-cards">
            <div className="tier-card">
              <h3>Free</h3>
              <p className="price">$0/month</p>
              <ul>
                <li>✓ Basic AI Copilot</li>
                <li>✓ Limited community access</li>
                <li>✓ Explore worlds & media</li>
                <li>✗ No marketplace selling</li>
              </ul>
            </div>
            <div className="tier-card featured">
              <h3>Freemium</h3>
              <p className="price">$9.99/month</p>
              <ul>
                <li>✓ Enhanced AI Copilot</li>
                <li>✓ Full community access</li>
                <li>✓ Create & monetize</li>
                <li>✓ Premium boosts</li>
              </ul>
            </div>
            <div className="tier-card">
              <h3>God Mode</h3>
              <p className="price">$49.99/month</p>
              <ul>
                <li>✓ Full automation</li>
                <li>✓ Custom Copilot personas</li>
                <li>✓ Exclusive features</li>
                <li>✓ Developer API access</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cta-final">
          <h2>Ready to Join?</h2>
          <p>Millions of creators, gamers, and explorers are already here.</p>
          <button className="btn btn-primary btn-large" onClick={handleSignupClick}>
            Sign Up Now
          </button>
        </section>

      <footer className="landing-footer">
        <p>&copy; 2025 LiTreeLabStudio™. All rights reserved.</p>
      </footer>
    </div>
  )
}
