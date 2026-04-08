import { create } from 'zustand';
import {
  fetchPlaidFinanceSnapshot,
} from '../api/plaidApi';
import Logger from '../utils/Logger';

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

export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

export interface Investment {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h: number;
  type: 'crypto' | 'stock' | 'etf';
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
  assetHistory: AssetSnapshot[]; // 历史资产快照
  lastRecordedTime: number | null; // 上次记录的时间
  
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
  hydratePlaidFinanceData: (token: string) => Promise<void>;
  clearPlaidFinanceData: () => void;
  disconnectBankingAccount: (accountId: string) => Promise<void>;
  disconnectInvestmentAccount: (accountId: string) => void;
  updateAccountOrder: (accountIds: string[], investmentAccountIds: string[]) => Promise<void>;
  
  // Asset History Operations (for performance tracking)
  recordAssetSnapshot: () => void; // 记录当前资产快照
  getAssetSnapshotsByTimeRange: (days: number) => AssetSnapshot[]; // 获取特定时间范围内的快照
  clearAssetHistory: () => void; // 清空历史数据
  calculateTotalAssets: () => number; // 计算当前总资产
  
  // Web3 Wallet Operations
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

// Mock data removed - now using real data from backend via Plaid

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
  hydratePlaidFinanceData: async (token: string) => {
    try {
      set({ isLoadingPlaidData: true, plaidError: null });
      Logger.debug('FinanceStore', 'Fetching Plaid finance snapshot');
      
      const snapshot = await fetchPlaidFinanceSnapshot(token);
      Logger.info('FinanceStore', 'Plaid snapshot fetched successfully', {
        accountsCount: snapshot.accounts.length,
        transactionsCount: snapshot.transactions.length,
        investmentAccountsCount: snapshot.investmentAccounts.length,
      });

      set((state) => {
        // Preserve Web3 Wallet accounts and investments (not managed by Plaid)
        const walletAccounts = state.investmentAccounts.filter(
          (account) => account.type === 'Web3 Wallet'
        );
        const walletInvestments = state.investments.filter((investment) =>
          walletAccounts.some((account) => account.id === investment.accountId)
        );

        return {
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          investmentAccounts: [...snapshot.investmentAccounts, ...walletAccounts],
          investments: [...snapshot.investments, ...walletInvestments],
          isLoadingPlaidData: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Plaid finance data';
      Logger.error('FinanceStore', 'Failed to hydrate Plaid data', { error: errorMessage });
      set({ isLoadingPlaidData: false, plaidError: errorMessage });
      throw error;
    }
  },
  
  clearPlaidFinanceData: () => {
    Logger.info('FinanceStore', 'Clearing Plaid finance data');
    set({
      accounts: [],
      transactions: [],
      investmentAccounts: [],
      investments: [],
      plaidError: null,
    });
  },
  
  // Account Disconnect (with backend sync)
  disconnectBankingAccount: async (accountId: string) => {
    try {
      Logger.debug('FinanceStore', 'Disconnecting banking account', { accountId });
      
      // Update UI immediately (optimistic update)
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== accountId),
        transactions: state.transactions.filter((transaction) => transaction.accountId !== accountId),
      }));
      
      Logger.info('FinanceStore', 'Banking account disconnected locally');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect account';
      Logger.error('FinanceStore', 'Failed to disconnect banking account', { error: errorMessage });
      throw error;
    }
  },
  
  disconnectInvestmentAccount: (accountId: string) => {
    Logger.debug('FinanceStore', 'Disconnecting investment account', { accountId });
    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((account) => account.id !== accountId),
      investments: state.investments.filter((investment) => investment.accountId !== accountId),
    }));
    Logger.info('FinanceStore', 'Investment account disconnected');
  },
  
  // Update Account Order
  updateAccountOrder: async (accountIds: string[], investmentAccountIds: string[]) => {
    try {
      Logger.debug('FinanceStore', 'Updating account order', { accountIds, investmentAccountIds });
      
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
      
      Logger.info('FinanceStore', 'Account order updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account order';
      Logger.error('FinanceStore', 'Failed to update account order', { error: errorMessage });
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

    Logger.debug('FinanceStore', 'Syncing wallet position', { address: normalizedAddress, chainId });

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
          Logger.debug('FinanceStore', 'Fetched market data', { currentPrice, change24h });
        }
      } catch (err) {
        Logger.warn('FinanceStore', 'Failed to fetch market data', err);
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
        ...state.investmentAccounts.filter((account) => account.id !== accountId),
        walletAccount,
      ],
      investments: [...state.investments.filter((investment) => investment.id !== assetId), walletAsset],
    }));
    
    Logger.info('FinanceStore', 'Wallet position synced', { address: normalizedAddress, balance: nativeBalance });
  },
  
  removeConnectedWalletPosition: (address, chainId) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;
    const assetId = `wallet-native-${chainId}-${normalizedAddress}`;

    Logger.debug('FinanceStore', 'Removing wallet position', { address: normalizedAddress, chainId });

    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((account) => account.id !== accountId),
      investments: state.investments.filter((investment) => investment.id !== assetId),
    }));
    
    Logger.info('FinanceStore', 'Wallet position removed');
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
    
    Logger.debug('FinanceStore', 'Total assets calculated', {
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
      Logger.debug('FinanceStore', 'Skipping snapshot - recorded too recently', {
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
    
    Logger.info('FinanceStore', 'Asset snapshot recorded', {
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
    
    Logger.debug('FinanceStore', 'Retrieved asset snapshots', {
      requestedDays: days,
      snapshotCount: snapshots.length,
    });
    
    return snapshots;
  },
  
  clearAssetHistory: () => {
    Logger.info('FinanceStore', 'Clearing asset history');
    set({ assetHistory: [], lastRecordedTime: null });
  },
}));
