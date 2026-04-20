// src/components/TopNav.tsx
"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserSettingsDrawer from './UserSettingsDrawer';
import { useAppStore } from '@/store/useAppStore';

export default function TopNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const userProfile = useAppStore(state => state.userProfile);
  const authStatus = useAppStore(state => state.authStatus);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  // Only show header when authenticated
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <>
      <header className="w-full flex justify-between items-center px-6 py-2.5 border-b border-[#1A1A24] bg-[#0B0B0F]/80 backdrop-blur-md z-40 shrink-0 sticky top-0">
        
        {/* 左側 Logo */}
        <Link href="/" className="text-lg font-bold text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            alt="Kura Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          Kura
        </Link>

        {/* 右側控制區 */}
        <div className="flex items-center gap-4">
          {/* 使用者頭像 (點擊開啟浮動視窗) */}
          <button 
            ref={avatarButtonRef}
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

      {/* 掛載浮動視窗 */}
      <UserSettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        anchorRef={avatarButtonRef}
      />
    </>
  );
}