'use client';

/**
 * Friends Widget
 * @workspace Display suggested friends in sidebar
 */

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
}

export default function FriendsWidget() {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/suggested?limit=5');
      if (res.ok) {
        setFriends(await res.json());
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-purple-500/20">
      <h2 className="font-black text-white text-lg mb-4">👥 Suggested Friends</h2>

      {loading ? (
        <p className="text-purple-300 text-sm">Loading...</p>
      ) : (
        <div className="space-y-3">
          {friends.map(friend => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-xs">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {friend.displayName}
                  </div>
                  <div className="text-xs text-purple-300 truncate">@{friend.username}</div>
                </div>
              </div>
              <button className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 whitespace-nowrap">
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
