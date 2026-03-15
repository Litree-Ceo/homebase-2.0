'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMarketplaceTemplates, purchaseTemplate, getPurchasedTemplates, type Template } from '@/lib/marketplace';
import { Store, Tag, TrendingUp, Shield, Search, Filter } from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [purchasedTemplates, setPurchasedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
    if (user?.uid) {
      loadPurchased();
    }
  }, [user, selectedCategory, selectedPlatform]);

  const loadTemplates = async () => {
    setLoading(true);
    const filters: any = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    if (selectedPlatform !== 'all') filters.platform = selectedPlatform;
    
    const data = await getMarketplaceTemplates(filters);
    setTemplates(data);
    setLoading(false);
  };

  const loadPurchased = async () => {
    if (!user?.uid) return;
    const purchased = await getPurchasedTemplates(user.uid);
    setPurchasedTemplates(purchased);
  };

  const handlePurchase = async (templateId: string) => {
    if (!user?.uid) {
      alert('Please sign in to purchase templates');
      return;
    }

    const confirmed = confirm('Purchase this template? You\'ll be charged via your Stripe account.');
    if (!confirmed) return;

    const result = await purchaseTemplate(user.uid, templateId);
    
    if (result.success) {
      alert('✅ Template purchased! Check your library.');
      loadPurchased();
    } else {
      alert('❌ ' + (result.error || 'Purchase failed'));
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isPurchased = (templateId?: string) => {
    return purchasedTemplates.some(p => p.id === templateId);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Store className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Template Marketplace 🛍️</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-3xl">
            Buy proven templates from top creators. Sell your best content for passive income.
            <span className="font-bold ml-2">30% commission • Instant delivery</span>
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Templates</span>
            </div>
            <p className="text-2xl font-bold">{templates.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Purchases</span>
            </div>
            <p className="text-2xl font-bold">{purchasedTemplates.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Verified Sellers</span>
            </div>
            <p className="text-2xl font-bold">100%</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Price</span>
            </div>
            <p className="text-2xl font-bold">$4.99</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 appearance-none"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                <option value="barber">Barber Shop</option>
                <option value="lash-tech">Lash Tech</option>
                <option value="nail-tech">Nail Tech</option>
                <option value="salon">Salon</option>
                <option value="spa">Spa</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Platform Filter */}
            <select
              id="platform-filter"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              aria-label="Filter by platform"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading marketplace...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Preview */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 min-h-[200px] flex items-center justify-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center line-clamp-6">
                    {template.preview}
                  </p>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  {/* Title & Rating */}
                  <div>
                    <h3 className="font-bold text-lg mb-1">{template.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(template.rating) ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({template.reviewCount})
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {template.salesCount} sales
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      {template.platform}
                    </span>
                    {template.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>by {template.sellerName}</span>
                  </div>

                  {/* Price & Purchase */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        ${(template.price / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">One-time purchase</p>
                    </div>
                    {isPurchased(template.id) ? (
                      <button
                        disabled
                        className="px-6 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium cursor-not-allowed"
                      >
                        ✓ Owned
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(template.id!)}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No templates found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}

        {/* Seller CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">💰 Become a Seller</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Turn your best templates into passive income. Earn 70% on every sale.
            Top sellers make $500-2000/month on autopilot.
          </p>
          <button className="px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition">
            Start Selling Templates
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
