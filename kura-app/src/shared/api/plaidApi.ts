/**
 * Plaid API Service Layer
 * 参考自 kura-web 的 Plaid 实现
 */

import { getBackendBaseUrl } from './authApi';
import Logger from '../utils/Logger';

export interface BackendFinanceAccount {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'saving' | 'credit' | 'crypto';
  logo: string;
}

export interface BackendFinanceTransaction {
  id: string;
  accountId?: string;
  accountName?: string;
  accountType?: 'checking' | 'saving' | 'credit' | 'crypto';
  amount: string;
  date: string;
  merchant: string;
  category: string;
  type: 'credit' | 'deposit' | 'transfer';
  logo?: string; // Merchant logo URL from backend
  // Enhanced fields from backend
  personalFinanceCategory?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  isSubscription?: boolean;
  enrichedMerchantName?: string;
  isPending?: boolean;
}

export interface BackendFinanceInvestmentAccount {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

export interface BackendFinanceInvestment {
  id: string;
  accountId?: string;
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h: number; // Can be percentage or absolute value (e.g., $1500 for BTC)
  type: 'crypto' | 'stock';
  logo: string;
}

export interface RefreshInfo {
  refreshedAt: string; // ISO string timestamp
  refreshCountRemaining: number;
  refreshLimit: number;
  nextResetAt: string; // ISO string timestamp
}

export interface BackendFinanceSnapshot {
  accounts: BackendFinanceAccount[];
  transactions: BackendFinanceTransaction[];
  investmentAccounts: BackendFinanceInvestmentAccount[];
  investments: BackendFinanceInvestment[];
  _cacheSource?: string; // '來自緩存' or '強制刷新，來自 Plaid API'
  _limitReached?: boolean; // Whether rate limit was reached
  _refreshInfo?: RefreshInfo; // Only present on refresh=true responses
}

export interface UpdatePlaidAccountOrderPayload {
  accountIds?: string[];
  investmentAccountIds?: string[];
}

export interface DisconnectAccountData {
  accountId: string;
  institution: string;
  plaidRequestId?: string;
}

export interface DisconnectAccountResponse {
  status: string;
  message: string;
  data?: DisconnectAccountData;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class PlaidApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PlaidApiError';
    this.status = status;
  }
}

async function plaidRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    Logger.debug('PlaidAPI', 'Fetching:', {
      method: options.method || 'GET',
      url,
      hasAuth: !!token,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const raw = await response.text();
    let json: (ApiErrorBody & T) | null = null;
    if (raw) {
      try {
        json = JSON.parse(raw) as ApiErrorBody & T;
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      const message = json?.error || json?.message || `Request failed with status ${response.status}`;
      Logger.error('PlaidAPI', 'Response error', { message, status: response.status });
      throw new PlaidApiError(message, response.status);
    }

    Logger.debug('PlaidAPI', 'Response successful', { status: response.status });
    return (json as T) ?? ({} as T);
  } catch (error) {
    Logger.error('PlaidAPI', 'Request failed', error);
    throw error;
  }
}

/**
 * 创建 Plaid Link Token
 * 用户打开 Plaid Link 时需要此 token
 */
export const createPlaidLinkToken = (token: string): Promise<{ link_token: string }> => {
  return plaidRequest<{ link_token: string }>(
    '/api/plaid/create-link-token',
    { method: 'POST' },
    token
  );
};

/**
 * 交换 Plaid Public Token 为 Access Token
 * 用户在 Plaid 完成授权后调用
 */
export const exchangePlaidPublicToken = (
  token: string,
  payload: { public_token: string; institution_name?: string }
): Promise<{ status: string; message: string }> => {
  return plaidRequest<{ status: string; message: string }>(
    '/api/plaid/exchange-public-token',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  );
};

/**
 * 获取财务数据快照
 * 包括银行账户、交易、投资账户和投资产品
 * 
 * @param token - Authentication token
 * @param refresh - If true, forces a refresh from Plaid API (consumes daily quota)
 *                  If false (default), returns cached data from database (unlimited)
 */
export const fetchPlaidFinanceSnapshot = (token: string, refresh: boolean = false): Promise<BackendFinanceSnapshot> => {
  const queryParam = refresh ? '?refresh=true' : '';
  return plaidRequest<BackendFinanceSnapshot>(
    `/api/plaid/finance-snapshot${queryParam}`,
    { method: 'GET' },
    token
  );
};

/**
 * 断开 Plaid 银行账户连接 (Checking/Savings/Credit) 或投资账户 (Broker/Exchange/Web3)
 * 使用同一个后端 endpoint, 后端根据 accountId 类型自动判断
 */
export const disconnectPlaidAccount = (
  token: string,
  accountId: string
): Promise<DisconnectAccountResponse> => {
  return plaidRequest<DisconnectAccountResponse>(
    '/api/plaid/disconnect',
    {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    },
    token
  );
};

/**
 * 断开 Plaid 投资账户连接 (Broker/Exchange/Web3 Wallet)
 * 使用同一个后端 endpoint
 */
export const disconnectInvestmentAccountApi = (
  token: string,
  investmentAccountId: string
): Promise<DisconnectAccountResponse> => {
  return plaidRequest<DisconnectAccountResponse>(
    '/api/plaid/disconnect',
    {
      method: 'POST',
      body: JSON.stringify({ accountId: investmentAccountId }),
    },
    token
  );
};

/**
 * 更新 Plaid 账户顺序（用于 UI 排序）
 */
export const updatePlaidAccountOrder = (
  token: string,
  payload: UpdatePlaidAccountOrderPayload
): Promise<{ status: string; message: string }> => {
  return plaidRequest<{ status: string; message: string }>(
    '/api/plaid/account-order',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    token
  );
};
