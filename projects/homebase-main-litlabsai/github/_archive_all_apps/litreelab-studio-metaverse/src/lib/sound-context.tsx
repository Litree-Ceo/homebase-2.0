'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Howl, Howler } from 'howler';

type SoundType = 'click' | 'success' | 'error' | 'notification' | 'ambient';

interface SoundContextType {
  play: (type: SoundType) => void;
  stop: () => void;
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Placeholder sound URLs - in a real app, these would be local files in /public/sounds/
const SOUNDS: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
  ambient: '/sounds/ambient-drone.mp3',
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true); // Default to muted for UX best practice
  const [volume, setVolume] = useState(0.5);
  const soundsRef = useRef<Record<string, Howl>>({});

  useEffect(() => {
    // Initialize Howler
    Howler.volume(volume);
    Howler.mute(isMuted);

    // Preload critical UI sounds
    // We use a try-catch block or check file existence in a real app
    // Here we just setup the Howl objects
    Object.entries(SOUNDS).forEach(([key, src]) => {
      soundsRef.current[key] = new Howl({
        src: [src],
        preload: key !== 'ambient', // Lazy load ambient
        loop: key === 'ambient',
        volume: key === 'ambient' ? 0.3 : 1.0, // Lower volume for background
      });
    });

    return () => {
      Howler.unload();
    };
  }, []);

  useEffect(() => {
    Howler.volume(volume);
  }, [volume]);

  useEffect(() => {
    Howler.mute(isMuted);
    
    // Auto-play/stop ambient based on mute state if we were on a page that requested it
    // For now, we keep it simple
    if (!isMuted) {
       // soundsRef.current['ambient']?.play(); // Uncomment to auto-start ambient
    } else {
       soundsRef.current['ambient']?.pause();
    }
  }, [isMuted]);

  const play = (type: SoundType) => {
    if (isMuted) return;
    
    const sound = soundsRef.current[type];
    if (sound) {
      // Randomize pitch slightly for UI sounds to prevent "ear fatigue"
      if (type === 'click') {
        sound.rate(0.9 + Math.random() * 0.2);
      }
      sound.play();
    } else {
      console.warn(`Sound "${type}" not found`);
    }
  };

  const stop = () => {
    Howler.stop();
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <SoundContext.Provider value={{ play, stop, isMuted, volume, toggleMute, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
