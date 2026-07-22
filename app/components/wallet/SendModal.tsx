"use client";

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  symbol?: string;
  network?: string;
  isSending?: boolean;
  onSend?: (params: { to: string; amount: number }) => Promise<void> | void;
}

export default function SendModal({
  isOpen,
  onClose,
  balance,
  symbol = 'USDC',
  network = 'Base',
  isSending = false,
  onSend,
}: SendModalProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(to.trim());
  const canSend = isValidAddress && numericAmount > 0 && numericAmount <= balance && !isSending;

  const handleSubmit = async () => {
    setError(null);
    if (!isValidAddress) {
      setError('Enter a valid recipient address.');
      return;
    }
    if (!(numericAmount > 0)) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (numericAmount > balance) {
      setError('Amount exceeds your available balance.');
      return;
    }
    await onSend?.({ to: to.trim(), amount: numericAmount });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send" description={`Send ${symbol} on ${network}.`}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Recipient address
          </label>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x…"
            className="font-mono"
            spellCheck={false}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
              Amount
            </label>
            <button
              type="button"
              onClick={() => setAmount(String(balance))}
              className="text-[11px] font-semibold text-[var(--kura-primary)] hover:underline"
            >
              Max: {balance.toFixed(2)} {symbol}
            </button>
          </div>
          <div className="relative">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="pr-16"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--kura-text-secondary)]">
              {symbol}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] px-3 py-2 text-xs text-[var(--kura-error-fg)]">
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!canSend} className="w-full" size="lg">
          {isSending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </Modal>
  );
}
