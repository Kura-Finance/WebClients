"use client";

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getAccountDisplayName(name: string, mask?: string): string {
  return mask ? `${name} • •${mask}` : name;
}

export default function AccountsPage() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'bank' | 'investment' | 'wallet'>('bank');
  const accounts = useFinanceStore((state) => state.accounts);
  const investmentAccounts = useFinanceStore((state) => state.investmentAccounts);
  const investments = useFinanceStore((state) => state.investments);
  const isLoadingPlaidData = useFinanceStore((state) => state.isLoadingPlaidData);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);

  const availableBalance = useMemo(() => {
    const getInvestmentValue = (accountId: string): number => {
      return investments
        .filter((investment) => investment.accountId === accountId)
        .reduce((sum, investment) => sum + investment.holdings * investment.currentPrice, 0);
    };

    if (activeSection === 'bank') {
      return accounts.reduce((sum, account) => {
        const rawBalance = Number(account.balance) || 0;
        if (account.type === 'credit') {
          return sum - Math.abs(rawBalance);
        }
        return sum + rawBalance;
      }, 0);
    }

    if (activeSection === 'investment') {
      return investmentAccounts
        .filter((account) => account.type === 'Broker' || account.type === 'Exchange')
        .reduce((sum, account) => sum + getInvestmentValue(account.id), 0);
    }

    return investmentAccounts
      .filter((account) => account.type === 'Web3 Wallet')
      .reduce((sum, account) => sum + getInvestmentValue(account.id), 0);
  }, [activeSection, accounts, investmentAccounts, investments]);

  const rows = useMemo(() => {
    const getInvestmentValue = (accountId: string): number => {
      return investments
        .filter((investment) => investment.accountId === accountId)
        .reduce((sum, investment) => sum + investment.holdings * investment.currentPrice, 0);
    };

    if (activeSection === 'bank') {
      return accounts.map((account) => {
        const balanceText = account.type === 'credit' ? `-${formatCurrency(account.balance)}` : formatCurrency(account.balance);
        const maskedBalance = isBalanceHidden ? '••••••' : balanceText;

        return {
          id: account.id,
          logo: account.logo,
          displayName: getAccountDisplayName(account.type, account.mask),
          typeLabel: account.type,
          maskedBalance,
          balanceTone: account.type === 'credit' ? 'credit' as const : 'positive' as const,
        };
      });
    }

    if (activeSection === 'investment') {
      const investmentRows = investmentAccounts
        .filter((account) => account.type === 'Broker' || account.type === 'Exchange')
        .map((account) => {
          const totalValue = getInvestmentValue(account.id);
          return {
            id: account.id,
            logo: account.logo,
            displayName: account.name,
            typeLabel: account.type,
            maskedBalance: isBalanceHidden ? '••••••' : formatCurrency(totalValue),
            balanceTone: 'positive' as const,
          };
        });

      return investmentRows;
    }

    return investmentAccounts
      .filter((account) => account.type === 'Web3 Wallet')
      .map((account) => {
        const totalValue = getInvestmentValue(account.id);
        return {
          id: account.id,
          logo: account.logo,
          displayName: account.name,
          typeLabel: account.type,
          maskedBalance: isBalanceHidden ? '••••••' : formatCurrency(totalValue),
          balanceTone: 'positive' as const,
        };
      });
  }, [activeSection, accounts, investmentAccounts, investments, isBalanceHidden]);

  const emptyStateText = useMemo(() => {
    if (activeSection === 'bank') return 'No bank accounts connected yet.';
    if (activeSection === 'investment') return 'No investment accounts connected yet.';
    return 'No wallet addresses connected yet.';
  }, [activeSection]);

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-8 max-w-6xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
          <div className="mt-3 flex items-center gap-5 text-sm text-[var(--kura-text-secondary)]">
            <button
              type="button"
              onClick={() => setActiveSection('bank')}
              className={`pb-2 border-b transition-colors ${
                activeSection === 'bank'
                  ? 'border-[var(--kura-primary)] text-[var(--kura-text)]'
                  : 'border-transparent hover:text-[var(--kura-text)]'
              }`}
            >
              Bank accounts
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('investment')}
              className={`pb-2 border-b transition-colors ${
                activeSection === 'investment'
                  ? 'border-[var(--kura-primary)] text-[var(--kura-text)]'
                  : 'border-transparent hover:text-[var(--kura-text)]'
              }`}
            >
              Investment accounts
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('wallet')}
              className={`pb-2 border-b transition-colors ${
                activeSection === 'wallet'
                  ? 'border-[var(--kura-primary)] text-[var(--kura-text)]'
                  : 'border-transparent hover:text-[var(--kura-text)]'
              }`}
            >
              Wallet address
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsConnectModalOpen(true)}>
            Add account
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs text-[var(--kura-text-secondary)] uppercase tracking-wide mb-1">Available</p>
        <p className="text-4xl font-medium">{isBalanceHidden ? '••••••' : `${availableBalance < 0 ? '-' : ''}${formatCurrency(availableBalance)}`}</p>
      </div>

      <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] overflow-hidden">
        <div className="grid grid-cols-[1.7fr_0.7fr] gap-4 px-4 py-3 text-xs uppercase tracking-wide text-[var(--kura-text-secondary)] border-b border-[var(--kura-border)]">
          <div>Account</div>
          <div>Balance</div>
        </div>

        {isLoadingPlaidData ? (
          <div className="px-4 py-6 text-sm text-[var(--kura-text-secondary)]">Loading accounts...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[var(--kura-text-secondary)] flex items-center justify-between gap-3">
            <span>{emptyStateText}</span>
            <Button size="sm" onClick={() => setIsConnectModalOpen(true)}>
              Connect account
            </Button>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1.7fr_0.7fr] gap-4 px-4 py-3 items-center border-b border-[var(--kura-border-light)] last:border-b-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  {row.logo ? (
                    <Image src={row.logo} alt={row.displayName} width={32} height={32} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">{row.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{row.displayName}</p>
                  <p className="text-xs text-[var(--kura-text-secondary)]">{row.typeLabel}</p>
                </div>
              </div>

              <p className={`text-sm font-mono ${row.balanceTone === 'credit' ? 'text-red-400' : 'text-emerald-400'}`}>
                {row.maskedBalance}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
