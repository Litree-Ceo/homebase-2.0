'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Create a completely isolated 3D canvas component with built-in elements
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full bg-lab-dark-800 rounded-lg flex items-center justify-center">
      <div className="text-lab-primary-400">Loading Metaverse...</div>
    </div>
  ),
});

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => mod.OrbitControls), {
  ssr: false,
});

const PerspectiveCamera = dynamic(
  () => import('@react-three/drei').then(mod => mod.PerspectiveCamera),
  { ssr: false },
);

const Float = dynamic(() => import('@react-three/drei').then(mod => mod.Float), { ssr: false });

// Simple 3D components built directly in this file
function SimplePlatform() {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[12, 12, 0.5, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#0f0f23"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  );
}

function SimpleAvatar() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <group position={[-5, 1, 2]}>
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1, 2, 0.5]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function SimpleBillboard({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group position={position}>
        {/* Billboard structure */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[4, 3, 0.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Support pole */}
        <mesh position={[0, -2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function SimpleTower() {
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={[0, 0, -8]}>
        {/* Main tower */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2, 6, 2]} />
          <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top crystal */}
        <mesh position={[0, 4, 0]} castShadow>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.1}
            emissive="#fbbf24"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

function SimplePortal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={0.6}>
      <group position={position}>
        {/* Portal ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.5, 0.2, 16, 32]} />
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Inner glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

export function IsolatedCanvas() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 w-full bg-lab-dark-800 rounded-lg flex items-center justify-center">
        <div className="text-lab-primary-400">Loading Metaverse...</div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full bg-lab-dark-900 rounded-lg overflow-hidden">
      <Suspense
        fallback={
          <div className="h-96 w-full bg-lab-dark-800 rounded-lg flex items-center justify-center">
            <div className="text-lab-primary-400">Loading 3D Scene...</div>
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [0, 5, 15], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 5, 15]} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 10, 0]} intensity={0.5} color="#7c3aed" />

          {/* Main platform */}
          <SimplePlatform />

          {/* Agent Zero Avatar */}
          <SimpleAvatar />

          {/* Social Billboards */}
          <SimpleBillboard position={[-8, 2, -5]} />
          <SimpleBillboard position={[8, 2, -5]} />

          {/* Trading Tower */}
          <SimpleTower />

          {/* Portal Gates */}
          <SimplePortal position={[6, 1, 3]} color="#7c3aed" />
          <SimplePortal position={[-6, 1, 3]} color="#22c55e" />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
