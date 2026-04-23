"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function SecurityPage() {
  const router = useRouter();
  const changePassword = useAppStore((state) => state.changePassword);

  const [activeTab, setActiveTab] = useState<'passkeys' | '2fa' | 'password'>('passkeys');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage('');
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-10 px-8 pt-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Security Settings</h1>
          <p className="text-gray-400 mt-2">Manage your security preferences and authentication methods</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('passkeys')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'passkeys'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Passkeys
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === '2fa'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Two-Factor Auth
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>
        </div>

        {/* Passkeys Tab */}
        {activeTab === 'passkeys' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
            <h2 className="text-lg font-semibold text-white mb-2">Passkeys</h2>
            <p className="text-gray-400 text-sm">
              Passkey management is not available yet. This page now only shows implemented security features.
            </p>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
            <h2 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-400 text-sm">
              2FA setup is not available yet. This page now only shows implemented security features.
            </p>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
            <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <p className="text-gray-400 text-sm mt-2">At least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
