"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from './_components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authStatus = useAppStore((state) => state.authStatus);
  const router = useRouter();

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/');
    }
  }, [authStatus, router]);

  // Show loading state while checking auth
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* TopNav - Fixed at top */}
      <TopNav />
      
      {/* Main content area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed, non-scrollable */}
        <Sidebar />
        
        {/* Main content - Scrollable */}
        <main className="relative z-30 flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#0B0B0F] to-[#1A1A24]/30">
          {children}
        </main>
      </div>
    </div>
  );
}