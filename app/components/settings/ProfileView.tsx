import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import SettingsInputField from './shared/SettingsInputField';
import SettingsToggle from './shared/SettingsToggle';

export default function ProfileView({ variants }: { variants: Variants }) {
  const userProfile = useAppStore(state => state.userProfile);
  const setDisplayName = useAppStore(state => state.setDisplayName);
  const authStatus = useAppStore(state => state.authStatus);

  if (authStatus !== 'authenticated') {
    return (
      <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6">
        <div className="rounded-2xl border border-dashed border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-5 text-sm text-[var(--kura-text-secondary)]">
          Sign in from the Account view to load profile data from the backend API.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 space-y-6 px-6 py-6">
      <SettingsInputField
        label="Display Name"
        value={userProfile.displayName}
        onChange={setDisplayName}
        name="displayName"
        autoComplete="name"
      />
      <SettingsInputField
        label="Email Address"
        type="email"
        value={userProfile.email}
        disabled
        helperText="Contact support to change your primary email."
        name="email"
        autoComplete="email"
      />
      <div className="border-t border-[var(--kura-border)] pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-[var(--kura-text)]">Two-Factor Auth (2FA)</div>
            <div className="mt-0.5 text-xs text-[var(--kura-text-secondary)]">
              Secure your account with an authenticator app.
            </div>
          </div>
          <SettingsToggle checked />
        </div>
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-[var(--kura-border)] py-3 font-medium text-[var(--kura-text)] transition-colors hover:bg-[var(--kura-bg-light)]"
        >
          Change Password
        </button>
      </div>
    </motion.div>
  );
}
