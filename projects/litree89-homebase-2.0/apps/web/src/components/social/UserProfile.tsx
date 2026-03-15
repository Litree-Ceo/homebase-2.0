'use client';

/**
 * User Profile Component
 *
 * @workspace Facebook-like user profile with stats, media library, and social features
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import type { User, MediaItem, Post, Playlist } from '@/types';

interface ProfileTab {
  id: string;
  label: string;
  icon: string;
}

const PROFILE_TABS: ProfileTab[] = [
  { id: 'posts', label: 'Posts', icon: '📝' },
  { id: 'media', label: 'Media Library', icon: '🎬' },
  { id: 'playlists', label: 'Playlists', icon: '📋' },
  { id: 'watchParties', label: 'Watch Parties', icon: '🎉' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

import styles from './UserProfile.module.css';

interface UserProfileProps {
  readonly userId?: string; // If not provided, show current user's profile
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { user, getAccessToken } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const isOwnProfile = !userId || userId === user?.localAccountId;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        const targetId = userId || user?.localAccountId;

        if (!targetId) return;

        const response = await fetch(`/api/users/${targetId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user, getAccessToken]);

  // Fetch tab content
  useEffect(() => {
    const fetchTabContent = async () => {
      if (!profile) return;

      const token = await getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        switch (activeTab) {
          case 'posts': {
            const postsRes = await fetch(`/api/users/${profile.id}/posts`, { headers });
            if (postsRes.ok) setPosts(await postsRes.json());
            break;
          }
          case 'media': {
            const mediaRes = await fetch(`/api/users/${profile.id}/media`, { headers });
            if (mediaRes.ok) setMediaItems(await mediaRes.json());
            break;
          }
          case 'playlists': {
            const playlistsRes = await fetch(`/api/users/${profile.id}/playlists`, { headers });
            if (playlistsRes.ok) setPlaylists(await playlistsRes.json());
            break;
          }
        }
      } catch (error) {
        console.error('Failed to fetch tab content:', error);
      }
    };

    fetchTabContent();
  }, [activeTab, profile, getAccessToken]);

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-black/60 p-6 text-center">
        <p className="text-red-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo & Profile Picture */}
      <div className="relative">
        <div className={styles.coverPhotoContainer}>
          {profile.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverPhoto}
              alt={`${profile.displayName} cover`}
              className={styles.coverPhotoImage}
            />
          ) : (
            <div className={styles.coverPhotoFallback} aria-hidden="true" />
          )}
        </div>

        <div className="absolute -bottom-16 left-6">
          <div className="h-32 w-32 rounded-full border-4 border-black bg-linear-to-br from-amber-400 to-orange-500 shadow-xl">
            {profile.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profilePicture}
                alt={profile.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-black">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {profile.isVerified && (
            <span className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-1 text-white">
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="rounded-b-3xl border border-amber-400/30 bg-black/60 px-6 pb-6 pt-20 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">
              {profile.displayName}
              {profile.isVerified && <span className="ml-2 text-blue-400">✓</span>}
            </h1>
            <p className="text-amber-100/60">@{profile.username}</p>
            {profile.bio && <p className="mt-2 max-w-lg text-amber-100/80">{profile.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-amber-100/60">
              {profile.location && (
                <span className="flex items-center gap-1">📍 {profile.location}</span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline"
                >
                  🔗 {profile.website}
                </a>
              )}
              <span className="flex items-center gap-1">
                📅 Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <button className="rounded-full border border-amber-400/50 bg-amber-400/10 px-6 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20">
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    isFollowing
                      ? 'border border-amber-400/50 bg-transparent text-amber-100 hover:border-red-500 hover:text-red-400'
                      : 'bg-amber-400 text-black hover:bg-amber-300'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="rounded-full border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-amber-100 transition hover:bg-amber-400/20">
                  💬 Message
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 border-t border-amber-400/20 pt-6">
          <div className="text-center">
            <div className="text-xl font-bold text-amber-100">{profile.stats.posts}</div>
            <div className="text-sm text-amber-100/60">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-100">{profile.stats.followers}</div>
            <div className="text-sm text-amber-100/60">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-100">{profile.stats.following}</div>
            <div className="text-sm text-amber-100/60">Following</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-100">{profile.stats.mediaItems}</div>
            <div className="text-sm text-amber-100/60">Media Items</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-100">{profile.stats.watchParties}</div>
            <div className="text-sm text-amber-100/60">Watch Parties</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-amber-400/30 bg-black/60 shadow-lg">
        <div className="flex overflow-x-auto border-b border-amber-400/20">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-400 text-amber-100'
                  : 'text-amber-100/60 hover:text-amber-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-center text-amber-100/60">No posts yet</p>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-amber-400/20 bg-black/40 p-4"
                  >
                    <p className="text-amber-100">{post.content}</p>
                    <div className="mt-3 flex gap-4 text-sm text-amber-100/60">
                      <span>❤️ {post.stats.likes}</span>
                      <span>💬 {post.stats.comments}</span>
                      <span>🔄 {post.stats.shares}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {mediaItems.length === 0 ? (
                <p className="col-span-full text-center text-amber-100/60">No media items yet</p>
              ) : (
                mediaItems.map(item => (
                  <div
                    key={item.id}
                    className="group relative aspect-video overflow-hidden rounded-xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 transition group-hover:opacity-100">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="truncate text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-white/60">{item.mediaType}</p>
                      </div>
                    </div>
                    {item.mediaType === 'movie' || item.mediaType === 'tvshow' ? (
                      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                        {Math.floor(item.duration / 60)}min
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {playlists.length === 0 ? (
                <p className="col-span-full text-center text-amber-100/60">No playlists yet</p>
              ) : (
                playlists.map(playlist => (
                  <div
                    key={playlist.id}
                    className="rounded-xl border border-amber-400/20 bg-black/40 p-4"
                  >
                    <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-amber-900/20">
                      {playlist.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={playlist.coverImage}
                          alt={playlist.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">📋</div>
                      )}
                    </div>
                    <h3 className="font-medium text-amber-100">{playlist.title}</h3>
                    <p className="text-sm text-amber-100/60">
                      {playlist.stats.itemCount} items •{' '}
                      {Math.round(playlist.stats.totalDuration / 60)}min
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-medium text-amber-100">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${profile.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/30"
                    >
                      𝕏 @{profile.socialLinks.twitter}
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a
                      href={profile.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30"
                    >
                      ▶️ YouTube
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-pink-500/20 px-4 py-2 text-sm text-pink-400 hover:bg-pink-500/30"
                    >
                      📷 @{profile.socialLinks.instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
