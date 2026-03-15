'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

type User = {
  uid: string;
  email: string;
  displayName: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: { toDate?: () => Date } | string | number | null;
  totalPosts: number;
  postsThisMonth: number;
  referralCode: string;
  referralCount: number;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  useEffect(() => {
    const authInstance = auth;
    if (!authInstance) {
      router.push('/auth');
      return;
    }

    const unsub = onAuthStateChanged(authInstance, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      // Verify admin status via API route
      const res = await fetch('/api/verify-admin', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!res.ok) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      trackEvent('admin_users_view', { uid: user.uid });
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  function applyFilters(
    usersList: User[],
    search: string,
    tier: string,
    status: string
  ) {
    let filtered = usersList;

    if (search) {
      filtered = filtered.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase()));
    }

    if (tier !== 'all') {
      filtered = filtered.filter((u) => u.tier === tier);
    }

    if (status !== 'all') {
      filtered = filtered.filter((u) => u.status === status);
    }

    setFilteredUsers(filtered);
  }

  useEffect(() => {
    const authInstance = auth;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!authInstance) {
      router.push('/auth');
      return;
    }

    const unsub = onAuthStateChanged(authInstance, async (user) => {
      if (!user || (adminEmail && user.email !== adminEmail)) {
        router.push('/auth');
        return;
      }

      setIsAdmin(true);
      trackEvent('admin_users_view', { uid: user.uid });

      // Real-time users
      const dbInstance = db;
      if (!dbInstance) return;
      const usersQuery = query(collection(dbInstance, 'users'));
      const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((doc) => {
          usersList.push({
              uid: doc.id,
              ...(doc.data() as Record<string, unknown>),
            } as User);
        });

        setUsers(usersList);
        applyFilters(usersList, searchTerm, filterTier, filterStatus);
      });

      setLoading(false);

      return () => unsubUsers();
    });

    return () => unsub();
  }, [router, searchTerm, filterTier, filterStatus]);

  

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(users, value, filterTier, filterStatus);
  };

  const handleTierFilter = (value: string) => {
    setFilterTier(value as 'all' | 'free' | 'pro' | 'enterprise');
    applyFilters(users, searchTerm, value, filterStatus);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value as 'all' | 'active' | 'suspended');
    applyFilters(users, searchTerm, filterTier, value);
  };

  const upgradeTier = async (uid: string, newTier: 'pro' | 'enterprise') => {
    try {
      const dbRef = db;
      if (!dbRef) {
        console.error('Firestore not initialized');
        return;
      }
      await updateDoc(doc(dbRef, 'users', uid), { tier: newTier });
      trackEvent('admin_upgrade_user', { uid, newTier });
      alert(`✅ User upgraded to ${newTier}`);
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('❌ Failed to upgrade user');
    }
  };

  const toggleSuspension = async (uid: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const dbRef = db;
      if (!dbRef) {
        console.error('Firestore not initialized');
        return;
      }
      await updateDoc(doc(dbRef, 'users', uid), { status: newStatus });
      trackEvent('admin_toggle_user_suspension', { uid, newStatus });
      alert(`✅ User ${newStatus}`);
    } catch (error) {
      console.error('Error toggling suspension:', error);
      alert('❌ Failed to update user status');
    }
  };

  const deleteUser = async (uid: string, email: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete ${email}? This cannot be undone.`)) return;

    try {
      const dbRef = db;
      if (!dbRef) {
        console.error('Firestore not initialized');
        return;
      }
      await deleteDoc(doc(dbRef, 'users', uid));
      trackEvent('admin_delete_user', { uid });
      alert(`✅ User deleted`);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Unauthorized access</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">👥 User Management</h1>
          <p className="text-white/60">Manage user accounts, tiers, and subscriptions</p>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Email or name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tier Filter */}
            <div>
              <label htmlFor="filter-tier" className="block text-white/60 text-sm font-medium mb-2">Tier</label>
              <select
                id="filter-tier"
                aria-label="Filter users by tier"
                value={filterTier}
                onChange={(e) => handleTierFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="filter-status" className="block text-white/60 text-sm font-medium mb-2">Status</label>
              <select
                id="filter-status"
                aria-label="Filter users by status"
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Results Count */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Results</label>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-semibold">
                {filteredUsers.length} of {users.length}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Email</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Name</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Tier</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Posts</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Joined</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Referrals</th>
                  <th className="px-6 py-4 text-left text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/80 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-white/80 text-sm">{user.displayName || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.tier === 'free'
                              ? 'bg-blue-500/20 text-blue-400'
                              : user.tier === 'pro'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {user.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {user.postsThisMonth || 0} / {user.totalPosts || 0}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">{user.referralCount || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.tier !== 'pro' && (
                            <button
                              onClick={() => upgradeTier(user.uid, 'pro')}
                              className="px-3 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                            >
                              → Pro
                            </button>
                          )}
                          {user.tier !== 'enterprise' && (
                            <button
                              onClick={() => upgradeTier(user.uid, 'enterprise')}
                              className="px-3 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                            >
                              → Ent.
                            </button>
                          )}
                          <button
                            onClick={() => toggleSuspension(user.uid, user.status)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              user.status === 'active'
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.uid, user.email)}
                            className="px-3 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-white/40 text-sm">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function formatDate(value?: { toDate?: () => Date } | string | number | null) {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  return new Date(value as string | number | Date).toLocaleDateString();
}
