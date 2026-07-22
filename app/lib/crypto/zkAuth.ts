/**
 * E2EE 資料層解鎖（Passkey-DEK + Wrapped X25519 Keypair 版）
 *
 * 新架構（對齊 backendserver / react-native）：
 *   - 登入由 Privy 驅動（見 authApi.loginWithPrivy / PrivyProvider）。
 *   - 登入後用 Passkey（WebAuthn PRF）解鎖出 32-byte DEK。
 *   - DEK + kekSalt 派生 dekWrapKey / localCacheKey；dekWrapKey 解開後端存的
 *     encryptedPrivateKey → X25519 privateKey → 用來開 sealed box 解業務資料。
 *
 * 對外公開（資料層 / store 依賴）：
 *   - ensureE2EEUnlocked()      → 登入後解鎖（沒 keypair 自動 setup；沒 passkey 自動註冊）
 *   - ensureKeyPairConfigured() → 後端回 409 KEY_PAIR_REQUIRED 時由呼叫端觸發
 *   - getCryptoSession()        → 取得目前 in-memory session（解 sealed box 用）
 *   - isE2EEUnlocked()          → 是否已具備可解密的 session
 *   - clearCryptoSession()      → 登出清除
 *   - tryRestoreSessionFromStorage() → page reload 後還原 x25519 keypair
 *   - decryptFromServer(envelope) → 解開後端 hybrid envelope（相容保留）
 */

import {
  decryptServerEnvelope,
  generateSalt,
  generateX25519KeyPair,
  wrapPrivateKey,
  unwrapPrivateKey,
} from './keyDerivation';
import type { EncryptedEnvelope } from './keyDerivation';
import { deriveKeysFromDek } from './keyDerivation';
import {
  registerPasskeyAndGetDek,
  authenticatePasskeyForDek,
  getPasskeyStatus,
} from './passkey';
import {
  getUserKeyPair,
  setupUserKeyPair,
  rotateUserKeyPair,
  UserKeyPairNotFoundError,
  type UserKeyPairRecord,
} from '@/lib/authApi';

// ─────────────────────────────────────────
// Crypto Session（記憶體中，登出後清除）
// ─────────────────────────────────────────

interface CryptoSession {
  /** X25519 私鑰（raw 32 bytes），解 sealed box / hybrid envelope 用。 */
  x25519PrivateKey: Uint8Array;
  /** 對應的 X25519 公鑰（base64，44 chars）。 */
  x25519PublicKeyBase64: string;
  /**
   * AES-GCM CryptoKey，用來 wrap/unwrap privateKey。
   * null = sessionStorage 還原的部分 session（reload 後），需重新 passkey 解鎖才有。
   */
  dekWrapKey: CryptoKey | null;
  /** AES-GCM CryptoKey，給 financeVault 加密 localStorage 快取；reload 後為 null。 */
  localCacheKey: CryptoKey | null;
}

let cryptoSession: CryptoSession | null = null;
const CRYPTO_OPERATION_ERROR_MESSAGE =
  'Account cryptography operation failed. Please retry with an updated browser.';

// ─────────────────────────────────────────
// SessionStorage 持久化（跨 page reload，關 tab 清除）
// ─────────────────────────────────────────

const SESSION_STORAGE_KEY = 'kura.crypto.session.v1';

interface PersistedSession {
  privKeyB64: string;
  pubKeyB64: string;
}

function persistSessionToStorage(privKey: Uint8Array, pubKeyBase64: string): void {
  if (typeof window === 'undefined') return;
  try {
    const privKeyB64 = btoa(String.fromCharCode(...privKey));
    const record: PersistedSession = { privKeyB64, pubKeyB64: pubKeyBase64 };
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // sessionStorage 不可用（隱私瀏覽等）— 靜默跳過，降級為每次重新解鎖
  }
}

function clearPersistedSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * 嘗試從 sessionStorage 還原 crypto session（x25519 keypair only）。
 * 還原的 session 已足夠解密所有 E2EE 資料；若需要 dekWrapKey（keypair 重建）需重新 passkey 解鎖。
 */
export function tryRestoreSessionFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;
    const record = JSON.parse(raw) as PersistedSession;
    if (!record.privKeyB64 || !record.pubKeyB64) return false;
    const privKey = Uint8Array.from(atob(record.privKeyB64), (c) => c.charCodeAt(0));
    if (privKey.length !== 32) return false;
    cryptoSession = {
      x25519PrivateKey: privKey,
      x25519PublicKeyBase64: record.pubKeyB64,
      dekWrapKey: null,
      localCacheKey: null,
    };
    return true;
  } catch {
    return false;
  }
}

export function getCryptoSession(): CryptoSession | null {
  return cryptoSession;
}

export function isE2EEUnlocked(): boolean {
  return cryptoSession !== null;
}

