"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type User = {
  uid: string;
  email?: string;
  businessName?: string;
  name?: string;
  city?: string;
  services?: string;
  tier?: string;
  status?: string;
  createdAt?: string;
  bannedReason?: string;
};

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "pro">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      if (!db) return;
      
      const snap = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      
      snap.forEach((doc) => {
        usersList.push({
          uid: doc.id,
          ...doc.data(),
        } as User);
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (
    uid: string,
    action: string,
    tier?: string,
    reason?: string
  ) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action, tier, reason }),
      });

      if (response.ok) {
        alert(`✅ Action completed: ${action}`);
        await loadUsers();
        setSelectedUser(null);
      } else {
        alert("❌ Action failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error performing action");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && user.status === "active") ||
      (filter === "suspended" && user.status === "suspended") ||
      (filter === "pro" && (user.tier === "pro" || user.tier === "enterprise"));

    const matchesSearch =
      !searchTerm ||
      user.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-950/40 to-slate-950/40 border border-blue-700/50 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-blue-400 mb-1">All Users</p>
          <p className="text-2xl font-black text-blue-200">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950/40 border border-emerald-700/50 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-400 mb-1">Active</p>
          <p className="text-2xl font-black text-emerald-200">
            {users.filter((u) => u.status !== "suspended").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-950/40 to-slate-950/40 border border-purple-700/50 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-purple-400 mb-1">Suspended</p>
          <p className="text-2xl font-black text-purple-200">
            {users.filter((u) => u.status === "suspended").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-950/40 to-slate-950/40 border border-pink-700/50 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-pink-400 mb-1">Premium</p>
          <p className="text-2xl font-black text-pink-200">
            {users.filter((u) => u.tier === "pro" || u.tier === "enterprise").length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, business, or UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-pink-500 focus:outline-none"
        />
        <div className="flex gap-2">
          {(["all", "active", "suspended", "pro"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/50"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">
                  Business / Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">
                  Email / UID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">
                  Tier
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-slate-700 hover:bg-slate-800/30 transition"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">
                          {user.businessName || "(No business)"}
                        </p>
                        <p className="text-xs text-slate-400">{user.name || "-"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <p className="font-mono">{user.uid.substring(0, 20)}...</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.city || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          user.tier === "enterprise"
                            ? "bg-purple-500/30 text-purple-300"
                            : user.tier === "pro"
                              ? "bg-pink-500/30 text-pink-300"
                              : "bg-slate-600/30 text-slate-300"
                        }`}
                      >
                        {user.tier || "free"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          user.status === "suspended"
                            ? "bg-red-500/30 text-red-300"
                            : "bg-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedUser.businessName}
              </h3>
              <p className="text-sm text-slate-400">{selectedUser.uid}</p>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Email:</span> {selectedUser.email || "-"}
              </p>
              <p>
                <span className="text-slate-500">Owner:</span> {selectedUser.name || "-"}
              </p>
              <p>
                <span className="text-slate-500">Status:</span> {selectedUser.status}
              </p>
              <p>
                <span className="text-slate-500">Tier:</span> {selectedUser.tier}
              </p>
            </div>

            {/* Tier Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-semibold">Set Tier:</p>
              <div className="flex gap-2">
                {(["free", "pro", "enterprise"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      performAction(selectedUser.uid, "setTier", t)
                    }
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Ban/Unban Buttons */}
            <div className="flex gap-2">
              {selectedUser.status === "suspended" ? (
                <button
                  onClick={() =>
                    performAction(selectedUser.uid, "unban")
                  }
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 font-semibold transition disabled:opacity-50"
                >
                  ✅ Unban User
                </button>
              ) : (
                <button
                  onClick={() => {
                    const reason = prompt("Ban reason (optional):");
                    performAction(selectedUser.uid, "ban", undefined, reason || "");
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300 font-semibold transition disabled:opacity-50"
                >
                  🚫 Ban User
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
