/* eslint-disable react/no-unknown-property */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Dynamically import Canvas to prevent SSR issues with React Context
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false });

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => mod.OrbitControls), {
  ssr: false,
});

type AvatarState = {
  id: string;
  position: [number, number, number];
  color: string;
};

const FALLBACK_AVATARS = [
  { id: 'alpha', color: '#5ad4ff' },
  { id: 'beta', color: '#ff7aa6' },
  { id: 'gamma', color: '#a1e87f' },
];

const makeOrbitPosition = (index: number): [number, number, number] => {
  const t = Date.now() / (1500 + index * 500);
  return [
    Math.cos(t) * (1.5 + index * 0.5),
    Math.sin(t * 0.8) * 0.8,
    Math.sin(t * 0.5) * (1.8 + index * 0.4),
  ];
};

export default function MetaversePage() {
  const [avatars, setAvatars] = useState<Record<string, AvatarState>>({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  useEffect(() => {
    // Skip socket.io in offline mode for local demo
    if (offlineMode || globalThis.window === undefined) {
      return;
    }

    const socket = io();

    const broadcastPosition = () => {
      if (!socket.connected || !socket.id) return;
      const position: [number, number, number] = [
        Math.cos(Date.now() / 600) * 2,
        Math.sin(Date.now() / 700) * 0.6,
        Math.sin(Date.now() / 500) * 2.2,
      ];
      const payload: AvatarState = { id: socket.id, position, color: '#f5d56e' };
      socket.emit('avatar:position', payload);
      setAvatars(prev => ({ ...prev, [payload.id]: payload }));
    };

    socket.on('connect', () => {
      if (!socket.id) return;
      setSocketConnected(true);
      setAvatars(prev => ({
        ...prev,
        [socket.id as string]: { id: socket.id as string, position: [0, 0, 0], color: '#f5d56e' },
      }));
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      const id = socket.id;
      setAvatars(prev => {
        const next = { ...prev };
        if (id) {
          delete next[id];
        }
        return next;
      });
    });

    socket.on('avatar:position', (payload: AvatarState) => {
      setAvatars(prev => ({ ...prev, [payload.id]: payload }));
    });

    socket.on('avatar:state', (list: AvatarState[]) => {
      const avatarMap = list.reduce((acc, avatar) => {
        acc[avatar.id] = avatar;
        return acc;
      }, {} as Record<string, AvatarState>);
      setAvatars(prev => ({ ...prev, ...avatarMap }));
    });

    const interval = setInterval(broadcastPosition, 1400);
    broadcastPosition();

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [offlineMode]);

  useEffect(() => {
    const updateFallback = () => {
      const fallbackMap = FALLBACK_AVATARS.reduce((acc, fallback, index) => {
        acc[fallback.id] = {
          id: fallback.id,
          color: fallback.color,
          position: makeOrbitPosition(index),
        };
        return acc;
      }, {} as Record<string, AvatarState>);
      setAvatars(prev => ({ ...prev, ...fallbackMap }));
    };

    const timer = setInterval(updateFallback, 100);
    updateFallback();
    return () => clearInterval(timer);
  }, []);

  const avatarArray = Object.values(avatars);

  return (
    <main className="min-h-screen bg-[var(--honey-dark)] text-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="space-y-3 rounded-3xl border border-amber-400/30 bg-black/50 p-6">
          <h1 className="text-3xl font-black text-amber-100">Metaverse preview</h1>
          <p className="text-sm text-amber-100/70">
            Real-time avatars float inside a shared canvas. Socket.IO keeps their positions synced,
            while @react-three/fiber handles the glowing nodes.
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-100/60">
              {(() => {
                if (offlineMode) return '🌐 Offline mode (local demo)';
                if (socketConnected) return '✅ Socket connected';
                return '⏳ Connecting...';
              })()}
            </p>
            <button
              onClick={() => {
                setOfflineMode(!offlineMode);
                if (offlineMode) {
                  globalThis.location.reload();
                }
              }}
              className="rounded-full bg-amber-500/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-100 hover:bg-amber-500/30 transition-all border border-amber-400/30"
            >
              {offlineMode ? 'Enable Live Sync' : 'Offline Mode'}
            </button>
          </div>
        </div>

        <div className="relative h-[520px] w-full rounded-3xl border border-amber-400/30 bg-black/80">
          <Canvas
            camera={{ position: [0, 3, 7], fov: 60 }}
            className="h-full w-full"
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
          >
            <color attach="background" args={['#03030a']} />
            <fog attach="fog" args={['#03030a', 4, 18]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#111" opacity={0.6} transparent />
            </mesh>

            {avatarArray.map(avatar => (
              <mesh key={avatar.id} position={avatar.position}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial
                  color={avatar.color}
                  emissive={avatar.color}
                  emissiveIntensity={0.6}
                />
              </mesh>
            ))}

            <OrbitControls enablePan enableZoom />
          </Canvas>
          <div className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.4em] text-amber-100/60">
            {avatarArray.length} avatars streaming
          </div>
        </div>
      </div>
    </main>
  );
}
