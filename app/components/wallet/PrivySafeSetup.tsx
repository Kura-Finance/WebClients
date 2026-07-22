"use client";

/**
 * Smart Wallet setup — mirrors mobile `useKuraCardWallet` provision:
 *   compute counterfactual Safe (salt 0) → PUT /api/wallet/sca (+ eoa)
 * Does not deploy on-chain; first UserOp deploys like mobile.
 */

import { useEffect, useRef } from "react";
import { useWallets } from "@privy-io/react-auth";
import { isPrivyConfigured } from "@/config/env";
import { computePersonalSafeAddress } from "@/lib/personalSafe";
import { saveEoaAddress, saveScaAddress } from "@/lib/walletApi";

interface PrivySafeSetupProps {
  /** Existing SCA from GET /api/wallet (or session). Skip compute when set. */
  persistedSca: string | null;
  onSca: (address: string) => void;
  onError?: (message: string) => void;
}

export default function PrivySafeSetup({ persistedSca, onSca, onError }: PrivySafeSetupProps) {
  const { wallets } = useWallets();
  const busyRef = useRef(false);
  const doneRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPrivyConfigured) return;

    if (persistedSca) {
      onSca(persistedSca);
      doneRef.current = persistedSca.toLowerCase();
      return;
    }

    const privyWallet =
      wallets.find((w) => w.walletClientType === "privy") ?? wallets[0] ?? null;
    if (!privyWallet) return;
    if (busyRef.current) return;
    if (doneRef.current) return;

    busyRef.current = true;

    void (async () => {
      try {
        const provider = (await privyWallet.getEthereumProvider()) as {
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
        const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
        const eoa = accounts[0];
        if (!eoa) throw new Error("Privy wallet has no account.");

        const sca = await computePersonalSafeAddress(provider);

        await Promise.all([
          saveScaAddress(sca).catch((err) => {
            console.warn("[PrivySafeSetup] Failed to save SCA", err);
            throw err;
          }),
          saveEoaAddress(eoa).catch((err) => {
            console.warn("[PrivySafeSetup] Failed to save EOA", err);
          }),
        ]);

        doneRef.current = sca.toLowerCase();
        onSca(sca);
      } catch (e) {
        busyRef.current = false;
        doneRef.current = null;
        const msg = e instanceof Error ? e.message : "Failed to set up Smart Wallet.";
        console.error("[PrivySafeSetup]", msg);
        onError?.(msg);
      } finally {
        busyRef.current = false;
      }
    })();
  }, [wallets, persistedSca, onSca, onError]);

  return null;
}
