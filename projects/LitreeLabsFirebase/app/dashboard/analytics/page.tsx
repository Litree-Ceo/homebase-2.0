'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics';
import { TrendingUp, Eye, Heart, Target, Zap, Calendar, Award, Lightbulb } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getAnalyticsSummary(user.uid, timeRange);
    setAnalytics(data);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Analytics Dashboard 📊</h1>
              </div>
              <p className="text-purple-100 text-lg max-w-2xl">
                AI-powered insights to predict viral content, optimize posting times, and dominate your niche
              </p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeRange === days
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Analyzing your performance...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {analytics.growthRate > 0 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      ↑ {analytics.growthRate.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      ↓ {Math.abs(analytics.growthRate).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-gray-500">vs last period</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="text-2xl font-bold">{analytics.totalEngagement.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.avgEngagementRate.toFixed(2)}% avg rate
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold">{analytics.totalPosts}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Top: {analytics.topPlatform}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Viral Score</p>
                    <p className="text-2xl font-bold">
                      {analytics.predictions[0]?.score || 0}/100
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.predictions[0]?.confidence ? 
                    `${(analytics.predictions[0].confidence * 100).toFixed(0)}% confident` : 
                    'Need more data'
                  }
                </div>
              </div>
            </div>

            {/* Best Performing Post */}
            {analytics.bestPerformingPost && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      🏆 Top Performing Post
                      <span className="text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">
                        {analytics.bestPerformingPost.engagementRate.toFixed(2)}% engagement
                      </span>
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {analytics.bestPerformingPost.caption?.substring(0, 200)}...
                    </p>
                    <div className="flex gap-6 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {analytics.bestPerformingPost.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {analytics.bestPerformingPost.likes.toLocaleString()} likes
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {analytics.bestPerformingPost.comments} comments
                      </span>
                      <span className="text-gray-500">
                        {analytics.bestPerformingPost.platform} • {analytics.bestPerformingPost.postedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold">AI Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Insights */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold">Competitor Intelligence</h3>
                </div>
                <div className="space-y-3">
                  {analytics.competitorInsights.map((insight, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <span className="text-red-600">🎯</span>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Viral Predictions */}
            {analytics.predictions.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold">Viral Potential Analysis</h3>
                </div>
                <div className="space-y-4">
                  {analytics.predictions.map((pred, i) => (
                    <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Post #{i + 1}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {(pred.confidence * 100).toFixed(0)}% confidence
                          </span>
                          <span className={`text-2xl font-bold ${
                            pred.score >= 70 ? 'text-green-600' :
                            pred.score >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {pred.score}/100
                          </span>
                        </div>
                      </div>
                      
                      {/* Score Bar */}
                      <div className="mb-3">
                        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              pred.score >= 70 ? 'bg-green-600' :
                              pred.score >= 40 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${pred.score}%` }}
                            role="progressbar"
                            aria-valuenow={pred.score}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Prediction score: ${pred.score}%`}
                          ></div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Why it works:</p>
                          <ul className="space-y-1">
                            {pred.reasons.map((reason, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Improve it:</p>
                          <ul className="space-y-1">
                            {pred.suggestedImprovements.map((improvement, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-yellow-600">→</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Posting Times */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6" />
                <h3 className="text-xl font-bold">Optimal Posting Times</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">Best Day</p>
                  <p className="text-2xl font-bold">Tuesday</p>
                  <p className="text-blue-100 text-sm">2.3x engagement</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">Peak Hour</p>
                  <p className="text-2xl font-bold">6-9 PM</p>
                  <p className="text-blue-100 text-sm">Maximum reach</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">Post Frequency</p>
                  <p className="text-2xl font-bold">3-5x/week</p>
                  <p className="text-blue-100 text-sm">Optimal growth</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No analytics data yet</p>
            <p className="text-gray-500 text-sm mb-4">Connect your social accounts to start tracking</p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700">
              Connect Accounts
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
