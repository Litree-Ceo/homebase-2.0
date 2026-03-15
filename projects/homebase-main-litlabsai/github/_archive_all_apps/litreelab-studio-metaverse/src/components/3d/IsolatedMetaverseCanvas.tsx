'use client';

import { useState, useEffect } from 'react';

// We do NOT use next/dynamic here because we want to manually control 
// exactly when the module is requested to avoid module-graph evaluation 
// conflicts between React 19 (Next.js) and React 18 (Three.js).

export default function IsolatedMetaverseCanvas() {
  const [MetaverseComponent, setMetaverseComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This import happens ONLY in the browser, well after hydration.
    // It prevents the server from ever seeing the @react-three/fiber imports.
    let mounted = true;

    const loadMetaverse = async () => {
      try {
        // Artificial delay to ensure we are fully clear of hydration
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const mod = await import('./MetaverseCanvasContent');
        if (mounted) {
          setMetaverseComponent(() => mod.default);
        }
      } catch (err: any) {
        console.error("Failed to load Metaverse 3D Engine:", err);
        if (mounted) {
           setError(err.message || "Failed to load 3D Engine");
        }
      }
    };

    loadMetaverse();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
        <div className="w-full h-full bg-lab-dark-900 flex items-center justify-center p-4 border border-red-500/20 rounded-xl">
            <div className="text-center space-y-2">
                <div className="text-red-500 font-mono text-xl">SYSTEM ERROR</div>
                <div className="text-gray-400 text-sm max-w-xs mx-auto break-words">{error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-xs uppercase tracking-wider transition-colors"
                >
                    Reboot System
                </button>
            </div>
        </div>
    );
  }

  if (!MetaverseComponent) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center" role="region" aria-label="3D metaverse loading">
        <div className="flex flex-col items-center gap-2">
           <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
           <span className="text-xs text-gray-500 font-mono">INITIALIZING ENGINE</span>
           <p className="sr-only">3D metaverse environment is loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <MetaverseComponent />
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-purple-500/30">
          <p className="text-xs text-purple-300 font-bold">LIVE VIEW</p>
        </div>
      </div>
    </div>
  );
}
