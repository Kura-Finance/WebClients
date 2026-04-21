// src/store/useFinanceStore.ts
import { create } from 'zustand';
import { fetchPlaidFinanceSnapshot } from '@/lib/plaidApi';

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
  accountName: string;
  accountType: 'checking' | 'saving' | 'credit' | 'crypto';
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

export interface AssetSnapshot {
  timestamp: number; // Unix timestamp in milliseconds
  totalAssets: number; // 总资产（USD）
  bankingBalance: number; // 银行账户总余额
  investmentValue: number; // 投资总价值
  cryptoValue: number; // 加密货币总价值
}

interface FinanceState {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  investmentAccounts: InvestmentAccount[];
  investments: Investment[];
  isAiOptedIn: boolean;
  selectedTimeRange: '1M' | '3M' | '6M' | '1Y' | 'All';
  chartDataByTimeRange: Record<string, number[]>;
  
  // Asset Performance Tracking
  assetHistory: AssetSnapshot[];
  lastRecordedTime: number | null;
  
  // Loading & Error States
  isLoadingPlaidData: boolean;
  plaidError: string | null;
  
  // UI Actions
  toggleAiOptIn: () => void;
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setInvestmentAccounts: (accounts: InvestmentAccount[]) => void;
  setInvestments: (investments: Investment[]) => void;
  setSelectedTimeRange: (timeRange: '1M' | '3M' | '6M' | '1Y' | 'All') => void;
  
  // Plaid Operations
  hydratePlaidFinanceData: () => Promise<void>;
  clearPlaidFinanceData: () => void;
  disconnectBankingAccount: (accountId: string) => Promise<void>;
  disconnectInvestmentAccount: (accountId: string) => void;
  updateAccountOrder: (accountIds: string[], investmentAccountIds: string[]) => Promise<void>;
  
  // Web3 Wallet Operations
  syncConnectedWalletPosition: (payload: SyncWalletPayload) => Promise<void>;
  removeConnectedWalletPosition: (address: string, chainId: number) => void;
  
  // Asset History Operations (for performance tracking)
  recordAssetSnapshot: () => void;
  getAssetSnapshotsByTimeRange: (days: number) => AssetSnapshot[];
  clearAssetHistory: () => void;
  calculateTotalAssets: () => number;
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

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  accounts: [],
  transactions: [],
  investmentAccounts: [],
  investments: [],
  isAiOptedIn: false,
  selectedTimeRange: '1M',
  chartDataByTimeRange: {
    '1M': [],
    '3M': [],
    '6M': [],
    '1Y': [],
    'All': [],
  },
  isLoadingPlaidData: false,
  plaidError: null,
  assetHistory: [],
  lastRecordedTime: null,
  
  // Simple Setters
  toggleAiOptIn: () => set((state) => ({ isAiOptedIn: !state.isAiOptedIn })),
  setAccounts: (accounts) => set({ accounts }),
  setTransactions: (transactions) => set({ transactions }),
  setInvestmentAccounts: (investmentAccounts) => set({ investmentAccounts }),
  setInvestments: (investments) => set({ investments }),
  setSelectedTimeRange: (timeRange) => set({ selectedTimeRange: timeRange }),
  