export function clearCryptoSession(): void {
  if (cryptoSession) {
    cryptoSession.x25519PrivateKey.fill(0);
  }
  cryptoSession = null;
  clearPersistedSession();
}

function isCryptoOperationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return ['OperationError', 'DataError', 'InvalidAccessError', 'NotSupportedError'].includes(error.name);
}

function setSession(
  privateKey: Uint8Array,
  publicKeyBase64: string,
  dekWrapKey: CryptoKey,
  localCacheKey: CryptoKey,
): void {
  cryptoSession = {
    x25519PrivateKey: privateKey,
    x25519PublicKeyBase64: publicKeyBase64,
    dekWrapKey,
    localCacheKey,
  };
  persistSessionToStorage(privateKey, publicKeyBase64);
}

// ─────────────────────────────────────────
// 內部：用 DEK 建立 / 輪替 keypair（新 kekSalt）
// ─────────────────────────────────────────

async function provisionKeyPairWithDek(dek: Uint8Array, mode: 'setup' | 'rotate'): Promise<void> {
  const kekSalt = generateSalt();
  const { dekWrapKey, localCacheKey } = await deriveKeysFromDek(dek, kekSalt);
  const keyPair = generateX25519KeyPair();
  const encryptedPrivateKey = await wrapPrivateKey(keyPair.privateKey, dekWrapKey);

  if (mode === 'rotate') {
    await rotateUserKeyPair(keyPair.publicKeyBase64, encryptedPrivateKey, kekSalt);
  } else {
    await setupUserKeyPair(keyPair.publicKeyBase64, encryptedPrivateKey, kekSalt);
  }

  setSession(keyPair.privateKey, keyPair.publicKeyBase64, dekWrapKey, localCacheKey);
}

async function fetchKeyPairRecord(): Promise<UserKeyPairRecord | null> {
  try {
    return await getUserKeyPair();
  } catch (error) {
    if (error instanceof UserKeyPairNotFoundError) {
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────
// 對外：登入後解鎖 E2EE 資料層
// ─────────────────────────────────────────

/**
 * 確保目前已具備可解密的 crypto session。
 *
 * 涵蓋所有情況：
 *   - 已有 keypair + 已註冊 passkey → authenticate 取 DEK → 解開 privateKey。
 *   - 已有 keypair 但 passkey 不一致 / 解不開 → 重新註冊 passkey 並 rotate keypair。
 *   - 尚無 keypair → 註冊（或驗證）passkey 取 DEK → setup 新 keypair。
 *
 * ⚠️ rotate 會讓既有 wrappedSek 失效；後端會在下次 sync 用新 publicKey 重新加密。
 */
export async function ensureE2EEUnlocked(): Promise<void> {
  try {
    const [record, status] = await Promise.all([fetchKeyPairRecord(), getPasskeyStatus()]);

    // 路徑 1：已有 keypair
    if (record) {
      if (status.registered && record.kekSalt) {
        const dek = await authenticatePasskeyForDek();
        const { dekWrapKey, localCacheKey } = await deriveKeysFromDek(dek, record.kekSalt);
        try {
          const priv = await unwrapPrivateKey(record.encryptedPrivateKey, dekWrapKey);
          setSession(priv, record.publicKey, dekWrapKey, localCacheKey);
          return;
        } catch {
          // 解不開（DEK / kekSalt 不對）→ 用同一把 DEK 重建 keypair
          await provisionKeyPairWithDek(dek, 'rotate');
          return;
        }
      }

      // 有 keypair 但沒有（可用的）passkey → 註冊新 passkey 並 rotate keypair
      const dek = await registerPasskeyAndGetDek();
      await provisionKeyPairWithDek(dek, 'rotate');
      return;
    }

    // 路徑 2：尚無 keypair → setup
    const dek = status.registered ? await authenticatePasskeyForDek() : await registerPasskeyAndGetDek();
    await provisionKeyPairWithDek(dek, 'setup');
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

/**
 * 後端回 409 KEY_PAIR_REQUIRED 時由呼叫端（如 useFinanceStore）觸發。
 * 若已有可用 session 則直接沿用，否則跑完整解鎖流程。
 */
export async function ensureKeyPairConfigured(): Promise<void> {
  if (cryptoSession?.dekWrapKey) {
    return;
  }
  await ensureE2EEUnlocked();
}

// ─────────────────────────────────────────
// 對外：解密後端送來的 hybrid envelope（相容保留）
// ─────────────────────────────────────────

export async function decryptFromServer(envelope: EncryptedEnvelope): Promise<Uint8Array> {
  if (!cryptoSession) {
    throw new Error('No active crypto session. Please unlock your data first.');
  }
  try {
    return await decryptServerEnvelope(envelope, cryptoSession.x25519PrivateKey);
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

export async function decryptFromServerJson<T = unknown>(envelope: EncryptedEnvelope): Promise<T> {
  const bytes = await decryptFromServer(envelope);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
