'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { SocialBillboard } from '../SocialBillboard';
import { TradingTower } from '../trading/ProfitPilotCrystal';
import { AgentZeroAvatar } from './AgentZeroAvatar';

const MOCK_TRADES = [
  { symbol: 'BTC', profit: 1200 },
  { symbol: 'ETH', profit: -300 },
  { symbol: 'SOL', profit: 450 },
];

const MOCK_POST = {
  id: '1',
  author: {
    uid: 'mock-user-1',
    name: 'Metaverse User',
    username: '@metauser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meta',
  },
  content: 'Welcome to the metaverse!',
  timestamp: new Date(),
  likes: 42,
  comments: 5,
  shares: 2,
  platform: 'internal' as const,
};

function MetaverseContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#3b82f6" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* 3D Objects */}
      <group position={[0, 0, 0]}>
        <SocialBillboard position={[-3, 1, 0]} post={MOCK_POST} />
        <TradingTower position={[0, 1, 0]} trades={MOCK_TRADES} />
        <AgentZeroAvatar position={[3, 1, 0]} />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
        
        {/* Grid helper for that "tron" look */}
        <gridHelper args={[20, 20, 0x4f46e5, 0x1e293b]} position={[0, -0.99, 0]} />
      </group>
    </>
  );
}

export default function MetaverseCanvasContent() {
  return (
    <div className="w-full h-full bg-black">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-purple-500 font-mono">LOADING SIMULATION...</div>}>
        <Canvas>
          <MetaverseContent />
        </Canvas>
      </Suspense>
    </div>
  );
}
