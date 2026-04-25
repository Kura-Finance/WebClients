"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import TopNav from '@/components/TopNav';
import Sidebar from './_components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authStatus = useAppStore((state) => state.authStatus);
  const router = useRouter();

  // 若未認證則導回首頁
  React.useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/');
    }
  }, [authStatus, router]);

  // 檢查認證期間顯示載入狀態
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--kura-bg)]">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--kura-primary)]/20 mb-4">
              <div className="w-8 h-8 border-2 border-[var(--kura-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[var(--kura-text-secondary)]">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 僅在已認證時渲染 dashboard
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div className="flex h-full w-full">
      {/* 側邊欄 - 固定且不可捲動 */}
      <Sidebar />

      {/* 主內容 - 可捲動（含頂部導覽列） */}
      <main className="relative z-30 flex-1 overflow-y-auto bg-[var(--kura-bg)] w-full">
        <TopNav />
        {children}
      </main>
    </div>
  );
}