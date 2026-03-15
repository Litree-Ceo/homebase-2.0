'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-hc-bright-gold/10 via-black to-black"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-hc-purple/10 rounded-full blur-[150px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full flash-glass z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter bg-linear-to-r from-hc-bright-gold to-hc-purple bg-clip-text text-transparent">
            LiTreeLab'Studio™
          </h1>
          <div className="flex gap-6 items-center">
            <Link
              href="/auth"
              className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition"
            >
              Login
            </Link>
            <Link href="/auth" className="flash-button-primary py-2.5! px-6! text-xs!">
              JOIN THE ELITE
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-hc-bright-gold/30 bg-hc-bright-gold/5 text-hc-bright-gold text-[10px] font-black uppercase tracking-[0.3em] animate-glow">
            The Future of Social Interaction
          </div>
          <h2 className="text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            UNLEASH THE
            <br />
            <span className="bg-linear-to-r from-hc-bright-gold via-hc-purple to-purple-500 bg-clip-text text-transparent">
              METAVERSE
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience the next evolution of digital connection. A unified ecosystem for social,
            commerce, and immersive 3D worlds.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/social"
              className="flash-button-primary py-5! px-12! text-lg! shadow-[0_0_40px_rgba(252,211,77,0.2)]"
            >
              ENTER PLATFORM
            </Link>
            <Link
              href="/flash"
              className="px-12 py-5 rounded-2xl border-2 border-hc-purple/50 text-white font-black text-lg hover:bg-hc-purple/10 hover:border-hc-purple transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            >
              FLASH CORTEX UI
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="SOCIAL"
            description="High-fidelity social feeds with encrypted communications and guild management."
            icon="🤝"
            color="primary"
          />
          <FeatureCard
            title="METAVERSE"
            description="Proprietary WebGL engine delivering immersive 3D environments and avatar customization."
            icon="🌐"
            color="secondary"
          />
          <FeatureCard
            title="MARKETPLACE"
            description="Ultra-fast NFT minting and asset trading within the LiTreeLab'Studio™ economy."
            icon="🎨"
            color="primary"
          />
          <FeatureCard
            title="MEDIA"
            description="Next-gen streaming hub for music, cinema, and interactive digital experiences."
            icon="🎬"
            color="secondary"
          />
          <FeatureCard
            title="FLASH CORTEX"
            description="Access GLM-4, Mistral, and Llama 3 via our unified AI aggregation hub. Free and Pro tiers available."
            icon="⚡"
            color="primary"
          />
          <FeatureCard
            title="ECONOMY"
            description="Unified LITBIT token system for rewards, payments, and ecosystem governance."
            icon="💰"
            color="secondary"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 py-32">
          <div className="flash-preview-bg p-16 text-center">
            <div className="flash-orb w-50 h-50 bg-hc-bright-gold/20 top-0 left-0"></div>
            <h3 className="text-5xl font-black mb-6 tracking-tighter relative z-10">
              READY FOR THE NEXT LEVEL?
            </h3>
            <p className="text-gray-400 mb-12 text-lg font-medium relative z-10">
              Join 50,000+ creators building the future on LiTreeLab'Studio™.
            </p>
            <Link href="/auth" className="flash-button-primary py-5! px-16! text-xl! relative z-10">
              CREATE FREE ACCOUNT
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">
            &copy; 2026 LiTreeLab'Studio™. ALL SYSTEMS OPERATIONAL.
          </p>
          <div className="flex gap-8">
            <FooterLink href="#">Terms</FooterLink>
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Status</FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon, color }) {
  const glow = color === 'primary' ? 'hover:border-hc-bright-gold/40' : 'hover:border-hc-purple/40';
  const text = color === 'primary' ? 'text-hc-bright-gold' : 'text-hc-purple';

  return (
    <div className={`flash-card group border-white/5 ${glow} transition-all duration-500`}>
      <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className={`text-xs font-black tracking-[0.3em] mb-4 ${text}`}>{title}</h3>
      <p className="text-gray-400 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition"
    >
      {children}
    </Link>
  );
}
