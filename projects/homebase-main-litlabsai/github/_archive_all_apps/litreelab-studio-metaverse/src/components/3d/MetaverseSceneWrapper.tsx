'use client';

import dynamic from 'next/dynamic';

// Create a wrapper that ensures proper React context isolation
const MetaverseSceneWrapper = dynamic(
  () => import('./MetaverseScene').then(mod => ({ default: mod.MetaverseScene })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full bg-lab-dark-800 rounded-lg flex items-center justify-center">
        <div className="text-lab-primary-400">Loading Metaverse...</div>
      </div>
    ),
  },
);

export default MetaverseSceneWrapper;
