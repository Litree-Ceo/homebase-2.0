"use client";

import React, { useState, useEffect } from 'react';
import { useMAKT } from '../context/MAKTContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

const MAKTPlayer = () => {
  const { playerState, setPlayerState } = useMAKT();
  const [audio] = useState(new Audio());

  useEffect(() => {
    if (playerState.currentTrack) {
      audio.src = playerState.currentTrack;
      audio.volume = playerState.volume / 100;
      if (playerState.isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [playerState, audio]);

  const togglePlay = () => {
    setPlayerState({ ...playerState, isPlaying: !playerState.isPlaying });
  };

  return (
    <div className="makt-card relative h-96">
      <Canvas className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars />
        <OrbitControls />
        {/* Add more 3D elements here */}
      </Canvas>
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 glow-cyan">MAKT Player</h2>
        <button 
          onClick={togglePlay}
          className="makt-button"
        >
          {playerState.isPlaying ? 'Pause' : 'Play'}
        </button>
        {/* Add more controls */}
      </div>
    </div>
  );
};

export default MAKTPlayer;