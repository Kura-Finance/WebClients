"use client";

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  /** "receive" 顯示收款；"topup" 顯示為錢包儲值。 */
  mode?: 'receive' | 'topup';
  network?: string;
}

export default function ReceiveModal({
  isOpen,
  onClose,
  address,
  mode = 'receive',
  network = 'Base',
}: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'topup' ? 'Add Funds' : 'Receive'}
      description={`Send only USDC on ${network} to this address.`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="rounded-2xl bg-white p-4">
          <QrPlaceholder value={address ?? ''} />
        </div>

        <div className="w-full">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Your {network} address
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] px-3 py-2.5">
            <span className="min-w-0 flex-1 break-all font-mono text-xs text-[var(--kura-text)]">
              {address ?? 'No wallet address available'}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--kura-warning)]/30 bg-[var(--kura-warning)]/10 px-3 py-2.5 text-xs text-[var(--kura-warning)]">
          Only send USDC on the {network} network. Other assets may be lost.
        </div>

        <Button onClick={handleCopy} disabled={!address} className="w-full" size="lg">
          {copied ? 'Copied!' : 'Copy Address'}
        </Button>
      </div>
    </Modal>
  );
}

/** 簡易 QR 視覺佔位（待接入 QR 產生器）。 */
function QrPlaceholder({ value }: { value: string }) {
  const cells = React.useMemo(() => {
    const size = 21;
    const out: boolean[] = [];
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    for (let i = 0; i < size * size; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      out.push((seed >> 8) % 2 === 0);
    }
    return out;
  }, [value]);

  return (
    <div
      className="grid h-40 w-40"
      style={{ gridTemplateColumns: 'repeat(21, 1fr)', gridTemplateRows: 'repeat(21, 1fr)' }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-black' : 'bg-white'} />
      ))}
    </div>
  );
}
