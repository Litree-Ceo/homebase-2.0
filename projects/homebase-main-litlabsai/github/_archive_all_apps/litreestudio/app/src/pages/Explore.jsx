import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/Explore.css'

export default function Explore() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('trending')

  // Mock data for different tabs
  const mockData = {
    trending: [
      { id: 1, title: 'Neon City', type: 'World', creator: 'Creator1', icon: '🌆' },
      { id: 2, title: 'Gaming Stream', type: 'Stream', creator: 'Creator2', icon: '🎮' },
    ],
    worlds: [
      { id: 3, title: 'Fantasy Realm', type: 'World', creator: 'Creator3', icon: '🏰' },
      { id: 4, title: 'Space Station', type: 'World', creator: 'Creator4', icon: '🚀' },
    ],
    creators: [
      { id: 5, name: 'AlexCreates', followers: 5000, icon: '👤' },
      { id: 6, name: 'StreamKing', followers: 12000, icon: '👤' },
    ]
  }

  const tabs = ['Trending', 'Worlds', 'Media', 'Creators', 'Missions', 'Guilds']

  return (
    <div className="explore-page">
      <header className="explore-header">
        <h1>Explore LiTreeLabStudio™</h1>
        <p>Discover worlds, creators, media, and communities</p>
      </header>

      <nav className="explore-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="explore-content">
        {activeTab === 'trending' && (
          <div className="grid">
            {mockData.trending.map(item => (
              <div key={item.id} className="card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.type}</p>
                <small>by {item.creator}</small>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'worlds' && (
          <div className="grid">
            {mockData.worlds.map(item => (
              <div key={item.id} className="card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.type}</p>
                <small>by {item.creator}</small>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'creators' && (
          <div className="grid">
            {mockData.creators.map(item => (
              <div key={item.id} className="card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.name}</h3>
                <p>{item.followers.toLocaleString()} followers</p>
              </div>
            ))}
          </div>
        )}

        {!['trending', 'worlds', 'creators'].includes(activeTab) && (
          <div className="placeholder">
            <p>🚀 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon...</p>
          </div>
        )}
      </main>
    </div>
  )
}
