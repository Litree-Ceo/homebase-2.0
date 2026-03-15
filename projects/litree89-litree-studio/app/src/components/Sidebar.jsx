import { Link } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button 
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle sidebar"
        >
          ☰
        </button>
        {isOpen && <h1>LITLAB</h1>}
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">
          <span className="icon">🏠</span>
          {isOpen && <span>Home</span>}
        </Link>
        
        <Link to="/media" className="nav-item">
          <span className="icon">🎬</span>
          {isOpen && <span>Media Library</span>}
        </Link>

        <div className="nav-divider"></div>

        <Link to="/user" className="nav-item">
          <span className="icon">👤</span>
          {isOpen && <span>Profile</span>}
        </Link>

        <Link to="/settings" className="nav-item">
          <span className="icon">⚙️</span>
          {isOpen && <span>Settings</span>}
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
