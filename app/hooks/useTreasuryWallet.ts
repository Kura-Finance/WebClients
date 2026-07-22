"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { selectActiveTreasury, useOrgStore, type OrgTreasury } from "@/store/useOrgStore";
import {
  fetchSafeSigners,
  fetchStablecoinBalances,
  HOME_STABLECOINS,
  type SafeSignerInfo,
  type StablecoinBalances,
} from "@/lib/baseChain";
import type { TreasurySource } from "@/lib/orgTreasury";
import { isTreasurySafeDeployed, treasuryAccountOpts } from "@/lib/treasurySafe";
import type { SafeAccountOpts } from "@/lib/smartAccountSend";
import { syncSetActiveTreasury } from "@/lib/treasurySync";

function isAddress(value: string | null | undefined): value is `0x${string}` {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

function emptyStableBalances(): StablecoinBalances {
  return Object.fromEntries(HOME_STABLECOINS.map((t) => [t.symbol, 0]));
}

export interface TreasuryWalletState {
  loading: boolean;
  bound: boolean;
  treasuries: OrgTreasury[];
  active: OrgTreasury | null;
  treasuryId: string | null;
  name: string | null;
  scaAddress: string | null;
  source: TreasurySource | null;
  deployed: boolean;
  accountOpts: SafeAccountOpts;
  stableBalances: StablecoinBalances;
  stablesLoading: boolean;
  safeSigners: SafeSignerInfo | null;
  signersLoading: boolean;
  signersError: string | null;
  error: string | null;
  setActiveTreasury: (id: string | null) => void;
  refresh: () => Promise<void>;
}

export function useTreasuryWallet(): TreasuryWalletState {
  const treasuries = useOrgStore((s) => s.treasuries);
  const activeTreasuryId = useOrgStore((s) => s.activeTreasuryId);
  const setActiveTreasury = useCallback((id: string | null) => {
    void syncSetActiveTreasury(id);
  }, []);

  const active = useMemo(
    () => selectActiveTreasury({ treasuries, activeTreasuryId }),
    [treasuries, activeTreasuryId],
  );

  const scaAddress = active?.address ?? null;
  const source = active?.source ?? null;

  const [loading, setLoading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [stableBalances, setStableBalances] = useState<StablecoinBalances>(emptyStableBalances);
  const [stablesLoading, setStablesLoading] = useState(false);
  const [safeSigners, setSafeSigners] = useState<SafeSignerInfo | null>(null);
  const [signersLoading, setSignersLoading] = useState(false);
  const [signersError, setSignersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accountOpts: SafeAccountOpts = isAddress(scaAddress)
    ? treasuryAccountOpts(source, scaAddress, active?.saltNonce)
    : {};

  const refresh = useCallback(async () => {
    if (!isAddress(scaAddress)) {
      setStableBalances(emptyStableBalances());
      setSafeSigners(null);
      setSignersError(null);
      setError(null);
      setDeployed(false);
      setLoading(false);
      setStablesLoading(false);
      setSignersLoading(false);
      return;
    }

    setLoading(true);
    setStablesLoading(true);
    setSignersLoading(true);
    setError(null);
    try {
      const onChain = await isTreasurySafeDeployed(scaAddress).catch(() => false);
      setDeployed(onChain);

      await Promise.all([
        fetchStablecoinBalances(scaAddress)
          .then(setStableBalances)
          .catch(() => setStableBalances(emptyStableBalances())),
        onChain
          ? fetchSafeSigners(scaAddress)
              .then((info) => {
                setSafeSigners(info);
                setSignersError(null);
              })
              .catch((e) => {
                setSafeSigners(null);
                setSignersError(
                  e instanceof Error ? e.message : "Failed to read Treasury Safe owners",
                );
              })
          : Promise.resolve().then(() => {
              setSafeSigners(null);
              setSignersError(null);
            }),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Treasury Safe");
    } finally {
      setLoading(false);
      setStablesLoading(false);
      setSignersLoading(false);
    }
  }, [scaAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!scaAddress) return;
    const id = setInterval(() => {
      void refresh();
    }, 90_000);
    return () => clearInterval(id);
  }, [refresh, scaAddress]);

  return {
    loading,
    bound: Boolean(scaAddress),
    treasuries,
    active,
    treasuryId: active?.id ?? null,
    name: active?.name ?? null,
    scaAddress,
    source,
    deployed,
    accountOpts,
    stableBalances,
    stablesLoading,
    safeSigners,
    signersLoading,
    signersError,
    error,
    setActiveTreasury,
    refresh,
  };
}
