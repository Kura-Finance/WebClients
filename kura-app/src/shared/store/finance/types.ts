import { ExchangeName } from '../../api/exchangeApi';

// ============================================================================
// Refresh Info Type
// ============================================================================

export interface RefreshInfo {
  refreshedAt: string; // ISO string timestamp
  refreshCountRemaining: number;
  refreshLimit: number;
  nextResetAt: string; // ISO string timestamp
}

// ============================================================================
// 基礎資料型別
// ============================================================================

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'saving' | 'credit' | 'crypto';
  logo: string;
}

export interface Transaction {
  id: string | number;
  accountId?: string;
  accountName?: string;
  accountType?: 'checking' | 'saving' | 'credit' | 'crypto';
  amount: string;
  date: string;
  merchant: string;
  category: string;
  type: 'credit' | 'deposit' | 'transfer';
  logo?: string; // Merchant logo URL from backend
  // Enhanced fields
  personalFinanceCategory?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  isSubscription?: boolean;
  enrichedMerchantName?: string;
  isPending?: boolean;
}

export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

export interface Investment {
  id: string;
  accountId?: string;
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h: number; // Can be percentage or absolute value depending on type
  type: 'crypto' | 'stock' | 'etf';
  logo: string;
}

export interface ExchangeAccount {
  id: string;
  exchange: ExchangeName;
  exchangeDisplayName: string; // Display name e.g., "Binance"
  isVerified: boolean;
  isActive: boolean;
  lastVerifiedAt: string;
  icon: string; // URL to exchange icon
}

export interface ExchangeBalance {
  symbol: string;
  free: number;
  used: number;
  total: number;
}

export interface AssetSnapshot {
  timestamp: number; // Unix timestamp in milliseconds
  totalAssets: number; // 总资产（USD）
  bankingBalance: number; // 银行账户总余额
  investmentValue: number; // 投资总价值
  cryptoValue: number; // 加密货币总价值
}

// ============================================================================
// Payload 型別
// ============================================================================

export interface SyncWalletPayload {
  address: string;
  chainId: number;
  chainName: string;
  nativeSymbol: string;
  nativeBalance: number;
}

// ============================================================================
// UI State Slice
// ============================================================================

export interface UIState {
  // UI Preferences
  selectedTimeRange: '1M' | '3M' | '6M' | '1Y' | 'All';
  chartDataByTimeRange: Record<string, number[]>;
  currency: 'usd' | 'eur' | 'twd' | 'cny' | 'jpy';
  isAiOptedIn: boolean;

  // UI Actions
  toggleAiOptIn: () => void;
  setSelectedTimeRange: (timeRange: '1M' | '3M' | '6M' | '1Y' | 'All') => void;
  setCurrency: (currency: 'usd' | 'eur' | 'twd' | 'cny' | 'jpy') => void;
}

// ============================================================================
// Account State Slice
// ============================================================================

export interface AccountState {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  investmentAccounts: InvestmentAccount[];
  investments: Investment[];
  exchangeAccounts: ExchangeAccount[];

  // Actions - Banking Accounts
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  disconnectBankingAccount: (accountId: string) => Promise<void>;

  // Actions - Investment Accounts
  setInvestmentAccounts: (accounts: InvestmentAccount[]) => void;
  setInvestments: (investments: Investment[]) => void;
  disconnectInvestmentAccount: (accountId: string) => void;
  updateAccountOrder: (
    accountIds: string[],
    investmentAccountIds: string[]
  ) => Promise<void>;

  // Actions - Exchange Accounts
  addExchangeAccount: (account: ExchangeAccount) => void;
  removeExchangeAccount: (exchangeAccountId: string) => void;
}

// ============================================================================
// Plaid State Slice
// ============================================================================

export interface PlaidState {
  // Loading & Error States
  isLoadingPlaidData: boolean;
  plaidError: string | null;

  // Refresh tracking (for quota management)
  lastRefreshInfo: RefreshInfo | null;
  cacheSource: string | null; // '來自緩存' or '強制刷新，來自 Plaid API'

  // Actions
  hydratePlaidFinanceData: (token: string, refresh?: boolean) => Promise<void>;
  clearPlaidFinanceData: () => void;
  hydrateExchangeAccounts: (token: string) => Promise<void>;
}

// ============================================================================
// Web3 State Slice
// ============================================================================

export interface Web3State {
  // Actions
  syncConnectedWalletPosition: (payload: SyncWalletPayload) => Promise<void>;
  removeConnectedWalletPosition: (address: string, chainId: number) => void;
}

// ============================================================================
// History State Slice (Asset Performance Tracking)
// ============================================================================

export interface HistoryState {
  // Data
  assetHistory: AssetSnapshot[];
  lastRecordedTime: number | null;

  // Actions
  recordAssetSnapshot: () => void;
  getAssetSnapshotsByTimeRange: (days: number) => AssetSnapshot[];
  clearAssetHistory: () => void;
  calculateTotalAssets: () => number;
}

// ============================================================================
// Combined Finance State
// ============================================================================

export interface FinanceState extends UIState, AccountState, PlaidState, Web3State, HistoryState {}

// ============================================================================
// Chain Metadata
// ============================================================================

export interface ChainMarketMeta {
  coingeckoId: string;
  logo: string;
  fallbackName: string;
}

export type CurrencyType = 'usd' | 'eur' | 'twd' | 'cny' | 'jpy';
export type TimeRangeType = '1M' | '3M' | '6M' | '1Y' | 'All';
