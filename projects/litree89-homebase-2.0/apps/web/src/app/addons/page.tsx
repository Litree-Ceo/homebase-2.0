'use client';

/**
 * Kodi Addons Marketplace
 * @workspace Discover, install, and manage Kodi addons
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface KodiAddon {
  id: string;
  name: string;
  description: string;
  icon?: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  category: string;
  installUrl: string;
  sourceUrl?: string;
  lastUpdated: string;
  isInstalled?: boolean;
}

type FilterCategory = 'all' | 'video' | 'audio' | 'program' | 'pvr' | 'repository';

export default function KodiAddonsPage() {
  const { user } = useAuth();
  const [addons, setAddons] = useState<KodiAddon[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<KodiAddon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [installedAddons, setInstalledAddons] = useState<Set<string>>(new Set());

  const categories: { id: FilterCategory; name: string; icon: string }[] = [
    { id: 'all', name: 'All Addons', icon: '⭐' },
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'audio', name: 'Music', icon: '🎵' },
    { id: 'program', name: 'Programs', icon: '⚙️' },
    { id: 'pvr', name: 'Live TV', icon: '📺' },
    { id: 'repository', name: 'Repositories', icon: '📦' },
  ];

  useEffect(() => {
    loadAddons();
  }, [user?.id || user?.localAccountId]);

  useEffect(() => {
    filterAddons();
  }, [addons, selectedCategory, searchQuery]);

  const loadAddons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/kodi/addons');
      if (res.ok) {
        const data = await res.json();
        setAddons(data);

        // Load installed addons
        const installedRes = await fetch('/api/kodi/addons/installed');
        if (installedRes.ok) {
          const installed = await installedRes.json();
          setInstalledAddons(new Set(installed.map((a: any) => a.id)));
        }
      }
    } catch (error) {
      console.error('Failed to load addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAddons = () => {
    let filtered = addons;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.author.toLowerCase().includes(query),
      );
    }

    // Sort by downloads (most popular first)
    filtered.sort((a, b) => b.downloads - a.downloads);
    setFilteredAddons(filtered);
  };

  const handleInstallAddon = async (addon: KodiAddon) => {
    try {
      const res = await fetch('/api/kodi/addons/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonId: addon.id, installUrl: addon.installUrl }),
      });

      if (res.ok) {
        setInstalledAddons(prev => new Set([...prev, addon.id]));
      }
    } catch (error) {
      console.error('Failed to install addon:', error);
    }
  };

  const handleUninstallAddon = async (addonId: string) => {
    try {
      const res = await fetch(`/api/kodi/addons/${addonId}/uninstall`, {
        method: 'POST',
      });

      if (res.ok) {
        setInstalledAddons(prev => {
          const updated = new Set(prev);
          updated.delete(addonId);
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to uninstall addon:', error);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-center">
        <div className="inline-block animate-spin text-4xl">⚙️</div>
        <p className="text-purple-300 mt-4">Loading addons...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-4">📺 Kodi Addons Marketplace</h1>
        <p className="text-purple-300">Discover and install amazing addons for Kodi</p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search addons, authors, descriptions..."
            className="w-full px-4 py-3 bg-slate-900 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredAddons.map(addon => {
          const isInstalled = installedAddons.has(addon.id);
          return (
            <div
              key={addon.id}
              className="bg-slate-900 border border-purple-500/20 rounded-lg p-6 hover:border-purple-400 transition"
            >
              {/* Addon Header */}
              <div className="flex items-start gap-4 mb-4">
                {addon.icon ? (
                  <img
                    src={addon.icon}
                    alt={addon.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-black text-white text-lg">{addon.name}</h3>
                  <p className="text-sm text-purple-300">by {addon.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`font-bold ${getRatingColor(addon.rating)}`}>
                      {'⭐'.repeat(Math.round(addon.rating))}
                    </span>
                    <span className="text-xs text-purple-300">{addon.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4 line-clamp-3">{addon.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-purple-300">Downloads</p>
                  <p className="font-bold text-white">{(addon.downloads / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-purple-300">Version</p>
                  <p className="font-bold text-white">{addon.version}</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <p className="text-purple-300">Updated</p>
                  <p className="font-bold text-white">
                    {new Date(addon.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                  {categories.find(c => c.id === (addon.category as FilterCategory))?.name}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  if (isInstalled) {
                    handleUninstallAddon(addon.id);
                  } else {
                    handleInstallAddon(addon);
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg font-bold transition ${
                  isInstalled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                }`}
              >
                {isInstalled ? '✓ Installed - Uninstall' : '⬇️ Install'}
              </button>

              {/* Source Link */}
              {addon.sourceUrl && (
                <a
                  href={addon.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-center text-xs text-purple-400 hover:text-purple-300"
                >
                  View on GitHub →
                </a>
              )}
            </div>
          );
        })}
      </div>

      {filteredAddons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-white font-bold text-lg">No addons found</p>
          <p className="text-purple-300">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-12 bg-slate-900 border border-purple-500/20 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-black text-amber-400">{addons.length}</p>
            <p className="text-purple-300">Total Addons</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-green-400">{installedAddons.size}</p>
            <p className="text-purple-300">Installed</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-purple-400">
              {(addons.reduce((sum, a) => sum + a.downloads, 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-purple-300">Total Downloads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
