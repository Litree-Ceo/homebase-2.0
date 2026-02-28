import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    { icon: '💬', title: 'Real-time Chat', desc: 'Connect with friends instantly', path: '/chat', color: 'from-blue-500 to-cyan-400' },
    { icon: '📱', title: 'Social Feed', desc: 'Share and discover moments', path: '/feed', color: 'from-purple-500 to-pink-400' },
    { icon: '🎮', title: 'Games', desc: 'Play Tetris & Snake', path: '/games', color: 'from-green-500 to-emerald-400' },
    { icon: '🎵', title: 'Music', desc: 'Stream and share tracks', path: '/music', color: 'from-orange-500 to-yellow-400' },
    { icon: '👥', title: 'Friends', desc: 'Manage your connections', path: '/friends', color: 'from-pink-500 to-rose-400' },
    { icon: '👤', title: 'Profile', desc: 'Customize your presence', path: '/profile', color: 'from-indigo-500 to-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Welcome to HomeBase Pro
          </h1>
          <p className="text-xl text-gray-400">Your real-time social hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.path}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 border border-gray-700/50 hover:border-gray-600"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
              <div className="text-4xl mb-4">{f.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{f.title}</h2>
              <p className="text-gray-400">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Running in demo mode • Sign in to unlock all features
          </p>
        </div>
      </div>
    </div>
  );
}
