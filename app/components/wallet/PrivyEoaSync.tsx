"use client";

import { useEffect, useRef } from "react";
import { useWallets } from "@privy-io/react-auth";
import { saveEoaAddress } from "@/lib/walletApi";
import { isPrivyConfigured } from "@/config/env";

interface PrivyEoaSyncProps {
  onEoa: (address: string) => void;
  persistedEoa: string | null;
}

/**
 * Discovers Privy embedded EOA and persists it via /api/wallet/eoa.
 * Must render under PrivyProvider.
 */
export default function PrivyEoaSync({ onEoa, persistedEoa }: PrivyEoaSyncProps) {
  const { wallets } = useWallets();
  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPrivyConfigured) return;
    const embedded =
      wallets.find((w) => w.walletClientType === "privy")?.address ?? wallets[0]?.address ?? null;
    if (!embedded) return;

    onEoa(embedded);

    if (persistedEoa?.toLowerCase() === embedded.toLowerCase()) return;
    if (savedRef.current === embedded.toLowerCase()) return;
    savedRef.current = embedded.toLowerCase();

    void saveEoaAddress(embedded).catch(() => {
      savedRef.current = null;
    });
  }, [wallets, onEoa, persistedEoa]);

  return null;
}
