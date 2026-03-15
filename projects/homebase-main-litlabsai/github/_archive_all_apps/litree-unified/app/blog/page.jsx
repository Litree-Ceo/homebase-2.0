'use client';
import FlashNav from '../../components/FlashNav';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-noise opacity-5 pointer-events-none"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-hc-purple/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-hc-bright-gold/5 rounded-full blur-[150px] pointer-events-none"></div>

      <FlashNav activePage="blog" />

      <div className="pt-28 max-w-7xl mx-auto px-4 pb-12 relative z-10">
        <header className="mb-16 text-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
            TRANSMISSIONS
          </h1>
          <p className="text-hc-bright-gold font-black uppercase tracking-[0.4em] text-xs">
            Official Dev Logs & Resources
          </p>
        </header>

        {/* Featured Article */}
        <div className="mb-16">
          <Link href="/blog/openshift-ai-setup" className="block group">
            <div className="flash-card !p-0 overflow-hidden border-hc-purple/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-hc-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-auto bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-hc-purple to-black opacity-50 mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-9xl opacity-20 filter blur-sm">AI</span>
                  </div>
                  {/* Decorative Tech Lines */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-hc-bright-gold to-transparent"></div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded bg-hc-bright-gold/10 border border-hc-bright-gold/20 text-hc-bright-gold text-[10px] font-black uppercase tracking-widest">
                      Engineering
                    </span>
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={10} /> May 1, 2024
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight group-hover:text-hc-bright-gold transition-colors">
                    Red Hat OpenShift AI Installation and Setup
                  </h2>

                  <p className="text-gray-400 font-medium mb-8 leading-relaxed line-clamp-3">
                    A comprehensive guide to preparing and running computer vision models at the
                    edge. Learn how to set up LVMS, NFD, and GPU operators for high-performance AI
                    workloads.
                  </p>

                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-hc-bright-gold transition-colors">
                    Read Transmission <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Articles Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <ArticleCard
            category="Metaverse"
            date="Apr 28, 2024"
            title="Building the Neural Renderer"
            excerpt="Deep dive into our custom WebGL engine and how we achieve 60fps in the browser."
          />
          <ArticleCard
            category="Design"
            date="Apr 25, 2024"
            title="The Flash UI Design System"
            excerpt="Why we chose glassmorphism and gold accents for the next generation of social tools."
          />
          <ArticleCard
            category="Web3"
            date="Apr 20, 2024"
            title="Smart Contracts on LiTree Chain"
            excerpt="Secure, scalable, and low-gas transactions for the creator economy."
          />
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ category, date, title, excerpt }) {
  return (
    <div className="flash-card group cursor-pointer border-white/5 hover:border-white/20">
      <div className="h-48 rounded-xl bg-white/5 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent opacity-60"></div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-hc-purple text-[10px] font-black uppercase tracking-widest">
          {category}
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
          {date}
        </span>
      </div>

      <h3 className="text-xl font-black mb-3 tracking-tight group-hover:text-hc-purple transition-colors">
        {title}
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed mb-6">{excerpt}</p>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
        Read Article
      </div>
    </div>
  );
}
