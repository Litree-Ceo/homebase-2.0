'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Avatar Component
 * @workspace Metaverse-like 3D avatars using Three.js
 * Features: Rotating avatar, ambient + directional lighting, orbit controls
 */

interface Avatar3DProps {
  avatarUrl?: string;
  userName?: string;
  scale?: number;
  autoRotate?: boolean;
}

// Simple avatar geometry
function AvatarMesh({ avatarUrl, autoRotate = true }: { avatarUrl?: string; autoRotate: boolean }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0.3, 0]}>
        <meshStandardMaterial
          color={avatarUrl ? '#6366f1' : '#8b5cf6'}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>

      {/* Body */}
      <Box args={[0.35, 0.8, 0.25]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </Box>

      {/* Left Arm */}
      <Box args={[0.15, 0.7, 0.15]} position={[-0.3, 0, 0]}>
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </Box>

      {/* Right Arm */}
      <Box args={[0.15, 0.7, 0.15]} position={[0.3, 0, 0]}>
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </Box>

      {/* Left Leg */}
      <Box args={[0.15, 0.6, 0.15]} position={[-0.15, -0.75, 0]}>
        <meshStandardMaterial color="#1e40af" metalness={0.2} roughness={0.5} />
      </Box>

      {/* Right Leg */}
      <Box args={[0.15, 0.6, 0.15]} position={[0.15, -0.75, 0]}>
        <meshStandardMaterial color="#1e40af" metalness={0.2} roughness={0.5} />
      </Box>
    </group>
  );
}

// Lighting setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 3, 5]} intensity={0.5} color="#9f7aea" />
    </>
  );
}

// Main canvas wrapper
export function Avatar3D({
  avatarUrl,
  userName = 'User',
  scale = 1,
  autoRotate = true,
}: Avatar3DProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0.5, 2.5], fov: 50 }} shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0.5, 2.5]} fov={50} />
        <Lighting />
        <AvatarMesh avatarUrl={avatarUrl} autoRotate={autoRotate} />
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={4}
          enableZoom={true}
          enablePan={true}
        />
        <gridHelper args={[10, 10]} position={[0, -1, 0]} />
      </Canvas>
    </div>
  );
}

export default Avatar3D;
