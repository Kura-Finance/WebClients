// 頂部導覽列元件
"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import UserSettingsDrawer from './UserSettingsDrawer';
import { useAppStore } from '@/store/useAppStore';

export default function TopNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const userProfile = useAppStore(state => state.userProfile);
  const authStatus = useAppStore(state => state.authStatus);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  // 僅在已認證時顯示導覽列
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <>
      <header className="w-full flex justify-end items-center px-6 py-2.5 bg-[#0B0B0F]/80 backdrop-blur-md z-40 shrink-0">
        {/* 右側控制區 */}
        <div className="flex items-center gap-4">
          {/* 使用者頭像 (點擊開啟浮動視窗) */}
          <Button
            ref={avatarButtonRef}
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full border border-[#1A1A24] p-0 overflow-hidden hover:border-[#8B5CF6] hover:bg-transparent"
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
          </Button>
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