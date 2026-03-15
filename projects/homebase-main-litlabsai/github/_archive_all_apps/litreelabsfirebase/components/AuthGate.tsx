"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import LitLabsAssistant from "./LitLabsAssistant";

export function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const authInstance = auth;
    const unsub = onAuthStateChanged(authInstance, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Authentication failed");
      setError(error.message || "Authentication failed");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );

  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-sm w-full space-y-6 bg-gray-900 p-8 rounded-lg border border-gray-800">
            <h1 className="text-2xl font-bold text-center">
              {mode === "login"
                ? "Login to LitLabs"
                : "Create LitLabs Account"}
            </h1>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-sm focus:border-pink-500 focus:outline-none transition"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-sm focus:border-pink-500 focus:outline-none transition"
                placeholder="Password (min 6 chars)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="w-full px-4 py-2 rounded bg-pink-500 text-sm font-semibold hover:bg-pink-600 transition"
                type="submit"
              >
                {mode === "login" ? "Login" : "Sign up"}
              </button>
            </form>

            <button
              className="text-xs text-gray-400 hover:text-gray-300 underline w-full text-center transition"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? "New here? Create an account"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
        <LitLabsAssistant />
      </>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <p className="text-sm text-gray-300">
          Logged in as{" "}
          <span className="font-semibold text-white">{user.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1 rounded border border-gray-600 hover:border-gray-400 transition"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
