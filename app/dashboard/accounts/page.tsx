"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { PlaidApiError, disconnectPlaidItem } from '@/lib/plaidApi';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getAccountDisplayName(name: string, mask?: string): string {
  return mask ? `${name} ••${mask}` : name;
}

function parseBankAccountName(rawName: string, mask?: string): { institutionName: string; accountLabel: string } {
  const [institutionPart, accountPart] = rawName.split('·').map((part) => part.trim());
  const institutionName = institutionPart || rawName;

  let accountLabel = accountPart || institutionName;
  if (mask) {
    const escapedMask = mask.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    accountLabel = accountLabel.replace(new RegExp(`\\s*${escapedMask}$`), '').trim();
  }

  return { institutionName, accountLabel };
}

function parseInstitutionName(rawName: string): string {
  const [institutionPart] = rawName.split('·').map((part) => part.trim());
  return institutionPart || rawName;
}

function getInvestmentAccountLabel(rawName: string, accountType: 'Broker' | 'Exchange' | 'Web3 Wallet'): string {
  const normalized = rawName.toLowerCase();

  if (normalized.includes('roth ira')) return 'Roth IRA';
  if (normalized.includes('traditional ira')) return 'Traditional IRA';
  if (normalized.includes('ira')) return 'IRA';
  if (normalized.includes('401k') || normalized.includes('401(k)')) return '401K';
  if (normalized.includes('retirement')) return 'Retirement';
  if (normalized.includes('brokerage') || normalized.includes('investment')) return 'Investment';

  if (accountType === 'Broker') return 'Investment';
  if (accountType === 'Exchange') return 'Exchange';
  return 'Wallet';
}

