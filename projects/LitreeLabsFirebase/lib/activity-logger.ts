import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function logActivity(type: 'signup' | 'upgrade' | 'created_content', data: {
  userName: string;
  businessName?: string;
  tier?: string;
}) {
  if (!db) return;
  
  try {
    await addDoc(collection(db, 'activity_log'), {
      type,
      userName: data.userName,
      businessName: data.businessName,
      tier: data.tier,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
