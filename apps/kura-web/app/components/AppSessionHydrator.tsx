"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function AppSessionHydrator() {
  const authToken = useAppStore((state) => state.authToken);
  const authStatus = useAppStore((state) => state.authStatus);
  const hydrateUserProfile = useAppStore((state) => state.hydrateUserProfile);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);

  useEffect(() => {
    if (authStatus !== 'loading') {
      return;
    }

    if (!authToken) {
      clearAuthSession();
      return;
    }

    void hydrateUserProfile();
  }, [authStatus, authToken, clearAuthSession, hydrateUserProfile]);

  return null;
}