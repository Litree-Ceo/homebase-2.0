'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Props {
  user: {
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
  };
}

export default function UserCardComponent({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: 'POST' });
      if (res.ok) setFollowed(true);
    } catch (err) {
      console.error('Follow error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-purple-500/20 flex flex-col items-start">
      <div className="flex items-center w-full">
        {user.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt={user.displayName}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">
            {user.displayName?.charAt(0) || user.username?.charAt(0)}
          </div>
        )}

        <div className="ml-4 flex-1">
          <h3 className="font-bold text-white">{user.displayName}</h3>
          <p className="text-sm text-purple-300">@{user.username}</p>
        </div>

        <button
          onClick={handleFollow}
          disabled={loading || followed}
          className={`px-3 py-2 rounded-lg font-semibold ${followed ? 'bg-green-600 text-white' : 'bg-amber-400 text-black hover:bg-amber-500'}`}
        >
          {loading ? '...' : followed ? 'Following' : 'Follow'}
        </button>
      </div>

      {user.bio && <p className="mt-3 text-sm text-purple-300">{user.bio}</p>}

      {user.stats && (
        <div className="mt-3 text-xs text-purple-400 flex gap-4">
          <span>{user.stats.posts} posts</span>
          <span>{user.stats.followers} followers</span>
          <span>{user.stats.following} following</span>
        </div>
      )}
    </div>
  );
}
