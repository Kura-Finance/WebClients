/**
 * Plaid API 服務層（Phase 3 Zero-Access E2EE）
 *
 * 後端回傳 EncryptedFinanceSnapshot，前端用 X25519 私鑰解開 SEK，
 * 再用 SEK（AES-256-GCM）解密每個 account / transaction / investment。
 * 解密後再組成 PlaidFinanceSnapshot 交給 store。
 *
 * 本地 cache 策略（Stale-While-Revalidate + 原始加密 Cache）：
 *
 *   下載原始加密 response
 *     ↓  解密 → 顯示資料 → 存 raw encrypted 進 localStorage
 *     ↓  背景重新 fetch → 解密 → 覆蓋 cache → 更新 UI（onUpdate callback）
 *
 * 為什麼存「原始加密 response」而非「解密後再加密」：
 *   - raw encrypted 本身即為 localStorage safe（無私鑰無法讀）
 *   - 「解密後再加密」需要 localCacheKey（in-memory）→ page reload 即失效
 *   - 存 raw → 登入後立刻從 cache 解密顯示，不需任何 API round-trip
 *
 * TTL：4 小時（Plaid 資料更新頻率低，但仍需定期 refresh）
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

// ============= 原始加密 Snapshot 的本地 cache =============
// 後端加密 payload 可以直接存 localStorage：
//   wrappedSek  = crypto_box_seal → 只有持有 X25519 私鑰的用戶才能解
//   ciphertext  = AES-256-GCM → 只有解開 wrappedSek 才能讀
// TTL 4 小時；過期後仍可用（stale）但觸發背景 refresh。

const PLAID_CACHE_KEY = 'kura.plaid.encrypted-snapshot.v1';
const PLAID_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface PlaidCacheRecord {
  fetchedAt: number;
  data: EncryptedFinanceSnapshot;
}

function readPlaidCache(): PlaidCacheRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PLAID_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlaidCacheRecord;
  } catch {
    return null;
  }
}

function writePlaidCache(data: EncryptedFinanceSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const record: PlaidCacheRecord = { fetchedAt: Date.now(), data };
    window.localStorage.setItem(PLAID_CACHE_KEY, JSON.stringify(record));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function isPlaidCacheFresh(record: PlaidCacheRecord): boolean {
  return Date.now() - record.fetchedAt < PLAID_CACHE_TTL_MS;
}

/** 強制清除 Plaid 本地 cache（用戶登出時呼叫）。 */
export function clearPlaidCache(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PLAID_CACHE_KEY);
}

async function decryptPlaidSnapshot(
  encrypted: EncryptedFinanceSnapshot,
  pubKey: Uint8Array,
  privKey: Uint8Array,
): Promise<PlaidFinanceSnapshot> {
  // 1. Unseal all SEKs
  const sekMap = new Map<string, Uint8Array>();
  let sekFail = 0;
  for (const pk of encrypted.payloadKeys) {
    try {
      sekMap.set(pk.id, await unsealSEK(pk.wrappedSek, pubKey, privKey));
    } catch (err) {
      sekFail++;
      console.warn('[PlaidAPI] Failed to unseal SEK', { scope: pk.scope, err: String(err) });
    }
  }

  if (sekMap.size === 0 && encrypted.payloadKeys.length > 0) {
    console.warn('[PlaidAPI] All SEK unseal attempts failed — wrong key pair or corrupted data');
  }

  // 2. Decrypt accounts
  const accounts: PlaidAccountPayload[] = [];
  for (const row of encrypted.accounts) {
    const sek = sekMap.get(row.payloadKeyId);
    if (!sek) continue;
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

  console.debug('[PlaidAPI] Snapshot decrypted', {
    accounts: accounts.length,
    transactions: transactions.length,
    investmentAccounts: investmentAccounts.length,
    investments: investments.length,
    seksFailed: sekFail,
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
 * Cache 策略（Stale-While-Revalidate）：
 *   1. localStorage 有 cache 且 session 存在 → 立刻解密 cache 回傳
 *   2. 同時背景 fetch API → 拿到新資料更新 cache（不阻塞主流程）
 *   3. Cache 過期（>4h） → 等待 API；失敗則 fallback 到 stale cache
 *   4. 無 session → 回傳空陣列（需重新登入）
 *
 * @param onUpdate  背景 refresh 完成時的 callback（供 store 更新 UI）
 */
export const fetchPlaidFinanceSnapshot = async (
  onUpdate?: (result: PlaidFinanceSnapshot) => void,
): Promise<PlaidFinanceSnapshot> => {
  const session = getCryptoSession();
  if (!session) {
    console.debug('[PlaidAPI] No crypto session — cannot decrypt Plaid snapshot');
    return EMPTY_SNAPSHOT;
  }

  const pubKey = Uint8Array.from(atob(session.x25519PublicKeyBase64), (c) => c.charCodeAt(0));

  async function fetchAndCache(): Promise<EncryptedFinanceSnapshot> {
    const raw = await plaidRequest<EncryptedFinanceSnapshot>(
      '/api/plaid/finance-snapshot',
      { method: 'GET' }
    );
    writePlaidCache(raw);
    return raw;
  }

  const cached = readPlaidCache();

  // Fresh cache → decrypt immediately, refresh in background
  if (cached && isPlaidCacheFresh(cached)) {
    console.debug('[PlaidAPI] Serving Plaid snapshot from local cache (fresh)');
    void fetchAndCache().then((raw) => {
      const currentSession = getCryptoSession();
      if (!currentSession) return;
      const pub = Uint8Array.from(atob(currentSession.x25519PublicKeyBase64), (c) => c.charCodeAt(0));
      void decryptPlaidSnapshot(raw, pub, currentSession.x25519PrivateKey).then((result) => {
        onUpdate?.(result);
      });
    }).catch(() => { /* background refresh failure is non-fatal */ });
    return decryptPlaidSnapshot(cached.data, pubKey, session.x25519PrivateKey);
  }

  // Stale cache → fetch fresh, fall back to stale if fetch fails
  if (cached) {
    console.debug('[PlaidAPI] Plaid cache stale — fetching fresh snapshot');
    try {
      const raw = await fetchAndCache();
      return decryptPlaidSnapshot(raw, pubKey, session.x25519PrivateKey);
    } catch (err) {
      console.warn('[PlaidAPI] Fetch failed, falling back to stale cache', String(err));
      return decryptPlaidSnapshot(cached.data, pubKey, session.x25519PrivateKey);
    }
  }

  // No cache → fetch from API
  const raw = await fetchAndCache();
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
