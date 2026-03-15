import { useState, useEffect } from 'react';
import MatrixRain from './MatrixRain';
import ParticleBackground from './ParticleBackground';
import { useKonami, useSecretCode } from '../hooks/useKonami.js';

const EasterEggs = () => {
  const [mode, setMode] = useState('normal'); // normal, matrix, hacker, god
  const [hackerText, setHackerText] = useState('');

  // Konami code: activates god mode
  useKonami(() => {
    setMode('god');
    const audio = new Audio();
    audio.volume = 0.3;
    // Play success sound using Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  });

  // Secret codes
  useSecretCode('matrix', () => setMode(prev => prev === 'matrix' ? 'normal' : 'matrix'));
  useSecretCode('hacker', () => setMode(prev => prev === 'hacker' ? 'normal' : 'hacker'));
  useSecretCode('particles', () => setMode(prev => prev === 'particles' ? 'normal' : 'particles'));

  // Hacker mode effect
  useEffect(() => {
    if (mode === 'hacker') {
      const chars = '01アイウエオカキクケコサシスセソタチツテト';
      const interval = setInterval(() => {
        setHackerText(chars[Math.floor(Math.random() * chars.length)]);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <>
      {/* Background Effects */}
      {mode === 'normal' && <ParticleBackground />}
      {mode === 'matrix' && <MatrixRain />}
      {mode === 'particles' && <ParticleBackground />}
      {mode === 'god' && (
        <>
          <MatrixRain />
          <ParticleBackground />
        </>
      )}
      
      {/* Hacker Mode Overlay */}
      {mode === 'hacker' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 255, 0, 0.05)',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: '20vw',
          color: 'rgba(0, 255, 0, 0.1)',
          fontWeight: 'bold',
        }}>
          {hackerText}
        </div>
      )}
      
      {/* Mode Indicator */}
      {mode !== 'normal' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          background: mode === 'god' 
            ? 'linear-gradient(135deg, #FFD700, #FF6B35)' 
            : 'var(--accent-primary)',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          zIndex: 10000,
          animation: 'pulse 2s infinite',
          boxShadow: mode === 'god' ? '0 0 30px rgba(255, 215, 0, 0.5)' : undefined,
        }}>
          {mode === 'god' ? '⭐ GOD MODE ⭐' : `${mode} mode`}
        </div>
      )}
    </>
  );
};

export default EasterEggs;
