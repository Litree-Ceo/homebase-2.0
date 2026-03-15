'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SocialPost } from '@/lib/social-service';
import { formatDistanceToNow } from 'date-fns';

interface SocialBillboardProps {
  post: SocialPost;
  position: [number, number, number];
  onClick?: () => void;
}

export function SocialBillboard({ post, position, onClick }: SocialBillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const platformColor = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    internal: '#7c3aed',
  }[post.platform];

  return (
    <group position={position}>
      {/* Main Board Background */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[3.2, 2.2, 0.1]} />
        <meshPhysicalMaterial
          color={hovered ? '#1a1a2e' : '#0f172a'}
          metalness={0.9}
          roughness={0.1}
          transmission={0.5}
          thickness={0.5}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Content Container (Slightly extruded) */}
      <group position={[0, 0, 0.06]}>
        {/* Header Bar */}
        <mesh position={[0, 0.9, 0]}>
          <planeGeometry args={[3, 0.3]} />
          <meshBasicMaterial color={platformColor} opacity={0.8} transparent />
        </mesh>
        
        <Text
          position={[-1.4, 0.9, 0.01]}
          fontSize={0.15}
          color="white"
          anchorX="left"
          anchorY="middle"
        >
          {post.platform.toUpperCase()}
        </Text>

        <Text
          position={[1.4, 0.9, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="right"
          anchorY="middle"
        >
          {formatDistanceToNow(post.timestamp, { addSuffix: true })}
        </Text>

        {/* User Info */}
        <Text
          position={[-1.4, 0.5, 0]}
          fontSize={0.18}
          color="white"
          anchorX="left"
          anchorY="middle"
          fontWeight="bold"
        >
          {post.author.name}
        </Text>
        
        <Text
          position={[-1.4, 0.3, 0]}
          fontSize={0.12}
          color="#888888"
          anchorX="left"
          anchorY="middle"
        >
          {post.author.username}
        </Text>

        {/* Main Content Body */}
        <Text
          position={[-1.4, 0, 0]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="left"
          anchorY="middle"
          maxWidth={2.8}
          lineHeight={1.4}
        >
          {post.content}
        </Text>

        {/* Stats Footer */}
        <group position={[0, -0.7, 0]}>
             <Text position={[-1, 0, 0]} fontSize={0.12} color="#22c55e">
               ♥ {post.likes}
             </Text>
             <Text position={[0, 0, 0]} fontSize={0.12} color="#3b82f6">
               💬 {post.comments}
             </Text>
             <Text position={[1, 0, 0]} fontSize={0.12} color="#7c3aed">
               ↗ {post.shares}
             </Text>
        </group>
      </group>

      {/* Neon Border Glow */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.3, 2.3, 0.05]} />
        <meshBasicMaterial color={platformColor} transparent opacity={hovered ? 0.4 : 0.1} />
      </mesh>
      
      {/* HTML Overlay for interactions if needed (optional) */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center transform>
          <div className="px-2 py-1 bg-black/80 text-white text-xs rounded border border-white/20 backdrop-blur-sm whitespace-nowrap">
            Click to Interact
          </div>
        </Html>
      )}
    </group>
  );
}
