import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export type UserTier = 'free' | 'starter' | 'creator' | 'pro' | 'agency' | 'education';

export interface UsageLimits {
  aiGenerations: number;
  dmReplies: number;
  moneyPlays: number;
  imageGenerations: number;
}

export interface DailyUsage {
  aiGenerations: number;
  dmReplies: number;
  moneyPlays: number;
  imageGenerations: number;
  date: string;
  resetAt: Date;
}

// NEW 5-TIER LIMIT SYSTEM
export const TIER_LIMITS: Record<UserTier, UsageLimits> = {
  free: {
    aiGenerations: 5,
    dmReplies: 3,
    moneyPlays: 1,
    imageGenerations: 2,
  },
  starter: {
    aiGenerations: 50,   // 50/month = ~1-2 per day
    dmReplies: 20,       // 20/month
    moneyPlays: 5,       // 5/month
    imageGenerations: 10, // 10/month
  },
  creator: {
    aiGenerations: 500,  // 500/month = ~16 per day
    dmReplies: 100,      // 100/month = ~3 per day
    moneyPlays: -1,      // Unlimited
    imageGenerations: 50, // 50/month
  },
  pro: {
    aiGenerations: -1,   // UNLIMITED
    dmReplies: -1,       // UNLIMITED
    moneyPlays: -1,      // UNLIMITED
    imageGenerations: -1, // UNLIMITED
  },
  agency: {
    aiGenerations: -1,   // UNLIMITED
    dmReplies: -1,       // UNLIMITED
    moneyPlays: -1,      // UNLIMITED
    imageGenerations: -1, // UNLIMITED (with white-label)
  },
  education: {
    aiGenerations: -1,   // UNLIMITED for teachers
    dmReplies: -1,       // UNLIMITED
    moneyPlays: -1,      // UNLIMITED
    imageGenerations: 500, // 500/month (10 per student × 50 students)
  },
};

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get user's tier from Firestore
 */
export async function getUserTier(uid: string): Promise<UserTier> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const userRef = doc(dbRef, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return 'free';
  }
  
  const data = userSnap.data();
  return (data.tier as UserTier) || 'free';
}

/**
 * Get user's usage for today
 */
export async function getDailyUsage(uid: string): Promise<DailyUsage> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const today = getTodayString();
  const usageRef = doc(dbRef, 'users', uid, 'usage', today);
  const usageSnap = await getDoc(usageRef);
  
  if (!usageSnap.exists()) {
    // Create new usage doc for today
    const newUsage: DailyUsage = {
      aiGenerations: 0,
      dmReplies: 0,
      moneyPlays: 0,
      imageGenerations: 0,
      date: today,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)), // midnight tonight
    };
    
    await setDoc(usageRef, newUsage);
    return newUsage;
  }
  
  return usageSnap.data() as DailyUsage;
}

/**
 * Check if user can perform an action based on their tier and current usage
 */
export async function canPerformAction(
  uid: string,
  actionType: keyof UsageLimits
): Promise<{ allowed: boolean; reason?: string; limit?: number; current?: number }> {
  const tier = await getUserTier(uid);
  const usage = await getDailyUsage(uid);
  const limits = TIER_LIMITS[tier];
  
  const limit = limits[actionType];
  const current = usage[actionType];
  
  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true };
  }
  
  if (current >= limit) {
    return {
      allowed: false,
      reason: `Daily limit reached. You've used ${current}/${limit} ${actionType} today. Upgrade to Pro for unlimited access.`,
      limit,
      current,
    };
  }
  
  return { allowed: true, limit, current };
}

/**
 * Increment usage counter for a specific action
 */
export async function incrementUsage(
  uid: string,
  actionType: keyof UsageLimits
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const today = getTodayString();
  const usageRef = doc(dbRef, 'users', uid, 'usage', today);
  
  // Use Firestore increment to handle concurrency
  await updateDoc(usageRef, {
    [actionType]: increment(1),
  });
}

/**
 * Get usage statistics for profile dashboard
 */
export async function getUsageStats(uid: string): Promise<{
  today: DailyUsage;
  thisMonth: number;
  allTime: number;
  tier: UserTier;
  limits: UsageLimits;
}> {
  const tier = await getUserTier(uid);
  const today = await getDailyUsage(uid);
  
  // Get this month's total (sum all days in current month)
  new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
  // TODO: Query Firestore for sum of all usage docs in date range
  // For now, just return today's count
  const thisMonth = today.aiGenerations + today.dmReplies + today.moneyPlays + today.imageGenerations;
  
  // TODO: Query for all-time total
  const allTime = thisMonth;
  
  return {
    today,
    thisMonth,
    allTime,
    tier,
    limits: TIER_LIMITS[tier],
  };
}

/**
 * Get smart recommendations based on usage patterns
 */
export async function getSmartRecommendations(uid: string): Promise<string[]> {
  const usage = await getDailyUsage(uid);
  const tier = await getUserTier(uid);
  const recommendations: string[] = [];
  
  // If free tier and hitting limits
  if (tier === 'free') {
    const limits = TIER_LIMITS.free;
    
    if (usage.aiGenerations >= limits.aiGenerations - 1) {
      recommendations.push('💎 You\'re almost at your daily limit! Upgrade to Pro for unlimited AI generations.');
    }
    
    if (usage.dmReplies >= limits.dmReplies) {
      recommendations.push('📱 Out of DM replies for today. Pro members get unlimited smart replies.');
    }
  }
  
  // Usage pattern insights
  if (usage.aiGenerations > 10) {
    recommendations.push('🔥 You\'re on fire today! Consider scheduling these posts throughout the week.');
  }
  
  if (usage.moneyPlays === 0) {
    recommendations.push('💰 Don\'t forget to generate a money play today - it could boost your revenue by 25%!');
  }
  
  return recommendations;
}
