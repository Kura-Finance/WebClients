// finance store
import { create } from 'zustand';
import { fetchPlaidFinanceSnapshot } from '@/lib/plaidApi';
import { fetchAssetHistory, AssetHistoryPoint, AssetHistorySummary } from '@/lib/assetApi';
import { ensureKeyPairConfigured } from '@/lib/crypto/zkAuth';
import { ApiError } from '@/lib/errorHandler';
import {
  clearEncryptedFinanceCache,
  loadEncryptedFinanceCache,
  persistEncryptedFinanceCache,
  type FinanceEncryptedCache,
} from '@/lib/crypto/financeVault';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'saving' | 'credit' | 'crypto';
  logo: string;
  mask?: string; // 帳號末 4 碼（部分機構可能不提供）
}

export interface Transaction {
  id: string | number;
  accountId: string;
  accountName: string;
  accountType: 'checking' | 'saving' | 'credit' | 'crypto';
  amount: string;
  date: string;
  merchant: string;
  merchantLogo?: string;
  category: string;
  type: 'credit' | 'deposit' | 'transfer';
}

// 1. 投資帳戶（券商 / Web3 錢包）
export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

// 2. 每筆持倉都包含 accountId
export interface Investment {
  id: string;
  accountId: string;      // 綁定到 InvestmentAccount 的 ID
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

interface SyncWalletAssetsPayload {
  address: string;
  chainId: number;
  chainName: string;
  assets: Investment[];
}


interface FinanceState {
  // 資料
  accounts: Account[];
  transactions: Transaction[];
  investmentAccounts: InvestmentAccount[];
  investments: Investment[];
  isAiOptedIn: boolean;
  selectedTimeRange: '1M' | '3M' | '6M' | '1Y' | 'All';
  chartDataByTimeRange: Record<string, number[]>;
  
  // API 資產歷史（由伺服器提供，供儀表板圖表使用）
  apiAssetHistory: AssetHistoryPoint[];
  assetHistorySummary: AssetHistorySummary | null;
  plaidLastSyncedAt: string | null;
  isLoadingAssetHistory: boolean;

  // 載入與錯誤狀態
  isLoadingPlaidData: boolean;
  plaidError: string | null;
  
  // UI 操作
  toggleAiOptIn: () => void;
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setInvestmentAccounts: (accounts: InvestmentAccount[]) => void;
  setInvestments: (investments: Investment[]) => void;
  setSelectedTimeRange: (timeRange: '1M' | '3M' | '6M' | '1Y' | 'All') => void;
  
  // Plaid 操作
  hydrateEncryptedFinanceCache: () => Promise<boolean>;
  hydratePlaidFinanceData: () => Promise<void>;
  clearPlaidFinanceData: () => void;
  disconnectBankingAccount: (accountId: string) => Promise<void>;
  disconnectInvestmentAccount: (accountId: string) => void;
  updateAccountOrder: (accountIds: string[], investmentAccountIds: string[]) => Promise<void>;
  
  // Web3 Wallet 操作
  syncConnectedWalletPosition: (payload: SyncWalletPayload) => Promise<void>;
  syncConnectedWalletAssets: (payload: SyncWalletAssetsPayload) => void;
  removeConnectedWalletPosition: (address: string, chainId: number) => void;
  
  // API 資產歷史
  hydrateAssetHistory: (days?: number) => Promise<void>;
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

function buildEncryptedCachePayload(state: FinanceState): FinanceEncryptedCache {
  return {
    accounts: state.accounts,
    transactions: state.transactions,
    investmentAccounts: state.investmentAccounts,
    investments: state.investments,
    apiAssetHistory: state.apiAssetHistory,
    assetHistorySummary: state.assetHistorySummary,
    plaidLastSyncedAt: state.plaidLastSyncedAt,
  };
}

async function persistFinanceCache(state: FinanceState): Promise<void> {
  await persistEncryptedFinanceCache(buildEncryptedCachePayload(state));
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // 初始狀態
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
  apiAssetHistory: [],
  assetHistorySummary: null,
  plaidLastSyncedAt: null,
  isLoadingAssetHistory: false,
  
  // 基本 setter
  toggleAiOptIn: () => set((state) => ({ isAiOptedIn: !state.isAiOptedIn })),
  setAccounts: (accounts) => {
    set({ accounts });
    void persistFinanceCache(get());
  },
  setTransactions: (transactions) => {
    set({ transactions });
    void persistFinanceCache(get());
  },
  setInvestmentAccounts: (investmentAccounts) => {
    set({ investmentAccounts });
    void persistFinanceCache(get());
  },
  setInvestments: (investments) => {
    set({ investments });
    void persistFinanceCache(get());
  },
  setSelectedTimeRange: (timeRange) => set({ selectedTimeRange: timeRange }),
  
  // Plaid 資料同步
  hydrateEncryptedFinanceCache: async () => {
    const cached = await loadEncryptedFinanceCache();
    if (!cached) {
      return false;
    }

    set({
      accounts: cached.accounts as Account[],
      transactions: cached.transactions as Transaction[],
      investmentAccounts: cached.investmentAccounts as InvestmentAccount[],
      investments: cached.investments as Investment[],
      apiAssetHistory: cached.apiAssetHistory,
      assetHistorySummary: cached.assetHistorySummary,
      plaidLastSyncedAt: cached.plaidLastSyncedAt ?? null,
    });
    console.info('[FinanceStore] Hydrated finance data from encrypted local cache');
    return true;
  },

  hydratePlaidFinanceData: async () => {
    // 抽成內部 helper，供初次嘗試與 keypair retry 共用
    const applySnapshot = async () => {
      const snapshot = await fetchPlaidFinanceSnapshot();
      console.info('[FinanceStore] Plaid snapshot fetched successfully', {
        accountsCount: snapshot.accounts.length,
        transactionsCount: snapshot.transactions.length,
        investmentAccountsCount: snapshot.investmentAccounts.length,
      });
      set((state) => {
        const nonPlaidAccounts = state.investmentAccounts.filter(
          (account) => account.type === 'Web3 Wallet' || account.type === 'Exchange'
        );
        const nonPlaidInvestments = state.investments.filter((investment) =>
          nonPlaidAccounts.some((account) => account.id === investment.accountId)
        );
        return {
          accounts: snapshot.accounts as Account[],
          transactions: snapshot.transactions as Transaction[],
          investmentAccounts: [...snapshot.investmentAccounts, ...nonPlaidAccounts] as InvestmentAccount[],
          investments: [...snapshot.investments, ...nonPlaidInvestments] as Investment[],
          plaidLastSyncedAt: snapshot.lastSyncedAt ?? null,
          isLoadingPlaidData: false,
        };
      });
      void persistFinanceCache(get());
    };

    try {
      set({ isLoadingPlaidData: true, plaidError: null });
      console.debug('[FinanceStore] Fetching Plaid finance snapshot');

      try {
        await applySnapshot();
      } catch (firstError) {
        // 存量用戶尚未建立 keypair → 靜默完成 setup 後重試一次，對用戶透明
        if (firstError instanceof ApiError && firstError.status === 409) {
          console.info('[FinanceStore] KEY_PAIR_REQUIRED — setting up keypair silently and retrying');
          await ensureKeyPairConfigured();
          await applySnapshot();
        } else {
          throw firstError;
        }
      }
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
      // 僅清除 Plaid 資料，保留 Web3 Wallet 與 Exchange 帳戶
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
        plaidLastSyncedAt: null,
        plaidError: null,
      };
    });
    clearEncryptedFinanceCache();
  },
  
