// Server-side Firebase utilities using Admin SDK
import { getAdminAuth, getAdminDb } from './firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

export async function getServerDb(): Promise<Firestore | null> {
  const db = getAdminDb();
  return db;
}

export async function getServerAuth() {
  const auth = getAdminAuth();
  return auth;
}

// Server-side usage tracking using Admin SDK
export async function getUserTierServer(uid: string) {
  const db = await getServerDb();
  if (!db) throw new Error('Firestore Admin not initialized');
  
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return 'free';
  
  const data = userDoc.data();
  return (data?.tier as string) || 'free';
}

export async function getDailyUsageServer(uid: string) {
  const db = await getServerDb();
  if (!db) throw new Error('Firestore Admin not initialized');
  
  const today = new Date().toISOString().split('T')[0];
  const usageDoc = await db.collection('users').doc(uid).collection('usage').doc(today).get();
  
  if (!usageDoc.exists) {
    const newUsage = {
      aiGenerations: 0,
      dmReplies: 0,
      moneyPlays: 0,
      imageGenerations: 0,
      date: today,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
    };
    await db.collection('users').doc(uid).collection('usage').doc(today).set(newUsage);
    return newUsage;
  }
  
  return usageDoc.data();
}

export async function incrementUsageServer(uid: string, actionType: string) {
  const db = await getServerDb();
  if (!db) throw new Error('Firestore Admin not initialized');
  
  const today = new Date().toISOString().split('T')[0];
  const usageRef = db.collection('users').doc(uid).collection('usage').doc(today);
  
  await usageRef.update({
    [actionType]: (await usageRef.get()).data()?.[actionType] + 1 || 1,
  });
}

const TIER_LIMITS: Record<string, any> = {
  free: { aiGenerations: 10, dmReplies: 5, moneyPlays: 3, imageGenerations: 5 },
  pro: { aiGenerations: -1, dmReplies: -1, moneyPlays: -1, imageGenerations: -1 },
  enterprise: { aiGenerations: -1, dmReplies: -1, moneyPlays: -1, imageGenerations: -1 },
};

export async function canPerformActionServer(uid: string, actionType: string) {
  const tier = await getUserTierServer(uid);
  const usage = await getDailyUsageServer(uid);
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  
  const limit = limits[actionType];
  const current = (usage && (usage as any)[actionType]) || 0;
  
  if (limit === -1) return { allowed: true };
  
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
