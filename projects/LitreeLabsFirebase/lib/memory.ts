import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserMemory {
  userId: string;
  preferences: {
    tone: "casual" | "professional" | "funny" | "urgent";
    niche: string;
    brandVoice: string;
    topicsOfInterest: string[];
  };
  historicalPerformance: {
    bestPerformingCaption: string;
    averageEngagementRate: number;
    topHooks: string[];
    failedAttempts: string[];
  };
  automationSettings: {
    autoReplyDMs: boolean;
    autoPostTiming: string;
    autoSuggestContent: boolean;
  };
  createdAt: Date;
  lastUpdated: Date;
}

export async function initializeUserMemory(userId: string, niche: string): Promise<UserMemory> {
  if (!db) throw new Error('Firebase not initialized');
  
  const memoryRef = doc(db, "userMemory", userId);
  const existingMemory = await getDoc(memoryRef);

  if (existingMemory.exists()) {
    return existingMemory.data() as UserMemory;
  }

  const newMemory: UserMemory = {
    userId,
    preferences: {
      tone: "casual",
      niche,
      brandVoice: "",
      topicsOfInterest: [],
    },
    historicalPerformance: {
      bestPerformingCaption: "",
      averageEngagementRate: 0,
      topHooks: [],
      failedAttempts: [],
    },
    automationSettings: {
      autoReplyDMs: false,
      autoPostTiming: "9am",
      autoSuggestContent: true,
    },
    createdAt: new Date(),
    lastUpdated: new Date(),
  };

  await setDoc(memoryRef, newMemory);
  return newMemory;
}

export async function updateUserMemory(
  userId: string,
  updates: Partial<UserMemory>
): Promise<void> {
  if (!db) return;
  
  const memoryRef = doc(db, "userMemory", userId);
  await updateDoc(memoryRef, {
    ...updates,
    lastUpdated: new Date(),
  });
}

export async function recordContentPerformance(
  userId: string,
  content: string,
  engagementRate: number
): Promise<void> {
  if (!db) return;
  
  const memoryRef = doc(db, "userMemory", userId);
  const memory = await getDoc(memoryRef);

  if (!memory.exists()) return;

  const currentMemory = memory.data() as UserMemory;
  const updatedPerformance = { ...currentMemory.historicalPerformance };

  if (engagementRate > updatedPerformance.averageEngagementRate) {
    updatedPerformance.bestPerformingCaption = content;
    updatedPerformance.averageEngagementRate = engagementRate;
  }

  await updateDoc(memoryRef, {
    historicalPerformance: updatedPerformance,
    lastUpdated: new Date(),
  });
}

export async function learnFromUserFeedback(
  userId: string,
  feedback: "good" | "bad" | "perfect",
  content: string
): Promise<void> {
  if (!db) return;
  
  const memoryRef = doc(db, "userMemory", userId);
  const memory = await getDoc(memoryRef);

  if (!memory.exists()) return;

  const currentMemory = memory.data() as UserMemory;

  if (feedback === "bad") {
    // Learn what doesn't work
    currentMemory.historicalPerformance.failedAttempts.push(content);
  } else if (feedback === "perfect") {
    // Learn what works best
    currentMemory.historicalPerformance.topHooks.push(
      content.substring(0, 100)
    );
  }

  await updateDoc(memoryRef, {
    historicalPerformance: currentMemory.historicalPerformance,
    lastUpdated: new Date(),
  });
}

export async function getUserMemory(userId: string): Promise<UserMemory | null> {
  if (!db) return null;
  
  const memoryRef = doc(db, "userMemory", userId);
  const docSnap = await getDoc(memoryRef);
  return docSnap.exists() ? (docSnap.data() as UserMemory) : null;
}
