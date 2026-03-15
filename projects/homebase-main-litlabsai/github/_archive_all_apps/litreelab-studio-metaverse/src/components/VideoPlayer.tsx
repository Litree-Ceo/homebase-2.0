'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSound from 'use-sound';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  className?: string;
}

export function VideoPlayer({ url, thumbnail, className }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playHover] = useSound('/sounds/notification.mp3', { volume: 0.1 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePlay = async () => {
    if (!mounted) return;
    
    playClick();

    // If error state, try to reset
    if (error) {
      setError(false);
      setPlaying(true);
      return;
    }

    setPlaying(prev => !prev);
  };

  if (!mounted) {
    return (
      <div className={cn("relative aspect-video bg-black/20 rounded-xl animate-pulse", className)} />
    );
  }

  if (error) {
    return (
      <div className={cn("relative aspect-video bg-black/90 rounded-xl flex items-center justify-center text-red-500 font-mono", className)}>
        <div className="text-center">
          <p className="text-xl font-bold">SIGNAL LOST</p>
          <p className="text-sm opacity-70">ERR_MEDIA_ABORTED</p>
          <button 
             onClick={() => setError(false)}
             className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50 text-xs uppercase"
          >
             Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative aspect-video rounded-xl overflow-hidden group bg-black shadow-2xl shadow-purple-900/20", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 pointer-events-none z-20 scanline opacity-20" />
      
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        light={thumbnail || false}
        onError={(e: any) => {
          console.error("Video Error:", e);
          setError(true);
          setPlaying(false);
        }}
        playIcon={
          <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:scale-110 transition-transform cursor-pointer group/play shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Play className="w-8 h-8 text-white fill-white ml-1 group-hover/play:text-lab-purple-400 group-hover/play:fill-lab-purple-400 transition-colors" />
          </div>
        }
        controls={false}
      />

      {/* Custom Overlay Controls */}
      <div className={cn(
        "absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 z-30",
        playing && !isHovered ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex items-center gap-6">
          <button 
            onClick={togglePlay}
            className="text-white hover:text-lab-purple-400 transition-colors hover:scale-110 active:scale-95 transform duration-200"
          >
            {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
          </button>

          <div className="flex items-center gap-3 group/vol">
            <button onClick={() => setMuted(!muted)} className="text-white hover:text-lab-purple-400">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.1} 
              value={volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setMuted(false);
              }}
              className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lab-purple-500"
            />
          </div>

          <div className="flex-1" />

          <button className="text-white hover:text-lab-purple-400 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
