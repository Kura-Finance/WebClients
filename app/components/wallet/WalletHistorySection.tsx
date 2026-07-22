"use client";

import React, { useMemo, useState } from "react";
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

interface WalletHistorySectionProps {
  activities: WalletActivity[];
  loading: boolean;
  error: string | null;
  hidden?: boolean;
  hasWallet?: boolean;
  previewLimit?: number;
}

function truncate(address: string): string {
  if (!address || address.length < 12) return address || "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletHistorySection({
  activities,
  loading,
  error,
  hidden = false,
  hasWallet = true,
  previewLimit = HOME_TX_PREVIEW_LIMIT,
}: WalletHistorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<WalletActivity | null>(null);

  const visible = useMemo(
    () => (expanded ? activities : activities.slice(0, previewLimit)),
    [activities, expanded, previewLimit],
  );
  const showViewAll = !expanded && activities.length > previewLimit;

  return (
    <section className="mt-6">
      <h2 className="mb-3.5 text-base font-semibold text-[var(--kura-text)]">History</h2>

      <div className="overflow-hidden rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)]">
        {error ? (
          <div className="m-3.5 flex items-start gap-2 rounded-[10px] border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] px-2.5 py-2.5 text-xs text-[var(--kura-error-fg)]">
            {error}
          </div>
        ) : null}

        {loading && activities.length === 0 ? (
          <div>
            {[0, 1, 2].map((i) => (
              <WalletTxRowSkeleton key={i} />
            ))}
          </div>
        ) : !loading && activities.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <Receipt className="mb-2 h-7 w-7 text-[var(--kura-text-secondary)] opacity-50" />
            <p className="text-[13px] text-[var(--kura-text-secondary)]">
              {hasWallet
                ? "No transactions yet"
                : "Register a smart account to see history"}
            </p>
            <p className="mt-1 text-[11px] text-[var(--kura-text-secondary)] opacity-70">
              Send, transfer, or top up to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--kura-border)]">
            {visible.map((tx) => (
              <WalletTxRow
                key={tx.id}
                tx={tx}
                hidden={hidden}
                onClick={setSelected}
              />
            ))}
          </div>
        )}

        {showViewAll ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex w-full items-center justify-center gap-1 border-t border-[var(--kura-border)] py-3.5 text-sm font-semibold text-[var(--kura-primary-light)] transition-colors hover:bg-[var(--kura-bg-light)]/30"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}

        {expanded && activities.length > previewLimit ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex w-full items-center justify-center gap-1 border-t border-[var(--kura-border)] py-3.5 text-sm font-semibold text-[var(--kura-text-secondary)] transition-colors hover:bg-[var(--kura-bg-light)]/30"
          >
            Show less
          </button>
        ) : null}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
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
              <Button type="button" className="flex-1" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