  // Plaid Data Hydration
  hydratePlaidFinanceData: async () => {
    try {
      set({ isLoadingPlaidData: true, plaidError: null });
      console.debug('[FinanceStore] Fetching Plaid finance snapshot');
      
      const snapshot = await fetchPlaidFinanceSnapshot();
      console.info('[FinanceStore] Plaid snapshot fetched successfully', {
        accountsCount: snapshot.accounts.length,
        transactionsCount: snapshot.transactions.length,
        investmentAccountsCount: snapshot.investmentAccounts.length,
      });

      set((state) => {
        // Preserve Web3 Wallet and Exchange accounts (not managed by Plaid)
        // Web3 Wallet Store 和 Exchange Store 現在獨立管理，但舊的混合數據需要保留
        const nonPlaidAccounts = state.investmentAccounts.filter(
          (account) => account.type === 'Web3 Wallet' || account.type === 'Exchange'
        );
        const nonPlaidInvestments = state.investments.filter((investment) =>
          nonPlaidAccounts.some((account) => account.id === investment.accountId)
        );

        console.debug('[FinanceStore] Preserving non-Plaid data', {
          nonPlaidAccountsCount: nonPlaidAccounts.length,
          nonPlaidInvestmentsCount: nonPlaidInvestments.length,
        });

        return {
          accounts: snapshot.accounts as Account[],
          transactions: snapshot.transactions as Transaction[],
          investmentAccounts: [...snapshot.investmentAccounts, ...nonPlaidAccounts] as InvestmentAccount[],
          investments: [...snapshot.investments, ...nonPlaidInvestments] as Investment[],
          isLoadingPlaidData: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Plaid finance data';
      console.error('[FinanceStore] Failed to hydrate Plaid data', { error: errorMessage });
      set({ isLoadingPlaidData: false, plaidError: errorMessage });
      throw error;
    }
  },
  
  clearPlaidFinanceData: () => {
    console.info('[FinanceStore] Clearing Plaid finance data');
    
    set((state) => {
      // Only clear Plaid data, preserve Web3 Wallet and Exchange accounts
      const nonPlaidAccounts = state.investmentAccounts.filter(
        (account) => account.type === 'Web3 Wallet' || account.type === 'Exchange'
      );
      const nonPlaidInvestments = state.investments.filter((investment) =>
        nonPlaidAccounts.some((account) => account.id === investment.accountId)
      );

      console.debug('[FinanceStore] Cleared Plaid data, preserved non-Plaid accounts', {
        preservedAccountsCount: nonPlaidAccounts.length,
        preservedInvestmentsCount: nonPlaidInvestments.length,
      });

      return {
        accounts: [],
        transactions: [],
        investmentAccounts: nonPlaidAccounts,
        investments: nonPlaidInvestments,
        plaidError: null,
      };
    });
  },
  
  // Account Disconnect (with backend sync)
  disconnectBankingAccount: async (accountId: string) => {
    try {
      console.debug('[FinanceStore] Disconnecting banking account', { accountId });
      
      // Update UI immediately (optimistic update)
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== accountId),
        transactions: state.transactions.filter((transaction) => transaction.accountId !== accountId),
      }));
      
      console.info('[FinanceStore] Banking account disconnected locally');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect account';
      console.error('[FinanceStore] Failed to disconnect banking account', { error: errorMessage });
      throw error;
    }
  },
  
  disconnectInvestmentAccount: (accountId: string) => {
    console.debug('[FinanceStore] Disconnecting investment account', { accountId });
    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((account) => account.id !== accountId),
      investments: state.investments.filter((investment) => investment.accountId !== accountId),
    }));
    console.info('[FinanceStore] Investment account disconnected');
  },
  
  // Update Account Order
  updateAccountOrder: async (accountIds: string[], investmentAccountIds: string[]) => {
    try {
      console.debug('[FinanceStore] Updating account order', { accountIds, investmentAccountIds });
      
      // Note: Backend sync should be called from parent component or useAppStore
      // This just updates the UI state based on new order
      set((state) => {
        const orderedAccounts = accountIds
          .map(id => state.accounts.find(a => a.id === id))
          .filter((a) => a !== undefined) as Account[];
        
        const orderedInvestmentAccounts = investmentAccountIds
          .map(id => state.investmentAccounts.find(a => a.id === id))
          .filter((a) => a !== undefined) as InvestmentAccount[];
        
        return {
          accounts: [...orderedAccounts, ...state.accounts.filter(a => !accountIds.includes(a.id))],
          investmentAccounts: [...orderedInvestmentAccounts, ...state.investmentAccounts.filter(a => !investmentAccountIds.includes(a.id))],
        };
      });
      
      console.info('[FinanceStore] Account order updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account order';
      console.error('[FinanceStore] Failed to update account order', { error: errorMessage });
      throw error;
    }
  },
  
  // Web3 Wallet Operations
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

    console.debug('[FinanceStore] Syncing wallet position', { address: normalizedAddress, chainId });

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
          console.debug('[FinanceStore] Fetched market data', { currentPrice, change24h });
        }
      } catch (err) {
        console.warn('[FinanceStore] Failed to fetch market data', err);
        currentPrice = 0;
        change24h = 0;
      }
    }

    const walletAccount: InvestmentAccount = {
      id: accountId,
      name: `${chainName} Wallet`,
      type: 'Web3 Wallet',
      logo: 'https://www.google.com/s2/favicons?domain=reown.com&sz=128',
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
        ...state.investmentAccounts.filter((account) => account.id !== accountId),
        walletAccount,
      ],
      investments: [...state.investments.filter((investment) => investment.id !== assetId), walletAsset],
    }));
    
    console.info('[FinanceStore] Wallet position synced', { address: normalizedAddress, balance: nativeBalance });
  },
  
  removeConnectedWalletPosition: (address, chainId) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;
    const assetId = `wallet-native-${chainId}-${normalizedAddress}`;

    console.debug('[FinanceStore] Removing wallet position', { address: normalizedAddress, chainId });

    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((account) => account.id !== accountId),
      investments: state.investments.filter((investment) => investment.id !== assetId),
    }));
    
    console.info('[FinanceStore] Wallet position removed');
  },
  
  // Asset History & Performance Tracking
  calculateTotalAssets: () => {
    const state = get();
    
    // 银行账户总余额
    const bankingBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // 投资总价值
    const investmentValue = state.investments.reduce((sum, investment) => {
      return sum + investment.holdings * investment.currentPrice;
    }, 0);
    
    const totalAssets = bankingBalance + investmentValue;
    
    console.debug('[FinanceStore] Total assets calculated', {
      bankingBalance,
      investmentValue,
      totalAssets,
    });
    
    return totalAssets;
  },
  
  recordAssetSnapshot: () => {
    const state = get();
    const now = Date.now();
    
    // 检查是否距离上次记录已有足够的时间（至少 1 小时以避免过度记录）
    if (state.lastRecordedTime && (now - state.lastRecordedTime) < 3600000) {
      console.debug('[FinanceStore] Skipping snapshot - recorded too recently', {
        lastRecordedTime: state.lastRecordedTime,
        now,
      });
      return;
    }
    
    const totalAssets = get().calculateTotalAssets();
    const bankingBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
    const investmentValue = state.investments.reduce((sum, investment) => {
      return sum + investment.holdings * investment.currentPrice;
    }, 0);
    const cryptoValue = state.investmentAccounts
      .filter((account) => account.type === 'Web3 Wallet')
      .reduce((sum, account) => {
        const investments = state.investments.filter((inv) => inv.accountId === account.id);
        return sum + investments.reduce((invSum, inv) => invSum + inv.holdings * inv.currentPrice, 0);
      }, 0);
    
    const snapshot: AssetSnapshot = {
      timestamp: now,
      totalAssets,
      bankingBalance,
      investmentValue,
      cryptoValue,
    };
    
    set((currentState) => {
      // 保持最多 365 天的数据
      const oneYearAgo = now - 365 * 24 * 3600 * 1000;
      const filteredHistory = currentState.assetHistory.filter(
        (snap) => snap.timestamp > oneYearAgo
      );
      
      return {
        assetHistory: [...filteredHistory, snapshot],
        lastRecordedTime: now,
      };
    });
    
    console.info('[FinanceStore] Asset snapshot recorded', {
      timestamp: new Date(now).toISOString(),
      totalAssets,
      bankingBalance,
      investmentValue,
      cryptoValue,
    });
  },
  
  getAssetSnapshotsByTimeRange: (days: number) => {
    const state = get();
    const cutoffTime = Date.now() - days * 24 * 3600 * 1000;
    
    const snapshots = state.assetHistory.filter((snap) => snap.timestamp >= cutoffTime);
    
    console.debug('[FinanceStore] Retrieved asset snapshots', {
      requestedDays: days,
      snapshotCount: snapshots.length,
    });
    
    return snapshots;
  },
  
  clearAssetHistory: () => {
    console.info('[FinanceStore] Clearing asset history');
    set({ assetHistory: [], lastRecordedTime: null });
  },
}));