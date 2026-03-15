'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Maximize2, Settings, Users } from 'lucide-react';
import { Suspense } from 'react';

function PlaceholderWorld() {
  return (
    <group>
      <Grid infiniteGrid fadeDistance={50} sectionColor="#8b5cf6" cellColor="#4b5563" />
      
      {/* Central Hub */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Floating Platforms */}
      <mesh position={[4, 2, 4]}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      
      <mesh position={[-4, 3, -3]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}

export default function WorldPage() {
  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-white/10 bg-black">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="glass px-4 py-2 rounded-lg">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lab-green-500 animate-pulse" />
            Metaverse Viewer
          </h1>
          <p className="text-white/50 text-xs">Instance: Alpha-1</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button className="p-3 glass rounded-lg hover:bg-white/10 text-white transition-all">
          <Maximize2 className="w-5 h-5" />
        </button>
        <button className="p-3 glass rounded-lg hover:bg-white/10 text-white transition-all">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-3 glass rounded-lg hover:bg-white/10 text-white transition-all">
          <Users className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="glass p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
               <span className="text-white font-bold">L</span>
             </div>
             <div>
               <p className="text-white font-medium">LiTree Plaza</p>
               <p className="text-white/50 text-xs">Coordinates: 0, 0, 0</p>
             </div>
          </div>
          <button className="btn-primary px-6 py-2 text-sm">
            Enter World
          </button>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <PlaceholderWorld />
            
            <OrbitControls 
              autoRotate 
              autoRotateSpeed={0.5} 
              maxPolarAngle={Math.PI / 2} 
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
