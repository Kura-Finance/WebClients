"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPendingMultisigTxs,
  type SafeMultisigTx,
} from "@/lib/safeTxService";

export function useTreasuryPendingTxs(safeAddress: string | null) {
  const [txs, setTxs] = useState<SafeMultisigTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!safeAddress || !/^0x[a-fA-F0-9]{40}$/i.test(safeAddress)) {
      setTxs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchPendingMultisigTxs(safeAddress);
      setTxs(next);
    } catch (e) {
      setTxs([]);
      setError(e instanceof Error ? e.message : "Failed to load pending Safe transactions");
    } finally {
      setLoading(false);
    }
  }, [safeAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!safeAddress) return;
    const id = setInterval(() => void refresh(), 45_000);
    return () => clearInterval(id);
  }, [refresh, safeAddress]);

  return { txs, loading, error, refresh };
}
