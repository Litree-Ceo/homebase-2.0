'use client';

import dynamic from 'next/dynamic';

// Create a completely isolated 3D canvas component with built-in elements
const IsolatedMetaverseCanvas = dynamic(() => import('./IsolatedMetaverseCanvas'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full bg-lab-dark-800 rounded-lg flex items-center justify-center">
      <div className="text-lab-primary-400">Loading Metaverse...</div>
    </div>
  ),
});

export default function MetaverseSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-lab-primary-400 to-lab-accent-400 bg-clip-text text-transparent">
            3D Metaverse
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience our immersive 3D environment with social integrations, trading towers, and AI
            agents.
          </p>
        </div>

        <div className="h-96 w-full bg-lab-dark-900 rounded-lg overflow-hidden">
          <IsolatedMetaverseCanvas />
        </div>
      </div>
    </section>
  );
}
