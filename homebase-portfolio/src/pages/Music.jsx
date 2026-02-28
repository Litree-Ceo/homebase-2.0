import { useState, useEffect } from 'react';

const mockPlaylists = [
  { id: 'p1', name: 'Chill Vibes', tracks: [{ id: 't1', title: 'Sunset', artist: 'The xx' }] },
  { id: 'p2', name: 'Workout', tracks: [] },
];

const mockFriendActivity = {
  'friend1': { track: { title: 'Bohemian Rhapsody' } },
  'friend2': { track: { title: 'Stairway to Heaven' } },
};

const getUserPlaylists = async (userId) => {
  console.log('Getting playlists for', userId);
  return mockPlaylists;
};

const createPlaylist = (userId, playlistName) => {
  console.log('Creating playlist', playlistName, 'for', userId);
  mockPlaylists.push({ id: 'p' + (mockPlaylists.length + 1), name: playlistName, tracks: [] });
};

const updateNowPlaying = (userId, track) => {
  console.log(userId, 'is now playing', track.title);
};

const subscribeToFriendActivity = (userId, callback) => {
  console.log('Subscribing to friend activity for', userId);
  callback(mockFriendActivity);
  return () => console.log('Unsubscribing from friend activity');
};

export default function Music() {
  const [playlists, setPlaylists] = useState([]);
  const [friendActivity, setFriendActivity] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{"id":"demo1","name":"Demo User"}');

  useEffect(() => {
    getUserPlaylists(demoUser.id).then(setPlaylists);
    const unsub = subscribeToFriendActivity(demoUser.id, setFriendActivity);
    return () => unsub();
  }, [demoUser.id]);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(demoUser.id, newPlaylistName);
    setNewPlaylistName('');
  };

  const playTrack = (track) => {
    setNowPlaying(track);
    updateNowPlaying(demoUser.id, track);
  };

  const mockTracks = [
    { id: '1', title: 'Summer Vibes', artist: 'Chill Out', duration: 180 },
    { id: '2', title: 'Night Drive', artist: 'Synthwave', duration: 240 },
    { id: '3', title: 'Focus Flow', artist: 'Lo-Fi Beats', duration: 200 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Music</h1>

        {nowPlaying && (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-3xl">🎵</div>
              <div>
                <div className="text-sm opacity-80">Now Playing</div>
                <div className="text-xl font-semibold">{nowPlaying.title}</div>
                <div className="text-sm opacity-80">{nowPlaying.artist}</div>
              </div>
              <div className="ml-auto">
                <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">⏸️</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-3">Quick Play</h2>
              <div className="space-y-2">
                {mockTracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-all"
                  >
                    <div className="w-10 h-10 bg-orange-500/20 rounded flex items-center justify-center">🎵</div>
                    <div className="flex-1">
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-gray-400">{track.artist}</div>
                    </div>
                    <div className="text-sm text-gray-500">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Your Playlists</h2>
                <form onSubmit={handleCreatePlaylist} className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New playlist..."
                    className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button type="submit" className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
                    Create
                  </button>
                </form>
              </div>
              <div className="space-y-2">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded flex items-center justify-center font-bold">
                      {playlist.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-sm text-gray-400">{playlist.tracks?.length || 0} tracks</div>
                    </div>
                  </div>
                ))}
                {playlists.length === 0 && (
                  <div className="text-gray-500 text-center py-4">No playlists yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-3">Friend Activity</h2>
            <div className="space-y-3">
              {Object.entries(friendActivity).map(([userId, activity]) => (
                <div key={userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xs">
                    {userId.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{userId}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {activity.track ? `Listening to ${activity.track.title}` : 'Offline'}
                    </div>
                  </div>
                  {activity.track && <span className="text-orange-400 text-lg">🎵</span>}
                </div>
              ))}
              {Object.keys(friendActivity).length === 0 && (
                <div className="text-gray-500 text-center py-4">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