  // 帳戶斷線（含後端同步）
  disconnectBankingAccount: async (accountId: string) => {
    try {
      console.debug('[FinanceStore] Disconnecting banking account', { accountId });
      
      // 先即時更新 UI（樂觀更新）
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== accountId),
        transactions: state.transactions.filter((transaction) => transaction.accountId !== accountId),
      }));
      void persistFinanceCache(get());
      
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
    void persistFinanceCache(get());
    console.info('[FinanceStore] Investment account disconnected');
  },
  
  // 更新帳戶排序
  updateAccountOrder: async (accountIds: string[], investmentAccountIds: string[]) => {
    try {
      console.debug('[FinanceStore] Updating account order', { accountIds, investmentAccountIds });
      
      // 備註：後端同步應由父元件或 useAppStore 呼叫
      // 此處僅依新排序更新 UI 狀態
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
      void persistFinanceCache(get());
      
      console.info('[FinanceStore] Account order updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account order';
      console.error('[FinanceStore] Failed to update account order', { error: errorMessage });
      throw error;
    }
  },
  
  // Web3 Wallet 操作
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
    void persistFinanceCache(get());
    
    console.info('[FinanceStore] Wallet position synced', { address: normalizedAddress, balance: nativeBalance });
  },

  syncConnectedWalletAssets: ({
    address,
    chainId,
    chainName,
    assets,
  }) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;
    const walletAccount: InvestmentAccount = {
      id: accountId,
      name: `${chainName} Wallet`,
      type: 'Web3 Wallet',
      logo: 'https://www.google.com/s2/favicons?domain=reown.com&sz=128',
    };

    const normalizedAssets: Investment[] = assets.map((asset, index) => ({
      ...asset,
      id: asset.id || `wallet-asset-${chainId}-${normalizedAddress}-${index}`,
      accountId,
      type: asset.type === 'stock' ? 'stock' : asset.type === 'etf' ? 'etf' : 'crypto',
    }));

    set((state) => ({
      investmentAccounts: [
        ...state.investmentAccounts.filter((account) => account.id !== accountId),
        walletAccount,
      ],
      investments: [
        ...state.investments.filter((investment) => investment.accountId !== accountId),
        ...normalizedAssets,
      ],
    }));
    void persistFinanceCache(get());

    console.info('[FinanceStore] Wallet assets synced', {
      address: normalizedAddress,
      chainId,
      assetsCount: normalizedAssets.length,
    });
  },
  
  removeConnectedWalletPosition: (address, chainId) => {
    const normalizedAddress = address.toLowerCase();
    const accountId = `wallet-${chainId}-${normalizedAddress}`;

    console.debug('[FinanceStore] Removing wallet position', { address: normalizedAddress, chainId });

    set((state) => ({
      investmentAccounts: state.investmentAccounts.filter((account) => account.id !== accountId),
      investments: state.investments.filter((investment) => investment.accountId !== accountId),
    }));
    void persistFinanceCache(get());
    
    console.info('[FinanceStore] Wallet position removed');
  },
  
  // API 資產歷史
  hydrateAssetHistory: async (days: number = 30) => {
    try {
      set({ isLoadingAssetHistory: true });
      console.debug('[FinanceStore] Fetching asset history from API', { days });

      const response = await fetchAssetHistory(days);

      set({
        apiAssetHistory: response.history,
        assetHistorySummary: response.summary,
        isLoadingAssetHistory: false,
      });
      void persistFinanceCache(get());

      console.info('[FinanceStore] Asset history hydrated', {
        points: response.history.length,
        change: response.summary.cashFlow?.changePercent ?? 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch asset history';
      console.warn('[FinanceStore] Failed to hydrate asset history', { error: errorMessage });
      set({ isLoadingAssetHistory: false });
    }
  },
}));