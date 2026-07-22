import { create } from 'zustand';
import { InvestmentAccount, Investment } from './useFinanceStore';

export interface ExchangeAccount {
  id: string;
  exchange: 'binance' | 'kraken' | 'coinbase' | 'okx' | 'huobi' | 'bybit' | 'kucoin' | 'bitget' | 'gateio';
  accountName: string;
  createdAt: string;
  lastSyncedAt: string | null;
  userId: string;
}

interface ExchangeStoreState {
  // Exchange 專用資料
  exchangeAccounts: ExchangeAccount[];
  exchangeInvestmentAccounts: InvestmentAccount[]; // InvestmentAccount 形式
  exchangeInvestments: Investment[]; // Investment 形式
  isLoading: Record<string, boolean>; // 依 exchangeAccountId 追蹤載入狀態
  error: string | null;
  lastSyncedTime: Record<string, number | null>; // 依 exchangeAccountId 追蹤同步時間

  // 操作
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

  // 選擇器
  getTotalExchangeValue: () => number;
  getExchangeAccountIds: () => string[];
  getExchangesByType: (exchange: string) => InvestmentAccount[];
}

export const useExchangeStore = create<ExchangeStoreState>((set, get) => ({
  // 初始狀態
  exchangeAccounts: [],
  exchangeInvestmentAccounts: [],
  exchangeInvestments: [],
  isLoading: {},
  error: null,
  lastSyncedTime: {},

  // 操作
  addExchangeAccount: (account: ExchangeAccount) => {
    console.debug('[ExchangeStore] Added exchange account:', {
      exchange: account.exchange,
      accountId: account.id,
      accountName: account.accountName,
    });

    set((state) => ({
      exchangeAccounts: [...state.exchangeAccounts, account],
    }));
  },

  removeExchangeAccount: (exchangeAccountId: string) => {
    console.warn('[ExchangeStore] Removing exchange account:', { exchangeAccountId });

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

    console.info('[ExchangeStore] Exchange account removed');
  },

  setExchangeData: (
    exchangeAccountId: string,
    investmentAccount: InvestmentAccount,
    investments: Investment[]
  ) => {
    console.debug('[ExchangeStore] Setting exchange data:', {
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

    console.info('[ExchangeStore] Exchange data updated');
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
    console.warn('[ExchangeStore] Clearing all exchange data');
    set({
      exchangeAccounts: [],
      exchangeInvestmentAccounts: [],
      exchangeInvestments: [],
      isLoading: {},
      error: null,
      lastSyncedTime: {},
    });
  },

  // 選擇器
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
