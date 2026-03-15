'use client';
import { use } from 'react';
import { BuilderComponent, builder } from '@builder.io/react';
import '../../../components/BuilderRegistry'; // Import the registrations
import FlashNav from '../../../components/FlashNav';

// Replace with your actual Builder.io Public API Key
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || 'YOUR_BUILDER_API_KEY');

export default function BuilderPage({ params: paramsPromise }) {
  const params = use(paramsPromise);

  return (
    <div className="min-h-screen bg-black text-white">
      <FlashNav />

      <div className="pt-24 max-w-7xl mx-auto px-4">
        {/* 
          This component will render whatever is built in the 
          Builder.io visual editor at the current URL path.
        */}
        <BuilderComponent model="page" url={params.page ? `/${params.page.join('/')}` : '/'} />

        {/* Placeholder if no content exists yet */}
        <div className="mt-12 p-12 border-2 border-dashed border-white/10 rounded-3xl text-center">
          <p className="text-gray-500 font-black uppercase tracking-widest mb-4">
            Builder.io Preview Mode
          </p>
          <p className="text-sm text-gray-400">
            Open{' '}
            <a
              href="https://builder.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hc-bright-gold underline"
            >
              Builder.io
            </a>
            , point the preview URL to this page, and start dragging your Flash UI components.
          </p>
        </div>
      </div>
    </div>
  );
}
