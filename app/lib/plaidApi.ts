/**
 * Plaid API 服務層（Phase 3 Zero-Access E2EE）
 *
 * 後端回傳 EncryptedFinanceSnapshot，前端用 X25519 私鑰解開 SEK，
 * 再用 SEK（AES-256-GCM）解密每個 account / transaction / investment。
 * 解密後再組成 PlaidFinanceSnapshot 交給 store。
 */

import { requestJson } from './httpClient';
import { getCryptoSession } from './crypto/zkAuth';
import { unsealSEK, decryptPayloadCiphertext } from './crypto/sealedBoxDecrypt';

// ============= 明文型別（store 使用）=============

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
  partial?: boolean;
  failedItemIds?: string[];
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

// ============= 加密 Response 型別（後端 EncryptedFinanceSnapshot）=============

interface EncryptedPayloadKey {
  id: string;
  scope: string;
  wrappedSek: string;
  algorithm: string;
}

interface EncryptedAccount {
  accountId: string;
  plaidItemId: string | null;
  type: string;
  bucket: string;
  cachedAt: string;
  payloadCiphertext: string;
  payloadKeyId: string;
}

interface EncryptedTransaction {
  transactionId: string;
  accountId: string;
  plaidItemId: string | null;
  date: string;
  month: string;
  isPending: boolean;
  isRecurring: boolean;
  isSubscription: boolean;
  cachedAt: string;
  payloadCiphertext: string;
  payloadKeyId: string;
}

interface EncryptedInvestmentAccount {
  accountId: string;
  cachedAt: string;
  payloadCiphertext: string;
  payloadKeyId: string;
}

interface EncryptedInvestment {
  investmentId: string;
  accountId: string;
  type: string;
  cachedAt: string;
  payloadCiphertext: string;
  payloadKeyId: string;
}

interface EncryptedFinanceSnapshot {
  payloadKeys: EncryptedPayloadKey[];
  accounts: EncryptedAccount[];
  transactions: EncryptedTransaction[];
  investmentAccounts: EncryptedInvestmentAccount[];
  investments: EncryptedInvestment[];
  partial: boolean;
  failedItemIds: string[];
  lastSyncedAt?: string | null;
  _cacheSource?: string;
  _limitReached?: boolean;
}

// ============= 解密後的敏感欄位型別（對應 plaidPayloadBuilder.ts）=============

interface AccountSensitive {
  name: string;
  balance: number;
  institutionName: string;
  logo: string;
  plaidLogo?: string;
  apy?: number;
  mask?: string;
}

interface TransactionSensitive {
  amount: string;
  merchant: string;
  category: string;
  type: string;
  accountName?: string;
  accountType?: string;
  merchantLogo?: string;
  enrichedMerchantName?: string;
  isRecurring?: boolean;
  isSubscription?: boolean;
}

interface InvestmentAccountSensitive {
  name: string;
  institutionName: string;
  logo: string;
  plaidLogo?: string;
}

interface InvestmentSensitive {
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h?: number;
  logo: string;
}

// ============= 解密 Pipeline =============

const EMPTY_SNAPSHOT: PlaidFinanceSnapshot = {
  accounts: [],
  transactions: [],
  investmentAccounts: [],
  investments: [],
};

