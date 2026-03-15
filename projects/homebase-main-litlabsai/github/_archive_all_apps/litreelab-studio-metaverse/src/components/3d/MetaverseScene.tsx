'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { MetaverseWorld } from './MetaverseWorld';
import { SocialBillboard } from '../SocialBillboard';
import { TradingTower } from '../trading/ProfitPilotCrystal';
import { AgentZeroAvatar, PortalGate } from './AgentZeroAvatar';
import { useSocialFeed } from '@/lib/social-service';
import { useRouter } from 'next/navigation';

// Floating Platform
function Platform() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[12, 12, 0.5, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#7c3aed"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Glowing ring */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.8, 12.2, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
      </mesh>

      {/* Inner ring */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 6.3, 64]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

// Floating Crystals - Decorative elements
function DecorativeCrystal({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Particle Field
function Particles() {
  const count = 300;
  const mesh = useRef<THREE.Points>(null);
  const [data, setData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = Math.random() > 0.5 ? new THREE.Color('#7c3aed') : new THREE.Color('#22c55e');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    setData({ positions, colors });
  }, []);

  useFrame(state => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  if (!data) return null;

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Main Scene Content
function SceneContent() {
  const router = useRouter();
  const { posts, loading } = useSocialFeed();
  const [trades, setTrades] = useState([
    { symbol: 'BTCUSDT', profit: 45.2 },
    { symbol: 'ETHUSDT', profit: -12.5 },
    { symbol: 'SOLUSDT', profit: 89.15 },
  ]);

  // Simulate live trade updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrades(prev =>
        prev.map(trade => ({
          ...trade,
          profit: trade.profit + (Math.random() - 0.4) * 5,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Arrange social posts in a circle
  const getPostPosition = (index: number, total: number): [number, number, number] => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 9;
    return [Math.sin(angle) * radius, 1.5, Math.cos(angle) * radius];
  };

  return (
    <>
      {/* Environment */}
      <MetaverseWorld />

      {/* Platform */}
      <Platform />

      {/* Decorative crystals */}
      <DecorativeCrystal position={[-5, 3, -5]} color="#7c3aed" />
      <DecorativeCrystal position={[5, 4, -3]} color="#22c55e" />
      <DecorativeCrystal position={[0, 5, -8]} color="#3b82f6" />
      <DecorativeCrystal position={[-6, 2, 4]} color="#ef4444" />
      <DecorativeCrystal position={[6, 3, 5]} color="#f59e0b" />

      {/* Social Billboards - arranged in a circle */}
      {!loading &&
        posts.map((post, i) => (
          <SocialBillboard
            key={post.id}
            post={post}
            position={getPostPosition(i, posts.length)}
            onClick={() => console.log('Clicked post:', post.id)}
          />
        ))}

      {/* Trading Tower - Central hub */}
      <TradingTower trades={trades} position={[0, 0, 0]} />

      {/* Agent Zero Avatar */}
      <AgentZeroAvatar position={[0, 3, -8]} onClick={() => router.push('/chat')} />

      {/* Portal Gates */}
      <PortalGate
        position={[-10, 0, 0]}
        color="#7c3aed"
        onClick={() => router.push('/dashboard')}
      />
      <PortalGate position={[10, 0, 0]} color="#22c55e" onClick={() => router.push('/chat')} />
      <PortalGate position={[0, 0, 10]} color="#3b82f6" onClick={() => router.push('/rooms')} />

      {/* Particles */}
      <Particles />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={1.5} castShadow />
    </>
  );
}

export function MetaverseScene() {
  return (
    <div className="h-full w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-black via-lab-dark-900/30 to-black" />
      <Canvas
        shadows
        camera={{ position: [0, 8, 20], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 8, 20]} fov={50} />
        <SceneContent />
        <OrbitControls
          enableZoom={true}
          minDistance={10}
          maxDistance={40}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">LiTreeLab Metaverse</h3>
          <p className="text-white/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lab-green-400 animate-pulse" />
            Live • 892 Users Online
          </p>
        </div>
        <div className="pointer-events-auto flex gap-3">
          <button className="glass-strong px-6 py-3 rounded-full text-white font-semibold hover:bg-white/20 transition-all">
            Enter Studio
          </button>
          <button className="glass-strong px-6 py-3 rounded-full text-white font-semibold bg-lab-green-500/20 hover:bg-lab-green-500/30 transition-all border border-lab-green-500/50">
            Talk to Agent Zero
          </button>
        </div>
      </div>

      {/* Quick stats overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span className="w-2 h-2 rounded-full bg-lab-green-400" />
            ProfitPilot Active
          </div>
          <div className="text-2xl font-bold text-lab-green-400">+$130.27</div>
          <div className="text-xs text-white/40">Today&apos;s Profit</div>
        </div>
      </div>
    </div>
  );
}
