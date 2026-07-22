"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFinanceStore } from '@/store/useFinanceStore';

export function useTrackFiAssetHistory(days = 30) {
  const isDecryptionReady = useAppStore((state) => state.isDecryptionReady);
  const apiAssetHistory = useFinanceStore((state) => state.apiAssetHistory);
  const assetHistorySummary = useFinanceStore((state) => state.assetHistorySummary);
  const isLoadingAssetHistory = useFinanceStore((state) => state.isLoadingAssetHistory);
  const hydrateAssetHistory = useFinanceStore((state) => state.hydrateAssetHistory);

  useEffect(() => {
    if (!isDecryptionReady) return;
    void hydrateAssetHistory(days);
  }, [days, hydrateAssetHistory, isDecryptionReady]);

  return {
    apiAssetHistory,
    assetHistorySummary,
    isLoadingAssetHistory,
    isDecryptionReady,
  };
}
