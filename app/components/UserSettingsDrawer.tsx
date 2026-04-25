"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: position.top,
              right: position.right,
            }}
            className="z-[9999] w-80"
          >
            <Card>
              <CardHeader className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center overflow-hidden">
                  {userProfile.avatarUrl ? (
                    <Image src={userProfile.avatarUrl} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{userProfile.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{userProfile.displayName || 'User'}</CardTitle>
                  <CardDescription>{userProfile.email}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start" onClick={() => handleMenuClick(() => router.push('/dashboard/profile'))}>
                    Profile
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleMenuClick(() => router.push('/dashboard'))}>
                    Notifications
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleMenuClick(() => router.push('/dashboard/security'))}>
                    Security
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="https://kura-finance.com/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy ↗
                    </a>
                  </Button>
                </div>
                <Separator />
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
