import React from 'react';
import { motion, Variants } from 'framer-motion';
import { PlaidApiError, disconnectPlaidAccount as disconnectPlaidAccountApi } from '@/lib/plaidApi';
import { unlinkDeBankAddress } from '@/lib/debankApi';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import AccountSection from './accounts/AccountSection';
import DisconnectConfirmDialog from './accounts/DisconnectConfirmDialog';
import { AccountListItem, PendingDisconnect } from './accounts/types';

interface AccountsViewProps {
  variants: Variants;
  onConnectAccount: () => void;
}

function getAddressFromWalletAccountId(accountId: string): string | null {
  const match = accountId.match(/^wallet-\d+-(0x[a-fA-F0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? null;
}

export default function AccountsView({ variants, onConnectAccount }: AccountsViewProps) {
  const authStatus = useAppStore(state => state.authStatus);
  const authToken = useAppStore(state => state.authToken);
  const accounts = useFinanceStore(state => state.accounts);
  const investmentAccounts = useFinanceStore(state => state.investmentAccounts);
  const investments = useFinanceStore(state => state.investments);
  const disconnectInvestmentAccount = useFinanceStore(state => state.disconnectInvestmentAccount);
  const hydratePlaidFinanceData = useFinanceStore(state => state.hydratePlaidFinanceData);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const [disconnectingId, setDisconnectingId] = React.useState<string | null>(null);
  const [pendingDisconnect, setPendingDisconnect] = React.useState<PendingDisconnect | null>(null);

  const bankingAccounts = accounts.filter(acc => acc.type !== 'crypto');
  const investmentOnlyAccounts = investmentAccounts.filter(acc => acc.type === 'Broker');
  const cryptoAccounts = investmentAccounts.filter(acc => acc.type === 'Exchange' || acc.type === 'Web3 Wallet');

  const getAccountValue = (accountId: string) => {
    return investments
      .filter(inv => inv.accountId === accountId)
      .reduce((sum, inv) => sum + inv.holdings * inv.currentPrice, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const activeWalletAccountId = address && isConnected
    ? `wallet-${chainId}-${address.toLowerCase()}`
    : null;

  const disconnectPlaidViaApi = async (accountId: string) => {
    if (!authToken) {
      throw new PlaidApiError('Please sign in to disconnect this account.', 401);
    }

    await disconnectPlaidAccountApi(accountId);
    await hydratePlaidFinanceData();
  };

  const handleDisconnectBanking = async (accountId: string) => {
    setDisconnectingId(accountId);

    try {
      await disconnectPlaidViaApi(accountId);
    } catch (error) {
      const message = error instanceof PlaidApiError ? error.message : 'Failed to disconnect account.';
      alert(message);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleDisconnectInvestment = async (accountId: string, accountType: 'Broker' | 'Exchange' | 'Web3 Wallet') => {
    setDisconnectingId(accountId);

    try {
      if (accountType === 'Web3 Wallet') {
        if (activeWalletAccountId === accountId) {
          try {
            await disconnectAsync();
          } catch {
            // 即使錢包 provider 斷線失敗，仍維持 UI / store 狀態一致。
          }
        }

        const walletAddress = getAddressFromWalletAccountId(accountId);
        if (walletAddress && authToken) {
          await unlinkDeBankAddress(walletAddress);
        }

        disconnectInvestmentAccount(accountId);
        return;
      }

      await disconnectPlaidViaApi(accountId);
    } catch (error) {
      const message = error instanceof PlaidApiError ? error.message : 'Failed to disconnect account.';
      alert(message);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!pendingDisconnect) return;

    if (pendingDisconnect.category === 'banking') {
      await handleDisconnectBanking(pendingDisconnect.id);
    } else {
      await handleDisconnectInvestment(pendingDisconnect.id, pendingDisconnect.accountType ?? 'Exchange');
    }

    setPendingDisconnect(null);
  };

  const bankingRows: AccountListItem[] = bankingAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    subtitle: `${acc.type} • ${formatCurrency(acc.balance)}`,
    logo: acc.logo,
  }));

  const investmentRows: AccountListItem[] = investmentOnlyAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    subtitle: `${acc.type} • ${formatCurrency(getAccountValue(acc.id))}`,
    logo: acc.logo,
  }));

  const cryptoRows: AccountListItem[] = cryptoAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    subtitle: `${acc.type} • ${formatCurrency(getAccountValue(acc.id))}`,
    logo: acc.logo,
  }));

  const investmentAccountTypeById = new Map(investmentAccounts.map((acc) => [acc.id, acc.type]));

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 px-6 py-6 space-y-6 overflow-y-auto">
      <p className="mb-2 text-sm text-[var(--kura-text-secondary)]">
        Manage all connected accounts across Banking, Investment, and Crypto.
      </p>
      <div className="rounded-2xl border border-dashed border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4 text-sm text-[var(--kura-text-secondary)]">
        {authStatus === 'authenticated'
          ? 'No accounts are connected yet.'
          : 'Sign in to fetch connected accounts from the backend API.'}
      </div>

      <div className="space-y-6">
        <AccountSection
          title="Banking"
          emptyText="No banking accounts connected."
          accounts={bankingRows}
          disconnectingId={disconnectingId}
          onDisconnectClick={(account) => {
            setPendingDisconnect({
              id: account.id,
              name: account.name,
              category: 'banking',
            });
          }}
        />

        <AccountSection
          title="Investment"
          emptyText="No investment accounts connected."
          accounts={investmentRows}
          disconnectingId={disconnectingId}
          onDisconnectClick={(account) => {
            setPendingDisconnect({
              id: account.id,
              name: account.name,
              category: 'investment',
              accountType: investmentAccountTypeById.get(account.id),
            });
          }}
        />

        <AccountSection
          title="Crypto"
          emptyText="No crypto accounts connected."
          accounts={cryptoRows}
          disconnectingId={disconnectingId}
          onDisconnectClick={(account) => {
            setPendingDisconnect({
              id: account.id,
              name: account.name,
              category: 'investment',
              accountType: investmentAccountTypeById.get(account.id),
            });
          }}
        />
      </div>

      <button
        onClick={onConnectAccount}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--kura-primary)]/30 bg-[var(--kura-primary)]/10 py-3 font-medium text-[var(--kura-primary-light)] transition-colors hover:bg-[var(--kura-primary)]/20"
      >
        <span>+</span> Connect New Institution
      </button>

      <DisconnectConfirmDialog
        pendingDisconnect={pendingDisconnect}
        onCancel={() => setPendingDisconnect(null)}
        onConfirm={() => void handleConfirmDisconnect()}
      />
    </motion.div>
  );
}