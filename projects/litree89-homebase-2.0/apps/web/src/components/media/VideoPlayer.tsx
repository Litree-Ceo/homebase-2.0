'use client';

/**
 * Video Player Component with Kodi-like Features
 *
 * @workspace HLS/DASH adaptive streaming player with chapter support,
 * subtitle tracks, quality selection, and watch party sync
 *
 * Uses native video element with custom controls for maximum compatibility
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './VideoPlayer.module.css';
import type { MediaItem, SubtitleTrack, Chapter } from '@/types';

interface VideoPlayerProps {
  media: MediaItem;
  autoPlay?: boolean;
  startTime?: number; // Resume position
  onProgress?: (progress: number, duration: number) => void;
  onEnded?: () => void;
  watchPartyMode?: boolean;
  onSyncRequest?: (time: number, isPlaying: boolean) => void;
}

interface ReadonlyVideoPlayerProps extends Readonly<VideoPlayerProps> {}

export default function VideoPlayer({
  media,
  autoPlay = false,
  startTime = 0,
  onProgress,
  onEnded,
  watchPartyMode = false,
  onSyncRequest,
}: ReadonlyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bufferedIndicatorRef = useRef<HTMLDivElement>(null);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);
  const chapterMarkerRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState(media.quality || 'auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get volume icon based on mute state and volume level
  const getVolumeIcon = (muted: boolean, vol: number): string => {
    if (muted || vol === 0) return '🔇';
    return vol < 0.5 ? '🔉' : '🔊';
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    if (watchPartyMode && onSyncRequest) {
      onSyncRequest(video.currentTime, !video.paused);
    }
  }, [watchPartyMode, onSyncRequest]);

  // Handle volume
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Number.parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement === null) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    },
    [duration],
  );

  // Jump to chapter
  const jumpToChapter = useCallback((chapter: Chapter) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapter.startTime;
    setShowChapters(false);
  }, []);

  // Current chapter derived from playback position
  const chapters = media.metadata?.chapters ?? [];

  const currentChapter = chapters.length
    ? [...chapters].reverse().find(ch => currentTime >= ch.startTime) || null
    : null;

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        onProgress(video.currentTime, video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [startTime, onProgress, onEnded]);

  useEffect(() => {
    if (!Number.isFinite(duration) || duration <= 0) return;

    if (bufferedIndicatorRef.current) {
      bufferedIndicatorRef.current.style.setProperty('--width', `${buffered}%`);
    }

    if (progressIndicatorRef.current) {
      const progressPercent = (currentTime / duration) * 100 || 0;
      progressIndicatorRef.current.style.setProperty('--width', `${progressPercent}%`);
    }

    chapters.forEach(chapter => {
      const marker = chapterMarkerRefs.current.get(chapter.startTime);
      if (!marker) return;
      const leftPercent = (chapter.startTime / duration) * 100 || 0;
      marker.style.setProperty('--left', `${leftPercent}%`);
    });
  }, [buffered, currentTime, duration, chapters]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowleft':
          skip(-10);
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange({
            target: { value: Math.min(1, volume + 0.1).toString() },
          } as React.ChangeEvent<HTMLInputElement>);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange({
            target: { value: Math.max(0, volume - 0.1).toString() },
          } as React.ChangeEvent<HTMLInputElement>);
          break;
      }
    };

    globalThis.window?.addEventListener('keydown', handleKeyDown);
    return () => globalThis.window?.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, skip, handleVolumeChange, volume]);

  const qualityOptions = ['auto', '360p', '480p', '720p', '1080p', '4k'];

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
    >
      {/* Video Element */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="h-full w-full"
        src={media.hlsUrl || media.sourceUrl}
        poster={media.thumbnailUrl}
        autoPlay={autoPlay}
        onClick={togglePlay}
        playsInline
        title="Video player"
      >
        Your browser does not support the HTML5 video player.
        {/* Subtitle tracks provide accessibility for hearing-impaired users */}
        {media.metadata?.subtitles?.map((sub: SubtitleTrack) => (
          <track
            key={sub.language}
            kind="subtitles"
            label={sub.label}
            srcLang={sub.language}
            src={sub.url}
            default={sub.isDefault}
          />
        ))}
      </video>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="rounded-full bg-amber-400/90 p-6 text-4xl text-black transition hover:bg-amber-300"
          >
            ▶
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Chapter Title */}
        {currentChapter && (
          <div className="mb-2 text-sm text-amber-200">📍 {currentChapter.title}</div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <label htmlFor="video-progress" className="sr-only">
            Video progress
          </label>
          <input
            id="video-progress"
            type="range"
            min="0"
            max={Number.isFinite(duration) ? Math.floor(duration) : 0}
            value={Number.isFinite(currentTime) ? Math.floor(currentTime) : 0}
            onChange={e => {
              const newTime = Number.parseInt(e.currentTarget.value, 10);
              if (videoRef.current && Number.isFinite(newTime)) {
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="w-full h-1 bg-white/30 rounded-full accent-amber-400 cursor-pointer hover:h-2 transition-all"
            aria-label="Video progress slider"
            title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          />
          {/* Visual progress indicators - CSS custom properties for dynamic values */}
          <div className={styles.progressContainer}>
            {/* eslint-disable-next-line react/style-prop-object */}
            <div
              ref={bufferedIndicatorRef}
              className={styles.bufferedIndicator}
              aria-hidden="true"
            />
            <div
              ref={progressIndicatorRef}
              className={styles.progressIndicator}
              aria-hidden="true"
            />
            {chapters.map((chapter: Chapter) => (
              <div
                key={chapter.startTime}
                ref={node => {
                  if (node) {
                    chapterMarkerRefs.current.set(chapter.startTime, node);
                  } else {
                    chapterMarkerRefs.current.delete(chapter.startTime);
                  }
                }}
                className={styles.chapterMarker}
                title={chapter.title}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-2xl text-white hover:text-amber-400">
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Skip */}
            <button onClick={() => skip(-10)} className="text-lg text-white hover:text-amber-400">
              ⏪ 10s
            </button>
            <button onClick={() => skip(10)} className="text-lg text-white hover:text-amber-400">
              10s ⏩
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-lg text-white hover:text-amber-400"
                aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              >
                {getVolumeIcon(isMuted, volume)}
              </button>
              <label htmlFor="volume-slider" className="sr-only">
                Volume
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-amber-400"
                aria-label="Volume control"
              />
            </div>

            {/* Time */}
            <div className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Chapters */}
            {media.metadata?.chapters && media.metadata.chapters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowChapters(!showChapters)}
                  className="text-lg text-white hover:text-amber-400"
                >
                  📑 Chapters
                </button>
                {showChapters && (
                  <div className="absolute bottom-full right-0 mb-2 max-h-64 w-64 overflow-y-auto rounded-lg bg-black/95 p-2 shadow-xl">
                    {media.metadata.chapters.map((chapter: Chapter) => (
                      <button
                        key={chapter.startTime}
                        onClick={() => jumpToChapter(chapter)}
                        className={`block w-full rounded px-3 py-2 text-left text-sm transition hover:bg-amber-400/20 ${
                          currentChapter?.title === chapter.title
                            ? 'bg-amber-400/30 text-amber-300'
                            : 'text-white'
                        }`}
                      >
                        <span className="text-amber-400/60">{formatTime(chapter.startTime)}</span>{' '}
                        {chapter.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtitles */}
            {media.metadata?.subtitles && media.metadata.subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  className={`text-lg hover:text-amber-400 ${
                    activeSubtitle ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  CC
                </button>
                {showSubtitleMenu && (
                  <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-black/95 p-2 shadow-xl">
                    <button
                      onClick={() => {
                        setActiveSubtitle(null);
                        setShowSubtitleMenu(false);
                      }}
                      className={`block w-full rounded px-3 py-1 text-left text-sm ${
                        activeSubtitle === null ? 'text-amber-400' : 'text-white'
                      } hover:bg-amber-400/20`}
                    >
                      Off
                    </button>
                    {media.metadata.subtitles.map((sub: SubtitleTrack) => (
                      <button
                        key={sub.language}
                        onClick={() => {
                          setActiveSubtitle(sub.language);
                          setShowSubtitleMenu(false);
                        }}
                        className={`block w-full rounded px-3 py-1 text-left text-sm ${
                          activeSubtitle === sub.language ? 'text-amber-400' : 'text-white'
                        } hover:bg-amber-400/20`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quality */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="text-sm font-medium text-white hover:text-amber-400"
              >
                ⚙️ {quality}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-black/95 p-2 shadow-xl">
                  {qualityOptions.map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={`block w-full rounded px-3 py-1 text-left text-sm ${
                        quality === q ? 'text-amber-400' : 'text-white'
                      } hover:bg-amber-400/20`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-lg text-white hover:text-amber-400"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? '⛶ Exit' : '⛶ Enter'}
            </button>
          </div>
        </div>
      </div>

      {/* Watch Party Indicator */}
      {watchPartyMode && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 text-sm text-white">
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-white"
            aria-hidden="true"
          />
          <span>Watch Party</span>
        </div>
      )}
    </div>
  );
}
