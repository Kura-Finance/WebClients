"use client";

import { useCallback, useEffect, useState } from "react";
import { listEarnMorphoVaults, type MorphoVault } from "@/lib/morphoApi";

export function useMorphoVaults() {
  const [vaults, setVaults] = useState<MorphoVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const next = await listEarnMorphoVaults();
      setVaults(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Morpho vaults");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    vaults,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
  };
}