export default function AccountsPage() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'bank' | 'investment' | 'wallet'>('bank');
  const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(null);
  const [nicknameByAccountId, setNicknameByAccountId] = useState<Record<string, string>>({});
  const [unlinkingAccountId, setUnlinkingAccountId] = useState<string | null>(null);
  const accounts = useFinanceStore((state) => state.accounts);
  const investmentAccounts = useFinanceStore((state) => state.investmentAccounts);
  const investments = useFinanceStore((state) => state.investments);
  const isLoadingPlaidData = useFinanceStore((state) => state.isLoadingPlaidData);
  const disconnectInvestmentAccount = useFinanceStore((state) => state.disconnectInvestmentAccount);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const membershipLabel = useAppStore((state) => state.userProfile.membershipLabel);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('[data-account-menu-root="true"]') ||
        target.closest('[data-account-menu-trigger="true"]')
      ) {
        return;
      }
      setOpenMenuAccountId(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
        const { institutionName, accountLabel } = parseBankAccountName(account.name, account.mask);
        const nickname = nicknameByAccountId[account.id]?.trim();
        const displayName = getAccountDisplayName(nickname || accountLabel, account.mask);

        return {
          id: account.id,
          logo: account.logo,
          displayName,
          typeLabel: account.type,
          institutionLabel: institutionName,
          maskedBalance,
          balanceTone: account.type === 'credit' ? 'credit' as const : 'positive' as const,
          unlinkTarget: 'bank' as const,
        };
      });
    }

    if (activeSection === 'investment') {
      const investmentRows = investmentAccounts
        .filter((account) => account.type === 'Broker' || account.type === 'Exchange')
        .map((account) => {
          const totalValue = getInvestmentValue(account.id);
          const nickname = nicknameByAccountId[account.id]?.trim();
          const institutionName = parseInstitutionName(account.name);
          const accountLabel = getInvestmentAccountLabel(account.name, account.type);
          return {
            id: account.id,
            logo: account.logo,
            displayName: nickname || accountLabel,
            typeLabel: account.type,
            institutionLabel: institutionName,
            maskedBalance: isBalanceHidden ? '••••••' : formatCurrency(totalValue),
            balanceTone: 'positive' as const,
            unlinkTarget: 'investment' as const,
          };
        });

      return investmentRows;
    }

    return investmentAccounts
      .filter((account) => account.type === 'Web3 Wallet')
      .map((account) => {
        const totalValue = getInvestmentValue(account.id);
        const nickname = nicknameByAccountId[account.id]?.trim();
        return {
          id: account.id,
          logo: account.logo,
          displayName: nickname || account.name,
          typeLabel: account.type,
          institutionLabel: account.name,
          maskedBalance: isBalanceHidden ? '••••••' : formatCurrency(totalValue),
          balanceTone: 'positive' as const,
          unlinkTarget: 'investment' as const,
        };
      });
  }, [activeSection, accounts, investmentAccounts, investments, isBalanceHidden, nicknameByAccountId]);

  const emptyStateText = useMemo(() => {
    if (activeSection === 'bank') return 'No bank accounts connected yet.';
    if (activeSection === 'investment') return 'No investment accounts connected yet.';
    return 'No wallet addresses connected yet.';
  }, [activeSection]);

  const handleEditNickname = (accountId: string, currentDisplayName: string) => {
    const nextNickname = window.prompt('Edit nickname', currentDisplayName);
    if (nextNickname === null) return;

    const trimmed = nextNickname.trim();
    setNicknameByAccountId((prev) => {
      if (!trimmed) {
        const next = { ...prev };
        delete next[accountId];
        return next;
      }
      return { ...prev, [accountId]: trimmed };
    });
    setOpenMenuAccountId(null);
  };

  const handleUnlink = async (
    accountId: string,
    unlinkTarget: 'bank' | 'investment',
    accountType: string,
  ) => {
    setOpenMenuAccountId(null);
    setUnlinkingAccountId(accountId);
    try {
      const shouldUsePlaidDisconnect =
        unlinkTarget === 'bank' || accountType === 'Broker';

      if (shouldUsePlaidDisconnect) {
        await disconnectPlaidItem(accountId);
        await hydratePlaidFinanceData();
      } else {
        disconnectInvestmentAccount(accountId);
      }
    } catch (error) {
      const message = error instanceof PlaidApiError ? error.message : 'Failed to unlink account.';
      alert(message);
    } finally {
      setUnlinkingAccountId(null);
    }
  };

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-8 max-w-6xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
          <div className="mt-3 border-b border-[var(--kura-border)]">
            <div className="flex items-center gap-5 text-sm text-[var(--kura-text-secondary)] -mb-px">
              <button
                type="button"
                onClick={() => setActiveSection('bank')}
                className={`cursor-pointer pb-2 border-b-2 transition-colors ${
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
                className={`cursor-pointer pb-2 border-b-2 transition-colors ${
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
                className={`cursor-pointer pb-2 border-b-2 transition-colors ${
                  activeSection === 'wallet'
                    ? 'border-[var(--kura-primary)] text-[var(--kura-text)]'
                    : 'border-transparent hover:text-[var(--kura-text)]'
                }`}
              >
                Wallet address
              </button>
            </div>
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

      <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] overflow-visible">
        <div className="grid grid-cols-[1.7fr_0.7fr_auto] gap-4 px-4 py-3 text-xs uppercase tracking-wide text-[var(--kura-text-secondary)] border-b border-[var(--kura-border)]">
          <div>Account</div>
          <div>Balance</div>
          <div className="w-8" />
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
            <div key={row.id} className="grid grid-cols-[1.7fr_0.7fr_auto] gap-4 px-4 py-3 items-center border-b border-[var(--kura-border-light)] last:border-b-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  {row.logo ? (
                    <Image src={row.logo} alt={row.displayName} width={32} height={32} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">{row.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">{row.displayName}</p>
                    {membershipLabel && (
                      <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-[var(--kura-border)] text-[var(--kura-text-secondary)] bg-[var(--kura-bg-light)] whitespace-nowrap">
                        {membershipLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--kura-text-secondary)] truncate">
                    {row.typeLabel} – {row.institutionLabel}
                  </p>
                </div>
              </div>

              <p className={`text-sm font-mono ${row.balanceTone === 'credit' ? 'text-[var(--kura-error)]' : 'text-[var(--kura-success)]'}`}>
                {row.maskedBalance}
              </p>

              <div className="relative">
                <button
                  type="button"
                  data-account-menu-trigger="true"
                  onClick={() => setOpenMenuAccountId((prev) => (prev === row.id ? null : row.id))}
                  className="w-8 h-8 rounded-md border border-transparent hover:border-[var(--kura-border)] hover:bg-[var(--kura-border-light)] text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)] transition-colors disabled:opacity-50"
                  disabled={unlinkingAccountId === row.id}
                  aria-label="Account actions"
                >
                  ⋮
                </button>

                {openMenuAccountId === row.id && (
                  <div
                    data-account-menu-root="true"
                    className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] shadow-lg p-1"
                  >
                    <button
                      type="button"
                      onClick={() => handleEditNickname(row.id, row.displayName)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--kura-border-light)] transition-colors"
                    >
                      Edit Nickname
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUnlink(row.id, row.unlinkTarget, row.typeLabel)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--kura-error)] hover:bg-[var(--kura-border-light)] transition-colors"
                    >
                      Unlink
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
