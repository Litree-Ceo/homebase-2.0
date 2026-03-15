import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Homebase.css'

export default function Homebase() {
  const navigate = useNavigate()
  const { user, tier } = useAuth()
  const [streak, setStreak] = useState(7)

  if (!user) {
    navigate('/login')
    return null
  }

  const todaysPlan = [
    { id: 1, title: 'Check Daily Mission', emoji: '🎯', status: 'pending' },
    { id: 2, title: 'Visit a Guild', emoji: '👥', status: 'pending' },
    { id: 3, title: 'Watch Media', emoji: '🎬', status: 'completed' },
    { id: 4, title: 'Create Something', emoji: '✨', status: 'pending' }
  ]

  const recentActivity = [
    { user: 'Alice', action: 'posted in', target: '#general', time: '2h ago' },
    { user: 'Bob', action: 'joined', target: 'Guild Name', time: '4h ago' },
    { user: 'Carol', action: 'created', target: 'New World', time: '6h ago' }
  ]

  return (
    <div className="homebase">
      <header className="homebase-header">
        <h1>Your Homebase</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="emoji">🔥</span>
            <span className="value">{streak} day streak</span>
          </div>
          <div className="stat">
            <span className="emoji">💰</span>
            <span className="value">150 LITBIT</span>
          </div>
          <div className="stat">
            <span className="emoji">⭐</span>
            <span className="value">{tier.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="homebase-content">
        <section className="section todays-plan">
          <h2>Today's Plan</h2>
          <p className="section-subtitle">Curated AI recommendations for you</p>
          <div className="plan-grid">
            {todaysPlan.map(item => (
              <div key={item.id} className={`plan-card ${item.status}`}>
                <span className="emoji">{item.emoji}</span>
                <h3>{item.title}</h3>
                {item.status === 'completed' ? (
                  <span className="badge completed">✓ Done</span>
                ) : (
                  <span className="badge pending">→ Do it</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="section quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/create')}>
              <span className="emoji">✍️</span>
              <span>Create Post</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/explore')}>
              <span className="emoji">🔍</span>
              <span>Explore</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/worlds')}>
              <span className="emoji">🌍</span>
              <span>Enter World</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/missions')}>
              <span className="emoji">🎯</span>
              <span>Missions</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/marketplace')}>
              <span className="emoji">🛍️</span>
              <span>Marketplace</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/wallet')}>
              <span className="emoji">💳</span>
              <span>Wallet</span>
            </button>
          </div>
        </section>

        <section className="section activity">
          <h2>Friends Activity</h2>
          <div className="activity-list">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-avatar">👤</div>
                <div className="activity-text">
                  <strong>{item.user}</strong> {item.action} <em>{item.target}</em>
                </div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </section>

        {tier === 'free' && (
          <section className="section upsell">
            <h2>Upgrade Your Experience</h2>
            <p>Hit AI limits? Switch to <strong>Freemium</strong> for unlimited prompts and premium tools!</p>
            <button className="btn btn-primary" onClick={() => navigate('/pricing')}>
              View Plans
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
