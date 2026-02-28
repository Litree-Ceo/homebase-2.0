import { Routes, Route, Link, useLocation, Navigate, lazy, Suspense } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

const Chat = lazy(() => import('./pages/Chat'));
const Feed = lazy(() => import('./pages/Feed'));
const Games = lazy(() => import('./pages/Games'));
const Music = lazy(() => import('./pages/Music'));
const Friends = lazy(() => import('./pages/Friends'));
const Profile = lazy(() => import('./pages/Profile'));

const requireAuth = (Component) => {
  return (props) => {
    const user = JSON.parse(localStorage.getItem('demoUser'));
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Component {...props} />;
  };
};

const AuthedChat = requireAuth(Chat);
const AuthedFeed = requireAuth(Feed);
const AuthedGames = requireAuth(Games);
const AuthedMusic = requireAuth(Music);
const AuthedFriends = requireAuth(Friends);
const AuthedProfile = requireAuth(Profile);


function App() {
  const location = useLocation();
  const demoUser = JSON.parse(localStorage.getItem('demoUser'));
  const isLoginPage = location.pathname === '/login';

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/feed', icon: '📱', label: 'Feed' },
    { path: '/games', icon: '🎮', label: 'Games' },
    { path: '/music', icon: '🎵', label: 'Music' },
    { path: '/friends', icon: '👥', label: 'Friends' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {!isLoginPage && (
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                HomeBase Pro
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {demoUser ? (
                  <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {demoUser.name?.charAt(0) || '?'}
                    </div>
                    <span className="hidden sm:block">{demoUser.name}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex justify-around py-2 border-t border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 text-xs ${
                  location.pathname === item.path ? 'text-purple-400' : 'text-gray-400'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<AuthedChat />} />
            <Route path="/feed" element={<AuthedFeed />} />
            <Route path="/games" element={<AuthedGames />} />
            <Route path="/music" element={<AuthedMusic />} />
            <Route path="/friends" element={<AuthedFriends />} />
            <Route path="/profile" element={<AuthedProfile />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
