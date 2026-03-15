import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function checkPostLimit(userId: string): Promise<{
  canPost: boolean;
  postsToday: number;
  limit: number;
  tier: string;
}> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const userDoc = await getDoc(doc(dbRef, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const data = userDoc.data();
  const tier = data.tier || 'free';
  const today = new Date().toDateString();
  const lastPostDate = data.lastPostDate || '';
  const postsToday = lastPostDate === today ? data.postsToday || 0 : 0;

  const limits: Record<string, number> = {
    free: 1,
    pro: 10,
    enterprise: 999,
  };

  const limit = limits[tier] || limits.free;
  const canPost = postsToday < limit;

  return { canPost, postsToday, limit, tier };
}

export async function recordPost(userId: string) {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const userDoc = await getDoc(doc(dbRef, 'users', userId));
  if (!userDoc.exists()) return;

  const today = new Date().toDateString();
  const data = userDoc.data();
  const lastPostDate = data.lastPostDate || '';
  const postsToday = lastPostDate === today ? (data.postsToday || 0) + 1 : 1;

  await updateDoc(doc(dbRef, 'users', userId), {
    lastPostDate: today,
    postsToday,
    totalPostsAllTime: (data.totalPostsAllTime || 0) + 1,
  });
}
