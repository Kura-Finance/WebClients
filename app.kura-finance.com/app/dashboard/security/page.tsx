"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function SecurityPage() {
  const router = useRouter();
  useAppStore();

  const [activeTab, setActiveTab] = useState<'passkeys' | '2fa' | 'password'>('passkeys');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Passkeys state
  const [passkeys, setPasskeys] = useState<Array<{ id: string; name: string; createdAt: string }>>([
    { id: '1', name: 'My MacBook', createdAt: '2024-01-15' },
  ]);
  const [passkeyName, setPasskeyName] = useState('');

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAddPasskey = async () => {
    if (!passkeyName.trim()) {
      setErrorMessage('Please enter a passkey name');
      return;
    }
    try {
      setIsLoading(true);
      // TODO: Implement passkey creation via WebAuthn
      const newPasskey = {
        id: Date.now().toString(),
        name: passkeyName,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPasskeys([...passkeys, newPasskey]);
      setPasskeyName('');
      setSuccessMessage('Passkey added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Failed to add passkey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePasskey = (id: string) => {
    setPasskeys(passkeys.filter((pk) => pk.id !== id));
    setSuccessMessage('Passkey removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement 2FA setup
      setTwoFactorEnabled(true);
      setBackupCodes([
        'XXXX-XXXX-XXXX',
        'YYYY-YYYY-YYYY',
        'ZZZZ-ZZZZ-ZZZZ',
        'AAAA-AAAA-AAAA',
      ]);
      setShowBackupCodes(true);
      setSuccessMessage('Two-factor authentication enabled!');
    } catch {
      setErrorMessage('Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement 2FA disable
      setTwoFactorEnabled(false);
      setBackupCodes([]);
      setShowBackupCodes(false);
      setSuccessMessage('Two-factor authentication disabled!');
    } catch {
      setErrorMessage('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields');
      return;
    }
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
      // TODO: Implement password change via API
      setCurrentPassword('');
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
          <div>
            <div className="mb-8 p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
              <h2 className="text-lg font-semibold text-white mb-2">Add New Passkey</h2>
              <p className="text-gray-400 text-sm mb-4">Passkeys are a passwordless way to sign in securely</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="e.g., My iPhone"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <button
                  onClick={handleAddPasskey}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Passkey'}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
              <h3 className="text-lg font-semibold text-white mb-4">Your Passkeys</h3>
              {passkeys.length === 0 ? (
                <p className="text-gray-400 text-sm">No passkeys registered yet</p>
              ) : (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div key={passkey.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                      <div>
                        <p className="text-white font-medium">{passkey.name}</p>
                        <p className="text-gray-400 text-sm">Added {passkey.createdAt}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePasskey(passkey.id)}
                        className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <div>
            <div className="mb-8 p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                  <p className="text-gray-400 text-sm mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    twoFactorEnabled
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className={twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {twoFactorEnabled && showBackupCodes && (
              <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
                <h3 className="text-lg font-semibold text-white mb-4">Backup Codes</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator.
                </p>
                <div className="bg-black/30 p-4 rounded-lg mb-4 font-mono text-sm text-gray-300 space-y-2">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
                <button className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium">
                  Copy Codes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0B0B0F]">
            <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
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
                    setCurrentPassword('');
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
