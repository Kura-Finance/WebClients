// src/components/UserSettingsDrawer.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';

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
  anchorRef?: React.RefObject<HTMLButtonElement>;
}

export type ViewState = 'main' | 'profile' | 'accounts' | 'preferences';

// 共用的滑動動畫設定
const viewVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function UserSettingsDrawer({ isOpen, onClose, anchorRef }: UserSettingsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || '';
  const [activeView, setActiveView] = useState<ViewState>('main');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const openConnectFlow = () => {
    setIsConnectModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 計算浮動窗口位置
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  const handleClose = () => {
    onClose();
    setTimeout(() => setActiveView('main'), 300); // 關閉後重置回主畫面
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - 點擊關閉 */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998]"
            onClick={handleClose}
          />

          {/* 浮動視窗 - 從右上角下拉 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -10 }} 
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: position.top,
              right: position.right,
            }}
            className="z-[9999] w-96 bg-[#0B0B0F] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 動態標題列 */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0B0B0F] z-20">
              <div className="flex items-center gap-3">
                {activeView !== 'main' && (
                  <button onClick={() => setActiveView('main')} className="w-8 h-8 rounded-full bg-white/5 flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    ←
                  </button>
                )}
                <h2 className="text-lg font-bold text-white tracking-wide">
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
            <div className="max-h-96 overflow-y-auto hide-scrollbar">
              <AnimatePresence mode="wait">
                {activeView === 'main' && (
                  <MainView
                    key="main"
                    pathname={pathname}
                    handleClose={handleClose}
                    setActiveView={setActiveView}
                    onConnectAccount={openConnectFlow}
                    variants={viewVariants}
                  />
                )}
                {activeView === 'profile' && (
                  <ProfileView key="profile" variants={viewVariants} />
                )}
                {activeView === 'accounts' && (
                  <AccountsView key="accounts" variants={viewVariants} onConnectAccount={openConnectFlow} />
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
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}