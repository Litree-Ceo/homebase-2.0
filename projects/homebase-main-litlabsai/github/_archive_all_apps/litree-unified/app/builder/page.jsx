'use client';
import FlashNav from '../../components/FlashNav';
import { useState } from 'react';
import { Copy, Check, Layout, Type, Box, MousePointer2 } from 'lucide-react';

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-hc-purple/5 via-black to-black pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-hc-purple via-hc-bright-gold to-hc-purple opacity-50"></div>

      <FlashNav activePage="builder" />

      <div className="pt-32 max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                FLASH
              </span>
              <span className="text-hc-bright-gold">UI</span>
              <span className="text-hc-purple ml-2 text-2xl align-top">KIT</span>
            </h1>
            <p className="text-gray-400 font-medium max-w-xl">
              The official design system for LiTreeLab'Studio™. Glassmorphism, neon accents, and
              high-fidelity interactions.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            <TabButton
              active={activeTab === 'components'}
              onClick={() => setActiveTab('components')}
              icon={<Box size={14} />}
            >
              Components
            </TabButton>
            <TabButton
              active={activeTab === 'typography'}
              onClick={() => setActiveTab('typography')}
              icon={<Type size={14} />}
            >
              Typography
            </TabButton>
            <TabButton
              active={activeTab === 'layout'}
              onClick={() => setActiveTab('layout')}
              icon={<Layout size={14} />}
            >
              Layouts
            </TabButton>
          </div>
        </header>

        {activeTab === 'components' && (
          <div className="grid gap-12">
            {/* Buttons Section */}
            <Section
              title="Interactive Elements"
              description="Primary and secondary actions with hover states."
            >
              <div className="flex flex-wrap gap-6 items-center p-8 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <button className="flash-button-primary">PRIMARY ACTION</button>
                <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:border-hc-purple/50 transition-all duration-300">
                  Glass Secondary
                </button>
                <button className="px-6 py-2 rounded-full border border-hc-bright-gold/30 text-hc-bright-gold text-[10px] font-black uppercase tracking-widest hover:bg-hc-bright-gold/10 transition-colors">
                  Outline Gold
                </button>
                <button className="w-12 h-12 rounded-full bg-hc-purple flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-110 transition-transform">
                  <MousePointer2 size={20} />
                </button>
              </div>
            </Section>

            {/* Cards Section */}
            <Section
              title="Cards & Containers"
              description="Glassmorphic containers for content display."
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flash-card group">
                  <div className="h-32 bg-gradient-to-br from-hc-purple/20 to-black rounded-lg mb-4 border border-white/5"></div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-hc-bright-gold transition-colors">
                    Standard Card
                  </h3>
                  <p className="text-sm text-gray-400">
                    Default flash-card class with hover effects and border glow.
                  </p>
                </div>

                <div className="flash-card !bg-hc-purple/10 !border-hc-purple/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-hc-purple flex items-center justify-center font-bold">
                      A
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-hc-purple">
                      Active State
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Tinted card variant for active or highlighted states.
                  </p>
                </div>

                <div className="relative p-6 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-hc-bright-gold/20 to-hc-purple/20 backdrop-blur-xl border border-white/10"></div>
                  <div className="relative z-10 text-center">
                    <h3 className="font-black text-2xl mb-2">Glass Overlay</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                      Premium Effect
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Inputs */}
            <Section title="Form Inputs" description="Data entry fields with focus states.">
              <div className="grid md:grid-cols-2 gap-8 p-8 bg-black/40 rounded-3xl border border-white/5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Email Address
                    </label>
                    <input
                      type="text"
                      placeholder="user@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-hc-purple focus:ring-1 focus:ring-hc-purple transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full bg-black border border-white/20 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-hc-bright-gold transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        ⌘K
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-hc-purple/10 border border-hc-purple/30">
                    <input
                      type="checkbox"
                      checked
                      className="accent-hc-purple w-5 h-5 rounded"
                      readOnly
                    />
                    <label className="text-sm font-medium">Enable 3D Rendering</label>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input type="checkbox" className="accent-hc-bright-gold w-5 h-5 rounded" />
                    <label className="text-sm font-medium text-gray-400">Allow Notifications</label>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-8xl font-black tracking-tighter">Display Heading</h1>
              <h2 className="text-6xl font-black tracking-tight">Section Title</h2>
              <h3 className="text-4xl font-bold">Component Header</h3>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Body Large - Used for lead paragraphs. The quick brown fox jumps over the lazy dog.
                LiTreeLab'Studio™ typography is designed for maximum readability and impact.
              </p>
              <p className="text-base text-gray-500 max-w-2xl">
                Body Standard - Used for general content. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex gap-4">
                <span className="text-xs font-black uppercase tracking-widest text-hc-purple">
                  Caption Purple
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-hc-bright-gold">
                  Caption Gold
                </span>
              </div>
            </div>

            <Section title="Text Gradients" description="Signature gradients for emphasis.">
              <div className="space-y-4">
                <h3 className="text-5xl font-black bg-gradient-to-r from-hc-bright-gold via-white to-white bg-clip-text text-transparent">
                  Gold to White
                </h3>
                <h3 className="text-5xl font-black bg-gradient-to-r from-hc-purple to-blue-500 bg-clip-text text-transparent">
                  Purple to Blue
                </h3>
                <h3 className="text-5xl font-black bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent">
                  Vertical Fade
                </h3>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-video bg-black rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 border border-white/10"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600">
                  Empty State
                </p>
              </div>
            </div>
            <div className="aspect-video bg-hc-purple/5 rounded-3xl border border-hc-purple/20 relative overflow-hidden flex">
              <div className="w-1/3 border-r border-white/5 bg-black/20"></div>
              <div className="flex-1"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 border-b border-white/5 pb-2">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-500 mb-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all
        ${
          active
            ? 'bg-hc-purple text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
            : 'text-gray-500 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}
