// src/store/useFinanceStore.ts
import { create } from 'zustand';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'saving' | 'credit' | 'crypto';
  logo: string;
}

export interface Transaction {
  id: string | number;
  accountId: string;
  amount: string;
  date: string;
  merchant: string;
  category: string;
  type: 'credit' | 'deposit' | 'transfer';
}

// 💡 1. 新增：投資帳戶 (券商 / Web3 錢包)
export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

// 💡 2. 修改：為每筆持倉加上 accountId
export interface Investment {
  id: string;
  accountId: string;      // 綁定到 InvestmentAccount 的 ID
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h: number;
  type: 'crypto' | 'stock';
  logo: string;
}

interface SyncWalletPayload {
  address: string;
  chainId: number;
  chainName: string;
  nativeSymbol: string;
  nativeBalance: number;
}

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  investmentAccounts: InvestmentAccount[]; // 💡 新增
  investments: Investment[];
  isAiOptedIn: boolean;
  toggleAiOptIn: () => void;
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  disconnectBankingAccount: (accountId: string) => void;
  disconnectInvestmentAccount: (accountId: string) => void;
  syncConnectedWalletPosition: (payload: SyncWalletPayload) => Promise<void>;
  removeConnectedWalletPosition: (address: string, chainId: number) => void;
}

const CHAIN_MARKET_META: Record<number, { coingeckoId: string; logo: string; fallbackName: string }> = {
  1: {
    coingeckoId: 'ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    fallbackName: 'Ethereum',
  },
  137: {
    coingeckoId: 'matic-network',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    fallbackName: 'Polygon',
  },
  42161: {
    coingeckoId: 'ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    fallbackName: 'Ethereum',
  },
};

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  transactions: [],
  investmentAccounts: [],
  investments: [],
  
  isAiOptedIn: false,
  toggleAiOptIn: () => set((state) => ({ isAiOptedIn: !state.isAiOptedIn })),
  setAccounts: (accounts) => set({ accounts }),
  setTransactions: (transactions) => set({ transactions }),
  disconnectBankingAccount: (accountId) => {
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== accountId),
      transactions: state.transactions.filter((tx) => tx.accountId !== accountId),
    }));
  },
  disconnectInvestmentAccount: (accountId) => {
    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((acc) => acc.id !== accountId),
      investments: state.investments.filter((inv) => inv.accountId !== accountId),
    }));
  },

  syncConnectedWalletPosition: async ({
    address,
    chainId,
    chainName,
    nativeSymbol,
    nativeBalance,
  }) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;
    const assetId = `wallet-native-${chainId}-${normalizedAddress}`;
    const chainMeta = CHAIN_MARKET_META[chainId];

    let currentPrice = 0;
    let change24h = 0;

    if (chainMeta) {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${chainMeta.coingeckoId}&vs_currencies=usd&include_24hr_change=true`
        );

        if (response.ok) {
          const json = (await response.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
          const market = json[chainMeta.coingeckoId];
          currentPrice = market?.usd ?? 0;
          change24h = market?.usd_24h_change ?? 0;
        }
      } catch {
        currentPrice = 0;
        change24h = 0;
      }
    }

    const walletAccount: InvestmentAccount = {
      id: accountId,
      name: `${chainName} Wallet`,
      type: 'Web3 Wallet',
      logo: 'https://www.google.com/s2/favicons?domain=walletconnect.com&sz=128',
    };

    const walletAsset: Investment = {
      id: assetId,
      accountId,
      symbol: nativeSymbol,
      name: chainMeta?.fallbackName ?? nativeSymbol,
      holdings: nativeBalance,
      currentPrice,
      change24h,
      type: 'crypto',
      logo: chainMeta?.logo ?? 'https://www.google.com/s2/favicons?domain=ethereum.org&sz=128',
    };

    set((state) => ({
      investmentAccounts: [
        ...state.investmentAccounts.filter((acc) => acc.id !== accountId),
        walletAccount,
      ],
      investments: [
        ...state.investments.filter((inv) => inv.id !== assetId),
        walletAsset,
      ],
    }));
  },

  removeConnectedWalletPosition: (address, chainId) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;
    const assetId = `wallet-native-${chainId}-${normalizedAddress}`;

    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((acc) => acc.id !== accountId),
      investments: state.investments.filter((inv) => inv.id !== assetId),
    }));
  },
}));