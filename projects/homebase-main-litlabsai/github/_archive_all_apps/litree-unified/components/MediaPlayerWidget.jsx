'use client';
import React, { useRef, useState } from 'react';
import { Tv, Mic, Share2 } from 'lucide-react';

const demoPlaylist = [
  { title: 'Big Buck Bunny', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { title: 'Sample Audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

export default function MediaPlayerWidget() {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef(null);

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (!fullscreen) {
        playerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setFullscreen(!fullscreen);
    }
  };

  const media = demoPlaylist[current];
  const isVideo = media.url.endsWith('.mp4');

  return (
    <div ref={playerRef} className="flash-card !p-5 border-white/5 bg-black/40 group/player">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hc-purple to-hc-gold p-[1px]">
            <div className="w-full h-full rounded-[7px] bg-black flex items-center justify-center">
              <Tv size={14} className="text-hc-bright-gold" />
            </div>
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-gradient">
            LiTreeLab'Studio™ Player
          </h2>
        </div>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-hc-purple/50 animate-pulse"></div>
          <div
            className="w-1.5 h-1.5 rounded-full bg-hc-bright-gold/50 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>
      </div>

      <div className="mb-6 group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-hc-purple/20 to-hc-gold/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {isVideo ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-black">
            <video
              controls
              className="w-full aspect-video object-cover"
              crossOrigin="anonymous"
              poster="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
            >
              <source src={media.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-4 right-4 z-20">
              <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-hc-bright-gold">
                HD LIVE
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-hc-purple/10 to-hc-gold/10 rounded-2xl p-12 flex flex-col items-center justify-center relative z-10 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-10"></div>
            <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10 mb-4 animate-float">
              <Mic size={40} className="text-hc-bright-gold" />
            </div>
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-gradient-to-r from-hc-purple to-hc-gold animate-[shimmer_2s_infinite]"></div>
            </div>
            <audio controls className="mt-8 w-full opacity-30 hover:opacity-100 transition-opacity">
              <source src={media.url} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hc-bright-gold animate-ping"></span>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Now Streaming
              </p>
            </div>
            <h3 className="font-black text-lg tracking-tight text-white group-hover/player:text-hc-bright-gold transition-colors">
              {media.title}
            </h3>
          </div>
          <button
            onClick={handleFullscreen}
            className="p-3 rounded-xl bg-white/5 hover:bg-hc-purple/20 border border-white/5 hover:border-hc-purple/30 transition-all text-gray-400 hover:text-white"
          >
            <Share2 size={16} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {demoPlaylist.map((item, idx) => (
            <button
              key={item.title}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border ${
                idx === current
                  ? 'bg-gradient-to-r from-hc-purple to-hc-dark-purple text-white border-hc-purple/50 shadow-[0_0_20px_rgba(107,33,168,0.3)]'
                  : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
              }`}
              onClick={() => setCurrent(idx)}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
