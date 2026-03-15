'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Points } from 'three';

export function MetaverseWorld() {
  const starsRef = useRef<Points>(null);

  useFrame(state => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.001;
    }
  });

  // Create star field
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }

  return (
    <>
      {/* Sky gradient */}
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0a0a0f" side={THREE.BackSide} />
      </mesh>

      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Ambient particles */}
      <mesh position={[0, -10, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.05} />
      </mesh>

      {/* Fog effect */}
      <fog attach="fog" args={[0x0a0a0f, 30, 100]} />
    </>
  );
}
