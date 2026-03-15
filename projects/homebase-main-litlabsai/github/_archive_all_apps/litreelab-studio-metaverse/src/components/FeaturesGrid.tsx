'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Bot,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Creator Studio',
    description: 'All-in-one dashboard for content creation, scheduling, and analytics.',
    color: 'lab-purple',
    href: '/dashboard',
  },
  {
    icon: Globe,
    title: '3D Metaverse',
    description: 'Immersive spaces for your community. Host events, meetups, and showcases.',
    color: 'blue',
    href: '/hub',
  },
  {
    icon: Bot,
    title: 'ProfitPilot Trading',
    description: 'Automated crypto trading while you create. 24/7 profit generation.',
    color: 'lab-green',
    href: '/dashboard',
  },
  {
    icon: Sparkles,
    title: 'AI Tools',
    description: 'Generate content, images, and ideas with integrated AI assistants.',
    color: 'pink',
    href: '/chat',
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Deep insights into your content performance and audience growth.',
    color: 'lab-purple',
    href: '/dashboard',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. You own everything you create.',
    color: 'lab-green',
    href: '#',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for performance. No lag, instant updates, real-time sync.',
    color: 'yellow',
    href: '#',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with other creators. Collaborate, share, and grow together.',
    color: 'lab-purple',
    href: '/hub',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to <span className="text-gradient">Build Your Empire</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            No more switching between apps. Studio, metaverse, trading, and AI — all unified.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group glass-card p-6 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div
                className={`p-3 rounded-xl bg-${feature.color}-500/20 w-fit mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
