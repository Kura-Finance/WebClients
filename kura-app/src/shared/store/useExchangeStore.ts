import { create } from 'zustand';
import { InvestmentAccount, Investment } from './useFinanceStore';
import Logger from '../utils/Logger';

export interface ExchangeAccount {
  id: string;
  exchange: 'binance' | 'kraken' | 'coinbase' | 'okx' | 'huobi' | 'bybit' | 'kucoin' | 'bitget' | 'gateio';
  accountName: string;
  createdAt: string;
  lastSyncedAt: string | null;
  userId: string;
}

interface ExchangeStoreState {
  // Exchange 專用數據
  exchangeAccounts: ExchangeAccount[];
  exchangeInvestmentAccounts: InvestmentAccount[]; // InvestmentAccount 形式
  exchangeInvestments: Investment[]; // Investment 形式
  isLoading: Record<string, boolean>; // 按 exchangeAccountId 追蹤加載狀態
  error: string | null;
  lastSyncedTime: Record<string, number | null>; // 按 exchangeAccountId 追蹤同步時間

  // Actions
  addExchangeAccount: (account: ExchangeAccount) => void;
  removeExchangeAccount: (exchangeAccountId: string) => void;
  setExchangeData: (
    exchangeAccountId: string,
    investmentAccount: InvestmentAccount,
    investments: Investment[]
  ) => void;
  setLoading: (exchangeAccountId: string, loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;

  // Selectors
  getTotalExchangeValue: () => number;
  getExchangeAccountIds: () => string[];
  getExchangesByType: (exchange: string) => InvestmentAccount[];
}

export const useExchangeStore = create<ExchangeStoreState>((set, get) => ({
  // Initial State
  exchangeAccounts: [],
  exchangeInvestmentAccounts: [],
  exchangeInvestments: [],
  isLoading: {},
  error: null,
  lastSyncedTime: {},

  // Actions
  addExchangeAccount: (account: ExchangeAccount) => {
    Logger.info('ExchangeStore', '➕ Added exchange account:', {
      exchange: account.exchange,
      accountId: account.id,
      accountName: account.accountName,
    });

    set((state) => ({
      exchangeAccounts: [...state.exchangeAccounts, account],
    }));
  },

  removeExchangeAccount: (exchangeAccountId: string) => {
    Logger.warn('ExchangeStore', '➖ Removing exchange account:', { exchangeAccountId });

    set((state) => ({
      exchangeAccounts: state.exchangeAccounts.filter(
        (acc) => acc.id !== exchangeAccountId
      ),
      exchangeInvestmentAccounts: state.exchangeInvestmentAccounts.filter(
        (inv) => inv.id !== exchangeAccountId
      ),
      exchangeInvestments: state.exchangeInvestments.filter(
        (inv) => inv.accountId !== exchangeAccountId
      ),
      lastSyncedTime: {
        ...state.lastSyncedTime,
        [exchangeAccountId]: null,
      },
    }));

    Logger.info('ExchangeStore', '✅ Exchange account removed');
  },

  setExchangeData: (
    exchangeAccountId: string,
    investmentAccount: InvestmentAccount,
    investments: Investment[]
  ) => {
    Logger.debug('ExchangeStore', '📊 Setting exchange data:', {
      accountId: exchangeAccountId,
      investmentCount: investments.length,
    });

    set((state) => ({
      exchangeInvestmentAccounts: [
        ...state.exchangeInvestmentAccounts.filter(
          (inv) => inv.id !== exchangeAccountId
        ),
        investmentAccount,
      ],
      exchangeInvestments: [
        ...state.exchangeInvestments.filter(
          (inv) => inv.accountId !== exchangeAccountId
        ),
        ...investments,
      ],
      lastSyncedTime: {
        ...state.lastSyncedTime,
        [exchangeAccountId]: Date.now(),
      },
    }));

    Logger.info('ExchangeStore', '✅ Exchange data updated');
  },

  setLoading: (exchangeAccountId: string, loading: boolean) => {
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [exchangeAccountId]: loading,
      },
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearAll: () => {
    Logger.warn('ExchangeStore', '🗑️ Clearing all exchange data');
    set({
      exchangeAccounts: [],
      exchangeInvestmentAccounts: [],
      exchangeInvestments: [],
      isLoading: {},
      error: null,
      lastSyncedTime: {},
    });
  },

  // Selectors
  getTotalExchangeValue: () => {
    const { exchangeInvestments } = get();
    return exchangeInvestments.reduce(
      (sum, inv) => sum + inv.holdings * inv.currentPrice,
      0
    );
  },

  getExchangeAccountIds: () => {
    const { exchangeAccounts } = get();
    return exchangeAccounts.map((acc) => acc.id);
  },

  getExchangesByType: (exchange: string) => {
    const { exchangeInvestmentAccounts } = get();
    return exchangeInvestmentAccounts.filter(
      (acc) => acc.name.toLowerCase().includes(exchange.toLowerCase())
    );
  },
}));
