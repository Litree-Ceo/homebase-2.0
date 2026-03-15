import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'feed', icon: '🏠', label: 'Feed' },
  { id: 'create', icon: '🎨', label: 'Create' },
  { id: 'games', icon: '🎮', label: 'Game Hub' },
  { id: 'store', icon: '📱', label: 'App Store' },
  { id: 'market', icon: '💰', label: 'Market' },
  { id: 'metaverse', icon: '🌐', label: 'Metaverse' },
  { id: 'builder', icon: '🔧', label: 'Builder' },
  { id: 'btc', icon: '📈', label: 'BTC Signals' },
];

export default function LeftSidebar() {
  const location = useLocation();
  const activePage = location.pathname.substring(1) || 'dashboard';

  return (
    <aside className="left-sidebar">
      <div className="sidebar-section-label">NAVIGATE</div>
      {navItems.map((item) => (
        <Link to={`/${item.id}`} key={item.id}>
          <button
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        </Link>
      ))}
    </aside>
  );
}
