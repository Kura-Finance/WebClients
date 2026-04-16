'use client';

import React, { useState, useEffect } from 'react';
import { getStoredAdminToken } from '@/lib/admin/adminAuth';
import {
  getAllUsers,
  deleteUser,
  updateUserTier,
  User,
  AdminApiErrorClass,
} from '@/lib/admin/adminApi';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newTier, setNewTier] = useState<'Basic' | 'Pro' | 'Ultimate' | 'VIP'>('Basic');
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = getStoredAdminToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await getAllUsers(token, 10, currentPage * 10);
      setUsers(response.users);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof AdminApiErrorClass) {
        setError(err.message || 'Failed to fetch users');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = getStoredAdminToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      await deleteUser(token, userId);
      setUsers(users.filter((u) => u.id !== userId));
      setError(null);
    } catch (err: unknown) {
      if (err instanceof AdminApiErrorClass) {
        setError(err.message);
      } else {
        setError('Failed to delete user');
      }
      console.error('Error deleting user:', err);
    }
  };

  const handleUpdateTier = async () => {
    if (!selectedUserId) return;

    try {
      setIsUpdating(true);
      const token = getStoredAdminToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      await updateUserTier(token, selectedUserId, { tier: newTier });
      
      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUserId ? { ...u, tier: newTier } : u
        )
      );
      
      setSelectedUserId(null);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof AdminApiErrorClass) {
        setError(err.message);
      } else {
        setError('Failed to update tier');
      }
      console.error('Error updating tier:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View and manage all users in the system</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
        <button
          onClick={fetchUsers}
          className="px-6 py-2 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl border border-[#2D2D3D]/50 bg-gradient-to-br from-[#1A1A24]/80 to-[#0B0B0F]/80 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D2D3D]/50 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#2D2D3D]/30 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.displayName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] text-xs font-medium">
                        {user.tier || 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setNewTier(user.tier as 'Basic' | 'Pro' | 'Ultimate' | 'VIP' || 'Basic');
                          }}
                          className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors text-xs font-medium"
                        >
                          Change Tier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-4 py-2 rounded-lg bg-[#8B5CF6]/20 text-[#A78BFA] hover:bg-[#8B5CF6]/30 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          Previous
        </button>
        <span className="text-gray-400">Page {currentPage + 1}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={filteredUsers.length < 10}
          className="px-4 py-2 rounded-lg bg-[#8B5CF6]/20 text-[#A78BFA] hover:bg-[#8B5CF6]/30 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          Next
        </button>
      </div>

      {/* Change Tier Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-[#2D2D3D]/50 bg-gradient-to-br from-[#1A1A24]/95 to-[#0B0B0F]/95 backdrop-blur-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Change User Tier</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select New Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as 'Basic' | 'Pro' | 'Ultimate' | 'VIP')}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              >
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Ultimate">Ultimate</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUserId(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTier}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#A78BFA] disabled:opacity-50 transition-colors font-medium"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
