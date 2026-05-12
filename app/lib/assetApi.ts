/**
 * 資產歷史 API 服務（Phase 3 Zero-Access E2EE）
 *
 * 後端回傳加密格式：{ payloadKeys, snapshots }
 * 前端負責：
 *   1. 用 X25519 privateKey 解開每把 wrappedSek（libsodium sealed box）
 *   2. 用 SEK 解密每個 snapshot 的 payloadCiphertext（AES-256-GCM）
 *   3. 依 timestamp 分組、按 metric 加總，組成時間序列
 *   4. 計算 AssetHistorySummary
 *
 * 本地 cache 策略：
 *   - 後端加密 response 本身即為零知識資料（無私鑰無法解），可直接存 localStorage
 *   - fetchAssetHistory() 優先解密 cache，同時在背景 refresh API 並更新 cache
 *   - Page reload 後 session 不存在時 cache 仍可讀；用戶重新登入後立即解密，不需 API round-trip
 */

import { requestJson } from './httpClient';
import { getCryptoSession } from './crypto/zkAuth';
import { unsealSEK, decryptPayloadCiphertext } from './crypto/sealedBoxDecrypt';

// ============= 明文型別（store 使用）=============

export interface AssetHistoryPoint {
  timestamp: string;
  cashFlow: number;
  plaidInvestment: number;
  cryptoSpot: number;
  defiProtocol: number;
}

export interface AssetSegmentSummary {
  minValue: number;
  maxValue: number;
  change: number;
  changePercent: number;
}

export interface AssetHistorySummary {
  cashFlow: AssetSegmentSummary;
  plaidInvestment: AssetSegmentSummary;
  cryptoSpot: AssetSegmentSummary;
  defiProtocol: AssetSegmentSummary;
}

export interface AssetHistoryResponse {
  userId: string;
  history: AssetHistoryPoint[];
  summary: AssetHistorySummary;
}

// ============= 加密 Response 型別（後端回傳格式）=============

type AssetMetricBase = 'cashFlow' | 'plaidInvestment' | 'cryptoSpot' | 'defiProtocol';

interface EncryptedPayloadKey {
  id: string;
  scope: string;
  wrappedSek: string;  // base64(crypto_box_seal output)
  algorithm: string;
}

interface EncryptedSnapshot {
  id: string;
  metric: string;          // base or sub-scoped (e.g. "cashFlow:source:id")
  recordedAt: string;      // ISO 8601
  payloadCiphertext: string; // base64(iv[12] | tag[16] | ciphertext)
  payloadKeyId: string;
}

interface EncryptedAssetHistoryResponse {
  userId: string;
  payloadKeys: EncryptedPayloadKey[];
  snapshots: EncryptedSnapshot[];
}

// ============= 內部工具 =============

const ZERO_SUMMARY: AssetSegmentSummary = { minValue: 0, maxValue: 0, change: 0, changePercent: 0 };

const EMPTY_RESPONSE: AssetHistoryResponse = {
  userId: '',
  history: [],
  summary: {
    cashFlow: ZERO_SUMMARY,
    plaidInvestment: ZERO_SUMMARY,
    cryptoSpot: ZERO_SUMMARY,
    defiProtocol: ZERO_SUMMARY,
  },
};

// ============= 原始加密 Response 的本地 cache =============
// 後端加密 payload 可以直接存 localStorage，無需額外加密：
//   wrappedSek  = crypto_box_seal → 只有持有 X25519 私鑰的用戶才能解
//   ciphertext  = AES-256-GCM → 只有解開 wrappedSek 才能拿到 SEK
// Cache 存活時間 30 分鐘；超過後仍可用（stale）但會觸發背景 refresh。

const CACHE_KEY_PREFIX = 'kura.asset-history.encrypted-cache.v1:';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface AssetHistoryCacheRecord {
  fetchedAt: number;            // Date.now()
  days: number;                 // query days parameter
  data: EncryptedAssetHistoryResponse;
}

