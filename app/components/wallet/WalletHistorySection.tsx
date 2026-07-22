"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import type { WalletActivity } from "@/hooks/useWalletActivity";
import {
  formatTxFullDate,
  formatTxListAmount,
  getTxTypeLabel,
  HOME_TX_PREVIEW_LIMIT,
} from "@/lib/walletTxDisplay";
import WalletTxRow, { WalletTxRowSkeleton } from "@/components/wallet/WalletTxRow";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/dashboard/PageShell";

interface WalletHistorySectionProps {
  activities: WalletActivity[];
  loading: boolean;
  error: string | null;
  hidden?: boolean;
  hasWallet?: boolean;
  previewLimit?: number;
  /** Link target for "View all" — defaults to /dashboard/history */
  allHref?: string;
}

function truncate(address: string): string {
  if (!address || address.length < 12) return address || "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletTxDetailModal({
  selected,
  onClose,
  hidden = false,
}: {
  selected: WalletActivity | null;
  onClose: () => void;
  hidden?: boolean;
}) {
  return (
    <Modal
      isOpen={!!selected}
      onClose={onClose}
      title={selected ? getTxTypeLabel(selected) : "Transaction"}
      description={selected ? formatTxFullDate(selected.timestamp) : undefined}
    >
      {selected ? (
        <div className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--kura-text-secondary)]">Amount</dt>
              <dd className="font-semibold tabular-nums text-[var(--kura-text)]">
                {hidden ? "••••••" : formatTxListAmount(selected)}
              </dd>
            </div>
            {selected.subtitle ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--kura-text-secondary)]">Details</dt>
                <dd className="max-w-[60%] text-right text-[var(--kura-text)]">
                  {selected.subtitle}
                </dd>
              </div>
            ) : null}
            {selected.statusLabel ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--kura-text-secondary)]">Status</dt>
                <dd className="text-[var(--kura-text)]">{selected.statusLabel}</dd>
              </div>
            ) : null}
            {selected.hash ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--kura-text-secondary)]">Tx hash</dt>
                <dd className="font-mono text-xs text-[var(--kura-text)]">
                  {truncate(selected.hash)}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row">
            {selected.hash ? (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={`https://basescan.org/tx/${selected.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Basescan
                </a>
              </Button>
            ) : null}
            <Button type="button" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default function WalletHistorySection({
  activities,
  loading,
  error,
  hidden = false,
  hasWallet = true,
  previewLimit = HOME_TX_PREVIEW_LIMIT,
  allHref = "/dashboard/history",
}: WalletHistorySectionProps) {
  const [selected, setSelected] = useState<WalletActivity | null>(null);

  const visible = useMemo(
    () => activities.slice(0, previewLimit),
    [activities, previewLimit],
  );
  const showViewAll = !loading && activities.length > previewLimit;

  return (
    <Panel padding="none" className="overflow-hidden">
      <div className="px-5 pt-5">
        <PanelHeader
          title="History"
          description="Recent Smart Wallet activity"
          action={
            <Link
              href={allHref}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--kura-primary)] hover:underline"
            >
              All history
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </div>

      {error ? (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-[10px] border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] px-2.5 py-2.5 text-xs text-[var(--kura-error-fg)]">
          {error}
        </div>
      ) : null}

      {loading && activities.length === 0 ? (
        <div>
          {[0, 1, 2, 3, 4].map((i) => (
            <WalletTxRowSkeleton key={i} />
          ))}
        </div>
      ) : !loading && activities.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Receipt className="mb-2 h-7 w-7 text-[var(--kura-text-secondary)] opacity-50" />
          <p className="text-[13px] text-[var(--kura-text-secondary)]">
            {hasWallet ? "No transactions yet" : "Register a smart account to see history"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--kura-text-secondary)] opacity-70">
            Send, transfer, or top up to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--kura-border)]">
          {visible.map((tx) => (
            <WalletTxRow key={tx.id} tx={tx} hidden={hidden} onClick={setSelected} />
          ))}
        </div>
      )}

      {showViewAll && activities.length > 0 ? (
        <Link
          href={allHref}
          className="flex w-full items-center justify-center gap-1 border-t border-[var(--kura-border)] py-3.5 text-sm font-semibold text-[var(--kura-primary-light)] transition-colors hover:bg-[var(--kura-bg-light)]/30"
        >
          View all history
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}

      <WalletTxDetailModal
        selected={selected}
        onClose={() => setSelected(null)}
        hidden={hidden}
      />
    </Panel>
  );
}
