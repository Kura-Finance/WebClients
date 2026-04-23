/**
 * Plaid API Service Layer
 * Backend handles caching, frontend focuses on error handling and type safety
 */

import { requestJson } from './httpClient';

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
  return requestJson<T>(path, options, 'PlaidAPI');
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