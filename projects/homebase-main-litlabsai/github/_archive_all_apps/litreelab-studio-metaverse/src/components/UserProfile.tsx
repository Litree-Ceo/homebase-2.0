'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useFirebase } from '@/lib/firebase'
import { 
  User, 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Grid, 
  Film, 
  ListMusic, 
  Tv, 
  Info 
} from 'lucide-react'

export function UserProfile() {
  const { user } = useFirebase()
  const [isEditing, setIsEditing] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [layout, setLayout] = useState('standard')

  // Use Firebase user or fallback
  const userData = {
    name: user?.displayName || 'Guest Creator',
    username: user?.email ? `@${user.email.split('@')[0]}` : '@guest',
    avatar: user?.photoURL || null,
    coverPhoto: '/api/placeholder/800/300',
    bio: '🎮 Gamer | 🎵 Music Lover | 🎬 Content Creator | Living life one pixel at a time ✨',
    location: 'Metaverse',
    website: 'litreelab.com',
    joinedDate: 'Joined Now',
    followers: 1247,
    following: 892,
    posts: 234
  }

  const themes = [
    { id: 'dark', name: 'Dark Mode', colors: 'bg-gray-900 text-white' },
    { id: 'light', name: 'Light Mode', colors: 'bg-white text-gray-900' },
    { id: 'neon', name: 'Neon Dreams', colors: 'bg-black text-cyan-400' },
    { id: 'retro', name: 'Retro Wave', colors: 'bg-purple-900 text-pink-400' },
  ]

  const layouts = [
    { id: 'standard', name: 'Standard', description: 'Clean and organized' },
    { id: 'creative', name: 'Creative', description: 'Artistic and free-form' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and focused' },
  ]

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden mb-6" role="region" aria-label="User profile">
      {/* Cover Photo */}
      <div className="relative h-48 bg-linear-to-r from-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        {isEditing && (
          <div className="absolute top-4 right-4">
            <button
              className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-70 transition-colors"
              aria-label="Change cover photo"
            >
              Change Cover
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex items-end -mt-16 mb-4">
          <div className="relative">
            <div className="w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-800 flex items-center justify-center text-4xl overflow-hidden">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="ml-4 mb-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white" id="user-name">{userData.name}</h1>
                <p className="text-gray-400" id="user-username">{userData.username}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label={isEditing ? 'Save profile' : 'Edit profile'}
                aria-describedby="user-name user-username"
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          {isEditing ? (
            <textarea
              className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none"
              rows={3}
              defaultValue={userData.bio}
              aria-label="User bio"
              aria-describedby="user-name user-username"
            />
          ) : (
            <p className="text-gray-300" aria-label="User bio">
              {userData.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-4 text-sm" role="list" aria-label="User statistics">
          <div className="text-center" role="listitem">
            <div className="font-bold text-white" aria-label="Number of posts">{userData.posts}</div>
            <div className="text-gray-400">Posts</div>
          </div>
          <div className="text-center" role="listitem">
            <div className="font-bold text-white" aria-label="Number of followers">{userData.followers}</div>
            <div className="text-gray-400">Followers</div>
          </div>
          <div className="text-center" role="listitem">
            <div className="font-bold text-white" aria-label="Number of following">{userData.following}</div>
            <div className="text-gray-400">Following</div>
          </div>
        </div>

        {/* Location & Website */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-400" role="list" aria-label="User information">
          <div className="flex items-center gap-1" role="listitem">
            <MapPin className="w-4 h-4" />
            <span aria-label="Location">{userData.location}</span>
          </div>
          <div className="flex items-center gap-1" role="listitem">
            <LinkIcon className="w-4 h-4" />
            <a href={`https://${userData.website}`} className="text-purple-400 hover:underline" aria-label={`Visit ${userData.website}`}>
              {userData.website}
            </a>
          </div>
          <div className="flex items-center gap-1" role="listitem">
            <Calendar className="w-4 h-4" />
            <span aria-label="Joined date">{userData.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Customization Options */}
      {isEditing && (
        <div className="border-t border-gray-700 pt-4 px-6 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Customize Your Profile</h3>
          
          {/* Theme Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" id="theme-label">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    theme === t.id
                      ? 'border-purple-500 bg-purple-600 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  } ${t.colors}`}
                  aria-label={`Select ${t.name} theme`}
                  aria-describedby="theme-label"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" id="layout-label">
              Layout Style
            </label>
            <div className="space-y-2">
              {layouts.map((l) => (
                <label key={l.id} className="flex items-center space-x-3" role="radio" aria-checked={layout === l.id}>
                  <input
                    type="radio"
                    name="layout"
                    value={l.id}
                    checked={layout === l.id}
                    onChange={(e) => setLayout(e.target.value)}
                    className="text-purple-600"
                    aria-labelledby="layout-label"
                    aria-label={l.name}
                  />
                  <div>
                    <div className="text-white font-medium">{l.name}</div>
                    <div className="text-gray-400 text-sm">{l.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom CSS */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" id="custom-css-label">
              Custom CSS (MySpace Style!)
            </label>
            <textarea
              className="w-full bg-gray-700 text-white p-3 rounded-lg font-mono text-sm"
              rows={4}
              placeholder="body { background: linear-gradient(...); }"
              aria-label="Custom CSS editor"
              aria-describedby="custom-css-label"
            />
          </div>
        </div>
      )}
    </div>
  )
}
