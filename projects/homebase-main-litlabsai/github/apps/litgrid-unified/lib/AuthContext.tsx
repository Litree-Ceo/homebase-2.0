"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date | string | number | null;
  tier: "free" | "pro" | "enterprise";
  subscription: {
    plan: string;
    status: "active" | "inactive" | "suspended";
    createdAt: Date | string | number | null;
    endsAt: Date | string | number | null;
  };
  stripeCustomerId: string | null;
  postsGenerated: number;
  dmsHandled: number;
  clientsBooked: number;
  lastActivityAt: Date | string | number | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase isn't configured on the client, avoid calling SDK methods
    if (!auth || !db) {
      setLoading(false);
      setError("Firebase not configured on client. Set NEXT_PUBLIC_FIREBASE_* env vars to enable auth.");
      return;
    }

    const authInstance = auth;
    const dbInstance = db;

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Fetch user data from Firestore
          const userDocRef = doc(dbInstance, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserData;
            setUserData(data);
          } else {
            // Create new user doc if doesn't exist
            const newUserData: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
              tier: "free",
              subscription: {
                plan: "free",
                status: "inactive",
                createdAt: new Date(),
                endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days free trial
              },
              stripeCustomerId: null,
              postsGenerated: 0,
              dmsHandled: 0,
              clientsBooked: 0,
              lastActivityAt: new Date(),
              role: "user",
            };

            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setError(null);
      } catch (err) {
        console.error("Auth state change error:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user || !db) throw new Error("No user logged in or db unavailable");

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...data,
        lastActivityAt: new Date(),
      });

      // Update local state
      setUserData((prev) => prev ? { ...prev, ...data, lastActivityAt: new Date() } : null);
    } catch (err) {
      console.error("Update user data error:", err);
      setError(err instanceof Error ? err.message : "Update failed");
      throw err;
    }
  };

  const isAdmin = userData?.role === "admin" || userData?.uid === process.env.NEXT_PUBLIC_ADMIN_UID;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        isAdmin,
        signOut,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
