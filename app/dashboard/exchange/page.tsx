"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExchangeConnectModal, { EXCHANGES } from '@/components/exchange/ExchangeConnectModal';
import { useExchangeStore } from '@/store/useExchangeStore';
import { useAppStore } from '@/store/useAppStore';

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maskIfHidden(hidden: boolean, value: string): string {
  return hidden ? '••••••' : value;
}

function exchangeMeta(exchange: string) {
  return EXCHANGES.find((e) => e.id === exchange) ?? { id: exchange, label: exchange, color: '#8b5cf6' };
}

export default function ExchangePage() {
  const accounts = useExchangeStore((s) => s.exchangeAccounts);
  const investments = useExchangeStore((s) => s.exchangeInvestments);
  const removeExchangeAccount = useExchangeStore((s) => s.removeExchangeAccount);
  const isBalanceHidden = useAppStore((s) => s.isBalanceHidden);

  const [showConnect, setShowConnect] = useState(false);

  const totalValue = investments.reduce((sum, i) => sum + i.holdings * i.currentPrice, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 sm:px-10 lg:px-16">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardDescription>Exchange Balance</CardDescription>
              <CardTitle className="text-4xl tracking-tight">
                {maskIfHidden(isBalanceHidden, formatCurrency(totalValue))}
              </CardTitle>
            </div>
            <Button onClick={() => setShowConnect(true)}>+ Connect</Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Connected Exchanges</CardTitle>
          <CardDescription>{accounts.length} connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[var(--kura-border)] px-4 py-12 text-center">
              <p className="text-sm text-[var(--kura-text-secondary)]">No exchanges connected yet.</p>
              <Button variant="secondary" onClick={() => setShowConnect(true)}>
                Connect your first exchange
              </Button>
            </div>
          ) : (
            accounts.map((acc) => {
              const meta = exchangeMeta(acc.exchange);
              const accountValue = investments
                .filter((i) => i.accountId === acc.id)
                .reduce((sum, i) => sum + i.holdings * i.currentPrice, 0);
              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.label.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--kura-text)]">{acc.accountName || meta.label}</p>
                      <p className="text-xs text-[var(--kura-text-secondary)]">
                        {acc.lastSyncedAt ? `Synced ${new Date(acc.lastSyncedAt).toLocaleDateString()}` : 'Not synced yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{maskIfHidden(isBalanceHidden, formatCurrency(accountValue))}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeExchangeAccount(acc.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Supported Exchanges</CardTitle>
            <CardDescription>Connect via read-only API keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EXCHANGES.map((ex) => (
                <Badge key={ex.id} variant="outline" className="gap-2 py-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ex.color }} />
                  {ex.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ExchangeConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </div>
  );
}
