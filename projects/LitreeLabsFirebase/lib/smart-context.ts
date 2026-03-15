import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  // Basic info
  email: string;
  name?: string;
  businessName?: string;
  city?: string;
  
  // Business details
  niche?: 'barber' | 'lash_tech' | 'nail_tech' | 'aesthetician' | 'salon';
  services?: string;
  idealClient?: string;
  priceRange?: string;
  slowDays?: string;
  
  // Tier
  tier?: 'free' | 'pro' | 'enterprise';
}

export interface AIPreferences {
  // Style preferences
  preferredTone?: 'casual' | 'professional' | 'funny' | 'urgent';
  brandVoice?: string;
  
  // Content preferences
  favoriteHashtags?: string[];
  avoidWords?: string[];
  
  // Social media
  instagramHandle?: string;
  tiktokHandle?: string;
  competitorAccounts?: string[];
  
  // Goals
  primaryGoal?: 'bookings' | 'brand_awareness' | 'followers' | 'engagement';
  targetAudience?: string;
}

export interface ContentHistory {
  mostUsedPrompts?: Array<{ prompt: string; count: number }>;
  bestPerformingContent?: Array<{ content: string; engagement: number }>;
  recentEdits?: Array<{ original: string; edited: string }>;
  learnings?: string[]; // AI-learned preferences from user edits
}

export interface SmartContext {
  profile: UserProfile;
  aiPreferences: AIPreferences;
  history: ContentHistory;
}

/**
 * Get complete smart context for a user
 */
export async function getSmartContext(uid: string): Promise<SmartContext | null> {
  if (!db) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    
    return {
      profile: {
        email: data.email || '',
        name: data.name,
        businessName: data.businessName,
        city: data.city,
        niche: data.niche,
        services: data.services,
        idealClient: data.idealClient,
        priceRange: data.priceRange,
        slowDays: data.slowDays,
        tier: data.tier || 'free',
      },
      aiPreferences: data.aiPreferences || {},
      history: data.aiHistory || {},
    };
  } catch (error) {
    console.error('Error getting smart context:', error);
    return null;
  }
}

/**
 * Update AI preferences
 */
export async function updateAIPreferences(
  uid: string,
  preferences: Partial<AIPreferences>
): Promise<void> {
  if (!db) return;
  
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    aiPreferences: preferences,
  });
}

/**
 * Learn from user edits (AI improves over time)
 */
export async function learnFromEdit(
  uid: string,
  original: string,
  edited: string
): Promise<void> {
  const context = await getSmartContext(uid);
  if (!context) return;
  
  // Analyze the difference to learn preferences
  const learnings: string[] = context.history.learnings || [];
  
  // Simple heuristics (you can make this smarter with GPT analysis)
  if (edited.length < original.length) {
    learnings.push('User prefers shorter, more concise content');
  }
  if (edited.includes('🔥') && !original.includes('🔥')) {
    learnings.push('User likes fire emoji');
  }
  if (edited.split('\n').length > original.split('\n').length) {
    learnings.push('User prefers more line breaks for readability');
  }
  
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'aiHistory.recentEdits': [
      ...(context.history.recentEdits || []).slice(-9), // Keep last 10
      { original, edited },
    ],
    'aiHistory.learnings': [...new Set(learnings)].slice(-10), // Unique, last 10
  });
}

/**
 * Track content usage
 */
export async function trackContentUsage(
  uid: string,
  prompt: string
): Promise<void> {
  const context = await getSmartContext(uid);
  if (!context || !db) return;
  
  // Update most used prompts
  const prompts = context.history.mostUsedPrompts || [];
  const existing = prompts.find(p => p.prompt === prompt);
  
  if (existing) {
    existing.count++;
  } else {
    prompts.push({ prompt, count: 1 });
  }
  
  prompts.sort((a, b) => b.count - a.count);
  
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'aiHistory.mostUsedPrompts': prompts.slice(0, 10), // Top 10
  });
}

/**
 * Build enhanced prompt with smart context
 * This injects user context into AI prompts automatically
 */
export function enhancePromptWithContext(
  basePrompt: string,
  context: SmartContext | null
): string {
  if (!context) return basePrompt;
  
  const { profile, aiPreferences, history } = context;
  
  let enhanced = basePrompt;
  
  // Inject business context
  if (profile.businessName) {
    enhanced += `\n\nBusiness: ${profile.businessName}`;
  }
  if (profile.city) {
    enhanced += ` in ${profile.city}`;
  }
  if (profile.niche) {
    enhanced += `\nIndustry: ${profile.niche}`;
  }
  if (profile.services) {
    enhanced += `\nServices: ${profile.services}`;
  }
  if (profile.idealClient) {
    enhanced += `\nTarget audience: ${profile.idealClient}`;
  }
  
  // Inject style preferences
  if (aiPreferences.brandVoice) {
    enhanced += `\nBrand voice: ${aiPreferences.brandVoice}`;
  }
  if (aiPreferences.preferredTone) {
    enhanced += `\nTone: ${aiPreferences.preferredTone}`;
  }
  if (aiPreferences.favoriteHashtags?.length) {
    enhanced += `\nPreferred hashtags: ${aiPreferences.favoriteHashtags.join(', ')}`;
  }
  if (aiPreferences.avoidWords?.length) {
    enhanced += `\nAvoid words: ${aiPreferences.avoidWords.join(', ')}`;
  }
  
  // Inject learned preferences
  if (history.learnings?.length) {
    enhanced += `\n\nLearned preferences from past edits:\n- ${history.learnings.join('\n- ')}`;
  }
  
  return enhanced;
}

/**
 * Get AI memory summary for profile page
 */
export async function getAIMemorySummary(uid: string): Promise<string[]> {
  if (!db) return [];
  
  const context = await getSmartContext(uid);
  if (!context) return ['No AI memory yet'];
  
  const memories: string[] = [];
  
  if (context.profile.businessName) {
    memories.push(`📍 Your business: ${context.profile.businessName}`);
  }
  if (context.profile.niche) {
    memories.push(`💼 Industry: ${context.profile.niche}`);
  }
  if (context.aiPreferences.preferredTone) {
    memories.push(`🎤 Preferred tone: ${context.aiPreferences.preferredTone}`);
  }
  if (context.aiPreferences.favoriteHashtags?.length) {
    memories.push(`#️⃣ Favorite hashtags: ${context.aiPreferences.favoriteHashtags.slice(0, 3).join(', ')}`);
  }
  if (context.history.learnings?.length) {
    memories.push(`🧠 Learned: ${context.history.learnings[0]}`);
  }
  if (context.history.mostUsedPrompts?.length) {
    const top = context.history.mostUsedPrompts[0];
    memories.push(`⭐ Most used: "${top.prompt.slice(0, 40)}..." (${top.count}x)`);
  }
  
  return memories.length ? memories : ['No AI memory yet - start generating content!'];
}
