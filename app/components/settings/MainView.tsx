import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useKuraLogout } from '@/components/PrivyAuthBridge';

interface MainViewProps {
  handleClose: () => void;
  setActiveView: (view: 'main' | 'profile' | 'accounts' | 'preferences') => void;
  onConnectAccount: () => void;
  variants: Variants;
}

export default function MainView({ handleClose, setActiveView, onConnectAccount, variants }: MainViewProps) {
  const userProfile = useAppStore(state => state.userProfile);
  const logout = useKuraLogout();
  const authStatus = useAppStore(state => state.authStatus);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[var(--kura-primary)] to-[var(--kura-primary-light)] p-0.5">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[var(--kura-bg)] bg-[var(--kura-surface)]">
            {userProfile.avatarUrl ? (
              <Image src={userProfile.avatarUrl} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" unoptimized />
            ) : (
              <span className="text-xl font-bold text-[var(--kura-primary-light)]">{avatarInitial}</span>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--kura-text)]">{userProfile.displayName || 'Signed out'}</h3>
          {userProfile.membershipLabel ? (
            <div className="mt-1 inline-block rounded-md bg-[var(--kura-primary)]/10 px-2 py-1 font-mono text-xs text-[var(--kura-primary-light)]">
              {userProfile.membershipLabel}
            </div>
          ) : (
            <div className="mt-1 inline-block rounded-md bg-[var(--kura-bg-light)] px-2 py-1 font-mono text-xs text-[var(--kura-text-secondary)]">
              Profile not loaded
            </div>
          )}
        </div>
      </div>

      {authStatus !== 'authenticated' && (
        <div className="mb-8 rounded-2xl border border-dashed border-[var(--kura-primary)]/30 bg-[var(--kura-primary)]/5 p-4">
          <div className="text-sm font-medium text-[var(--kura-text)]">You are signed out.</div>
          <div className="mt-1 text-xs text-[var(--kura-text-secondary)]">
            Sign in to load your profile, accounts, and Plaid link token from the backend API.
          </div>
          <button
            type="button"
            onClick={onConnectAccount}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--kura-primary)]/30 bg-[var(--kura-primary)]/10 px-3 py-2 text-xs font-semibold text-[var(--kura-primary-light)] transition-colors hover:bg-[var(--kura-primary)]/20"
          >
            Sign in / Register
          </button>
        </div>
      )}

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--kura-text-secondary)]">Settings</div>
        <div className="flex flex-col gap-1">
          {(
            [
              ['profile', 'Profile & Security', '👤'],
              ['accounts', 'Connected Accounts', '🏦'],
              ['preferences', 'Preferences', '⚙️'],
            ] as const
          ).map(([view, label, icon]) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className="flex items-center justify-between rounded-xl border border-transparent p-3 text-left text-[var(--kura-text-secondary)] transition-all hover:border-[var(--kura-border)] hover:bg-[var(--kura-bg-light)] hover:text-[var(--kura-text)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--kura-text-secondary)]">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
              <span className="text-[var(--kura-text-secondary)]">→</span>
            </button>
          ))}
        </div>
      </div>

      {authStatus === 'authenticated' && (
        <div className="absolute bottom-6 left-6 right-6 border-t border-[var(--kura-border)] pt-6">
          <button
            type="button"
            onClick={async () => {
              await logout();
              handleClose();
            }}
            className="w-full rounded-xl border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] py-3 font-medium text-[var(--kura-error-fg)] transition-colors hover:brightness-95"
          >
            Sign Out
          </button>
        </div>
      )}
    </motion.div>
  );
}
