'use client';

import { useFirebase } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, UserCircle, LayoutDashboard, Box, Zap, ArrowDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lab-dark-900 relative selection:bg-purple-500/30">
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-lab-purple-500/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-lab-blue-500/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-lab-pink-500/10 rounded-full blur-[96px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-black/80 mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow">
            <div className="flex flex-col items-center space-y-8">
              <div className="relative group cursor-pointer">
                 <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                 <div className="relative h-24 w-24 bg-black ring-1 ring-white/10 rounded-full flex items-center justify-center">
                   <Globe className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
                 </div>
              </div>
              
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-purple-200 to-gray-400 tracking-tight">
                  LiTreeLab Studio
                </h1>
                <p className="text-lg text-gray-400 font-light">
                  Enter the Metaverse. <span className="text-purple-400 font-medium">Create.</span> Trade. Exist.
                </p>
              </div>

              <div className="w-full space-y-6 pt-2">
                <Button 
                  onClick={() => signInWithGoogle()}
                  className="w-full h-14 bg-white text-black hover:bg-gray-100 font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-white/20 cursor-pointer"
                >
                  <UserCircle className="mr-3 h-6 w-6" />
                  Enter Studio
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  By entering, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <p className="text-xs font-mono tracking-widest uppercase">Scroll to Explore</p>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </motion.div>
      </div>

      {/* Features Section (Below Fold) */}
      <section className="py-24 bg-black/40 relative z-10 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Why LiTreeLab?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A unified operating system for the digital age. We combine content management, 
              immersive 3D spaces, and automated finance into one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={LayoutDashboard}
              title="Studio Core"
              desc="Central command for your digital assets. Upload, manage, and deploy content across platforms."
              color="purple"
            />
            <FeatureItem 
              icon={Box}
              title="Metaverse Hub"
              desc="Your persistent 3D space. Host events, showcase NFTs, and connect with your community."
              color="blue"
            />
            <FeatureItem 
              icon={Zap}
              title="ProfitPilot"
              desc="AI-driven trading automation running in the background. Watch your portfolio grow while you create."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black text-center text-gray-600 text-sm border-t border-white/5">
        <p>&copy; 2026 LiTreeLab Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: 'purple' | 'blue' | 'green';
}

function FeatureItem({ icon: Icon, title, desc, color }: FeatureItemProps) {
  const colors = {
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
  };
  
  const style = colors[color as keyof typeof colors];

  return (
    <div className={`p-8 rounded-2xl border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${style}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-display font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
