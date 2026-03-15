import { useState } from 'react'
import './MediaLibrary.css'

function MediaLibrary() {
  const [view, setView] = useState('grid')

  const mediaItems = [
    { id: 1, title: 'Breaking Bad', year: 2008, genre: 'Drama' },
    { id: 2, title: 'The Crown', year: 2016, genre: 'Biography' },
    { id: 3, title: 'Stranger Things', year: 2016, genre: 'Sci-Fi' },
    { id: 4, title: 'The Witcher', year: 2019, genre: 'Fantasy' },
    { id: 5, title: 'Narcos', year: 2015, genre: 'Crime' },
    { id: 6, title: 'Chernobyl', year: 2019, genre: 'Drama' },
  ]

  return (
    <div className="media-library">
      <div className="library-header">
        <h1>Media Library</h1>
        <div className="view-controls">
          <button 
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
          >
            ⊞ Grid
          </button>
          <button 
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            ☰ List
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="media-grid">
          {mediaItems.map(item => (
            <div key={item.id} className="media-card">
              <div className="media-poster">
                <div className="placeholder">🎬</div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.year} • {item.genre}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="media-list">
          {mediaItems.map(item => (
            <div key={item.id} className="list-item">
              <div className="list-poster">🎬</div>
              <div className="list-info">
                <h3>{item.title}</h3>
                <p>{item.genre}</p>
              </div>
              <div className="list-year">{item.year}</div>
              <button className="btn-play">▶ Play</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaLibrary
