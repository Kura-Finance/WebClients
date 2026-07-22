import React from 'react';
import { PendingDisconnect } from './types';

interface DisconnectConfirmDialogProps {
  pendingDisconnect: PendingDisconnect | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DisconnectConfirmDialog({
  pendingDisconnect,
  onCancel,
  onConfirm,
}: DisconnectConfirmDialogProps) {
  if (!pendingDisconnect) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-5 shadow-[0_20px_50px_rgba(18,19,26,0.2)]">
        <h4 className="text-base font-semibold text-[var(--kura-text)]">Confirm Disconnect</h4>
        <p className="mt-2 text-sm text-[var(--kura-text-secondary)]">
          Disconnect{' '}
          <span className="font-medium text-[var(--kura-text)]">{pendingDisconnect.name}</span>?
          Related synced data in this app view will be removed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-[var(--kura-bg-light)] px-3 py-2 text-sm text-[var(--kura-text-secondary)] transition-colors hover:bg-[var(--kura-bg-lighter)] hover:text-[var(--kura-text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[var(--kura-error)] px-3 py-2 text-sm text-[var(--kura-on-primary)] transition-colors hover:brightness-110"
          >
            Confirm Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
