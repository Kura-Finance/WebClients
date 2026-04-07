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
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-gray-400">
          Sign in from the Account view to load profile data from the backend API.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6 space-y-6">
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
      <div className="pt-4 border-t border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-white font-medium">Two-Factor Auth (2FA)</div>
            <div className="text-xs text-gray-500 mt-0.5">Secure your account with an authenticator app.</div>
          </div>
          <SettingsToggle checked />
        </div>
        <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors mt-2">
          Change Password
        </button>
      </div>
    </motion.div>
  );
}