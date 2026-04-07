// src/components/UserSettingsDrawer.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// 引入我們剛切好的四個模組
import MainView from './settings/MainView';
import ProfileView from './settings/ProfileView';
import AccountsView from './settings/AccountsView';
import PreferencesView from './settings/PreferencesView';

const ConnectAccountModal = dynamic(() => import('./ConnectAccountModal'), {
  ssr: false,
});

interface UserSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ViewState = 'main' | 'profile' | 'accounts' | 'preferences';

// 共用的滑動動畫設定
const viewVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function UserSettingsDrawer({ isOpen, onClose }: UserSettingsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || '';
  const [activeView, setActiveView] = useState<ViewState>('main');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    onClose();
    setTimeout(() => setActiveView('main'), 300); // 關閉後重置回主畫面
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[9999] flex justify-end">
          
          {/* 背景遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 抽屜本體 */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm h-full bg-[#0B0B0F] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* 動態標題列 */}
            <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0B0F] z-20">
              <div className="flex items-center gap-3">
                {activeView !== 'main' && (
                  <button onClick={() => setActiveView('main')} className="w-8 h-8 rounded-full bg-white/5 flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    ←
                  </button>
                )}
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {activeView === 'main' ? 'Account' : 
                   activeView === 'profile' ? 'Profile & Security' :
                   activeView === 'accounts' ? 'Connected Accounts' : 'Preferences'}
                </h2>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#1A1A24] flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            {/* 內容切換區 */}
            <div className="flex-1 relative overflow-x-hidden overflow-y-auto hide-scrollbar">
              <AnimatePresence mode="wait">
                {activeView === 'main' && (
                  <MainView
                    key="main"
                    pathname={pathname}
                    handleClose={handleClose}
                    setActiveView={setActiveView}
                    onConnectAccount={() => setIsConnectModalOpen(true)}
                    variants={viewVariants}
                  />
                )}
                {activeView === 'profile' && (
                  <ProfileView key="profile" variants={viewVariants} />
                )}
                {activeView === 'accounts' && (
                  <AccountsView key="accounts" variants={viewVariants} onConnectAccount={() => setIsConnectModalOpen(true)} />
                )}
                {activeView === 'preferences' && (
                  <PreferencesView key="preferences" variants={viewVariants} />
                )}
              </AnimatePresence>
            </div>

          </motion.div>

          {isConnectModalOpen && (
            <ConnectAccountModal
              isOpen={isConnectModalOpen}
              onClose={() => setIsConnectModalOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}