function cacheKey(days: number): string {
  return `${CACHE_KEY_PREFIX}${days}`;
}

function readCache(days: number): AssetHistoryCacheRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(days));
    if (!raw) return null;
    return JSON.parse(raw) as AssetHistoryCacheRecord;
  } catch {
    return null;
  }
}

function writeCache(days: number, data: EncryptedAssetHistoryResponse): void {
  if (typeof window === 'undefined') return;
  try {
    const record: AssetHistoryCacheRecord = { fetchedAt: Date.now(), days, data };
    window.localStorage.setItem(cacheKey(days), JSON.stringify(record));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function isCacheFresh(record: AssetHistoryCacheRecord): boolean {
  return Date.now() - record.fetchedAt < CACHE_TTL_MS;
}

function summarizeSegment(values: number[]): AssetSegmentSummary {
  if (values.length === 0) return ZERO_SUMMARY;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePercent = first !== 0 ? (change / Math.abs(first)) * 100 : 0;
  return { minValue, maxValue, change, changePercent };
}

function extractBaseMetric(metric: string): AssetMetricBase | null {
  const base = metric.split(':')[0] as AssetMetricBase;
  if (['cashFlow', 'plaidInvestment', 'cryptoSpot', 'defiProtocol'].includes(base)) {
    return base;
  }
  return null;
}

async function decryptHistory(
  encrypted: EncryptedAssetHistoryResponse,
  pubKey: Uint8Array,
  privKey: Uint8Array,
): Promise<AssetHistoryResponse> {
  // 1. Unseal all SEKs
  const sekMap = new Map<string, Uint8Array>();
  for (const pk of encrypted.payloadKeys) {
    try {
      const sek = await unsealSEK(pk.wrappedSek, pubKey, privKey);
      sekMap.set(pk.id, sek);
    } catch (err) {
      console.warn('[AssetAPI] Failed to unseal SEK for payloadKey', pk.id, err);
    }
  }

  // 2. Decrypt each snapshot, group by timestamp + base metric (sum sub-scopes)
  const groups = new Map<string, Partial<Record<AssetMetricBase, number>>>();
  for (const snap of encrypted.snapshots) {
    const sek = sekMap.get(snap.payloadKeyId);
    if (!sek) continue;

    const base = extractBaseMetric(snap.metric);
    if (!base) continue;

    let value: number;
    try {
      const json = await decryptPayloadCiphertext(sek, snap.payloadCiphertext);
      const parsed = JSON.parse(json) as { value?: number };
      value = parsed.value ?? 0;
    } catch (err) {
      console.warn('[AssetAPI] Failed to decrypt snapshot', snap.id, err);
      continue;
    }

    const existing = groups.get(snap.recordedAt) ?? {};
    existing[base] = (existing[base] ?? 0) + value;
    groups.set(snap.recordedAt, existing);
  }

  // Zeroize all SEKs after use
  for (const sek of sekMap.values()) {
    sek.fill(0);
  }

  if (groups.size === 0) {
    return { ...EMPTY_RESPONSE, userId: encrypted.userId };
  }

  // 3. Build sorted time series, filling missing metrics with 0
  const history: AssetHistoryPoint[] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, metrics]) => ({
      timestamp,
      cashFlow: metrics.cashFlow ?? 0,
      plaidInvestment: metrics.plaidInvestment ?? 0,
      cryptoSpot: metrics.cryptoSpot ?? 0,
      defiProtocol: metrics.defiProtocol ?? 0,
    }));

  // 4. Calculate summary from time series
  const summary: AssetHistorySummary = {
    cashFlow: summarizeSegment(history.map((p) => p.cashFlow)),
    plaidInvestment: summarizeSegment(history.map((p) => p.plaidInvestment)),
    cryptoSpot: summarizeSegment(history.map((p) => p.cryptoSpot)),
    defiProtocol: summarizeSegment(history.map((p) => p.defiProtocol)),
  };

  return { userId: encrypted.userId, history, summary };
}

