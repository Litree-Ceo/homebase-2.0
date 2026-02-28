import { useState, useEffect } from 'react';
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, subscribeToFriends } from '../services/friendService';
import { subscribeToFriendsPresence } from '../services/presenceService';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [presence, setPresence] = useState({});
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{"id":"demo1","name":"Demo User"}');

  useEffect(() => {
    getFriends(demoUser.id).then(setFriends);
    getPendingRequests(demoUser.id).then(setRequests);
    
    const unsub1 = subscribeToFriends(demoUser.id, setFriends);
    const unsub2 = subscribeToFriendsPresence(demoUser.id, setPresence);
    
    return () => { unsub1(); unsub2(); };
  }, [demoUser.id]);

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;
    sendFriendRequest(demoUser.id, newFriendEmail);
    setNewFriendEmail('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'in-game': return 'bg-purple-500';
      case 'listening': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>

        {/* Add Friend */}
        <form onSubmit={handleSendRequest} className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <div className="flex gap-2">
            <input
              type="email"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              placeholder="Enter friend email..."
              className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
            >
              Add Friend
            </button>
          </div>
        </form>

        {/* Pending Requests */}
        {requests.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-3">Pending Requests ({requests.length})</h2>
            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      {req.fromName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{req.fromName || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">Wants to be friends</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptFriendRequest(req.id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(req.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-3">All Friends ({friends.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {friends.map(friend => {
              const friendId = friend.id;
              const status = presence[friendId]?.status || friend.status || 'offline';
              const activity = presence[friendId]?.activity || friend.activity || '';
              
              return (
                <div key={friend.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center font-semibold">
                      {friend.avatar || friend.name?.charAt(0) || '?'}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(status)} rounded-full border-2 border-gray-800`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{friend.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="capitalize">{status}</span>
                      {activity && <span>• {activity}</span>}
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white transition-all">
                    💬
                  </button>
                </div>
              );
            })}
          </div>
          {friends.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No friends yet. Add some above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
