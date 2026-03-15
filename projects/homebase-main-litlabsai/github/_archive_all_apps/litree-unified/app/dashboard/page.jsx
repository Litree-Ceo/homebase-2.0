'use client';
import Sidebar from '../../components/social/Sidebar';
import RightPanel from '../../components/social/RightPanel';
import ProfileHeader from '../../components/social/ProfileHeader';
import PostCard from '../../components/social/PostCard';
import BottomNav from '../../components/social/BottomNav';

const USER_POSTS = [
  {
    id: 1,
    name: 'LiTree User',
    handle: 'litree_user',
    time: '1h',
    content: "Just deployed the new Flash UI builder. It's a game changer for rapid prototyping.",
    likes: '42',
    comments: '5',
    reposts: '2',
    isFlashGenerated: false,
    avatar: null, // Will use default in component
  },
  {
    id: 2,
    name: 'LiTree User',
    handle: 'litree_user',
    time: '5h',
    content: 'Exploring the capabilities of NVIDIA NIM. The latency on Llama 3 is incredible.',
    likes: '128',
    comments: '12',
    reposts: '15',
    isFlashGenerated: false,
    avatar: null,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center font-sans">
      {/* Background Texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

      {/* Background Orbs (Subtle) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-hc-purple/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-hc-bright-gold/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex w-full max-w-325 relative z-10">
        <Sidebar />
        <main className="flex-1 flex md:ml-20 xl:ml-68.75 mb-16 md:mb-0">
          <div className="flex-1 min-h-screen border-r border-white/10 max-w-150 w-full mx-auto pb-20">
            <ProfileHeader />
            {USER_POSTS.map(post => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
          <RightPanel />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
