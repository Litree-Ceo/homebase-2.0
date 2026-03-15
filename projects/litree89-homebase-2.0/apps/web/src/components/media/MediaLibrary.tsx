'use client';

/**
 * Media Library Component - Kodi-like Interface
 *
 * @workspace Netflix/Kodi-style media browsing with categories,
 * filtering, search, and beautiful card layouts
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { MediaItem } from '@/types';

interface MediaLibraryProps {
  readonly userId?: string; // If provided, show specific user's library
  readonly showPublicOnly?: boolean;
  readonly onMediaSelect?: (media: MediaItem) => void;
}

type MediaCategory = 'all' | 'movie' | 'tvshow' | 'music' | 'podcast' | 'livestream' | 'clip';
type SortOption = 'newest' | 'oldest' | 'popular' | 'rating' | 'title';
type ViewMode = 'grid' | 'list' | 'poster';

const CATEGORIES: { id: MediaCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'movie', label: 'Movies', icon: '🎬' },
  { id: 'tvshow', label: 'TV Shows', icon: '📺' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'livestream', label: 'Live', icon: '🔴' },
  { id: 'clip', label: 'Clips', icon: '📹' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'title', label: 'Title A-Z' },
];

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const getThumbnailClass = (mode: ViewMode): string => {
  if (mode === 'poster') return 'aspect-[2/3]';
  if (mode === 'list') return 'w-48 flex-shrink-0';
  return 'aspect-video';
};

interface MediaCardProps {
  readonly item: MediaItem;
  readonly viewMode: ViewMode;
  readonly onMediaSelect?: (media: MediaItem) => void;
}

const MediaCard = ({ item, viewMode, onMediaSelect }: MediaCardProps) => (
  <button
    type="button"
    onClick={() => onMediaSelect?.(item)}
    className={`group w-full cursor-pointer overflow-hidden rounded-xl border border-amber-400/20 bg-black/40 text-left transition hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/10 ${
      viewMode === 'list' ? 'flex gap-4' : ''
    }`}
  >
    {/* Thumbnail */}
    <div className={`relative overflow-hidden ${getThumbnailClass(viewMode)}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={viewMode === 'poster' ? item.posterUrl || item.thumbnailUrl : item.thumbnailUrl}
        alt={item.title}
        className="h-full w-full object-cover transition group-hover:scale-105"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
        <div className="rounded-full bg-amber-400 p-3 text-2xl text-black">▶</div>
      </div>

      {/* Duration Badge */}
      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
        {formatDuration(item.duration)}
      </span>

      {/* Media Type Badge */}
      <span className="absolute left-2 top-2 rounded bg-amber-400/90 px-2 py-0.5 text-xs font-medium text-black">
        {item.mediaType.toUpperCase()}
      </span>

      {/* Live Badge */}
      {item.mediaType === 'livestream' && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {/* eslint-disable-next-line jsx-a11y/aria-role */}
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
          LIVE
        </span>
      )}
    </div>

    {/* Info */}
    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
      <h3 className="mb-1 line-clamp-2 font-semibold text-amber-100 group-hover:text-amber-300">
        {item.title}
      </h3>

      {/* Metadata */}
      <div className="mb-2 flex flex-wrap gap-2 text-xs text-amber-100/60">
        {item.releaseYear && <span>{item.releaseYear}</span>}
        {item.quality && <span>• {item.quality}</span>}
        {item.metadata?.artist && <span>• {item.metadata.artist}</span>}
        {item.metadata?.director && <span>• Dir: {item.metadata.director}</span>}
      </div>

      {/* Description (list view only) */}
      {viewMode === 'list' && item.description && (
        <p className="mb-2 line-clamp-2 text-sm text-amber-100/70">{item.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-amber-100/50">
        <span>👁️ {item.stats.views.toLocaleString()}</span>
        <span>❤️ {item.stats.likes.toLocaleString()}</span>
        {item.rating && (
          <span className="flex items-center gap-1">⭐ {item.rating.average.toFixed(1)}</span>
        )}
      </div>

      {/* Genres */}
      <div className="mt-2 flex flex-wrap gap-1">
        {item.genre.slice(0, 3).map(genre => (
          <span
            key={genre}
            className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-400"
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  </button>
);

export default function MediaLibrary({
  userId,
  showPublicOnly = false,
  onMediaSelect,
}: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Fetch media items
  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (showPublicOnly) params.append('visibility', 'public');
        if (selectedCategory !== 'all') params.append('type', selectedCategory);

        const response = await fetch(`/api/media?${params.toString()}`, {
          headers: {},
        });

        if (response.ok) {
          const data = await response.json();
          setMediaItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [userId, showPublicOnly, selectedCategory]);

  // Get unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    mediaItems.forEach(item => item.genre.forEach(g => genres.add(g)));
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }, [mediaItems]);

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    let items = [...mediaItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query)) ||
          item.metadata?.artist?.toLowerCase().includes(query) ||
          item.metadata?.director?.toLowerCase().includes(query),
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      items = items.filter(item => selectedGenres.some(genre => item.genre.includes(genre)));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        items.sort((a, b) => b.stats.views - a.stats.views);
        break;
      case 'rating':
        items.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'title':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return items;
  }, [mediaItems, searchQuery, selectedGenres, sortBy]);

  // Group by genre for Kodi-style rows (only for 'all' category)
  const mediaByGenre = useMemo(() => {
    if (selectedCategory !== 'all') return null;

    const grouped: Record<string, MediaItem[]> = {};
    filteredMedia.forEach(item => {
      item.genre.forEach(genre => {
        if (!grouped[genre]) grouped[genre] = [];
        if (grouped[genre].length < 10) {
          grouped[genre].push(item);
        }
      });
    });
    return grouped;
  }, [filteredMedia, selectedCategory]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre],
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Controls */}
      <div className="rounded-2xl border border-amber-400/30 bg-black/60 p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search movies, shows, music..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-400/30 bg-black/30 px-4 py-2 pl-10 text-amber-100 placeholder-amber-100/40 focus:border-amber-400 focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/40">🔍</span>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-amber-400/30 bg-black/30 px-4 py-2 text-amber-100 focus:border-amber-400 focus:outline-none"
            title="Sort media by"
            aria-label="Sort media by"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex rounded-xl border border-amber-400/30 bg-black/30">
            {(['grid', 'poster', 'list'] as ViewMode[]).map(mode => {
              const getIcon = (): string => {
                if (mode === 'grid') return '▦';
                if (mode === 'poster') return '▣';
                return '☰';
              };
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 ${
                    viewMode === mode
                      ? 'bg-amber-400/20 text-amber-400'
                      : 'text-amber-100/60 hover:text-amber-100'
                  }`}
                >
                  {getIcon()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Genre Filters */}
        {allGenres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allGenres.slice(0, 15).map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedGenres.includes(genre)
                    ? 'bg-amber-400 text-black'
                    : 'bg-amber-400/10 text-amber-100/70 hover:bg-amber-400/20'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      )}

      {/* Kodi-style Genre Rows (when viewing all) */}
      {!isLoading && mediaByGenre && Object.keys(mediaByGenre).length > 0 && (
        <div className="space-y-8">
          {Object.entries(mediaByGenre)
            .slice(0, 8)
            .map(([genre, items]) => (
              <div key={genre}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-amber-100">{genre}</h2>
                  <button className="text-sm text-amber-400 hover:underline">See All →</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {items.map(item => (
                    <div key={item.id} className="w-64 flex-shrink-0">
                      <MediaCard item={item} viewMode={viewMode} onMediaSelect={onMediaSelect} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Grid/List View (when filtered or category selected) */}
      {!isLoading && (!mediaByGenre || selectedCategory !== 'all') && (
        <div
          className={(() => {
            if (viewMode === 'grid')
              return 'grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
            if (viewMode === 'poster')
              return 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
            return 'space-y-4';
          })()}
        >
          {filteredMedia.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onMediaSelect={onMediaSelect}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMedia.length === 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-black/40 p-12 text-center">
          <div className="mb-4 text-5xl">🎬</div>
          <h3 className="mb-2 text-lg font-medium text-amber-100">No media found</h3>
          <p className="text-amber-100/60">
            {searchQuery
              ? 'Try different search terms or filters'
              : 'Start adding media to your library'}
          </p>
        </div>
      )}
    </div>
  );
}
