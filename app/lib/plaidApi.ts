/**
 * Plaid API 服務層
 * 後端負責快取，前端專注於錯誤處理與型別安全
 */

import { requestJson } from './httpClient';

// ============= 型別定義 =============

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
  lastSyncedAt?: string | null;
  _cacheSource?: string;
  _limitReached?: boolean;
}

export interface PlaidLinkTokenResponse {
  link_token: string;
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

// ============= 請求處理器 =============

async function plaidRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(path, options, 'PlaidAPI');
}

// ============= 公開 API =============

/**
 * 建立 Plaid Link 使用的 Link Token
 * 取得 Link Token 以開啟 Plaid Link UI
 */
export const createPlaidLinkToken = (): Promise<PlaidLinkTokenResponse> => {
  return plaidRequest<PlaidLinkTokenResponse>(
    '/api/plaid/create-link-token',
    { method: 'POST' }
  );
};

/**
 * 將 public token 交換為 access token
 * 使用者完成銀行驗證後，交換取得 Access Token
 */
export const exchangePlaidPublicToken = (
  payload: { public_token: string; institution_name?: string }
): Promise<{ message: string; snapshot?: PlaidFinanceSnapshot }> => {
  return plaidRequest<{ message: string; snapshot?: PlaidFinanceSnapshot }>(
    '/api/plaid/exchange-public-token',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
};

/**
 * 取得財務快照
 * 取得財務快照（帳戶、交易、投資）
 */
export const fetchPlaidFinanceSnapshot = (): Promise<PlaidFinanceSnapshot> => {
  return plaidRequest<PlaidFinanceSnapshot>(
    '/api/plaid/finance-snapshot',
    { method: 'GET' }
  );
};

/**
 * 中斷 Plaid 帳戶連線
 * 中斷指定 Plaid 帳戶連線
 */
export const disconnectPlaidAccount = (
  accountId: string
): Promise<{ message: string; data?: { accountId: string; institution?: string; plaidRequestId?: string } }> => {
  return plaidRequest<{ message: string; data?: { accountId: string; institution?: string; plaidRequestId?: string } }>(
    '/api/plaid/disconnect',
    {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    }
  );
};

/**
 * 中斷 Plaid Item 連線（新版 endpoint）
 */
export const disconnectPlaidItem = (
  accountId: string
): Promise<{ message: string; data?: { accountId?: string; itemId?: string; institution?: string; plaidRequestId?: string } }> => {
  return plaidRequest<{ message: string; data?: { accountId?: string; itemId?: string; institution?: string; plaidRequestId?: string } }>(
    '/api/plaid/disconnect-item',
    {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    }
  );
};