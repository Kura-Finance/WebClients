/**
 * Plaid API Service Layer
 * Backend handles caching, frontend focuses on error handling and type safety
 */

import { getBackendBaseUrl } from './authApi';
import { handleFetchError, handleResponseError, logResponse, logSuccess, extractErrorMessage } from './errorHandler';

// ============= Types =============

export interface PlaidAccountPayload {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'saving' | 'credit' | 'crypto';
  logo: string;
  apy?: number;
}

export interface PlaidTransactionPayload {
  id: string;
  accountId: string;
  accountName: string;
  accountType: 'checking' | 'saving' | 'credit' | 'crypto';
  amount: string;
  date: string;
  merchant: string;
  category: string;
  type: 'credit' | 'deposit' | 'transfer';
  isRecurring?: boolean;
  isSubscription?: boolean;
  merchantLogo?: string;
}

export interface PlaidInvestmentAccountPayload {
  id: string;
  name: string;
  type: 'Broker' | 'Exchange' | 'Web3 Wallet';
  logo: string;
}

export interface PlaidInvestmentPayload {
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

export interface PlaidFinanceSnapshot {
  accounts: PlaidAccountPayload[];
  transactions: PlaidTransactionPayload[];
  investmentAccounts: PlaidInvestmentAccountPayload[];
  investments: PlaidInvestmentPayload[];
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class PlaidApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'PlaidApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

// ============= Request Handler =============

async function plaidRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Client-Type', 'web');

  try {
    console.debug('[PlaidAPI] Request:', { method: options.method || 'GET', url });

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    logResponse(response.status, response.statusText, response.headers.get('content-type'), url, 'PlaidAPI');

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
      const { error, message } = extractErrorMessage(json);
      const errorMsg = error || message || `Request failed with status ${response.status}`;
      const { error: apiError } = handleResponseError(response.status, errorMsg, url, 'PlaidAPI');
      throw apiError;
    }

    const data = (json as T) ?? ({} as T);
    logSuccess(data, url, 'PlaidAPI');
    return data;
  } catch (error) {
    if (error instanceof PlaidApiError) {
      throw error;
    }

    const { error: apiError } = handleFetchError(error, url, 'PlaidAPI');
    throw apiError;
  }
}

// ============= Public API =============

/**
 * Create Link Token for Plaid Link UI
 * 获取 Link Token 以打开 Plaid Link UI
 */
export const createPlaidLinkToken = (): Promise<{ link_token: string }> => {
  return plaidRequest<{ link_token: string }>(
    '/api/plaid/create-link-token',
    { method: 'POST' }
  );
};

/**
 * Exchange public token for access token
 * 用户完成银行认证后，交换获得 Access Token
 */
export const exchangePlaidPublicToken = (
  payload: { public_token: string; institution_name?: string }
): Promise<{ status: string; message: string; snapshot?: PlaidFinanceSnapshot }> => {
  return plaidRequest<{ status: string; message: string; snapshot?: PlaidFinanceSnapshot }>(
    '/api/plaid/exchange-public-token',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
};

/**
 * Get finance snapshot
 * 获取财务快照（帐户、交易、投资）
 */
export const fetchPlaidFinanceSnapshot = (): Promise<PlaidFinanceSnapshot> => {
  return plaidRequest<PlaidFinanceSnapshot>(
    '/api/plaid/finance-snapshot',
    { method: 'GET' }
  );
};

/**
 * Disconnect a Plaid account
 * 断开连接某个 Plaid 账户
 */
export const disconnectPlaidAccount = (
  accountId: string
): Promise<{ status: string; message: string }> => {
  return plaidRequest<{ status: string; message: string }>(
    '/api/plaid/disconnect',
    {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    }
  );
};