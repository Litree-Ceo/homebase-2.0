'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Box, Zap, Globe, LayoutDashboard, Play, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import IsolatedMetaverseCanvas from '@/components/3d/IsolatedMetaverseCanvas';
import { SocialFeed } from '@/components/SocialFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';

export default function Home() {
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playHover] = useSound('/sounds/notification.mp3', { volume: 0.1 });

  const handleEnterStudio = () => {
    playClick();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#3b82f6', '#ec4899'] // Lab colors
    });
  };

  return (
    <div className="min-h-screen bg-lab-dark-900 text-white font-sans selection:bg-lab-purple-500/30 overflow-x-hidden">
        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background Gradients & Grid */}
            <div className="absolute inset-0 bg-lab-dark-900">
              <div className="absolute inset-0 bg-grid-pattern opacity-20 mask-[radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
              <div className="absolute top-0 left-1/4 w-125 h-125 bg-lab-purple-500/20 rounded-full blur-[128px] animate-pulse-slow" />
              <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-lab-blue-500/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-lab-dark-900/50 to-lab-dark-900 pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lab-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-lab-green-400 uppercase tracking-wider">System Online v2.0</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight">
                  LiTreeLabStudio™ <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-lab-purple-400 via-lab-pink-400 to-lab-blue-400 text-glow animate-gradient-x">
                    The Social Metaverse.
                  </span>
                </h1>
                
                <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                  The universal operating system connecting everyone through music, games, and digital assets. 
                  Unite your entire creative universe in one immersive reality and automate your growth with ProfitPilot™.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard" onClick={handleEnterStudio}>
                    <Button 
                      size="lg" 
                      className="bg-lab-purple-600 hover:bg-lab-purple-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg shadow-lab-purple-900/20 group relative overflow-hidden"
                      onMouseEnter={() => playHover()}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center">
                        Enter Studio <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/world">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/10 hover:bg-white/5 text-white rounded-xl px-8 py-6 text-lg hover:border-lab-blue-400/50 transition-colors"
                      onMouseEnter={() => playHover()}
                      onClick={() => playClick()}
                    >
                      Explore World <Globe className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-8 py-6 text-lg"
                      onMouseEnter={() => playHover()}
                      onClick={() => playClick()}
                    >
                      Talk to AI <Sparkles className="ml-2 w-5 h-5 text-lab-purple-400" />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-lab-dark-900 bg-gray-800 flex items-center justify-center text-xs text-white">
                        {String.fromCharCode(64+i)}
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 8,000+ creators</p>
                </div>
              </motion.div>

              {/* 3D Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative h-[600px] w-full hidden lg:block perspective-1000"
              >
                <div className="absolute inset-0 bg-linear-to-tr from-lab-purple-500/10 to-lab-blue-500/10 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out">
                   <IsolatedMetaverseCanvas />
                   
                   {/* Overlay UI elements to make it look like a HUD */}
                   <div className="absolute top-4 left-4 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   </div>
                   <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-xs font-mono text-green-400 border border-green-500/30">
                      LIVE FEED
                   </div>
                   <div className="absolute bottom-4 right-4 text-xs font-mono text-white/50">
                      RENDER_ENGINE: R3F // LATENCY: 12ms
                   </div>
                   
                   {/* Floating Cards */}
                   <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 left-10 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl max-w-xs"
                   >
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-lab-purple-500/20 flex items-center justify-center text-lab-purple-400">
                         <Zap className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-white">ProfitPilot Active</p>
                         <p className="text-xs text-gray-400">+12.4% Yield Generated</p>
                       </div>
                     </div>
                     <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[70%] bg-lab-purple-500" />
                     </div>
                   </motion.div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Video Showcase Section */}
          <section className="py-24 relative z-10 bg-black/40 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <VideoPlayer 
                    url="https://www.youtube.com/watch?v=LXb3EKWsInQ" // Placeholder demo
                    className="w-full shadow-2xl shadow-lab-purple-900/20 border border-white/10"
                  />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lab-blue-500/10 border border-lab-blue-500/20">
                    <Sparkles className="w-3 h-3 text-lab-blue-400" />
                    <span className="text-xs font-medium text-lab-blue-400 uppercase tracking-wider">New Features</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold">
                    Experience the <span className="text-lab-purple-400">Future</span> of Creation
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Watch how LiTreeLab Studio unifies your workflow. From generating AI assets to deploying them into your personal metaverse instance, everything happens in one place.
                  </p>
                  <ul className="space-y-4">
                    {[
                      'Universal Music & Gaming Integration',
                      'Centralized Digital Asset Management',
                      'Immersive Social Metaverse',
                      'Automated Growth with ProfitPilot™'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-lab-purple-500/20 flex items-center justify-center text-lab-purple-400 shrink-0">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Everything You Need</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">A complete suite of tools designed to help you build, grow, and monetize your digital presence.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={LayoutDashboard}
                  title="Studio Core"
                  desc="Central command for your digital assets. Upload, manage, and deploy content across platforms."
                  color="purple"
                  href="/dashboard"
                />
                <FeatureCard 
                  icon={Box}
                  title="Metaverse Hub"
                  desc="Your persistent 3D space. Host events, showcase NFTs, and connect with your community."
                  color="blue"
                  href="/world"
                />
                <FeatureCard 
                  icon={Zap}
                  title="ProfitPilot"
                  desc="AI-driven trading automation running in the background. Watch your portfolio grow while you create."
                  color="green"
                  href="/finance"
                />
              </div>
            </div>
          </section>

          {/* Community / Social Feed Section */}
          <section className="py-24 bg-black/20 border-t border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-b from-lab-purple-900/5 to-transparent pointer-events-none" />
             <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-display font-bold mb-4 flex items-center justify-center gap-3">
                     <Users className="w-8 h-8 text-lab-pink-400" />
                     Community Pulse
                   </h2>
                   <p className="text-gray-400">See what other creators are building in real-time.</p>
                </div>
                
                <div className="glass-card p-6 md:p-8 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                   <SocialFeed />
                </div>
             </div>
          </section>
        </main>
      </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: 'purple' | 'blue' | 'green';
  href: string;
}

function FeatureCard({ icon: Icon, title, desc, color, href }: FeatureCardProps) {
  const colors = {
    purple: "text-lab-purple-400 group-hover:text-lab-purple-300",
    blue: "text-lab-blue-400 group-hover:text-lab-blue-300",
    green: "text-lab-green-400 group-hover:text-lab-green-300",
  };

  const bgColors = {
    purple: "bg-lab-purple-500/10 group-hover:bg-lab-purple-500/20 border-lab-purple-500/20",
    blue: "bg-lab-blue-500/10 group-hover:bg-lab-blue-500/20 border-lab-blue-500/20",
    green: "bg-lab-green-500/10 group-hover:bg-lab-green-500/20 border-lab-green-500/20",
  };

  return (
    <Link href={href} className="group relative p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-lab-purple-500/10 overflow-hidden">
      {/* Hover Gradient Background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-transparent ${color === 'purple' ? 'via-lab-purple-500' : color === 'blue' ? 'via-lab-blue-500' : 'via-lab-green-500'} to-transparent`} />
      
      <div className={`relative z-10 mb-6 p-4 rounded-xl w-fit transition-colors border ${bgColors[color as keyof typeof bgColors]} ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="relative z-10 text-xl font-display font-bold mb-3 group-hover:text-glow transition-all">{title}</h3>
      <p className="relative z-10 text-gray-400 leading-relaxed">{desc}</p>
      
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
        <ArrowRight className={`w-5 h-5 ${colors[color as keyof typeof colors]}`} />
      </div>
    </Link>
  );
}
