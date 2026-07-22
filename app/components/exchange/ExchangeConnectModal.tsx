"use client";

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EXCHANGES = [
  { id: 'binance', label: 'Binance', color: '#F0B90B' },
  { id: 'okx', label: 'OKX', color: '#000000' },
  { id: 'coinbase', label: 'Coinbase', color: '#0052FF' },
  { id: 'kraken', label: 'Kraken', color: '#5741D9' },
  { id: 'bybit', label: 'Bybit', color: '#F7A600' },
  { id: 'kucoin', label: 'KuCoin', color: '#23AF91' },
  { id: 'bitget', label: 'Bitget', color: '#00F0FF' },
  { id: 'gateio', label: 'Gate.io', color: '#2354E6' },
  { id: 'huobi', label: 'Huobi', color: '#1A74E8' },
] as const;

export type ExchangeId = (typeof EXCHANGES)[number]['id'];

interface ExchangeConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (params: { exchange: ExchangeId; apiKey: string; apiSecret: string; passphrase?: string }) => Promise<void> | void;
}

export default function ExchangeConnectModal({ isOpen, onClose, onConnect }: ExchangeConnectModalProps) {
  const [selected, setSelected] = useState<ExchangeId | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const needsPassphrase = selected === 'okx' || selected === 'kucoin' || selected === 'coinbase';
  const canSubmit = !!selected && apiKey.trim() && apiSecret.trim() && (!needsPassphrase || passphrase.trim()) && !submitting;

  const reset = () => {
    setSelected(null);
    setApiKey('');
    setApiSecret('');
    setPassphrase('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onConnect?.({ exchange: selected, apiKey: apiKey.trim(), apiSecret: apiSecret.trim(), passphrase: passphrase.trim() || undefined });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Connect Exchange"
      description={selected ? 'Enter your read-only API credentials.' : 'Select an exchange to connect.'}
    >
      {!selected ? (
        <div className="grid grid-cols-3 gap-3">
          {EXCHANGES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setSelected(ex.id)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] px-3 py-4 transition-colors hover:border-[var(--kura-primary)]/50"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: ex.color }}
              >
                {ex.label.slice(0, 1)}
              </span>
              <span className="text-xs font-medium text-[var(--kura-text)]">{ex.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="self-start text-xs font-semibold text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          >
            ← Choose another exchange
          </button>

          <Field label="API Key">
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Your API key" className="font-mono" spellCheck={false} />
          </Field>
          <Field label="API Secret">
            <Input value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Your API secret" type="password" className="font-mono" spellCheck={false} />
          </Field>
          {needsPassphrase && (
            <Field label="Passphrase">
              <Input value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="API passphrase" type="password" className="font-mono" spellCheck={false} />
            </Field>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-[var(--kura-warning)]/30 bg-[var(--kura-warning)]/10 px-3 py-2.5 text-xs text-[var(--kura-warning)]">
            Use read-only API keys. Never enable withdrawal permissions.
          </div>

          <Button className="w-full" size="lg" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'Connecting…' : 'Connect'}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  );
}
