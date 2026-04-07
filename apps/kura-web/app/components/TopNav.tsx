// src/components/TopNav.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import UserSettingsDrawer from './UserSettingsDrawer';
import { useAppStore } from '@/store/useAppStore';

export default function TopNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userProfile = useAppStore(state => state.userProfile);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  return (
    <>
      <header className="w-full flex justify-between items-center px-6 py-2.5 border-b border-[#1A1A24] bg-[#0B0B0F]/80 backdrop-blur-md z-40 shrink-0 sticky top-0">
        
        {/* 左側 Logo */}
        <div className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
          Kura
        </div>

        {/* 右側控制區 */}
        <div className="flex items-center gap-4">
          {/* 使用者頭像 (點擊開啟設定抽屜) */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-7 h-7 rounded-full border border-[#1A1A24] overflow-hidden hover:border-[#8B5CF6] transition-colors focus:outline-none cursor-pointer"
          >
            {userProfile.avatarUrl ? (
              <Image
                src={userProfile.avatarUrl}
                alt={`${userProfile.displayName || 'Account'} Avatar`}
                width={28}
                height={28}
                unoptimized
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1A1A24] text-[10px] font-bold text-[#A78BFA]">
                {avatarInitial}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* 掛載右側抽屜 */}
      <UserSettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}