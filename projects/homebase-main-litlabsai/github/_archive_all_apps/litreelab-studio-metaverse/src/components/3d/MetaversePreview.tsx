'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const colorMap: Record<string, string> = {
  'lab-purple': 'bg-lab-purple-500/20 text-lab-purple-400',
  'lab-green': 'bg-lab-green-500/20 text-lab-green-400',
  pink: 'bg-pink-500/20 text-pink-400',
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const MetaversePreview = React.memo(function MetaversePreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lab-dark-900 via-lab-purple-900/10 to-lab-dark-900" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Step Into The <span className="text-gradient">Metaverse</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Your 3D world where fans become communities. Host events, showcase work, and connect
              like never before.
            </p>
          </motion.div>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'Creator Spaces',
              description: 'Customizable 3D rooms for your content',
              icon: Globe,
              color: 'lab-purple',
              users: '2.4k',
            },
            {
              title: 'Live Events',
              description: 'Host concerts, premieres, and meetups',
              icon: Users,
              color: 'lab-green',
              users: '12k',
            },
            {
              title: 'NFT Galleries',
              description: 'Showcase your digital collectibles',
              icon: Sparkles,
              color: 'pink',
              users: '890',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card p-6 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div
                className={`p-4 rounded-2xl ${colorMap[item.color]} w-fit mb-4
                              group-hover:scale-110 transition-transform`}
              >
                <item.icon className={`w-8 h-8 ${colorMap[item.color].split(' ')[1]}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/60 mb-4">{item.description}</p>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Users className="w-4 h-4" />
                <span>{item.users} active</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/hub"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            Enter Metaverse
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

export default MetaversePreview;
