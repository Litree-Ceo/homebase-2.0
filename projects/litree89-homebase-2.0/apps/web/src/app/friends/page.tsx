'use client';

/**
 * Friends Discovery & Management Page
 * @workspace Find friends, send requests, manage followers
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import UserCardComponent from '@/components/UserCardComponent';

interface User {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface FriendRequest {
  id: string;
  from: User;
  createdAt: string;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'followers' | 'following'>(
    'discover',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendData();
  }, [user?.id || user?.localAccountId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);

      // Fetch suggested users
      const suggestedRes = await fetch(`/api/users/suggested?limit=12`);
      if (suggestedRes.ok) {
        setSuggestedUsers(await suggestedRes.json());
      }

      // Fetch friend requests
      const requestsRes = await fetch(`/api/friends/requests`);
      if (requestsRes.ok) {
        setFriendRequests(await requestsRes.json());
      }

      // Fetch followers and following
      const followersRes = await fetch(`/api/users/${user?.id || user?.localAccountId}/followers`);
      if (followersRes.ok) {
        setFollowers(await followersRes.json());
      }

      const followingRes = await fetch(`/api/users/${user?.id || user?.localAccountId}/following`);
      if (followingRes.ok) {
        setFollowing(await followingRes.json());
      }
    } catch (error) {
      console.error('Failed to load friend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        loadFriendData();
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string, fromId: string) => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: 'POST',
      });
      if (res.ok) {
        setFriendRequests(friendRequests.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">👥 Friends & Followers</h1>
        <p className="text-purple-300">
          Find new creators, manage your network, build your community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-purple-500/20 overflow-x-auto">
        {[
          { key: 'discover', label: '🔍 Discover', count: suggestedUsers.length },
          { key: 'requests', label: '📬 Requests', count: friendRequests.length },
          { key: 'followers', label: '👥 Followers', count: followers.length },
          { key: 'following', label: '✅ Following', count: following.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-amber-400 text-black rounded-full px-2 text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⚙️</div>
          <p className="text-purple-300 mt-4">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === 'discover' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedUsers.map(u => (
                <UserCardComponent key={u.id} user={u} />
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {friendRequests.length === 0 ? (
                <p className="text-purple-300 text-center py-8">No pending requests</p>
              ) : (
                friendRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-slate-900 p-4 rounded-lg border border-purple-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {req.from.profilePicture && (
                        <Image
                          src={req.from.profilePicture}
                          alt={req.from.displayName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-white">{req.from.displayName}</h3>
                        <p className="text-sm text-purple-300">@{req.from.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(req.id, req.from.id)}
                      className="px-4 py-2 bg-amber-400 text-black rounded-lg hover:bg-amber-500 font-semibold"
                    >
                      Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.length === 0 ? (
                <p className="text-purple-300">No followers yet</p>
              ) : (
                followers.map(u => <UserCardComponent key={u.id} user={u} />)
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.length === 0 ? (
                <p className="text-purple-300">Not following anyone yet</p>
              ) : (
                following.map(u => <UserCardComponent key={u.id} user={u} />)
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
