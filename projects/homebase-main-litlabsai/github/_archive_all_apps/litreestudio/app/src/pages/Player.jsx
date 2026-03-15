import { useParams } from 'react-router-dom'
import './Player.css'

function Player() {
  const { id } = useParams()

  return (
    <div className="player-container">
      <div className="video-player">
        <div className="video-placeholder">
          <div className="play-icon">▶</div>
        </div>
        
        <div className="player-controls">
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="0" 
            className="progress-bar"
          />
          <div className="control-buttons">
            <button className="control-btn">⏮</button>
            <button className="control-btn">⏯</button>
            <button className="control-btn">⏭</button>
            <span className="time">00:00 / 42:30</span>
            <div style={{ flex: 1 }}></div>
            <button className="control-btn">🔊</button>
            <button className="control-btn">⛶</button>
          </div>
        </div>
      </div>

      <div className="player-info">
        <h1>Breaking Bad - Season 1, Episode 1</h1>
        <p className="meta">2008 • Drama • 58 min</p>
        <p className="description">
          When an ex-cop turns to cooking methamphetamine with a former student, 
          the consequences spiral out of control.
        </p>
        
        <div className="player-actions">
          <button className="btn-action">▶ Resume</button>
          <button className="btn-action">❤ Add to Favorites</button>
          <button className="btn-action">📥 Download</button>
        </div>
      </div>
    </div>
  )
}

export default Player
