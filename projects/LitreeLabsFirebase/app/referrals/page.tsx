'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; email?: string } | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCount: 0,
    totalBonus: 0,
  });

  useEffect(() => {
    if (!auth || !db) {
      router.push('/auth');
      return;
    }

    const authInstance = auth;
    const dbInstance = db;

    const unsubscribe = onAuthStateChanged(authInstance, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
        return;
      }

      setUser({ uid: authUser.uid, email: authUser.email ?? undefined });

      const code = Buffer.from(`${authUser.uid}:referral`).toString('base64').slice(0, 12);
      setReferralCode(code);
      setReferralLink(`${window.location.origin}?ref=${code}`);

      const userDoc = await getDoc(doc(dbInstance, 'users', authUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Record<string, unknown>;
        setStats({
          referralCount: (data.referralCount as number) || 0,
          totalBonus: (data.totalReferralBonus as number) || 0,
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  const templates = [
    {
      platform: "Instagram Caption",
      text: "Just automated my entire DM game with LitLabs 🤖 Replies send in seconds. Revenue up 3x. Try free → [link]",
      emoji: "📸"
    },
    {
      platform: "TikTok Hook",
      text: "POV: You automated your customer service and now you have an extra 20 hours per week 🚀",
      emoji: "🎬"
    },
    {
      platform: "Twitter/X Post",
      text: "Using LitLabs to reply to 1,000+ DMs per month automatically. My business runs while I sleep 💤 Free trial → [link]",
      emoji: "𝕏"
    },
    {
      platform: "Email Subject",
      text: "This AI tool just saved me $10k in freelancer costs",
      emoji: "📧"
    },
    {
      platform: "LinkedIn Post",
      text: "Just discovered this AI automation platform that's handling all my customer service. Scaling my business without hiring more people. Highly recommend checking it out.",
      emoji: "💼"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">💰 Earn with LitLabs</h1>
          <p className="text-white/60">Share your referral link and earn $10 for every signup</p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="border border-pink-500/30 rounded-xl bg-pink-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Your Referrals</p>
            <p className="text-3xl font-black text-pink-400">{stats.referralCount}</p>
          </div>
          <div className="border border-purple-500/30 rounded-xl bg-purple-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Total Earned</p>
            <p className="text-3xl font-black text-purple-400">${stats.totalBonus}</p>
          </div>
          <div className="border border-cyan-500/30 rounded-xl bg-cyan-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Avg per Referral</p>
            <p className="text-3xl font-black text-cyan-400">$10</p>
          </div>
        </div>

        {/* YOUR REFERRAL CODE */}
        <div className="border-2 border-white/20 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-8 mb-12 space-y-6">
          <h2 className="text-2xl font-bold">Your Referral Code</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                id="referral-link-input"
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white text-sm"
                aria-label="Your referral link"
              />
              <button
                onClick={() => copyToClipboard(referralLink)}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-white/50">
              📌 Pin this: <code className="text-cyan-400">{referralCode}</code>
            </p>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="border border-white/20 rounded-2xl bg-white/5 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <ol className="space-y-4">
            {[
              "Share your link on Instagram, TikTok, email, or anywhere",
              "Someone clicks → signs up with your code",
              "They create account (takes 30 sec)",
              "You earn $10 instantly ✨"
            ].map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="text-2xl font-black text-pink-500 flex-shrink-0">{i + 1}.</span>
                <p className="text-white/80 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* MARKETING TEMPLATES */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">📱 Marketing Templates</h2>
          <p className="text-white/60 mb-6">Copy & paste these to your socials</p>
          <div className="space-y-4">
            {templates.map((template, i) => (
              <div key={i} className="border border-white/10 rounded-lg p-6 hover:border-pink-500/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{template.platform}</p>
                  </div>
                  <span className="text-2xl">{template.emoji}</span>
                </div>
                <p className="text-white/80 mb-4 leading-relaxed">{template.text}</p>
                <button
                  onClick={() => copyToClipboard(template.text)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  📋 Copy text
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div className="border border-white/20 rounded-2xl bg-white/5 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">💡 Pro Tips</h2>
          <ul className="space-y-3">
            {[
              "Show results: Use case studies and before/afters",
              "Be authentic: Only promote if you truly use & love LitLabs",
              "DM your network: Personal messages convert 5x better",
              "Post consistently: The more you share, the more you earn",
              "Include social proof: Link to testimonials or demo",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-white/80">
                <span className="text-pink-400 font-bold flex-shrink-0">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LEADERBOARD */}
        <div>
          <h2 className="text-2xl font-bold mb-6">🏆 Top Affiliates</h2>
          <div className="space-y-2">
            {[
              { name: "Sarah M.", referrals: 42, earned: "$420", badge: "🥇" },
              { name: "Jessica L.", referrals: 38, earned: "$380", badge: "🥈" },
              { name: "Maria P.", referrals: 31, earned: "$310", badge: "🥉" },
            ].map((affiliate, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-pink-500/30 rounded-lg bg-pink-500/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{affiliate.badge}</span>
                  <div>
                    <p className="font-bold">{affiliate.name}</p>
                    <p className="text-sm text-white/60">{affiliate.referrals} referrals</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-pink-400">{affiliate.earned}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
