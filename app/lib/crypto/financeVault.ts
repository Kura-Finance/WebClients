import { getCryptoSession } from './zkAuth';
import type { AssetHistoryPoint, AssetHistorySummary } from '@/lib/assetApi';

const FINANCE_CACHE_STORAGE_KEY = 'kura.finance.encrypted-cache.v1';

export interface FinanceEncryptedCache {
  accounts: unknown[];
  transactions: unknown[];
  investmentAccounts: unknown[];
  investments: unknown[];
  apiAssetHistory: AssetHistoryPoint[];
  assetHistorySummary: AssetHistorySummary | null;
  plaidLastSyncedAt?: string | null;
  debankLastSyncedAt?: string | null;
}

interface EncryptedFinanceCacheRecord {
  version: 1;
  iv: string;
  ciphertext: string;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function getDataKeyCryptoKey(): Promise<CryptoKey | null> {
  if (typeof window === 'undefined') return null;
  const session = getCryptoSession();
  if (!session?.dataKeyHex) return null;

  return crypto.subtle.importKey(
    'raw',
    hexToBytes(session.dataKeyHex),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function persistEncryptedFinanceCache(payload: FinanceEncryptedCache): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const dataKey = await getDataKeyCryptoKey();
    if (!dataKey) return false;

    const plainBytes = new TextEncoder().encode(JSON.stringify(payload));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      dataKey,
      plainBytes,
    );

    const record: EncryptedFinanceCacheRecord = {
      version: 1,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    };
    window.localStorage.setItem(FINANCE_CACHE_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch (error) {
    console.warn('[FinanceVault] Failed to persist encrypted finance cache', error);
    return false;
  }
}

export async function loadEncryptedFinanceCache(): Promise<FinanceEncryptedCache | null> {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(FINANCE_CACHE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<EncryptedFinanceCacheRecord>;
    if (parsed.version !== 1 || !parsed.iv || !parsed.ciphertext) return null;

    const dataKey = await getDataKeyCryptoKey();
    if (!dataKey) return null;

    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(parsed.iv) },
      dataKey,
      base64ToBytes(parsed.ciphertext),
    );

    return JSON.parse(new TextDecoder().decode(plain)) as FinanceEncryptedCache;
  } catch (error) {
    console.warn('[FinanceVault] Failed to load encrypted finance cache', error);
    return null;
  }
}

export function clearEncryptedFinanceCache(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(FINANCE_CACHE_STORAGE_KEY);
}
