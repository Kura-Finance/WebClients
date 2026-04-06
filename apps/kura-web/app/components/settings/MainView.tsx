import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

interface MainViewProps {
  pathname: string;
  handleClose: () => void;
  setActiveView: (view: 'main' | 'profile' | 'accounts' | 'preferences') => void;
  variants: Variants;
}

export default function MainView({ pathname, handleClose, setActiveView, variants }: MainViewProps) {
  const userProfile = useAppStore(state => state.userProfile);
  const clearAuthSession = useAppStore(state => state.clearAuthSession);

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-0.5">
          <div className="w-full h-full bg-[#1A1A24] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#0B0B0F]">
            <Image src={userProfile.avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{userProfile.displayName}</h3>
          <div className="text-xs text-[#A78BFA] font-mono bg-[#8B5CF6]/10 px-2 py-1 rounded-md inline-block mt-1">{userProfile.membershipLabel}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">App Switcher</div>
        <div className="flex items-center gap-1.5 bg-[#1A1A24] p-1.5 rounded-2xl border border-white/5">
          <Link href="/dashboard" onClick={handleClose} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${pathname.includes('/dashboard') ? 'bg-[#8B5CF6] shadow-[0_4px_15px_rgba(139,92,246,0.3)] text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
            <span className="text-xl mb-1.5">📊</span><span className="text-[10px] font-bold tracking-wider uppercase">Dashboard</span>
          </Link>
          <Link href="/reward" onClick={handleClose} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${pathname.includes('/reward') ? 'bg-[#8B5CF6] shadow-[0_4px_15px_rgba(139,92,246,0.3)] text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
            <span className="text-xl mb-1.5">🎁</span><span className="text-[10px] font-bold tracking-wider uppercase">Rewards</span>
          </Link>
          <Link href="/forum" onClick={handleClose} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${pathname.includes('/forum') ? 'bg-[#8B5CF6] shadow-[0_4px_15px_rgba(139,92,246,0.3)] text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
            <span className="text-xl mb-1.5">💬</span><span className="text-[10px] font-bold tracking-wider uppercase">Forum</span>
          </Link>
        </div>
      </div>

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

      <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-white/5">
        <button
          onClick={() => {
            clearAuthSession();
            handleClose();
          }}
          className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}