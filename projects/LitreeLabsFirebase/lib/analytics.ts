import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function trackEvent(
  eventName: string,
  data: Record<string, unknown> = {}
) {
  try {
    // GA4 tracking if gtag is available
    if (typeof window !== 'undefined') {
      const win = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof win.gtag === 'function') {
        win.gtag('event', eventName, {
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Also log to Firestore for founder analytics
    if (db) {
      await addDoc(collection(db, 'analytics_events'), {
        eventName,
        ...data,
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      });
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export const EVENTS = {
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  LOGIN: 'login',
  UPGRADE_CLICKED: 'upgrade_clicked',
  UPGRADE_COMPLETE: 'upgrade_complete',
  REFERRAL_SHARED: 'referral_shared',
  ADMIN_ACTION: 'admin_action',
  FEATURE_USED: 'feature_used',
} as const;

// Advanced Analytics Features

export interface PostMetrics {
  postId: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  reach: number;
  engagementRate: number;
  postedAt: Date;
  caption?: string;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  bestPerformingPost: PostMetrics | null;
  topPlatform: string;
  growthRate: number;
  predictions: ViralPrediction[];
  recommendations: string[];
  competitorInsights: string[];
}

export interface ViralPrediction {
  score: number;
  confidence: number;
  reasons: string[];
  suggestedImprovements: string[];
}

export async function getAnalyticsSummary(userId: string, days: number = 30): Promise<AnalyticsSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  if (!db) {
    return getEmptyAnalyticsSummary();
  }

  try {
    const metricsQuery = query(
      collection(db, 'post_metrics'),
      where('userId', '==', userId),
      where('postedAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('postedAt', 'desc')
    );

    const snapshot = await getDocs(metricsQuery);
    const posts: PostMetrics[] = snapshot.docs.map(doc => ({
      postId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt.toDate(),
    } as PostMetrics));

    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
    const avgEngagementRate = posts.length > 0 ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length : 0;

    const bestPost = posts.length > 0 ? posts.reduce((best, current) => 
      current.engagementRate > best.engagementRate ? current : best
    ) : null;

    const platformStats: Record<string, number> = {};
    posts.forEach(p => {
      platformStats[p.platform] = (platformStats[p.platform] || 0) + p.engagementRate;
    });
    const topPlatform = Object.keys(platformStats).reduce((a, b) => 
      platformStats[a] > platformStats[b] ? a : b, 'instagram'
    );

    const predictions = await predictViralContent(posts);
    const recommendations = await generateRecommendations(posts);
    const competitorInsights = await analyzeCompetitors();

    return {
      totalPosts: posts.length,
      totalViews,
      totalEngagement,
      avgEngagementRate,
      bestPerformingPost: bestPost,
      topPlatform,
      growthRate: calculateGrowthRate(posts),
      predictions,
      recommendations,
      competitorInsights,
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return getEmptyAnalyticsSummary();
  }
}

function getEmptyAnalyticsSummary(): AnalyticsSummary {
  return {
    totalPosts: 0,
    totalViews: 0,
    totalEngagement: 0,
    avgEngagementRate: 0,
    bestPerformingPost: null,
    topPlatform: 'instagram',
    growthRate: 0,
    predictions: [],
    recommendations: ['Connect your social accounts to see analytics'],
    competitorInsights: [],
  };
}

async function predictViralContent(posts: PostMetrics[]): Promise<ViralPrediction[]> {
  if (posts.length === 0) return [];
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  try {
    posts.slice(0, 3);
    const prompt = `Analyze these posts and predict viral potential. Return JSON array with score (0-100), confidence (0-1), reasons, and suggestedImprovements for each.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(response);
  } catch {
    return posts.slice(0, 3).map(p => ({
      score: Math.round(p.engagementRate * 10),
      confidence: 0.7,
      reasons: ['High engagement rate'],
      suggestedImprovements: ['Use trending audio', 'Post at peak times'],
    }));
  }
}

async function generateRecommendations(posts: PostMetrics[]): Promise<string[]> {
  if (posts.length === 0) return ['Start posting consistently 3-5 times per week', 'Use trending hashtags'];
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  try {
    const avgEngagement = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;
    const prompt = `Give 5 actionable recommendations based on ${avgEngagement.toFixed(2)}% engagement rate. Return JSON array of strings.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(response);
  } catch {
    return ['Post 3-5 times weekly', 'Use trending audio', 'Respond to comments quickly'];
  }
}

async function analyzeCompetitors(): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  try {
    const prompt = `Analyze beauty/grooming industry trends. What are competitors doing? Return JSON array of 4-5 insights.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(response);
  } catch {
    return ['Top creators post 2x daily', 'Behind-the-scenes content drives engagement', 'Before/after posts get highest saves'];
  }
}

function calculateGrowthRate(posts: PostMetrics[]): number {
  if (posts.length < 2) return 0;
  const sorted = [...posts].sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.engagementRate, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.engagementRate, 0) / secondHalf.length;
  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
}
