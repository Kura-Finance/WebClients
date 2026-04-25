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
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const toggleBalanceVisibility = useAppStore((state) => state.toggleBalanceVisibility);
  const displayName = userProfile.displayName.trim();
  const avatarInitial = displayName ? displayName.slice(0, 1).toUpperCase() : '?';

  // 僅在已認證時顯示導覽列
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <>
      <header className="w-full flex justify-end items-center px-6 py-2.5 bg-[var(--kura-bg)] z-40 shrink-0">
        {/* 右側控制區 */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleBalanceVisibility}
            aria-label={isBalanceHidden ? 'Show balances' : 'Hide balances'}
            className="w-8 h-8 rounded-full border border-[var(--kura-border)] text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          >
            {isBalanceHidden ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
                <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9 5 9 7a7.73 7.73 0 01-3.33 4.95" />
                <path d="M6.61 6.61C4.06 8.12 2.33 10.11 2 12c0 2 4 7 10 7a11.4 11.4 0 004.14-.74" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </Button>
          {/* 使用者頭像 (點擊開啟浮動視窗) */}
          <Button
            ref={avatarButtonRef}
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full border border-[var(--kura-border)] p-0 overflow-hidden hover:border-[var(--kura-primary)] hover:bg-transparent"
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
              <div className="w-full h-full flex items-center justify-center bg-[var(--kura-surface-strong)] text-[10px] font-bold text-[var(--kura-primary-light)]">
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