// src/components/UserSettingsDrawer.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface UserSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function UserSettingsDrawer({ isOpen, onClose, anchorRef }: UserSettingsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const router = useRouter();
  const { userProfile, logout } = useAppStore();

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

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push('/');
  };

  const handleMenuClick = (callback: () => void) => {
    callback();
    onClose();
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
            onClick={onClose}
          />

          {/* 浮動視窗 */}
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
            className="z-[9999] w-80 bg-[#0B0B0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 用戶信息區 */}
            <div className="px-6 py-6 flex flex-col gap-3">
              {/* 頭像 */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center overflow-hidden flex-shrink-0">
                {userProfile.avatarUrl ? (
                  <Image src={userProfile.avatarUrl} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              {/* Display Name */}
              <h3 className="text-base font-semibold text-white">
                {userProfile.displayName || 'User'}
              </h3>

              {/* Email */}
              <p className="text-sm text-gray-400">
                {userProfile.email}
              </p>
            </div>

            {/* 分割線 */}
            <div className="h-px bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            {/* 菜單項 */}
            <div className="px-6 py-4 flex flex-col gap-2">
              {/* Profile */}
              <button
                onClick={() => handleMenuClick(() => router.push('/dashboard/profile'))}
                className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                Profile
              </button>

              {/* Notifications */}
              <button
                onClick={() => handleMenuClick(() => router.push('/dashboard'))}
                className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                Notifications
              </button>

              {/* Security */}
              <button
                onClick={() => handleMenuClick(() => router.push('/dashboard/security'))}
                className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                Security
              </button>

              {/* Privacy */}
              <a
                href="https://kura-finance.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm block flex items-center justify-between"
              >
                <span>Privacy</span>
                <span className="text-gray-500 group-hover:text-gray-300">↗</span>
              </a>
            </div>

            {/* 分割線 */}
            <div className="h-px bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            {/* Log Out */}
            <div className="px-6 py-4">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}