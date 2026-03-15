'use client';

import { useState } from 'react';
import { StudioSidebar, StudioHeader } from '@/components/layout/StudioLayout';
import { AgentWidget } from '@/components/layout/AgentWidget';
import { AuthGuard } from '@/components/AuthGuard';

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-lab-dark-900 text-white font-sans selection:bg-lab-purple-500/30">
        <StudioSidebar 
          isCollapsed={isCollapsed} 
          toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        />
        <StudioHeader isCollapsed={isCollapsed} />
        
        <main 
          className={`pt-16 min-h-screen transition-all duration-300 ${
            isCollapsed ? 'pl-20' : 'pl-70'
          }`}
        >
          <div className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        <AgentWidget />
      </div>
    </AuthGuard>
  );
}
