'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Metaverse Space Component
 * @workspace 3D metaverse-like environment with interactive elements
 * Features: Floating platforms, ambient environment, text labels, interactive objects
 */

interface MetaverseSpaceProps {
  title?: string;
  allowInteraction?: boolean;
}

// Floating platform component
function FloatingPlatform({
  position,
  color,
  label,
}: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const floatOffset = useRef(Math.random() * Math.PI * 2);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + floatOffset.current) * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <Text position={[position[0], position[1] + 0.8, position[2]]} fontSize={0.3}>
        {label}
      </Text>
    </group>
  );
}

// Floating cube decoration
function FloatingCube({
  position,
  size = 0.3,
}: {
  position: [number, number, number];
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef({ x: Math.random(), y: Math.random() });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationRef.current.x * 0.01;
      meshRef.current.rotation.y += rotationRef.current.y * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={`hsl(${Math.random() * 360}, 100%, 50%)`}
        metalness={0.8}
        roughness={0.2}
        emissive={`hsl(${Math.random() * 360}, 100%, 30%)`}
      />
    </mesh>
  );
}

// Space environment
function MetaverseEnvironment() {
  return (
    <>
      {/* Main lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Additional point lights for ambiance */}
      <pointLight position={[-5, 5, 5]} intensity={0.4} color="#9f7aea" />
      <pointLight position={[5, 3, -5]} intensity={0.3} color="#0ea5e9" />

      {/* Preset environment */}
      <Environment preset="night" background={false} />
    </>
  );
}

// Main component
export function MetaverseSpace({
  title = 'HomeBase Universe',
  allowInteraction = true,
}: MetaverseSpaceProps) {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }} shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
        <MetaverseEnvironment />

        {/* Main ground platform */}
        <mesh position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Floating platforms */}
        <FloatingPlatform position={[-5, 2, -5]} color="#6366f1" label="Posts" />
        <FloatingPlatform position={[5, 2, -5]} color="#8b5cf6" label="Media" />
        <FloatingPlatform position={[0, 2, 5]} color="#0ea5e9" label="Creator Hub" />
        <FloatingPlatform position={[-5, 4, 5]} color="#06b6d4" label="Collaborations" />
        <FloatingPlatform position={[5, 4, 5]} color="#10b981" label="Marketplace" />

        {/* Floating decorative cubes */}
        <FloatingCube position={[0, 8, 0]} size={0.4} />
        <FloatingCube position={[-3, 6, -3]} size={0.3} />
        <FloatingCube position={[3, 6, -3]} size={0.3} />
        <FloatingCube position={[-3, 6, 3]} size={0.3} />
        <FloatingCube position={[3, 6, 3]} size={0.3} />
        <FloatingCube position={[0, 5, 8]} size={0.35} />

        {/* Central title */}
        <Text position={[0, 10, 0]} fontSize={1} color="#00ff88">
          {title}
        </Text>

        {/* Orbit controls for interaction */}
        {allowInteraction && (
          <OrbitControls enableZoom={true} enablePan={true} autoRotate={true} autoRotateSpeed={2} />
        )}
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        <div className="text-white">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-gray-400 mt-2">Explore, Create, Collaborate</p>
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 Drag to rotate • Scroll to zoom • Right-click to pan</p>
        </div>
      </div>
    </div>
  );
}

export default MetaverseSpace;
