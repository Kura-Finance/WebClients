"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listBorrowMorphoMarkets,
  pickMarketsByCollateral,
  type MorphoMarket,
} from "@/lib/morphoApi";

export function useMorphoBorrowMarkets() {
  const [markets, setMarkets] = useState<MorphoMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const next = await listBorrowMorphoMarkets();
      setMarkets(pickMarketsByCollateral(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Morpho borrow markets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    markets,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
  };
}
