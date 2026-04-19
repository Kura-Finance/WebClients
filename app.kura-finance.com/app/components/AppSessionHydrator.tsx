"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFinanceStore } from '@/store/useFinanceStore';

export default function AppSessionHydrator() {
  const authToken = useAppStore((state) => state.authToken);
  const authStatus = useAppStore((state) => state.authStatus);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const hydrateUserProfile = useAppStore((state) => state.hydrateUserProfile);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const clearPlaidFinanceData = useFinanceStore((state) => state.clearPlaidFinanceData);

  // Initialize auth state from storage on first load
  useEffect(() => {
    if (authStatus === 'loading' && !authToken) {
      void hydrateFromStorage();
    }
  }, []);

  useEffect(() => {
    if (authStatus !== 'loading') {
      return;
    }

    if (!authToken) {
      clearAuthSession();
      return;
    }

    void (async () => {
      await hydrateUserProfile();
      const latestState = useAppStore.getState();
      if (latestState.authStatus === 'authenticated' && latestState.authToken) {
        try {
          await hydratePlaidFinanceData();
        } catch {
          // Keep UI usable even when Plaid data API is temporarily unavailable.
        }
      }
    })();
  }, [authStatus, authToken, clearAuthSession, hydrateUserProfile, hydratePlaidFinanceData]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      clearPlaidFinanceData();
    }
  }, [authStatus, clearPlaidFinanceData]);

  return null;
}