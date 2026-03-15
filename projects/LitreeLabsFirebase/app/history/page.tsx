"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";

interface ContentItem {
  id: string;
  command: string;
  content: string;
  createdAt: Date;
  liked: boolean;
}

const COMMAND_NAMES: Record<string, string> = {
  "/daily_post": "Daily Post",
  "/weekly_pack": "Weekly Content Pack",
  "/dm_cold": "Cold DM",
  "/dm_followup": "Follow-up DM",
  "/dm_objection": "Objection Handling",
  "/promo_flash": "Flash Sale Promo",
  "/promo_referral": "Referral Promo",
  "/promo_seasonal": "Seasonal Promo",
  "/note_template": "Client Note",
  "/client_follow_up": "Client Follow-up",
};

export default function HistoryPage() {
  const router = useRouter();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const authInstance = auth;
    const dbInstance = db;

    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        // Query Firestore for user's content history
        const q = query(
          collection(dbInstance, "users", user.uid, "contents"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const items: ContentItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          command: doc.data().command,
          content: doc.data().content,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          liked: doc.data().liked || false,
        }));

        setContents(items);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (contentId: string) => {
    if (!auth?.currentUser || !db) return;

    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "contents", contentId)
      );
      setContents((prev) => prev.filter((item) => item.id !== contentId));
    } catch (err) {
      console.error("Error deleting content:", err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const filteredContents = contents
    .filter((item) => !filter || item.command === filter)
    .filter((item) =>
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Content History</h1>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <select
              aria-label="Filter by content type"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(COMMAND_NAMES).map(([cmd, name]) => (
                <option key={cmd} value={cmd}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-400">
            {filteredContents.length} item{filteredContents.length !== 1 ? "s" : ""}
            {filter && ` of type "${COMMAND_NAMES[filter]}"`}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="text-slate-400 py-8 text-center">Loading...</div>
        ) : filteredContents.length === 0 ? (
          <div className="text-slate-400 py-8 text-center">
            {contents.length === 0
              ? "No content generated yet. Start creating!"
              : "No content matches your filters."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContents.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-cyan-400 font-semibold">
                      {COMMAND_NAMES[item.command] || item.command}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.createdAt.toLocaleDateString()} at{" "}
                      {item.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(item.content)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 rounded text-sm text-red-400 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50 max-h-40 overflow-y-auto">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Option */}
        {filteredContents.length > 0 && (
          <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-slate-300 mb-3">Export all content</p>
            <button
              onClick={() => {
                const csv = filteredContents
                  .map(
                    (item) =>
                      `"${item.command}","${item.createdAt.toISOString()}","${item.content.replace(/"/g, '""')}"`
                  )
                  .join("\n");

                const element = document.createElement("a");
                element.setAttribute(
                  "href",
                  "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
                );
                element.setAttribute("download", "litlabs-content-history.csv");
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white"
            >
              📥 Export as CSV
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
