"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function DashboardShell() {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "daily_post" | "dm_script" | "promo" | "notes"
  >("daily_post");

  const callLitLabsAI = async (command: string) => {
    setLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setAiResponse(`Error: ${data.error}`);
      } else {
        const content = data.text || "No response from LitLabs AI";
        setAiResponse(content);

        // Save to Firestore if user is logged in
        if (auth?.currentUser && db) {
          try {
            await addDoc(
              collection(db, "users", auth.currentUser.uid, "contents"),
              {
                command,
                content,
                createdAt: Timestamp.now(),
                liked: false,
              }
            );
          } catch (firestoreErr) {
            console.error("Failed to save to history:", firestoreErr);
            // Don't fail the UI, just log the error
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to LitLabs Dashboard 🔥</h1>
        <p className="text-gray-400">
          Generate money-making content powered by your LitLabs AI brain.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-800">
        {[
          { id: "daily_post", label: "Daily Post", icon: "📱" },
          { id: "dm_script", label: "DM Script", icon: "💬" },
          { id: "promo", label: "Flash Promo", icon: "🎯" },
          { id: "notes", label: "Client Notes", icon: "📝" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as typeof activeTab)
            }
            className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-pink-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {activeTab === "daily_post" && (
            <>
              <button
                onClick={() => callLitLabsAI("/daily_post")}
                disabled={loading}
                className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Generate Daily Post 📱"}
              </button>
              <button
                onClick={() => callLitLabsAI("/weekly_pack")}
                disabled={loading}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Weekly Content Pack 📅"}
              </button>
            </>
          )}

          {activeTab === "dm_script" && (
            <>
              <button
                onClick={() => callLitLabsAI("/dm_cold")}
                disabled={loading}
                className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Cold DM 🆕"}
              </button>
              <button
                onClick={() => callLitLabsAI("/dm_followup")}
                disabled={loading}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Follow-up 🔄"}
              </button>
              <button
                onClick={() => callLitLabsAI("/dm_objection")}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Handle Objection 🎯"}
              </button>
            </>
          )}

          {activeTab === "promo" && (
            <>
              <button
                onClick={() => callLitLabsAI("/promo_flash")}
                disabled={loading}
                className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Flash Sale 🏃"}
              </button>
              <button
                onClick={() => callLitLabsAI("/promo_referral")}
                disabled={loading}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Referral Program 👥"}
              </button>
              <button
                onClick={() => callLitLabsAI("/promo_seasonal")}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Seasonal Pack 🎄"}
              </button>
            </>
          )}

          {activeTab === "notes" && (
            <>
              <button
                onClick={() => callLitLabsAI("/note_template")}
                disabled={loading}
                className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "New Note Template 📝"}
              </button>
              <button
                onClick={() => callLitLabsAI("/client_follow_up")}
                disabled={loading}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? "Generating..." : "Follow-up Ideas 💡"}
              </button>
            </>
          )}
        </div>

        {/* AI Response Area */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 min-h-[300px]">
          {aiResponse ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                LitLabs AI Response:
              </div>
              <div className="bg-gray-900 rounded p-4 whitespace-pre-wrap text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                {aiResponse}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiResponse);
                  alert("Copied to clipboard!");
                }}
                className="mt-4 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm font-medium transition"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">👈</p>
                <p>Click a button to generate content with LitLabs AI</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 pt-6 text-xs text-gray-500">
        <p>
          💡 Tip: Copy any response and paste it directly into Instagram,
          TikTok, or your messaging app.
        </p>
        <p>🔥 Powered by LitLabs AI | All responses are generated fresh</p>
      </div>
    </div>
  );
}
