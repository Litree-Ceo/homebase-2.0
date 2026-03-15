"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getSavedContent, deleteSavedContent, useTemplate, getPopularTags, SavedContent, ContentType } from "@/lib/template-library";
import Link from "next/link";

export default function LibraryPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ContentType | "all">("all");
  const [filterTag, setFilterTag] = useState<string>("");
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadContent();
      loadTags();
    }
  }, [user, filterType, filterTag, searchTerm]);

  const loadContent = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const filters: any = {};
    if (filterType !== "all") filters.type = filterType;
    if (filterTag) filters.tag = filterTag;
    if (searchTerm) filters.search = searchTerm;
    
    const data = await getSavedContent(user.uid, filters);
    setContent(data);
    setLoading(false);
  };

  const loadTags = async () => {
    if (!user?.uid) return;
    const tags = await getPopularTags(user.uid);
    setPopularTags(tags);
  };

  const handleUseTemplate = async (id: string, content: string) => {
    if (!user?.uid || !id) return;
    await useTemplate(user.uid, id);
    navigator.clipboard.writeText(content);
    alert("Template copied to clipboard! ✓");
    loadContent(); // Refresh to show updated use count
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid || !id) return;
    if (confirm("Delete this saved content?")) {
      await deleteSavedContent(user.uid, id);
      loadContent();
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "caption": return "📸";
      case "script": return "🎬";
      case "dm": return "💬";
      case "moneyPlay": return "💰";
      case "image": return "🖼️";
      default: return "📄";
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case "caption": return "from-pink-500 to-purple-500";
      case "script": return "from-blue-500 to-cyan-500";
      case "dm": return "from-green-500 to-emerald-500";
      case "moneyPlay": return "from-yellow-500 to-orange-500";
      case "image": return "from-red-500 to-pink-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-blue-500/20 p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-pink-500/30 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500/30 rounded-full blur-3xl opacity-40" />
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              📚 Content Library
            </h1>
            <p className="text-gray-400">Your saved content & templates • Reuse with one click</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Search</label>
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label htmlFor="content-type-filter" className="block text-sm font-bold mb-2 text-gray-300">Type</label>
              <select
                id="content-type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ContentType | "all")}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500"
                aria-label="Filter content by type"
              >
                <option value="all">All Types</option>
                <option value="caption">📸 Captions</option>
                <option value="script">🎬 Scripts</option>
                <option value="dm">💬 DM Replies</option>
                <option value="moneyPlay">💰 Money Plays</option>
                <option value="image">🖼️ Images</option>
              </select>
            </div>

            <div>
              <label htmlFor="content-tag-filter" className="block text-sm font-bold mb-2 text-gray-300">Tag</label>
              <select
                id="content-tag-filter"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500"
                aria-label="Filter content by tag"
              >
                <option value="">All Tags</option>
                {popularTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <p className="text-sm text-gray-400">Popular tags:</p>
            {popularTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs font-bold hover:bg-purple-500/30 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-400">Loading your library...</p>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400 mb-4">No saved content yet</p>
            <Link href="/dashboard/ai" className="text-pink-400 hover:text-pink-300 font-bold">
              Go to AI Studio to create content →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${getTypeColor(item.type)}`}>
                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                    <span className="text-xs font-bold text-white">{item.type.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️
                  </button>
                </div>

                {item.metadata?.title && (
                  <h3 className="text-lg font-bold text-white mb-2">{item.metadata.title}</h3>
                )}

                {item.type === 'image' && item.imageUrl ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img src={item.imageUrl} alt="Saved" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-4">{item.content}</p>
                )}

                {item.tags.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Used {item.usedCount}x</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => item.id && handleUseTemplate(item.id, item.content)}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition"
                >
                  📋 Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BACK LINK */}
        <div className="text-center border-t border-white/10 pt-6">
          <Link href="/dashboard/ai" className="text-pink-400 hover:text-pink-300 font-bold transition">
            ← Back to AI Studio
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
