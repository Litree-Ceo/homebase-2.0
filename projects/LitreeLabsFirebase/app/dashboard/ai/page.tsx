"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getUsageStats } from "@/lib/usage-tracker";
import { saveToLibrary } from "@/lib/template-library";
import GodModePanel from "@/components/GodModePanel";

type ContentType = "instagram_caption" | "tiktok_script" | "email" | "dm_opener" | "money_play";

type MoneyPlay = {
  offer?: string;
  script?: string;
  estimatedLift?: number | string;
};

type UsageStats = {
  today: { aiGenerations: number; dmReplies: number; moneyPlays: number; imageGenerations: number };
  thisMonth: number;
  allTime: number;
  tier: 'free' | 'pro' | 'enterprise';
  limits: { aiGenerations: number; dmReplies: number; moneyPlays: number; imageGenerations: number };
};

export default function AIActionsPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<"generator" | "dm" | "money" | "images" | "godmode">("generator");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Save handlers
  const handleSaveContent = async (content: string, type: 'caption' | 'script' | 'dm' | 'moneyPlay') => {
    if (!user?.uid) return;
    try {
      await saveToLibrary(user.uid, type, content, {
        platform: formData.contentType === 'instagram_caption' ? 'instagram' : 'tiktok',
        niche: userData?.subscription?.plan || 'barber',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save content');
    }
  };

  // Load usage stats on mount
  useEffect(() => {
    if (user?.uid) {
      getUsageStats(user.uid).then((stats) => {
        // Normalize tier to expected union type
        const tier = (stats.tier === 'starter' ? 'free' : stats.tier) as 'free' | 'pro' | 'enterprise';
        setUsageStats({
          today: stats.today,
          thisMonth: stats.thisMonth,
          allTime: stats.allTime,
          tier,
          limits: stats.limits,
        });
      });
    }
  }, [user]);

  // CONTENT GENERATOR
  const [formData, setFormData] = useState({
    contentType: "instagram_caption" as ContentType,
    description: "",
    tone: "casual" as "casual" | "professional" | "funny" | "urgent",
  });

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          niche: userData?.subscription?.plan || "barber",
          ...formData,
        }),
      });

      const data = await response.json();
      
      if (response.status === 403 && data.upgradeRequired) {
        setUpgradeModalOpen(true);
        setGenerated(data.error);
      } else {
        setGenerated(data.content);
        // Refresh usage stats
        if (user?.uid) {
          getUsageStats(user.uid).then((stats) => {
            const tier = (stats.tier === 'starter' ? 'free' : stats.tier) as 'free' | 'pro' | 'enterprise';
            setUsageStats({
              today: stats.today,
              thisMonth: stats.thisMonth,
              allTime: stats.allTime,
              tier,
              limits: stats.limits,
            });
          });
        }
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGenerated("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // DM REPLY
  const [dmInput, setDmInput] = useState("");
  const [dmReply, setDmReply] = useState("");

  const handleGenerateDMReply = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/dm-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          incomingMessage: dmInput,
          userNiche: "barber",
          userContext: "",
        }),
      });

      const data = await response.json();
      
      if (response.status === 403 && data.upgradeRequired) {
        setUpgradeModalOpen(true);
        setDmReply(data.error);
      } else {
        setDmReply(data.reply);
        if (user?.uid) {
          getUsageStats(user.uid).then((stats) => {
            const normalized = {
              ...stats,
              tier: (stats.tier === 'starter' ? 'free' : stats.tier) as 'free' | 'pro' | 'enterprise',
            };
            setUsageStats(normalized);
          });
        }
      }
    } catch (err) {
      console.error("DM reply error:", err);
      setDmReply("Failed to generate reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // MONEY PLAY
  const [moneyPlay, setMoneyPlay] = useState<MoneyPlay | null>(null);

  const handleGenerateMoneyPlay = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/money-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          userNiche: "barber",
          recentBookings: 5,
          userRevenue: 5000,
        }),
      });

      const data = await response.json();
      
      if (response.status === 403 && data.upgradeRequired) {
        setUpgradeModalOpen(true);
        setMoneyPlay({ offer: data.error });
      } else {
        setMoneyPlay(data as MoneyPlay);
        if (user?.uid) {
          getUsageStats(user.uid).then((stats) => {
            const normalized = {
              ...stats,
              tier: (stats.tier === 'starter' ? 'free' : stats.tier) as 'free' | 'pro' | 'enterprise',
            };
            setUsageStats(normalized);
          });
        }
      }
    } catch (err) {
      console.error("Money play error:", err);
    } finally {
      setLoading(false);
    }
  };

  // IMAGE GENERATION
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<{ url: string; revisedPrompt?: string; cost?: number } | null>(null);

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          prompt: imagePrompt,
          quality: "standard", // or "hd" for $0.08
        }),
      });

      const data = await response.json();
      
      if (response.status === 403 && data.upgradeRequired) {
        setUpgradeModalOpen(true);
        setGeneratedImage(null);
      } else {
        setGeneratedImage(data);
        if (user?.uid) {
          getUsageStats(user.uid).then((stats) => {
            const normalized = {
              ...stats,
              tier: (stats.tier === 'starter' ? 'free' : stats.tier) as 'free' | 'pro' | 'enterprise',
            };
            setUsageStats(normalized);
          });
        }
      }
    } catch (err) {
      console.error("Image generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-blue-500/20 p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-pink-500/30 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500/30 rounded-full blur-3xl opacity-40" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-5xl">🤖</div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Content Studio
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Powered by Google Gemini • Generate viral content in seconds
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Today's Usage</p>
                <p className="text-xl font-bold text-white">
                  {usageStats ? (
                    <>
                      {usageStats.today.aiGenerations + usageStats.today.dmReplies + usageStats.today.moneyPlays}
                      {usageStats.tier === 'free' ? (
                        ` / ${usageStats.limits.aiGenerations + usageStats.limits.dmReplies + usageStats.limits.moneyPlays}`
                      ) : (
                        ' / ∞'
                      )}
                    </>
                  ) : (
                    'Loading...'
                  )}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Tier</p>
                <p className="text-xl font-bold text-purple-400">
                  {usageStats?.tier.toUpperCase() || 'FREE'}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Generation Speed</p>
                <p className="text-xl font-bold text-green-400">⚡ Instant</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Quality</p>
                <p className="text-xl font-bold text-purple-400">★★★★★</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
          {[
            { id: "godmode" as const, label: "GOD MODE", icon: "🧠", color: "from-purple-600 to-pink-600" },
            { id: "generator" as const, label: "Content Generator", icon: "✍️", color: "from-pink-500 to-purple-500" },
            { id: "images" as const, label: "Image Studio", icon: "🎨", color: "from-orange-500 to-red-500" },
            { id: "dm" as const, label: "DM Smart Reply", icon: "💬", color: "from-blue-500 to-cyan-500" },
            { id: "money" as const, label: "Money Plays", icon: "💰", color: "from-green-500 to-emerald-500" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-4 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-2xl mr-2">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT GENERATOR TAB */}
        {activeTab === "generator" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* INPUT PANEL */}
            <div className="space-y-6 p-6 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">🎯 What do you want to create?</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Content Type</label>
                    <select
                      title="Select content type"
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value as ContentType })}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="instagram_caption">📸 Instagram Caption</option>
                      <option value="tiktok_script">🎬 TikTok Script</option>
                      <option value="email">📧 Email</option>
                      <option value="dm_opener">💬 DM Opener</option>
                      <option value="money_play">💰 Money Play</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Tone & Vibe</label>
                    <select
                      title="Select tone"
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value as "casual" | "professional" | "funny" | "urgent" })}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="casual">😎 Casual & Chill</option>
                      <option value="professional">💼 Professional & Polished</option>
                      <option value="funny">😂 Funny & Entertaining</option>
                      <option value="urgent">🔥 Urgent & FOMO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Describe what you need</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Example: A weekend flash sale for haircuts, 25% off for first-timers, create urgency with limited slots..."
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 h-32 resize-none placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">💡 Be specific! More details = better results</p>
                  </div>

                  <button
                    onClick={handleGenerateContent}
                    disabled={loading || !formData.description}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-pink-500/50 hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span> Generating Magic...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        🚀 Generate Content
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* OUTPUT PANEL */}
            <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">✨ Your Content</h3>
                {generated && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                    ✓ Ready to use
                  </span>
                )}
              </div>
              
              {generated ? (
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 min-h-[200px]">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{generated}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generated);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-3 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-400 font-bold hover:bg-pink-500/30 transition text-sm"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                    <button 
                      onClick={handleGenerateContent}
                      disabled={loading}
                      className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition text-sm disabled:opacity-50"
                    >
                      🔄 Regenerate
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/20 transition">
                      ✅ Perfect!
                    </button>
                    <Link 
                      href="/dashboard/library"
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition text-center"
                    >
                      📚 Library
                    </Link>
                    <button 
                      onClick={() => handleSaveContent(generated, 'caption')}
                      className="flex-1 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition"
                    >
                      {saveSuccess ? "✓ Saved!" : "💾 Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4 opacity-20">✨</div>
                  <p className="text-gray-500 text-sm">Your AI-generated content will appear here</p>
                  <p className="text-gray-600 text-xs mt-2">Fill out the form and hit generate!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* IMAGE STUDIO TAB */}
        {activeTab === "images" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* INPUT PANEL */}
            <div className="space-y-6 p-6 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">🎨 AI Image Studio</h3>
                <p className="text-sm text-gray-400 mb-4">Powered by DALL-E 3 • Create stunning visuals for your posts</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Describe Your Image</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Example: A modern barbershop interior with neon lights and leather chairs, urban vibe, professional photography style"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Be specific about style, colors, mood, and composition for best results
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={!imagePrompt.trim() || loading}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition shadow-lg"
                  >
                    {loading ? "🎨 Creating magic..." : "🚀 Generate Image"}
                  </button>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-xs text-gray-400">
                      ⚡ Cost: $0.04 per image (Standard) • High-quality: $0.08
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {usageStats?.tier === 'free' 
                        ? `Free tier: ${usageStats.today.imageGenerations}/${usageStats.limits.imageGenerations} images today`
                        : usageStats?.tier === 'pro'
                        ? `Pro tier: ${usageStats.today.imageGenerations}/50 images today`
                        : 'Enterprise: Unlimited images'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* OUTPUT PANEL */}
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/30 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-white">🖼️ Generated Image</h3>
              
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={generatedImage.url} 
                      alt="Generated" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {generatedImage.revisedPrompt && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">AI-Enhanced Prompt:</p>
                      <p className="text-sm text-white">{generatedImage.revisedPrompt}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <a
                      href={generatedImage.url}
                      download="litlabs-generated-image.png"
                      className="flex-1 px-4 py-3 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold hover:bg-orange-500/30 transition text-center"
                    >
                      💾 Download
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage.url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold hover:bg-orange-500/30 transition"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy URL"}
                    </button>
                    <button
                      onClick={() => user?.uid && saveToLibrary(user.uid, 'image', imagePrompt, { imageUrl: generatedImage.url })}
                      className="flex-1 px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold hover:bg-purple-500/30 transition"
                    >
                      {saveSuccess ? "✓ Saved!" : "💾 Save"}
                    </button>
                  </div>

                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition"
                  >
                    ↻ Generate New Image
                  </button>

                  {generatedImage.cost && (
                    <p className="text-xs text-gray-500 text-center">
                      Generation cost: ${generatedImage.cost.toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center border-2 border-dashed border-white/10 rounded-lg">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-500 text-sm">Your AI-generated image will appear here</p>
                  <p className="text-gray-600 text-xs mt-2">Describe your vision and hit generate!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DM REPLY TAB */}
        {activeTab === "dm" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* INPUT PANEL */}
            <div className="space-y-6 p-6 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">💬 Smart DM Reply Generator</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Paste Customer Message</label>
                    <textarea
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      placeholder="Example: Hey! How much for a full set? Are you available this Saturday?"
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-40 resize-none placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">💡 Paste the exact message from Instagram, TikTok, or text</p>
                  </div>

                  <button
                    onClick={handleGenerateDMReply}
                    disabled={loading || !dmInput}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span> Crafting Reply...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        💬 Generate Smart Reply
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* OUTPUT PANEL */}
            <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">✨ Your Reply</h3>
                {dmReply && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                    ✓ Ready to send
                  </span>
                )}
              </div>
              
              {dmReply ? (
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 min-h-[200px]">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{dmReply}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(dmReply);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/30 transition text-sm"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                    <button 
                      onClick={handleGenerateDMReply}
                      disabled={loading}
                      className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition text-sm disabled:opacity-50"
                    >
                      🔄 Try Different Reply
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold hover:bg-green-500/20 transition"
                    >
                      ✅ Perfect!
                    </button>
                    <Link 
                      href="/dashboard/library"
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition text-center"
                    >
                      📚 Library
                    </Link>
                    <button 
                      onClick={() => handleSaveContent(dmReply, 'dm')}
                      className="flex-1 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition"
                    >
                      {saveSuccess ? "✓ Saved!" : "💾 Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4 opacity-20">💬</div>
                  <p className="text-gray-500 text-sm">Your AI-generated reply will appear here</p>
                  <p className="text-gray-600 text-xs mt-2">Paste a customer message and generate!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MONEY PLAY TAB */}
        {activeTab === "money" && (
          <div className="space-y-6">
            {/* GENERATOR BUTTON */}
            <div className="p-8 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-600/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-black text-white mb-2">Daily Money Play Generator</h3>
              <p className="text-gray-400 mb-6">AI-powered revenue boosting offers tailored to your business</p>
              
              <button
                onClick={handleGenerateMoneyPlay}
                disabled={loading}
                className="px-12 py-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-green-500/50 hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚡</span> Generating Money Play...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🎯 Generate Today&apos;s Money Play
                  </span>
                )}
              </button>
            </div>

            {/* RESULTS */}
            {moneyPlay && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎯</span>
                    <p className="text-sm font-bold text-green-400">TODAY&apos;S OFFER</p>
                  </div>
                  <p className="text-2xl font-black text-white mb-4 leading-tight">{moneyPlay.offer}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(moneyPlay.offer || "");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 font-bold hover:bg-green-500/30 transition"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Offer"}
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📝</span>
                    <p className="text-sm font-bold text-purple-400">SALES SCRIPT</p>
                  </div>
                  <p className="text-white leading-relaxed mb-4 text-sm">{moneyPlay.script}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(moneyPlay.script || "");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold hover:bg-purple-500/30 transition"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Script"}
                  </button>
                </div>

                <div className="md:col-span-2 p-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl text-center">
                  <p className="text-sm text-gray-400 mb-2">ESTIMATED REVENUE LIFT</p>
                  <p className="text-6xl font-black text-green-400 mb-2">+{moneyPlay.estimatedLift}%</p>
                  <p className="text-gray-400 text-sm">Based on similar offers in your industry</p>
                  <div className="flex gap-4 justify-center mt-6">
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-400">Potential Impact</p>
                      <p className="text-lg font-bold text-white">🔥 High</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-400">Difficulty</p>
                      <p className="text-lg font-bold text-white">⚡ Easy</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-400">Time to Deploy</p>
                      <p className="text-lg font-bold text-white">⏱️ 5 min</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => handleSaveContent(`${moneyPlay.offer}\n\n${moneyPlay.script}`, 'moneyPlay')}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition"
                    >
                      {saveSuccess ? "✓ Saved to Library!" : "💾 Save Money Play"}
                    </button>
                    <Link 
                      href="/dashboard/library"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition text-center"
                    >
                      📚 View Library
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GOD MODE TAB */}
        {activeTab === "godmode" && <GodModePanel />}

        {/* FOOTER */}
        <div className="text-center border-t border-white/10 pt-6">
          <Link href="/dashboard" className="text-pink-400 hover:text-pink-300 font-bold transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* UPGRADE MODAL */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-pink-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-black text-white mb-2">Daily Limit Reached</h2>
              <p className="text-gray-400">You've used all your free generations for today. Upgrade to Pro for unlimited access!</p>
            </div>

            {usageStats && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-3">Today's Usage:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Content Generation</span>
                    <span className="text-pink-400 font-bold">
                      {usageStats.today.aiGenerations} / {usageStats.limits.aiGenerations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">DM Replies</span>
                    <span className="text-pink-400 font-bold">
                      {usageStats.today.dmReplies} / {usageStats.limits.dmReplies}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Money Plays</span>
                    <span className="text-pink-400 font-bold">
                      {usageStats.today.moneyPlays} / {usageStats.limits.moneyPlays}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/billing"
                className="block w-full px-6 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-center hover:scale-105 transition shadow-lg"
              >
                💎 Upgrade to Pro - $49/mo
              </Link>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Resets daily at midnight UTC • Pro = unlimited generations
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
