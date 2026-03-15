'use client';

import { Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentZeroAvatarProps {
  position: [number, number, number];
  onClick?: () => void;
}

export function AgentZeroAvatar({ position, onClick }: AgentZeroAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame(state => {
    const time = state.clock.elapsedTime;

    // Core pulsation
    if (coreRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.1;
      coreRef.current.scale.setScalar(scale);
    }

    // Ring rotations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.4;
      ring2Ref.current.rotation.z = time * 0.2;
    }

    // Float animation
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.2;
    }
  });

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    onClick?.();
  };

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
        {/* Outer glow sphere */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.1} />
        </mesh>

        {/* Rotating ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
        </mesh>

        {/* Rotating ring 2 */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[0.9, 0.03, 16, 100]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.8} />
        </mesh>

        {/* Core icosahedron */}
        <mesh
          ref={coreRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={clicked ? 1.3 : 1}
        >
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial
            color={hovered ? '#22c55e' : '#7c3aed'}
            metalness={0.9}
            roughness={0.1}
            emissive={hovered ? '#22c55e' : '#7c3aed'}
            emissiveIntensity={0.8}
            wireframe={false}
          />
        </mesh>

        {/* Inner core */}
        <mesh scale={0.3}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Point light */}
        <pointLight color={hovered ? '#22c55e' : '#7c3aed'} intensity={2} distance={8} decay={2} />

        {/* Label */}
        <mesh position={[0, -2, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshBasicMaterial color={hovered ? '#22c55e' : '#7c3aed'} />
        </mesh>

        {/* Subtitle */}
        <mesh position={[0, -2.4, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.1]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      </Float>
    </group>
  );
}

// Portal Gate component for navigation
interface PortalGateProps {
  position: [number, number, number];
  color: string;
  onClick?: () => void;
}

export function PortalGate({ position, color, onClick }: PortalGateProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(state => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      const scale = hovered ? 1.1 : 1;
      ringRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Portal ring */}
      <mesh
        ref={ringRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Inner portal glow */}
      <mesh>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Ground marker */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
