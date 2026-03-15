'use client';

/**
 * User Settings & Customization
 * @workspace Manage profile, privacy, notifications, subscription
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<
    'profile' | 'privacy' | 'notifications' | 'billing'
  >('profile');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    isPublic: true,
    allowMessages: true,
    allowFollows: true,
    showActivity: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true,
    email: false,
  });

  // Load user settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id && !user?.localAccountId) return;

      try {
        const res = await fetch(`/api/users/${user?.id || user?.localAccountId}/settings`);
        if (res.ok) {
          const settings = await res.json();
          if (settings.privacy) {
            setPrivacySettings(settings.privacy);
          }
          if (settings.notifications) {
            setNotificationSettings(settings.notifications);
          }
        } else {
          console.warn('Could not load user settings, using defaults');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [user?.id, user?.localAccountId]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/users/${user?.id || user?.localAccountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        alert('Profile updated!');
      } else {
        const errorData = await res.json();
        console.error('Profile update failed:', errorData);
        alert(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Network error: Unable to update profile. Please check your connection.');
    }
  };

  const handleSaveSettings = async (type: 'privacy' | 'notifications') => {
    try {
      const res = await fetch(`/api/users/${user?.id || user?.localAccountId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          settings: type === 'privacy' ? privacySettings : notificationSettings,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`${type === 'privacy' ? 'Privacy' : 'Notification'} settings saved successfully!`);
        console.log('Settings saved:', result);
      } else {
        const errorData = await res.json();
        console.error('Settings save failed:', errorData);
        alert(`Failed to save ${type} settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Network error: Unable to save settings. Please check your connection.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-4xl font-black text-white mb-8">⚙️ Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-slate-900 rounded-lg border border-purple-500/20 p-4 sticky top-20">
            <nav className="space-y-2">
              {[
                { key: 'profile', icon: '👤', label: 'Profile' },
                { key: 'privacy', icon: '🔒', label: 'Privacy' },
                { key: 'notifications', icon: '🔔', label: 'Notifications' },
                { key: 'billing', icon: '💳', label: 'Billing' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeSection === item.key
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <div className="border-t border-purple-500/20 mt-6 pt-6">
              <button
                onClick={logout}
                className="w-full px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition font-semibold"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="bg-slate-900 rounded-lg border border-purple-500/20 p-8 space-y-6">
              <h2 className="text-2xl font-black text-white">👤 Profile Information</h2>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Profile Picture
                </label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-4xl">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="rounded-full"
                      />
                    ) : (
                      '📸'
                    )}
                  </div>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Upload New
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              {[
                { label: 'Display Name', key: 'displayName', type: 'text' },
                { label: 'Bio', key: 'bio', type: 'textarea' },
                { label: 'Website', key: 'website', type: 'url' },
                { label: 'Location', key: 'location', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-white mb-2">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={profileData[field.key as keyof typeof profileData]}
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50"
                      rows={3}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={profileData[field.key as keyof typeof profileData]}
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="bg-slate-900 rounded-lg border border-purple-500/20 p-8 space-y-6">
              <h2 className="text-2xl font-black text-white">🔒 Privacy & Safety</h2>

              {[
                {
                  key: 'isPublic',
                  label: 'Public Profile',
                  desc: 'Anyone can see your profile and posts',
                },
                {
                  key: 'allowMessages',
                  label: 'Allow Messages',
                  desc: 'Allow anyone to send you direct messages',
                },
                {
                  key: 'allowFollows',
                  label: 'Allow Follows',
                  desc: 'Anyone can follow your account',
                },
                {
                  key: 'showActivity',
                  label: 'Show Activity',
                  desc: "Let others see when you're online",
                },
              ].map(setting => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-white">{setting.label}</h3>
                    <p className="text-sm text-purple-300">{setting.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      privacySettings[setting.key as keyof typeof privacySettings] as boolean
                    }
                    onChange={e =>
                      setPrivacySettings({
                        ...privacySettings,
                        [setting.key]: e.target.checked,
                      })
                    }
                    className="w-6 h-6 rounded"
                  />
                </div>
              ))}

              <button
                onClick={() => handleSaveSettings('privacy')}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg"
              >
                Save Privacy Settings
              </button>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-slate-900 rounded-lg border border-purple-500/20 p-8 space-y-6">
              <h2 className="text-2xl font-black text-white">🔔 Notifications</h2>

              {[
                { key: 'likes', label: '👍 Likes', desc: 'When someone likes your post' },
                {
                  key: 'comments',
                  label: '💬 Comments',
                  desc: 'When someone comments on your post',
                },
                { key: 'follows', label: '👥 Follows', desc: 'When someone follows you' },
                {
                  key: 'messages',
                  label: '✉️ Messages',
                  desc: 'When you receive a direct message',
                },
                { key: 'mentions', label: '@ Mentions', desc: 'When someone mentions you' },
                {
                  key: 'email',
                  label: '📧 Email Digest',
                  desc: 'Weekly email summary of activity',
                },
              ].map(notif => (
                <div
                  key={notif.key}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-white">{notif.label}</h3>
                    <p className="text-sm text-purple-300">{notif.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      notificationSettings[
                        notif.key as keyof typeof notificationSettings
                      ] as boolean
                    }
                    onChange={e =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [notif.key]: e.target.checked,
                      })
                    }
                    className="w-6 h-6 rounded"
                  />
                </div>
              ))}

              <button
                onClick={() => handleSaveSettings('notifications')}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg"
              >
                Save Notification Preferences
              </button>
            </div>
          )}

          {/* Billing Settings */}
          {activeSection === 'billing' && (
            <div className="bg-slate-900 rounded-lg border border-purple-500/20 p-8 space-y-6">
              <h2 className="text-2xl font-black text-white">💳 Billing & Subscription</h2>

              <div className="bg-gradient-to-r from-amber-400 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Current Plan: {user?.tier || 'Free'}</h3>
                <p>Manage your subscription, billing history, and payment methods</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { tier: 'Free', price: '$0', features: ['5 posts', '1 bot', 'Basic stats'] },
                  {
                    tier: 'Pro',
                    price: '$29.99/mo',
                    features: ['Unlimited posts', 'Unlimited bots', 'Pro stats'],
                  },
                  {
                    tier: 'Studio',
                    price: '$99.99/mo',
                    features: ['All Pro', 'API access', 'White-label'],
                  },
                ].map(plan => (
                  <div key={plan.tier} className="border border-purple-500/20 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-1">{plan.tier}</h3>
                    <div className="text-amber-400 font-bold mb-3">{plan.price}</div>
                    <ul className="text-sm text-purple-200">
                      {plan.features.map(f => (
                        <li key={f}>✓ {f}</li>
                      ))}
                    </ul>
                    {user?.tier === plan.tier ? (
                      <button className="w-full mt-4 py-2 bg-purple-600 rounded text-white font-semibold">
                        Current Plan
                      </button>
                    ) : (
                      <button className="w-full mt-4 py-2 bg-amber-400 text-black rounded font-semibold hover:bg-amber-500">
                        Upgrade
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
