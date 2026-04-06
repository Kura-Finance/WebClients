// src/components/ConnectAccountModal.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAppStore } from '@/store/useAppStore';

import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from 'react-plaid-link';
import {
  BackendApiError,
  createPlaidLinkToken,
  exchangePlaidPublicToken,
  loginUser,
  registerUser,
} from '@/lib/backendApi';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectAccountModal({ isOpen, onClose }: ConnectAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState<'plaid' | 'walletconnect' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isExchangingToken, setIsExchangingToken] = useState(false);

  const linkToken = useAppStore(state => state.plaidLinkToken);
  const setPlaidLinkToken = useAppStore(state => state.setPlaidLinkToken);
  const authToken = useAppStore(state => state.authToken);
  const setAuthToken = useAppStore(state => state.setAuthToken);
  const setUserEmail = useAppStore(state => state.setUserEmail);

  const { open: openWalletConnect } = useWeb3Modal();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchPlaidLinkToken = useCallback(
    async (token: string) => {
      try {
        setPlaidError(null);
        const result = await createPlaidLinkToken(token);
        setPlaidLinkToken(result.link_token);
      } catch (error) {
        const message = error instanceof BackendApiError ? error.message : 'Failed to get Plaid link token.';
        setPlaidError(message);
      }
    },
    [setPlaidLinkToken]
  );

  useEffect(() => {
    if (!isOpen || !authToken || linkToken) return;
    void fetchPlaidLinkToken(authToken);
  }, [authToken, fetchPlaidLinkToken, isOpen, linkToken]);

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
      setUserEmail(authResult.user.email);
      await fetchPlaidLinkToken(authResult.token);
    } catch (error) {
      const message = error instanceof BackendApiError ? error.message : 'Authentication failed.';
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const onPlaidSuccess = useCallback(
    async (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      if (!authToken) {
        setPlaidError('Please sign in before connecting a bank account.');
        return;
      }

      setIsExchangingToken(true);
      setPlaidError(null);

      try {
        const result = await exchangePlaidPublicToken(authToken, {
          public_token,
          institution_name: metadata.institution?.name,
        });

        alert(result.message || 'Bank account connected successfully.');
        onClose();
      } catch (error) {
        const message = error instanceof BackendApiError ? error.message : 'Failed to exchange Plaid token.';
        setPlaidError(message);
      } finally {
        setIsExchangingToken(false);
      }
    },
    [authToken, onClose]
  );

  const { open: openPlaid, ready: isPlaidReady } = usePlaidLink({
    token: linkToken || null,
    onSuccess: (publicToken, metadata) => {
      void onPlaidSuccess(publicToken, metadata);
    },
  });

  const handlePlaidConnect = async () => {
    setPlaidError(null);

    if (!authToken) {
      setPlaidError('Please log in or register first.');
      return;
    }

    setIsConnecting('plaid');

    if (!linkToken) {
      await fetchPlaidLinkToken(authToken);
      setIsConnecting(null);
      return;
    }

    if (isPlaidReady) {
      openPlaid();
      setIsConnecting(null);
      return;
    }

    setPlaidError('Plaid is still initializing. Please try again in a second.');
    setIsConnecting(null);
  };

  const handleWalletConnect = () => {
    setIsConnecting('walletconnect');
    onClose();
    setTimeout(() => {
      // Force connector selection instead of the default account view when already connected.
      openWalletConnect({ view: 'Connect' }).finally(() => {
        setIsConnecting(null);
      });
    }, 300);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Connect Account</h2>
                <p className="text-sm text-gray-400 mt-1">Select the type of account to link.</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1A1A24] flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 relative z-10">
              {!authToken && (
                <form onSubmit={handleAuthSubmit} className="mb-4 p-4 rounded-2xl bg-[#13131A] border border-white/10 space-y-3">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60"
                  />
                  <input
                    type="password"
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
              )}

              {authToken && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  Authenticated. You can now connect Plaid institutions.
                </div>
              )}

              {plaidError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {plaidError}
                </div>
              )}
              
              <button 
                onClick={handlePlaidConnect}
                disabled={isConnecting !== null || isAuthenticating || isExchangingToken}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group text-left ${
                  isConnecting === 'plaid' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-white/5 bg-[#1A1A24] hover:border-[#8B5CF6]/50 hover:bg-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Image src="https://www.google.com/s2/favicons?domain=plaid.com&sz=128" alt="Plaid" width={28} height={28} className="object-contain opacity-80" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-base mb-0.5 group-hover:text-[#A78BFA] transition-colors">Bank & Brokerage</div>
                  <div className="text-xs text-gray-500 line-clamp-2">Connect Robinhood, Fidelity, Chase, and other traditional financial institutions via Plaid.</div>
                </div>
                {isConnecting === 'plaid' ? (
                  <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="text-gray-600 group-hover:text-[#8B5CF6] transition-colors shrink-0">→</div>
                )}
              </button>

              <button 
                onClick={handleWalletConnect}
                disabled={isConnecting !== null || isAuthenticating || isExchangingToken}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group text-left ${
                  isConnecting === 'walletconnect' ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-white/5 bg-[#1A1A24] hover:border-[#3B82F6]/50 hover:bg-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#3B99FC] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 40" width="24" height="24" fill="white">
                    <path d="M12.26 11.26c4.27-4.14 11.2-4.14 15.47 0l.48.46c.38.36.38.96 0 1.33l-2.07 2a.94.94 0 0 1-1.33 0l-.58-.56a6.83 6.83 0 0 0-9.45 0l-.56.54a.95.95 0 0 1-1.34 0l-2.07-2a.94.94 0 0 1 0-1.32l1.45-1.45zm19.8 8.65l1.96 1.9a.94.94 0 0 1 0 1.32l-9.15 8.87a.95.95 0 0 1-1.34 0l-3.53-3.42a1.9 1.9 0 0 0-2.67 0l-3.53 3.42a.95.95 0 0 1-1.34 0l-9.15-8.87a.94.94 0 0 1 0-1.32l1.95-1.9a.95.95 0 0 1 1.34 0l6.23 6.03c.74.72 1.94.72 2.68 0l3.52-3.41a1.9 1.9 0 0 1 2.68 0l3.52 3.4a.95.95 0 0 0 1.34 0l6.24-6.03a.94.94 0 0 1 1.32 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-base mb-0.5 group-hover:text-[#3B82F6] transition-colors">Web3 Wallet</div>
                  <div className="text-xs text-gray-500 line-clamp-2">Connect Metamask, Phantom, Trust Wallet, and 100+ decentralized wallets via WalletConnect.</div>
                </div>
                {isConnecting === 'walletconnect' ? (
                  <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="text-gray-600 group-hover:text-[#3B82F6] transition-colors shrink-0">→</div>
                )}
              </button>

            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 blur-3xl rounded-full pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}