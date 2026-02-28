import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserPresence, setUserActivity } from '../services/presenceService';

export default function Profile() {
  const [user] = useState(() => {
    return JSON.parse(localStorage.getItem('demoUser'));
  });
  const [status, setStatus] = useState('online');
  const [activity, setActivity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    updateUserPresence(user.id, 'online');
  }, [navigate, user]);

  useEffect(() => {
    if (user) {
      updateUserPresence(user.id, status);
    }
  }, [status, user]);

  const handleActivityChange = (e) => {
    const newActivity = e.target.value;
    setActivity(newActivity);
    if (user) {
      setUserActivity(user.id, newActivity);
    }
  };

  const handleLogout = () => {
    if (user) {
      updateUserPresence(user.id, 'offline');
    }
    localStorage.removeItem('demoUser');
    navigate('/login');
  };

  if (!user) return null;

  const stats = {
    posts: 12,
    friends: 8,
    gamesPlayed: 45,
    highScore: 15000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-400 capitalize">{status}</span>
                {activity && <span className="text-sm text-gray-400">• {activity}</span>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Posts', value: stats.posts },
            { label: 'Friends', value: stats.friends },
            { label: 'Games Played', value: stats.gamesPlayed },
            { label: 'High Score', value: stats.highScore.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
              <div className="text-2xl font-bold text-purple-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="busy">🔴 Busy</option>
                <option value="offline">⚫ Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Activity</label>
              <input
                type="text"
                value={activity}
                onChange={handleActivityChange}
                placeholder="What are you up to?"
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
