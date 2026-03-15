import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <input 
          type="text" 
          placeholder="Search media..." 
          className="search-bar"
        />
      </div>
      
      <div className="header-right">
        <button className="icon-btn" title="Notifications">
          🔔
        </button>
        <button className="icon-btn" title="User Menu">
          👤
        </button>
      </div>
    </header>
  )
}

export default Header
