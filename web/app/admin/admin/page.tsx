'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout } from '@/lib/admin/adminAuth';

interface Admin {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AdminsResponse {
  admins: Admin[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminListPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  
  // Add admin modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch admins list
  const fetchAdmins = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(query && { search: query }),
      });

      const response = await fetch(`/api/admin/admins?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/admin');
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch admins');
      }

      const data: AdminsResponse = await response.json();
      setAdmins(data.admins);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  }, [router, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchAdmins(1, '');
  }, [fetchAdmins]);

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdmins(1, searchQuery);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAdmins(newPage, searchQuery);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await adminLogout();
      router.push('/admin');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/admin');
    }
  };

  // Handle add admin
  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      setAddError('Email is required');
      return;
    }
    
    if (!newAdminEmail.includes('@')) {
      setAddError('Please enter a valid email');
      return;
    }
    
    if (!newAdminPassword.trim()) {
      setAddError('Password is required');
      return;
    }
    
    if (newAdminPassword.length < 6) {
      setAddError('Password must be at least 6 characters');
      return;
    }
    
    setAddingAdmin(true);
    setAddError(null);
    
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          name: newAdminName || undefined,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to add admin');
      }
      
      // Reset form
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setShowAddModal(false);
      
      // Refresh list
      fetchAdmins(1, '');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this administrator?')) {
      return;
    }
    
    setDeletingId(adminId);
    
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to delete admin');
      }
      
      // Refresh list
      fetchAdmins(currentPage, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
      console.error('Delete admin error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0B0B0F] via-[#1A1A24] to-[#0B0B0F]">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-[#2D2D3D]/50 bg-gradient-to-br from-[#1A1A24]/95 to-[#0B0B0F]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage system administrators</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddModal(true);
                setAddError(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors"
            >
              + Add Admin
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 font-semibold hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admins by email or name..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  fetchAdmins(1, '');
                }}
                className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-400">
          Found <span className="text-white font-semibold">{total}</span> administrator
          {total !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Admins Table */}
        <div className="rounded-xl border border-[#2D2D3D]/50 bg-gradient-to-br from-[#1A1A24]/80 to-[#0B0B0F]/80 backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              <p className="mt-3">Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg">No administrators found</p>
              {searchQuery && <p className="text-sm mt-2">Try adjusting your search criteria</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2D3D]/50 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created At</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className={`border-b border-[#2D2D3D]/30 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-white/2'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-white">{admin.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{admin.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <button
                            disabled={deletingId === admin.id}
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-400 hover:text-red-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === admin.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
          <p>Page {currentPage} of {totalPages || 1}</p>
          <p className="text-xs mt-1 text-blue-400">Showing {admins.length} of {total} administrators</p>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0B0B0F] border border-[#2D2D3D]/50 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Administrator</h2>
            
            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {addError}
              </div>
            )}
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  disabled={addingAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  disabled={addingAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  disabled={addingAdmin}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingAdmin ? 'Adding...' : 'Add Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                    setNewAdminName('');
                    setAddError(null);
                  }}
                  disabled={addingAdmin}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
