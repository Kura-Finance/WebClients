// src/components/ConnectAccountModal.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useConnect } from 'wagmi';
import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from 'react-plaid-link';
import { usePlaidReady } from '@/context/PlaidProvider';
import {
  PlaidApiError,
  createPlaidLinkToken,
  exchangePlaidPublicToken,
} from '@/lib/plaidApi';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlaidLinkError {
  display_message?: string;
  error_code?: string;
  error_message?: string;
}

/**
 * Inner modal content component - only rendered when Plaid is ready
 */
function ConnectAccountModalContent({
  isOpen,
  onClose,
  linkToken,
}: ConnectAccountModalProps & { linkToken: string | null }) {
  const [isConnecting, setIsConnecting] = useState<'plaid' | 'reown' | null>(null);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [isExchangingToken, setIsExchangingToken] = useState(false);

  const authToken = useAppStore((state) => state.authToken);
  const setPlaidLinkToken = useAppStore((state) => state.setPlaidLinkToken);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const { connectAsync, connectors } = useConnect();

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      if (!authToken) {
        setPlaidError('Please sign in before connecting a bank account.');
        return;
      }

      setIsExchangingToken(true);
      setPlaidError(null);

      try {
        console.debug('[ConnectAccountModal] Exchanging Plaid public token', {
          institution: metadata.institution?.name,
        });

        const result = await exchangePlaidPublicToken({
          public_token: publicToken,
          institution_name: metadata.institution?.name,
        });

        console.info('[ConnectAccountModal] Public token exchanged successfully');

        // Load updated finance data
        try {
          await hydratePlaidFinanceData();
          console.info('[ConnectAccountModal] Finance data reloaded');
        } catch (reloadError) {
          // If reload fails, still consider exchange successful - user can refresh manually
          console.warn('[ConnectAccountModal] Finance data reload failed, but exchange succeeded', reloadError);
        }

        alert(result.message || 'Bank account connected successfully.');
        onClose();
      } catch (error) {
        let message = 'Failed to connect bank account.';

        if (error instanceof PlaidApiError) {
          switch (error.status) {
            case 401:
              message = 'Your session expired. Please sign in again and try connecting your account.';
              break;
            case 429:
              message = 'Too many connection attempts. Please wait a moment and try again.';
              break;
            case 400:
              message = error.errorCode === 'INVALID_REQUEST' 
                ? 'Invalid bank credentials. Please verify and try again.'
                : 'Invalid request. Please try again.';
              break;
            case 500:
            case 502:
            case 503:
              message = 'Server error. Please try again in a few moments.';
              break;
            default:
              message = error.message;
          }
        }

        setPlaidError(message);
        console.error('[ConnectAccountModal] Token exchange failed:', { error, message });
      } finally {
        setIsExchangingToken(false);
      }
    },
    [authToken, hydratePlaidFinanceData, onClose]
  );

  // Initialize Plaid Link hook - this will work because we only render this component when Plaid is ready
  const { open: openPlaid, ready: isPlaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (error: PlaidLinkError | null) => {
      if (error) {
        const errorMessage = error.display_message || error.error_message || 'Plaid error occurred';
        setPlaidError(errorMessage);
        console.error('[ConnectAccountModal] Plaid exited with error:', error);
      }
    },
  });

  const fetchPlaidLinkToken = useCallback(
    async () => {
      try {
        setPlaidError(null);
        console.debug('[ConnectAccountModal] Requesting Plaid link token');

        const result = await createPlaidLinkToken();
        
        if (!result.link_token) {
          throw new PlaidApiError('Server did not return a link token', 500);
        }

        setPlaidLinkToken(result.link_token);
        console.info('[ConnectAccountModal] Link token received');
      } catch (error) {
        let message = 'Failed to initialize Plaid. Please try again.';

        if (error instanceof PlaidApiError) {
          switch (error.status) {
            case 401:
              message = 'Your session expired. Please sign in again.';
              break;
            case 429:
              message = 'Too many attempts. Please wait and try again.';
              break;
            case 500:
            case 502:
            case 503:
              message = 'Plaid service temporarily unavailable. Please try again later.';
              break;
            default:
              message = error.message;
          }
        } else if (error instanceof Error && error.message.includes('NetworkError')) {
          message = 'Network error. Please check your connection and try again.';
        }

        setPlaidError(message);
        console.error('[ConnectAccountModal] Failed to fetch link token:', { error, message });
      }
    },
    [setPlaidLinkToken]
  );

  useEffect(() => {
    if (!isOpen || linkToken) return;
    void fetchPlaidLinkToken();
  }, [fetchPlaidLinkToken, isOpen, linkToken]);

  const handlePlaidConnect = async () => {
    setPlaidError(null);

    if (!authToken) {
      setPlaidError('Please sign in first to connect a bank account.');
      return;
    }

    setIsConnecting('plaid');

    try {
      // Fetch token if needed
      if (!linkToken) {
        console.debug('[ConnectAccountModal] Fetching link token');
        await fetchPlaidLinkToken();

        // Re-check if token was successfully fetched
        if (!linkToken) {
          setPlaidError('Failed to load Plaid Link. Please check your connection and try again.');
          return;
        }
      }

      // Check if Plaid SDK is ready
      if (!isPlaidReady) {
        setPlaidError('Plaid is still initializing. Please wait and try again.');
        console.warn('[ConnectAccountModal] Plaid SDK not ready when attempting to open');
        return;
      }

      // Open Plaid Link
      console.debug('[ConnectAccountModal] Opening Plaid Link UI');
      openPlaid();
    } catch (error) {
      console.error('[ConnectAccountModal] Error in handlePlaidConnect:', error);

      if (error instanceof PlaidApiError) {
        if (error.status === 429) {
          setPlaidError('Too many attempts. Please wait a few minutes before trying again.');
        } else {
          setPlaidError(`Failed to initialize Plaid: ${error.message}`);
        }
      } else {
        setPlaidError('Failed to connect account. Please refresh and try again.');
      }
    } finally {
      setIsConnecting(null);
    }
  };

  const handleReownConnect = async () => {
    setIsConnecting('reown');
    setPlaidError(null);

    try {
      const reownConnector = connectors.find(
        (connector) =>
          connector.id.toLowerCase().includes('walletconnect') ||
          connector.type.toLowerCase().includes('walletconnect')
      );

      if (reownConnector) {
        await connectAsync({ connector: reownConnector });
        onClose();
        return;
      }

      const injectedCandidates = connectors.filter(
        (connector) => connector.type === 'injected' || connector.id.includes('injected')
      );

      const prioritized = [
        ...injectedCandidates.filter((connector) => connector.id.toLowerCase().includes('metamask')),
        ...injectedCandidates.filter((connector) => !connector.id.toLowerCase().includes('metamask')),
      ];

      let injectedConnector: (typeof connectors)[number] | undefined;
      for (const connector of prioritized) {
        try {
          const provider = await connector.getProvider?.();
          if (provider) {
            injectedConnector = connector;
            break;
          }
        } catch {
          // Try next injected connector.
        }
      }

      if (!injectedConnector) {
        setPlaidError('No browser wallet detected. Please install MetaMask, Rabby, or Brave Wallet.');
        return;
      }

      await connectAsync({ connector: injectedConnector });
      onClose();
    } catch (error: unknown) {
      const walletError = error as { code?: number; message?: string };
      const message = walletError.message?.toLowerCase() || '';

      if (walletError.code === 4001 || message.includes('user rejected') || message.includes('rejected')) {
        // User cancelled connection intentionally; keep UI quiet.
      } else if (message.includes('provider') && message.includes('not found')) {
        setPlaidError('Wallet provider not found. Please open or install your wallet extension and refresh.');
      } else {
        console.error('Wallet connection failed', error);
        setPlaidError('Wallet connection failed. Please unlock your wallet and try again.');
      }
    } finally {
      setIsConnecting(null);
    }
  };

  return (
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Connect Account</h2>
                <p className="text-sm text-gray-400 mt-1">Select the type of account to link.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1A1A24] flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 relative z-10">
              {authToken ? (
                <>
                  {plaidError && (
                    <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                      {plaidError}
                    </div>
                  )}

                  <button
                    onClick={handlePlaidConnect}
                    disabled={isConnecting !== null || isExchangingToken}
                    className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group text-left ${
                      isConnecting === 'plaid'
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                        : 'border-white/5 bg-[#1A1A24] hover:border-[#8B5CF6]/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                      <Image
                        src="https://www.google.com/s2/favicons?domain=plaid.com&sz=128"
                        alt="Plaid"
                        width={28}
                        height={28}
                        className="object-contain opacity-80"
                      />
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
                    onClick={handleReownConnect}
                    disabled={isConnecting !== null || isExchangingToken}
                    className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group text-left ${
                      isConnecting === 'reown'
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                        : 'border-white/5 bg-[#1A1A24] hover:border-[#3B82F6]/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#3B99FC] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 40 40" width="24" height="24" fill="white">
                        <path d="M12.26 11.26c4.27-4.14 11.2-4.14 15.47 0l.48.46c.38.36.38.96 0 1.33l-2.07 2a.94.94 0 0 1-1.33 0l-.58-.56a6.83 6.83 0 0 0-9.45 0l-.56.54a.95.95 0 0 1-1.34 0l-2.07-2a.94.94 0 0 1 0-1.32l1.45-1.45zm19.8 8.65l1.96 1.9a.94.94 0 0 1 0 1.32l-9.15 8.87a.95.95 0 0 1-1.34 0l-3.53-3.42a1.9 1.9 0 0 0-2.67 0l-3.53 3.42a.95.95 0 0 1-1.34 0l-9.15-8.87a.94.94 0 0 1 0-1.32l1.95-1.9a.95.95 0 0 1 1.34 0l6.23 6.03c.74.72 1.94.72 2.68 0l3.52-3.41a1.9 1.9 0 0 1 2.68 0l3.52 3.4a.95.95 0 0 0 1.34 0l6.24-6.03a.94.94 0 0 1 1.32 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-base mb-0.5 group-hover:text-[#3B82F6] transition-colors">Web3 Wallet</div>
                      <div className="text-xs text-gray-500 line-clamp-2">Connect Metamask, Phantom, Trust Wallet, and 100+ decentralized wallets via Reown.</div>
                    </div>
                    {isConnecting === 'reown' ? (
                      <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="text-gray-600 group-hover:text-[#3B82F6] transition-colors shrink-0">→</div>
                    )}
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs">
                  Please sign in first to connect accounts.
                </div>
              )}
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 blur-3xl rounded-full pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Wrapper component that only renders modal when Plaid SDK is ready
 */
export default function ConnectAccountModal(props: ConnectAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const { isPlaidReady, plaidError: plaidSdkError } = usePlaidReady();
  const linkToken = useAppStore((state) => state.plaidLinkToken);

  // Mount state for SSR safety
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {!isPlaidReady && props.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={props.onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6"
          >
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Loading Plaid...</p>
              {plaidSdkError && (
                <p className="text-red-400 text-sm mt-2">{plaidSdkError}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {isPlaidReady && linkToken && (
        <ConnectAccountModalContent {...props} linkToken={linkToken} />
      )}
    </>,
    document.body
  );
}
