"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';

export default function TransactionsPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const accounts = useFinanceStore((state) => state.accounts);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const [keyword, setKeyword] = useState('');

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

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) return sorted;

    return sorted.filter((transaction) => {
      return (
        transaction.merchant.toLowerCase().includes(normalizedKeyword) ||
        transaction.category.toLowerCase().includes(normalizedKeyword) ||
        transaction.accountName.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [transactions, keyword]);

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return filteredTransactions.reduce(
      (acc, transaction) => {
        const txDate = new Date(transaction.date);
        if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) {
          return acc;
        }

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

  const accountNameById = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account.name]));
  }, [accounts]);

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
        <Button variant="secondary" className="h-9">
          Export all
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm">Data views</Button>
        <Button variant="secondary" size="sm">Filters</Button>
        <Button variant="secondary" size="sm">Date</Button>
        <Button variant="secondary" size="sm">Amount</Button>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search"
          className="h-8 w-44 sm:w-52 border-[var(--kura-border)] bg-[var(--kura-bg-light)]"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4">
        <div>
          <p className="text-xs text-[var(--kura-text-secondary)] uppercase tracking-wide">Net change this month</p>
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
            const resolvedAccountName = accountNameById.get(transaction.accountId) ?? transaction.accountName;
            const sourceAccount = `${transaction.accountType} • ${resolvedAccountName}`;
            const merchantLogo = (transaction as { merchantLogo?: string }).merchantLogo;

            return (
              <div
                key={transaction.id}
                className="grid grid-cols-[0.8fr_2.2fr_1fr_1.4fr_1.2fr_0.7fr] gap-3 px-4 py-3 items-center border-b border-[var(--kura-border-light)] last:border-b-0 text-sm"
              >
                <div className="text-[var(--kura-text-secondary)]">{formatDate(transaction.date)}</div>
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                    {merchantLogo ? (
                      <Image
                        src={merchantLogo}
                        alt={transaction.merchant}
                        width={32}
                        height={32}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[var(--kura-text)]">
                        {transaction.merchant.charAt(0).toUpperCase()}
                      </span>
                    )}
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
