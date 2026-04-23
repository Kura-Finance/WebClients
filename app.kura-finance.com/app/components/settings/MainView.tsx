import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface MainViewProps {
  handleClose: () => void;
  setActiveView: (view: 'main' | 'profile' | 'accounts' | 'preferences') => void;
  onConnectAccount: () => void;
  variants: Variants;
}

export default function MainView({ handleClose, setActiveView, onConnectAccount, variants }: MainViewProps) {
  const userProfile = useAppStore(state => state.userProfile);
  const logout = useAppStore(state => state.logout);
  const authStatus = useAppStore(state => state.authStatus);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-0.5">
          <div className="w-full h-full bg-[#1A1A24] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#0B0B0F]">
            {userProfile.avatarUrl ? (
              <Image src={userProfile.avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-xl font-bold text-[#A78BFA]">{avatarInitial}</span>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{userProfile.displayName || 'Signed out'}</h3>
          {userProfile.membershipLabel ? (
            <div className="text-xs text-[#A78BFA] font-mono bg-[#8B5CF6]/10 px-2 py-1 rounded-md inline-block mt-1">{userProfile.membershipLabel}</div>
          ) : (
            <div className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-md inline-block mt-1">Profile not loaded</div>
          )}
        </div>
      </div>

      {authStatus !== 'authenticated' && (
        <div className="mb-8 rounded-2xl border border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-4">
          <div className="text-sm font-medium text-white">You are signed out.</div>
          <div className="mt-1 text-xs text-gray-400">Sign in to load your profile, accounts, and Plaid link token from the backend API.</div>
          <button
            onClick={onConnectAccount}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-2 text-xs font-semibold text-[#A78BFA] hover:bg-[#8B5CF6]/20 transition-colors"
          >
            Sign in / Register
          </button>
        </div>
      )}

      <div>
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Settings</div>
        <div className="flex flex-col gap-1">
          <button onClick={() => setActiveView('profile')} className="flex items-center justify-between p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left border border-transparent hover:border-white/5">
            <div className="flex items-center gap-3"><span className="text-gray-500">👤</span><span className="font-medium">Profile & Security</span></div><span className="text-gray-600">→</span>
          </button>
          <button onClick={() => setActiveView('accounts')} className="flex items-center justify-between p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left border border-transparent hover:border-white/5">
            <div className="flex items-center gap-3"><span className="text-gray-500">🏦</span><span className="font-medium">Connected Accounts</span></div><span className="text-gray-600">→</span>
          </button>
          <button onClick={() => setActiveView('preferences')} className="flex items-center justify-between p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left border border-transparent hover:border-white/5">
            <div className="flex items-center gap-3"><span className="text-gray-500">⚙️</span><span className="font-medium">Preferences</span></div><span className="text-gray-600">→</span>
          </button>
        </div>
      </div>

      {authStatus === 'authenticated' && (
        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-white/5">
          <button
            onClick={async () => {
              await logout();
              handleClose();
            }}
            className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Sign Out
          </button>
        </div>
      )}
    </motion.div>
  );
}