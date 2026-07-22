"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Building2,
  Coins,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { WalletActivity } from "@/hooks/useWalletActivity";
import {
  formatTxListAmount,
  formatTxRelativeTime,
  getTxAccentColor,
  getTxIconName,
  getTxSubtitle,
  getTxTypeLabel,
} from "@/lib/walletTxDisplay";

interface WalletTxRowProps {
  tx: WalletActivity;
  hidden?: boolean;
  onClick?: (tx: WalletActivity) => void;
}

function TxIcon({ name, color }: { name: ReturnType<typeof getTxIconName>; color: string }) {
  const cls = "h-[18px] w-[18px]";
  switch (name) {
    case "down":
      return <ArrowDown className={cls} style={{ color }} />;
    case "up":
      return <ArrowUp className={cls} style={{ color }} />;
    case "swap":
      return <ArrowLeftRight className={cls} style={{ color }} />;
    case "bank":
      return <Building2 className={cls} style={{ color }} />;
    case "crypto":
      return <Coins className={cls} style={{ color }} />;
  }
}

export default function WalletTxRow({ tx, hidden = false, onClick }: WalletTxRowProps) {
  const accent = getTxAccentColor(tx);
  const typeLabel = getTxTypeLabel(tx);
  const subtitle = getTxSubtitle(tx);
  const amount = hidden ? "••••••" : formatTxListAmount(tx);
  const clickable = !!onClick;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onClick?.(tx)}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        clickable ? "hover:bg-[var(--kura-bg-light)]/40 cursor-pointer" : "cursor-default"
      }`}
    >
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <TxIcon name={getTxIconName(tx)} color={accent} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[13px] font-semibold text-[var(--kura-text)]">{typeLabel}</p>
        <div className="flex items-start gap-1.5">
          {tx.pending ? (
            <Loader2
              className="mt-0.5 h-3 w-3 shrink-0 animate-spin"
              style={{ color: accent }}
            />
          ) : null}
          <div className="min-w-0">
            <p
              className="truncate text-[11px]"
              style={{ color: tx.pending || tx.statusLabel ? accent : undefined }}
            >
              <span
                className={
                  tx.pending || (tx.statusLabel && tx.source !== "chain")
                    ? ""
                    : "text-[var(--kura-text-secondary)]"
                }
              >
                {subtitle.primary}
              </span>
            </p>
            {subtitle.secondary ? (
              <p className="truncate font-mono text-[10px] text-[var(--kura-text-secondary)] opacity-80">
                {subtitle.secondary}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="mb-0.5 text-[13px] font-bold tabular-nums" style={{ color: accent }}>
          {amount}
        </p>
        <p className="text-[11px] text-[var(--kura-text-secondary)] opacity-70">
          {formatTxRelativeTime(tx.timestamp)}
        </p>
      </div>

      {clickable ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--kura-text-secondary)] opacity-50" />
      ) : null}
    </button>
  );
}

export function WalletTxRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--kura-border)] px-4 py-3.5 last:border-b-0">
      <div className="h-[38px] w-[38px] shrink-0 animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/5 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
        <div className="h-2.5 w-3/5 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
      </div>
      <div className="space-y-1.5 text-right">
        <div className="ml-auto h-3 w-[70px] animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
        <div className="ml-auto h-2.5 w-10 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
      </div>
    </div>
  );
}