async function decryptPlaidSnapshot(
  encrypted: EncryptedFinanceSnapshot,
  pubKey: Uint8Array,
  privKey: Uint8Array,
): Promise<PlaidFinanceSnapshot> {
  console.debug('[PlaidAPI] decryptPlaidSnapshot start', {
    payloadKeys: encrypted.payloadKeys.length,
    accounts: encrypted.accounts.length,
    transactions: encrypted.transactions.length,
    investmentAccounts: encrypted.investmentAccounts.length,
    investments: encrypted.investments.length,
  });

  // 1. Unseal all SEKs
  const sekMap = new Map<string, Uint8Array>();
  let sekFail = 0;
  for (const pk of encrypted.payloadKeys) {
    try {
      const sek = await unsealSEK(pk.wrappedSek, pubKey, privKey);
      sekMap.set(pk.id, sek);
      console.debug('[PlaidAPI] SEK unsealed', { id: pk.id, scope: pk.scope });
    } catch (err) {
      sekFail++;
      console.warn('[PlaidAPI] Failed to unseal SEK', { id: pk.id, scope: pk.scope, err: String(err) });
    }
  }
  console.debug('[PlaidAPI] SEK unseal results', {
    success: sekMap.size,
    failed: sekFail,
    total: encrypted.payloadKeys.length,
  });

  // 2. Decrypt accounts
  const accounts: PlaidAccountPayload[] = [];
  for (const row of encrypted.accounts) {
    const sek = sekMap.get(row.payloadKeyId);
    if (!sek) {
      console.warn('[PlaidAPI] No SEK for account', { accountId: row.accountId, payloadKeyId: row.payloadKeyId });
      continue;
    }
    try {
      const json = await decryptPayloadCiphertext(sek, row.payloadCiphertext);
      const s = JSON.parse(json) as AccountSensitive;
      const account: PlaidAccountPayload = {
        id: row.accountId,
        name: s.name,
        balance: s.balance,
        type: row.type as PlaidAccountPayload['type'],
        logo: s.logo,
      };
      if (s.apy !== undefined) account.apy = s.apy;
      accounts.push(account);
    } catch (err) {
      console.warn('[PlaidAPI] Failed to decrypt account', { accountId: row.accountId, err: String(err) });
    }
  }

  // 3. Decrypt transactions
  const transactions: PlaidTransactionPayload[] = [];
  for (const row of encrypted.transactions) {
    const sek = sekMap.get(row.payloadKeyId);
    if (!sek) continue;
    try {
      const json = await decryptPayloadCiphertext(sek, row.payloadCiphertext);
      const s = JSON.parse(json) as TransactionSensitive;
      transactions.push({
        id: row.transactionId,
        accountId: row.accountId,
        accountName: s.accountName ?? '',
        accountType: (s.accountType ?? 'checking') as PlaidTransactionPayload['accountType'],
        amount: s.amount,
        date: row.date,
        merchant: s.enrichedMerchantName ?? s.merchant,
        category: s.category,
        type: s.type as PlaidTransactionPayload['type'],
        isRecurring: row.isRecurring,
        isSubscription: row.isSubscription,
        merchantLogo: s.merchantLogo,
      });
    } catch (err) {
      console.warn('[PlaidAPI] Failed to decrypt transaction', { id: row.transactionId, err: String(err) });
    }
  }

  // 4. Decrypt investment accounts
  const investmentAccounts: PlaidInvestmentAccountPayload[] = [];
  for (const row of encrypted.investmentAccounts) {
    const sek = sekMap.get(row.payloadKeyId);
    if (!sek) continue;
    try {
      const json = await decryptPayloadCiphertext(sek, row.payloadCiphertext);
      const s = JSON.parse(json) as InvestmentAccountSensitive;
      investmentAccounts.push({
        id: row.accountId,
        name: s.name,
        type: 'Broker',  // type was not included in the E2EE split — default to 'Broker'
        logo: s.logo,
      });
    } catch (err) {
      console.warn('[PlaidAPI] Failed to decrypt investmentAccount', { accountId: row.accountId, err: String(err) });
    }
  }

  // 5. Decrypt investments
  const investments: PlaidInvestmentPayload[] = [];
  for (const row of encrypted.investments) {
    const sek = sekMap.get(row.payloadKeyId);
    if (!sek) continue;
    try {
      const json = await decryptPayloadCiphertext(sek, row.payloadCiphertext);
      const s = JSON.parse(json) as InvestmentSensitive;
      investments.push({
        id: row.investmentId,
        accountId: row.accountId,
        symbol: s.symbol,
        name: s.name,
        holdings: s.holdings,
        currentPrice: s.currentPrice,
        change24h: s.change24h ?? 0,
        type: row.type as PlaidInvestmentPayload['type'],
        logo: s.logo,
      });
    } catch (err) {
      console.warn('[PlaidAPI] Failed to decrypt investment', { investmentId: row.investmentId, err: String(err) });
    }
  }

  // Zeroize all SEKs after use
  for (const sek of sekMap.values()) sek.fill(0);

  console.debug('[PlaidAPI] Plaid snapshot decrypted', {
    accounts: accounts.length,
    transactions: transactions.length,
    investmentAccounts: investmentAccounts.length,
    investments: investments.length,
  });

  return {
    accounts,
    transactions,
    investmentAccounts,
    investments,
    lastSyncedAt: encrypted.lastSyncedAt,
    _cacheSource: encrypted._cacheSource,
    _limitReached: encrypted._limitReached,
    partial: encrypted.partial,
    failedItemIds: encrypted.failedItemIds,
  };
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
 */
export const createPlaidLinkToken = (): Promise<PlaidLinkTokenResponse> => {
  return plaidRequest<PlaidLinkTokenResponse>(
    '/api/plaid/create-link-token',
    { method: 'POST' }
  );
};

/**
 * 將 public token 交換為 access token
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
 * 取得財務快照並解密（Phase 3 Zero-Access E2EE）。
 *
 * 需要有效的 crypto session：
 *   - 登入後 → session 存在 → 完整解密回傳
 *   - Page reload → session 消失 → 回傳空陣列（等用戶重新登入）
 */
export const fetchPlaidFinanceSnapshot = async (): Promise<PlaidFinanceSnapshot> => {
  const raw = await plaidRequest<EncryptedFinanceSnapshot>(
    '/api/plaid/finance-snapshot',
    { method: 'GET' }
  );

  const session = getCryptoSession();
  if (!session) {
    console.debug('[PlaidAPI] No crypto session — cannot decrypt Plaid snapshot, returning empty');
    return {
      ...EMPTY_SNAPSHOT,
      lastSyncedAt: raw.lastSyncedAt,
      _cacheSource: raw._cacheSource,
      partial: raw.partial,
      failedItemIds: raw.failedItemIds,
    };
  }

  const pubKey = Uint8Array.from(atob(session.x25519PublicKeyBase64), (c) => c.charCodeAt(0));
  return decryptPlaidSnapshot(raw, pubKey, session.x25519PrivateKey);
};

/**
 * 中斷 Plaid 帳戶連線
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
