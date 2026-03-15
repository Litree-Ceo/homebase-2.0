import { db } from './firebase';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export type ContentType = 'caption' | 'script' | 'dm' | 'moneyPlay' | 'image';

export interface SavedContent {
  id?: string;
  userId: string;
  type: ContentType;
  content: string;
  imageUrl?: string; // For saved images
  metadata?: {
    platform?: string;
    niche?: string;
    engagement?: number;
    title?: string;
  };
  tags: string[];
  createdAt: Date;
  usedCount: number;
  lastUsed?: Date;
}

/**
 * Save content to library
 */
export async function saveToLibrary(
  userId: string,
  type: ContentType,
  content: string,
  options?: {
    imageUrl?: string;
    platform?: string;
    niche?: string;
    tags?: string[];
    title?: string;
  }
): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const contentRef = collection(dbRef, 'users', userId, 'savedContent');
  
  const newContent: Omit<SavedContent, 'id'> = {
    userId,
    type,
    content,
    imageUrl: options?.imageUrl,
    metadata: {
      platform: options?.platform,
      niche: options?.niche,
      title: options?.title,
    },
    tags: options?.tags || [],
    createdAt: new Date(),
    usedCount: 0,
  };
  
  const docRef = await addDoc(contentRef, newContent);
  return docRef.id;
}

/**
 * Get all saved content for a user
 */
export async function getSavedContent(
  userId: string,
  filters?: {
    type?: ContentType;
    tag?: string;
    search?: string;
  }
): Promise<SavedContent[]> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const contentRef = collection(dbRef, 'users', userId, 'savedContent');
  
  let q = query(contentRef, orderBy('createdAt', 'desc'));
  
  if (filters?.type) {
    q = query(contentRef, where('type', '==', filters.type), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    lastUsed: doc.data().lastUsed?.toDate?.(),
  })) as SavedContent[];
  
  // Apply client-side filters
  if (filters?.tag) {
    results = results.filter(item => item.tags.includes(filters.tag!));
  }
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(item =>
      item.content.toLowerCase().includes(searchLower) ||
      item.metadata?.title?.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  return results;
}

/**
 * Get single saved content item
 */
export async function getSavedContentById(
  userId: string,
  contentId: string
): Promise<SavedContent | null> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const docRef = doc(dbRef, 'users', userId, 'savedContent', contentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    lastUsed: data.lastUsed?.toDate?.(),
  } as SavedContent;
}

/**
 * Delete saved content
 */
export async function deleteSavedContent(
  userId: string,
  contentId: string
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const docRef = doc(dbRef, 'users', userId, 'savedContent', contentId);
  await deleteDoc(docRef);
}

/**
 * Use a template (increment usage counter)
 */
export async function useTemplate(
  userId: string,
  contentId: string
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  const dbRef = db;
  const docRef = doc(dbRef, 'users', userId, 'savedContent', contentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return;
  }
  
  await updateDoc(docRef, {
    usedCount: (docSnap.data().usedCount || 0) + 1,
    lastUsed: Timestamp.now(),
  });
}

/**
 * Get library stats for dashboard
 */
export async function getLibraryStats(userId: string): Promise<{
  totalSaved: number;
  byType: Record<ContentType, number>;
  mostUsed: SavedContent[];
  recentlySaved: SavedContent[];
}> {
  const allContent = await getSavedContent(userId);
  
  const byType: Record<ContentType, number> = {
    caption: 0,
    script: 0,
    dm: 0,
    moneyPlay: 0,
    image: 0,
  };
  
  allContent.forEach(item => {
    byType[item.type]++;
  });
  
  const mostUsed = [...allContent]
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 5);
  
  const recentlySaved = allContent.slice(0, 5);
  
  return {
    totalSaved: allContent.length,
    byType,
    mostUsed,
    recentlySaved,
  };
}

/**
 * Get popular tags
 */
export async function getPopularTags(userId: string): Promise<string[]> {
  const allContent = await getSavedContent(userId);
  
  const tagCounts: Record<string, number> = {};
  
  allContent.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
}
