'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, TrendingUp, Sparkles, Globe } from 'lucide-react';

const heroVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const HeroSection = React.memo(function HeroSection() {
  const [liveStats, setLiveStats] = React.useState({
    creators: 12547,
    earnings: 2847500,
    traders: 3421,
    online: 892,
  });

  // Simulate live stats
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        creators: prev.creators + Math.floor(Math.random() * 3),
        earnings: prev.earnings + Math.floor(Math.random() * 150),
        traders: prev.traders + Math.floor(Math.random() * 2),
        online: prev.online + Math.floor(Math.random() * 5) - 2,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-lab-purple-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lab-green-600/20 rounded-full blur-3xl"
        />

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Live Badge */}
          <motion.div
            variants={heroVariants}
            initial="initial"
            animate="animate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       glass mb-8 border border-lab-green-500/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lab-green-500" />
            </span>
            <span className="text-sm text-white/80">
              {liveStats.online.toLocaleString()} creators online now
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={heroVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
          >
            Your Content.
            <br />
            <span className="text-gradient">Your Empire.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={heroVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12"
          >
            The only platform that combines creator tools, 3D metaverse, AI automation, and{' '}
            <span className="text-lab-green-400 font-semibold">ProfitPilot</span> trading. Build
            your brand while bots make you money.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={heroVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Enter Studio
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/hub"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              <Play className="w-5 h-5" />
              Explore Metaverse
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={heroVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              {
                label: 'Active Creators',
                value: liveStats.creators.toLocaleString(),
                icon: Globe,
              },
              {
                label: 'Total Earnings',
                value: `$${(liveStats.earnings / 1000000).toFixed(2)}M`,
                icon: TrendingUp,
              },
              {
                label: 'ProfitPilot Traders',
                value: liveStats.traders.toLocaleString(),
                icon: TrendingUp,
              },
              {
                label: 'AI Generations',
                value: '2.4M+',
                icon: Sparkles,
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="glass-card p-6 text-center hover:bg-white/10 transition-all"
              >
                <stat.icon className="w-6 h-6 text-lab-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
});

export default HeroSection;