// ============= 公開 API =============

/**
 * 取得並解密指定天數內的資產歷史資料。
 *
 * 需要已登入的 cryptoSession。若 session 不存在（未登入）則回傳空資料，
 * 讓呼叫端優雅降級而非拋出例外。
 */
/**
 * 取得並解密指定天數內的資產歷史資料。
 *
 * Cache 策略（stale-while-revalidate）：
 *   1. 若 localStorage 有 cache 且 session 存在 → 立刻解密 cache 回傳
 *   2. 同時啟動背景 API fetch：拿到新資料後更新 cache（不阻塞主流程）
 *   3. 若 cache 已過期（>30 min）→ 等待 API，不回傳 stale 資料
 *   4. 若 session 不存在 → 回傳空（需重新登入）
 *
 * @param days      查詢天數（預設 30）
 * @param onUpdate  背景 refresh 完成時的 callback（供 store 更新 UI）
 */
export const fetchAssetHistory = async (
  days: number = 30,
  onUpdate?: (result: AssetHistoryResponse) => void,
): Promise<AssetHistoryResponse> => {
  const session = getCryptoSession();
  if (!session) {
    console.debug('[AssetAPI] No crypto session — asset history unavailable until re-login');
    return EMPTY_RESPONSE;
  }

  const pubKeyBytes = Uint8Array.from(atob(session.x25519PublicKeyBase64), (c) => c.charCodeAt(0));

  async function fetchAndCache(): Promise<EncryptedAssetHistoryResponse> {
    const raw = await requestJson<EncryptedAssetHistoryResponse>(
      `/api/assets/history?days=${days}`,
      { method: 'GET' },
      'AssetAPI',
    );
    if (raw.payloadKeys && raw.snapshots) {
      writeCache(days, raw);
    }
    return raw;
  }

  const cached = readCache(days);

  // Fresh cache available → decrypt and return immediately, refresh in background
  if (cached && isCacheFresh(cached)) {
    console.debug('[AssetAPI] Serving asset history from local cache (fresh)');
    void fetchAndCache().then((raw) => {
      if (!raw.payloadKeys || !raw.snapshots) return;
      const currentSession = getCryptoSession();
      if (!currentSession) return;
      const pub = Uint8Array.from(atob(currentSession.x25519PublicKeyBase64), (c) => c.charCodeAt(0));
      void decryptHistory(raw, pub, currentSession.x25519PrivateKey).then((result) => {
        onUpdate?.(result);
      });
    }).catch(() => { /* background refresh failure is non-fatal */ });
    return decryptHistory(cached.data, pubKeyBytes, session.x25519PrivateKey);
  }

  // Stale cache available → fetch fresh, fall back to stale if fetch fails
  if (cached) {
    console.debug('[AssetAPI] Cache stale — fetching fresh asset history');
    try {
      const raw = await fetchAndCache();
      if (!raw.payloadKeys || !raw.snapshots) {
        return decryptHistory(cached.data, pubKeyBytes, session.x25519PrivateKey);
      }
      return decryptHistory(raw, pubKeyBytes, session.x25519PrivateKey);
    } catch {
      console.warn('[AssetAPI] Fetch failed, falling back to stale cache');
      return decryptHistory(cached.data, pubKeyBytes, session.x25519PrivateKey);
    }
  }

  // No cache → fetch from API
  const raw = await fetchAndCache();
  if (!raw.payloadKeys || !raw.snapshots) {
    console.warn('[AssetAPI] Received non-encrypted response — returning empty history');
    return { ...EMPTY_RESPONSE, userId: (raw as { userId?: string }).userId ?? '' };
  }
  return decryptHistory(raw, pubKeyBytes, session.x25519PrivateKey);
};
