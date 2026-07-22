"use client";

import React from "react";
import { Vault, Wallet } from "lucide-react";
import { useHomeWallet } from "@/hooks/useHomeWallet";
import { useTreasuryWallet } from "@/hooks/useTreasuryWallet";
import type { SafeAccountOpts } from "@/lib/smartAccountSend";

export type TradingAccountKind = "smart" | "treasury";

export function useTradingAccount(defaultKind: TradingAccountKind = "smart") {
  const personal = useHomeWallet();
  const treasury = useTreasuryWallet();
  const [kind, setKind] = React.useState<TradingAccountKind>(defaultKind);

  const treasuryReady = Boolean(treasury.bound && treasury.deployed && treasury.scaAddress);
  const effectiveKind: TradingAccountKind =
    kind === "treasury" && !treasuryReady ? "smart" : kind;

  const scaAddress =
    effectiveKind === "treasury" ? treasury.scaAddress : personal.scaAddress;

  const accountOpts: SafeAccountOpts =
    effectiveKind === "treasury" ? treasury.accountOpts : {};

  return {
    kind: effectiveKind,
    setKind,
    scaAddress,
    accountOpts,
    personal,
    treasury,
    treasuryReady,
    treasuryName: treasury.name,
    isTreasury: effectiveKind === "treasury",
  };
}

export default function TradingAccountPicker({
  kind,
  onChange,
  treasuryReady,
  treasuryAddress,
  smartAddress,
  treasuryLabel,
  /** When true, Treasury is shown but disabled (e.g. Stocks / Dinari). */
  treasuryDisabledReason,
}: {
  kind: TradingAccountKind;
  onChange: (kind: TradingAccountKind) => void;
  treasuryReady: boolean;
  treasuryAddress: string | null;
  smartAddress: string | null;
  treasuryLabel?: string | null;
  treasuryDisabledReason?: string | null;
}) {
  const truncate = (a: string) =>
    a.length < 12 ? a : `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
        Pay from
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--kura-bg-lighter)] p-1">
        <button
          type="button"
          onClick={() => onChange("smart")}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
            kind === "smart"
              ? "bg-[var(--kura-surface)] text-[var(--kura-text)] shadow-sm"
              : "text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          Smart Wallet
        </button>
        <button
          type="button"
          disabled={!treasuryReady || Boolean(treasuryDisabledReason)}
          onClick={() => onChange("treasury")}
          title={
            treasuryDisabledReason ||
            (!treasuryReady ? "Create and activate a Treasury Safe first" : undefined)
          }
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            kind === "treasury"
              ? "bg-[var(--kura-surface)] text-[var(--kura-text)] shadow-sm"
              : "text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          }`}
        >
          <Vault className="h-3.5 w-3.5" />
          {treasuryLabel?.trim() || "Treasury"}
        </button>
      </div>
      <p className="text-[11px] text-[var(--kura-text-secondary)]">
        {kind === "treasury" ? (
          <>
            {treasuryLabel?.trim() || "Treasury"}
            {treasuryAddress ? (
              <span className="font-mono"> · {truncate(treasuryAddress)}</span>
            ) : null}
            {" · "}
            queued for Approvals          </>
        ) : (
          <>
            Smart Wallet
            {smartAddress ? (
              <span className="font-mono"> · {truncate(smartAddress)}</span>
            ) : null}
            {" · "}
            sends immediately
          </>
        )}
      </p>
      {treasuryDisabledReason && kind !== "treasury" ? (
        <p className="text-[11px] text-[var(--kura-text-secondary)]">{treasuryDisabledReason}</p>
      ) : null}
    </div>
  );
}
