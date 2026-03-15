'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'schedule' | 'monetize' | 'audience'>('analytics');

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-amber-950/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-amber-400/20 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-amber-400">🎬 Creator Studio</h1>
            <p className="text-amber-100/60">Premium tools for creators</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/profile/me"
              className="px-4 py-2 text-amber-400 hover:text-amber-300 transition"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-amber-400/20">
          {(['analytics', 'schedule', 'audience', 'monetize'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-amber-100/60 hover:text-amber-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Views', value: '0', icon: '👁️' },
                { label: 'Engagements', value: '0', icon: '💬' },
                { label: 'Shares', value: '0', icon: '↗️' },
                { label: 'Followers', value: '0', icon: '👥' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-2"
                >
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-amber-100/60 text-sm">{stat.label}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Engagement over time */}
            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Engagement Over Time</h3>
              <div className="h-64 flex items-end justify-around gap-2 bg-black/20 rounded p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded opacity-40 h-1/4"
                  />
                ))}
              </div>
              <p className="text-amber-100/60 text-sm">No data yet. Create posts to see analytics!</p>
            </div>

            {/* Top posts */}
            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Top Performing Posts</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-black/20 rounded border border-amber-400/10"
                  >
                    <div className="flex-1">
                      <div className="text-amber-100">Post #{i}</div>
                      <div className="text-amber-100/60 text-sm">0 engagements</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-semibold">0 views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">📅 Post Scheduler</h2>

            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-8 text-center space-y-4">
              <div className="text-6xl">📤</div>
              <p className="text-white font-semibold">Schedule Posts in Advance</p>
              <p className="text-amber-100/60">
                Plan your content calendar and auto-publish posts at the best times
              </p>
              <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition font-semibold">
                Schedule a Post
              </button>
            </div>

            {/* Scheduled posts list */}
            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Posts</h3>
              <p className="text-amber-100/60 text-center py-8">No scheduled posts yet</p>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">👥 Audience Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Follower demographics */}
              <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Follower Demographics</h3>
                <div className="space-y-3">
                  {['18-24', '25-34', '35-44', '45+'].map((age) => (
                    <div key={age} className="flex items-center justify-between">
                      <span className="text-amber-100">{age} years</span>
                      <div className="flex-1 mx-4 h-2 bg-black/40 rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-0" />
                      </div>
                      <span className="text-amber-100/60 text-sm">0%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active times */}
              <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">When Your Audience is Active</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-amber-100/60 mb-2">{day}</div>
                      <div className="h-16 bg-black/20 rounded opacity-40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top followers */}
            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Top Followers</h3>
              <p className="text-amber-100/60 text-center py-8">
                Build your audience and see your top supporters here
              </p>
            </div>
          </div>
        )}

        {/* Monetize Tab */}
        {activeTab === 'monetize' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">💰 Monetization</h2>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-400/40 rounded-lg p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-amber-100">Premium Membership</h3>
                <p className="text-amber-100/60">
                  Your fans can subscribe to your profile for exclusive content
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: 'Starter', price: '$4.99', features: ['Exclusive posts', 'Chat access'] },
                  { tier: 'Pro', price: '$9.99', features: ['All Starter', 'Private streams', 'Early access'] },
                  { tier: 'VIP', price: '$24.99', features: ['All Pro', 'Direct calls', '1-on-1 sessions'] },
                ].map((tier) => (
                  <div
                    key={tier.tier}
                    className="bg-black/40 border border-amber-400/20 rounded-lg p-4 space-y-3"
                  >
                    <div className="text-lg font-bold text-white">{tier.tier}</div>
                    <div className="text-2xl font-black text-amber-400">{tier.price}</div>
                    <div className="space-y-2 text-sm text-amber-100/60">
                      {tier.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <span>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition text-sm font-semibold">
                      Set Up
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other monetization options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
                <div className="text-2xl">🎁</div>
                <h3 className="text-lg font-semibold text-white">Tips & Donations</h3>
                <p className="text-amber-100/60 text-sm">
                  Let your fans support you with one-time tips
                </p>
                <button className="w-full px-4 py-2 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/40 transition text-sm font-semibold">
                  Enable Tips
                </button>
              </div>

              <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
                <div className="text-2xl">📢</div>
                <h3 className="text-lg font-semibold text-white">Sponsored Posts</h3>
                <p className="text-amber-100/60 text-sm">
                  Earn from brand partnerships and sponsored content
                </p>
                <button className="w-full px-4 py-2 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/40 transition text-sm font-semibold">
                  Learn More
                </button>
              </div>
            </div>

            {/* Revenue summary */}
            <div className="bg-black/40 border border-amber-400/20 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Revenue Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-black/20 rounded">
                  <div className="text-amber-100/60 text-sm mb-1">This Month</div>
                  <div className="text-2xl font-bold text-amber-400">$0</div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded">
                  <div className="text-amber-100/60 text-sm mb-1">Total Earned</div>
                  <div className="text-2xl font-bold text-amber-400">$0</div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded">
                  <div className="text-amber-100/60 text-sm mb-1">Subscribers</div>
                  <div className="text-2xl font-bold text-amber-400">0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
