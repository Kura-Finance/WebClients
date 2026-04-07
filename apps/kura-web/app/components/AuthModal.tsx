"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { BackendApiError, loginUser, registerUser } from '@/lib/backendApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: () => void;
}

export default function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const setAuthToken = useAppStore((state) => state.setAuthToken);
  const setPlaidLinkToken = useAppStore((state) => state.setPlaidLinkToken);
  const hydrateUserProfile = useAppStore((state) => state.hydrateUserProfile);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const authResult =
        authMode === 'register'
          ? await registerUser(email.trim(), password)
          : await loginUser(email.trim(), password);

      setAuthToken(authResult.token);
      setPlaidLinkToken(null);
      await hydrateUserProfile();
      onAuthenticated?.();
      onClose();
    } catch (error) {
      const message = error instanceof BackendApiError ? error.message : 'Authentication failed.';
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Account Login</h2>
                <p className="text-sm text-gray-400 mt-1">Sign in or create an account before connecting institutions.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1A1A24] flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleAuthSubmit} className="p-4 rounded-2xl bg-[#13131A] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`px-3 py-1.5 rounded-full border ${
                      authMode === 'login'
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`px-3 py-1.5 rounded-full border ${
                      authMode === 'register'
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60"
                />
                <input
                  type="password"
                  name={authMode === 'register' ? 'new-password' : 'current-password'}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60"
                />

                {authError && <p className="text-xs text-red-400">{authError}</p>}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C4B5FD] text-sm font-semibold hover:bg-[#8B5CF6]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isAuthenticating ? 'Processing...' : authMode === 'register' ? 'Create account' : 'Sign in'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
