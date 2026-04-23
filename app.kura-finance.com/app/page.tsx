"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AuthApiError } from '@/lib/authApi';
import { zkLogin, zkRegister, zkLoginLegacy } from '@/lib/crypto/zkAuth';

export default function RootHubPage() {
  const authStatus = useAppStore((state) => state.authStatus);
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const setPlaidLinkToken = useAppStore((state) => state.setPlaidLinkToken);
  const hydrateUserProfile = useAppStore((state) => state.hydrateUserProfile);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.push('/dashboard');
    }
  }, [authStatus, router]);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        // 建立帳號並在背景設定 SRP
        await zkRegister(email.trim(), password);
      } else {
        // 嘗試 SRP 零知識登入；若帳號尚未升級則 fallback 至舊版（並自動背景升級）
        try {
          await zkLogin(email.trim(), password);
        } catch (srpError) {
          // SRP not set up yet for this account → use legacy path
          const msg = srpError instanceof Error ? srpError.message : '';
          const isNotSetup = msg.includes('SRP not configured');
          if (isNotSetup) {
            await zkLoginLegacy(email.trim(), password);
          } else {
            throw srpError;
          }
        }
      }

      setPlaidLinkToken(null);
      await hydrateUserProfile();
    } catch (error) {
      const message = error instanceof AuthApiError ? error.message : 'Authentication failed.';
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show loading state
  if (authStatus === 'loading') {
    return (
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if unauthenticated
  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">Kura Finance</h1>
            <p className="text-sm text-gray-400 mb-8">
              Manage all your finances in one place
            </p>
            
            <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
              {/* Mode Switcher */}
              <div className="flex items-center gap-2 text-xs bg-[#1A1A24] p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                    authMode === 'login'
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                    authMode === 'register'
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Email Input */}
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
              />

              {/* Password Input */}
              <input
                type="password"
                name={authMode === 'register' ? 'new-password' : 'current-password'}
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
              />

              {/* Error Message */}
              {authError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#A78BFA] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {isAuthenticating ? 'Processing...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}