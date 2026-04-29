"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';

type DatePreset = 'all' | 'thisMonth' | 'last30' | 'custom';
type AmountDirection = 'any' | 'in' | 'out';

const passthroughImageLoader = ({ src }: { src: string }) => src;

function getDateRangeByPreset(preset: Exclude<DatePreset, 'custom'>): { from: string; to: string } {
  if (preset === 'all') {
    return { from: '', to: '' };
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (preset === 'thisMonth') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to: today,
    };
  }

  return {
    from: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: today,
  };
}

export default function TransactionsPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const accounts = useFinanceStore((state) => state.accounts);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const [keyword, setKeyword] = useState('');
  const [openPopover, setOpenPopover] = useState<'date' | 'amount' | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountDirection, setAmountDirection] = useState<AmountDirection>('any');
  const [specificAmount, setSpecificAmount] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const handleDatePresetChange = (nextPreset: DatePreset) => {
    setDatePreset(nextPreset);
    if (nextPreset === 'custom') return;

    const { from, to } = getDateRangeByPreset(nextPreset);
    setDateFrom(from);
    setDateTo(to);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!toolbarRef.current?.contains(target)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const parseAmount = (rawAmount: string): number => {
    const parsed = Number(rawAmount);
    return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
  };

  const parseFilterNumber = (raw: string): number | null => {
    if (raw.trim() === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.abs(parsed) : null;
  };

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const normalizedKeyword = keyword.trim().toLowerCase();
    const exactAmount = parseFilterNumber(specificAmount);
    const min = parseFilterNumber(minAmount);
    const max = parseFilterNumber(maxAmount);
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return sorted.filter((transaction) => {
      const amount = parseAmount(transaction.amount);
      const txDate = new Date(transaction.date).getTime();
      const isOut = transaction.type === 'credit';
      const isIn = !isOut;

      if (normalizedKeyword) {
        const matchesKeyword =
          transaction.merchant.toLowerCase().includes(normalizedKeyword) ||
          transaction.category.toLowerCase().includes(normalizedKeyword) ||
          transaction.accountName.toLowerCase().includes(normalizedKeyword);
        if (!matchesKeyword) return false;
      }

      if (fromTs !== null && txDate < fromTs) return false;
      if (toTs !== null && txDate > toTs) return false;

      if (amountDirection === 'in' && !isIn) return false;
      if (amountDirection === 'out' && !isOut) return false;

      if (exactAmount !== null && Math.abs(amount - exactAmount) > 0.0001) return false;
      if (min !== null && amount < min) return false;
      if (max !== null && amount > max) return false;

      return true;
    });
  }, [transactions, keyword, dateFrom, dateTo, specificAmount, minAmount, maxAmount, amountDirection]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        const amount = parseAmount(transaction.amount);
        if (transaction.type === 'credit') {
          acc.moneyOut += amount;
          acc.netChange -= amount;
        } else {
          acc.moneyIn += amount;
          acc.netChange += amount;
        }
        return acc;
      },
      { moneyIn: 0, moneyOut: 0, netChange: 0 },
    );
  }, [filteredTransactions]);

  const formatAmount = (value: number): string => {
    if (isBalanceHidden) return '••••••';
    return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const metricColor = (value: number): string => {
    if (value > 0) return 'text-[var(--kura-success)]';
    if (value < 0) return 'text-[var(--kura-error)]';
    return 'text-[var(--kura-text-secondary)]';
  };

  const accountMetaById = useMemo(() => {
    return new Map(
      accounts.map((account) => [
        account.id,
        {
          type: account.type,
          mask: account.mask,
        },
      ]),
    );
  }, [accounts]);

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
        <Button variant="secondary" className="h-9">
          Export all
        </Button>
      </div>

      <div ref={toolbarRef} className="mb-4 flex flex-wrap items-center gap-2 relative">
        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setOpenPopover((p) => (p === 'date' ? null : 'date'))}>
            Date {openPopover === 'date' ? '▴' : '▾'}
          </Button>
          {openPopover === 'date' && (
            <div className="absolute left-0 top-9 z-30 w-[320px] rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4 shadow-lg space-y-3">
              <p className="text-xs text-[var(--kura-text-secondary)]">Show transactions for</p>
              <select
                value={datePreset}
                onChange={(event) => handleDatePresetChange(event.target.value as DatePreset)}
                className="w-full h-9 rounded-md border border-[var(--kura-border)] bg-[var(--kura-bg-light)] px-2 text-sm"
              >
                <option value="all">All time</option>
                <option value="thisMonth">This month</option>
                <option value="last30">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-xs text-[var(--kura-text-secondary)]">From</p>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => {
                      setDatePreset('custom');
                      setDateFrom(event.target.value);
                    }}
                    className="h-9 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[var(--kura-text-secondary)]">To</p>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(event) => {
                      setDatePreset('custom');
                      setDateTo(event.target.value);
                    }}
                    className="h-9 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setOpenPopover((p) => (p === 'amount' ? null : 'amount'))}>
            Amount {openPopover === 'amount' ? '▴' : '▾'}
          </Button>
          {openPopover === 'amount' && (
            <div className="absolute left-0 top-9 z-30 w-[320px] rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4 shadow-lg space-y-3">
              <p className="text-xs text-[var(--kura-text-secondary)]">Direction</p>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="amount-direction" checked={amountDirection === 'any'} onChange={() => setAmountDirection('any')} />
                  Any
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="amount-direction" checked={amountDirection === 'in'} onChange={() => setAmountDirection('in')} />
                  In (deposits, refunds)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="amount-direction" checked={amountDirection === 'out'} onChange={() => setAmountDirection('out')} />
                  Out (purchases, charges)
                </label>
              </div>
              <div>
                <p className="mb-1 text-xs text-[var(--kura-text-secondary)]">Specific amount</p>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={specificAmount}
                  onChange={(event) => setSpecificAmount(event.target.value)}
                  placeholder="e.g. 19.99"
                  className="h-9 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-xs text-[var(--kura-text-secondary)]">At least</p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={minAmount}
                    onChange={(event) => setMinAmount(event.target.value)}
                    placeholder="0.00"
                    className="h-9 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[var(--kura-text-secondary)]">No more than</p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={maxAmount}
                    onChange={(event) => setMaxAmount(event.target.value)}
                    placeholder="0.00"
                    className="h-9 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search"
          className="h-8 w-44 sm:w-52 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4">
        <div>
          <p className="text-xs text-[var(--kura-text-secondary)] uppercase tracking-wide">Net change</p>
          <p className={`mt-1 text-lg font-semibold ${metricColor(summary.netChange)}`}>
            {summary.netChange < 0 ? '-' : ''}
            {formatAmount(summary.netChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--kura-text-secondary)] uppercase tracking-wide">Money in</p>
          <p className="mt-1 text-lg font-semibold text-[var(--kura-success)]">
            {formatAmount(summary.moneyIn)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--kura-text-secondary)] uppercase tracking-wide">Money out</p>
          <p className="mt-1 text-lg font-semibold text-[var(--kura-error)]">
            {formatAmount(summary.moneyOut)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] overflow-hidden">
        <div className="grid grid-cols-[0.8fr_2.2fr_1fr_1.4fr_1.2fr_0.7fr] gap-3 px-4 py-3 text-[11px] uppercase tracking-wide text-[var(--kura-text-secondary)] border-b border-[var(--kura-border)]">
          <div>Date</div>
          <div>To/From</div>
          <div>Amount</div>
          <div>Account</div>
          <div>Category</div>
          <div>Attach</div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[var(--kura-text-secondary)] text-center">
            No transactions found.
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const amount = parseAmount(transaction.amount);
            const isCredit = transaction.type === 'credit';
            const accountMeta = accountMetaById.get(transaction.accountId);
            const displayType = accountMeta?.type ?? transaction.accountType;
            const displayMask = accountMeta?.mask ? `••••${accountMeta.mask}` : '••••';
            const sourceAccount = `${displayType} ${displayMask}`;
            const merchantLogo = (transaction as { merchantLogo?: string }).merchantLogo;

            return (
              <div
                key={transaction.id}
                className="grid grid-cols-[0.8fr_2.2fr_1fr_1.4fr_1.2fr_0.7fr] gap-3 px-4 py-3 items-center border-b border-[var(--kura-border-light)] last:border-b-0 text-sm"
              >
                <div className="text-[var(--kura-text-secondary)]">{formatDate(transaction.date)}</div>
                <div className="min-w-0 flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-[#111827]">
                      {transaction.merchant.charAt(0).toUpperCase()}
                    </span>
                    {merchantLogo ? (
                      <Image
                        src={merchantLogo}
                        loader={passthroughImageLoader}
                        unoptimized
                        alt={transaction.merchant}
                        fill
                        sizes="32px"
                        className="absolute inset-0 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="truncate">{transaction.merchant}</div>
                </div>
                <div className={`font-mono ${isCredit ? 'text-[var(--kura-error)]' : 'text-[var(--kura-success)]'}`}>
                  {isCredit ? '-' : '+'}
                  {formatAmount(amount)}
                </div>
                <div className="truncate text-[var(--kura-text-secondary)]">{sourceAccount}</div>
                <div className="truncate text-[var(--kura-text-secondary)]">{transaction.category}</div>
                <div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-base">
                    +
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
