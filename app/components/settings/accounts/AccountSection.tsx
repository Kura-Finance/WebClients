import React from 'react';
import Image from 'next/image';
import { AccountListItem } from './types';

interface AccountSectionProps {
  title: string;
  emptyText: string;
  accounts: AccountListItem[];
  disconnectingId: string | null;
  onDisconnectClick: (account: AccountListItem) => void;
}

export default function AccountSection({
  title,
  emptyText,
  accounts,
  disconnectingId,
  onDisconnectClick,
}: AccountSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--kura-text-secondary)]">
        {title}
      </h3>
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4 text-sm text-[var(--kura-text-secondary)]">
          {emptyText}
        </div>
      ) : (
        accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={acc.logo}
                alt={acc.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-[var(--kura-surface)] object-contain p-1"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[var(--kura-text)]">{acc.name}</div>
                <div className="text-xs text-[var(--kura-text-secondary)]">{acc.subtitle}</div>
              </div>
            </div>
            <button
              onClick={() => onDisconnectClick(acc)}
              disabled={disconnectingId === acc.id}
              className="rounded-lg px-3 py-1.5 text-xs text-[var(--kura-error-fg)] transition-colors hover:bg-[var(--kura-error-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disconnectingId === acc.id ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ))
      )}
    </section>
  );
}
