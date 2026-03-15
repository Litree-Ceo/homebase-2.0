'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Trade {
  symbol: string;
  profit: number;
}

interface TradingTowerProps {
  trades: Trade[];
  position: [number, number, number];
}

export function TradingTower({ trades, position }: TradingTowerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const isProfitable = totalProfit > 0;

  return (
    <group position={position}>
      {/* Main tower */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        aria-label="Trading tower base"
      >
        <cylinderGeometry args={[1.5, 2, 4, 8]} />
        <meshStandardMaterial
          color={isProfitable ? '#22c55e' : '#ef4444'}
          metalness={0.9}
          roughness={0.1}
          emissive={isProfitable ? '#22c55e' : '#ef4444'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Crystal top */}
      <mesh position={[0, 2.5, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={isProfitable ? '#22c55e' : '#ef4444'}
          metalness={1}
          roughness={0}
          emissive={isProfitable ? '#22c55e' : '#ef4444'}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Trading symbols display */}
      {trades.map((trade, index) => {
        const angle = (index / trades.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.2;
        const z = Math.sin(angle) * 2.2;
        const isTradeProfitable = trade.profit > 0;

        return (
          <group key={trade.symbol} position={[x, 0, z]}>
            {/* Symbol display */}
            <mesh>
              <boxGeometry args={[0.8, 0.4, 0.1]} />
              <meshStandardMaterial
                color={isTradeProfitable ? '#22c55e' : '#ef4444'}
                metalness={0.8}
                roughness={0.2}
                emissive={isTradeProfitable ? '#22c55e' : '#ef4444'}
                emissiveIntensity={0.3}
              />
            </mesh>

            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[0.6, 0.2, 0.05]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>

            {/* Profit indicator */}
            <mesh position={[0, -0.3, 0.06]}>
              <boxGeometry args={[0.6, 0.2, 0.05]} />
              <meshBasicMaterial
                color={isTradeProfitable ? '#22c55e' : '#ef4444'}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Central profit display */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.2, 0.1]} />
        <meshBasicMaterial color="#cccccc" transparent opacity={0.7} />
      </mesh>

      {/* ProfitPilot label */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1.8, 0.3, 0.1]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.9} />
      </mesh>

      {/* Animated rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <ringGeometry args={[3, 3.2, 32]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
