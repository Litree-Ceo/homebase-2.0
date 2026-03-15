'use client';
import Sidebar from '../../components/social/Sidebar';
import Feed from '../../components/social/Feed';
import RightPanel from '../../components/social/RightPanel';
import BottomNav from '../../components/social/BottomNav';

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center font-sans">
      {/* Background Texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

      {/* Background Orbs (Subtle) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-hc-purple/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-hc-bright-gold/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex w-full max-w-325 relative z-10">
        <Sidebar />
        <main className="flex-1 flex md:ml-20 xl:ml-70 mb-16 md:mb-0">
          <Feed />
          <RightPanel />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
