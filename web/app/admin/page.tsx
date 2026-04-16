'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, adminLoginWithSecretKey, AdminAuthError } from '@/lib/admin/adminAuth';

export default function AdminPage() {
  const router = useRouter();
  const [isSecretKeyMode, setIsSecretKeyMode] = useState(false);
  
  // Email/Password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  
  // Secret Key form state
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState<string | null>(null);
  const [isSecretKeySubmitting, setIsSecretKeySubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setIsEmailSubmitting(true);

    try {
      if (!email || !password) {
        setEmailError('Please enter both email and password');
        setIsEmailSubmitting(false);
        return;
      }

      await adminLogin(email.trim(), password);
      setEmail('');
      setPassword('');
      router.push('/admin/users');
    } catch (err) {
      setIsEmailSubmitting(false);
      if (err instanceof AdminAuthError) {
        setEmailError(err.message || 'Authentication failed');
      } else if (err instanceof Error) {
        setEmailError(err.message || 'An error occurred during login. Please try again.');
      } else {
        setEmailError('An error occurred during login. Please try again.');
      }
      console.error('Login error:', err);
    }
  };

  const handleSecretKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSecretKeyError(null);
    setIsSecretKeySubmitting(true);

    try {
      if (!secretKey) {
        setSecretKeyError('Please enter a secret key');
        setIsSecretKeySubmitting(false);
        return;
      }

      // Secret Key 不存储在 localStorage，直接传给后端验证
      await adminLoginWithSecretKey(secretKey);
      setSecretKey('');
      router.push('/admin/admin');
    } catch (err) {
      setIsSecretKeySubmitting(false);
      if (err instanceof AdminAuthError) {
        setSecretKeyError(err.message || 'Secret key authentication failed');
      } else if (err instanceof Error) {
        setSecretKeyError(err.message || 'An error occurred during authentication. Please try again.');
      } else {
        setSecretKeyError('An error occurred during authentication. Please try again.');
      }
      console.error('Secret key login error:', err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0B0B0F] via-[#1A1A24] to-[#0B0B0F] flex items-center justify-center">
      <div
        className="w-full max-w-md rounded-2xl border border-[#2D2D3D]/50 bg-gradient-to-br from-[#1A1A24]/80 to-[#0B0B0F]/80 backdrop-blur-xl p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">
            {isSecretKeyMode ? 'Sign in with secret key' : 'Sign in to access the admin dashboard'}
          </p>
        </div>

        {!isSecretKeyMode ? (
          <>
            {/* Email/Password Mode */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isEmailSubmitting}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isEmailSubmitting}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
                />
              </div>

              {emailError && (
                <div
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                >
                  {emailError}
                </div>
              )}

              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isEmailSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsSecretKeyMode(true)}
              className="w-full py-2 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors mt-3"
            >
              🔐 Switch to Sign in with Secret Key
            </button>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
              <p className="font-semibold mb-1">Demo Credentials</p>
              <p>Please use your backend credentials to sign in</p>
            </div>
          </>
        ) : (
          <>
            {/* Secret Key Mode */}
            <form onSubmit={handleSecretKeySubmit} className="space-y-4">
              <div>
                <label htmlFor="secretKey" className="block text-sm font-medium text-gray-300 mb-2">
                  Secret Key
                </label>
                <input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your secret key"
                  disabled={isSecretKeySubmitting}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
                />
              </div>

              {secretKeyError && (
                <div
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                >
                  {secretKeyError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSecretKeySubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSecretKeySubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setIsSecretKeyMode(false);
                setSecretKey('');
                setSecretKeyError(null);
              }}
              className="w-full py-2 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors mt-3"
            >
              ← Back to Email/Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
