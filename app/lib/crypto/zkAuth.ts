/**
 * 零知識認證流程（Wrapped X25519 Keypair 版）
 *
 * 概觀：
 *   - SRP 用來證明用戶知道密碼，但密碼本身永不離開瀏覽器。
 *   - X25519 keypair 是 random 生成、私鑰用 dekWrapKey 加密後存後端
 *     （後端 /auth/keys/{setup,rotate,me}）。
 *   - 換密碼只 re-wrap 同一把 privateKey，publicKey 不變 → 舊 wrappedSek 仍有效。
 *
 * 對外公開：
 *   - zkLogin(email, password)            → SRP 登入 + 從 /keys/me 取回並解開 privateKey
 *                                            （無法解開時自動 fresh 生成並走 /keys/rotate）
 *   - zkVerifyRegistration(...)           → 驗證碼註冊 + /keys/setup 上傳新 keypair
 *   - zkChangePassword(...)               → SRP rotate + /keys/rotate（保留同一把 keypair）
 *   - zkResetPassword(...)                → SRP reset；keypair 失效，下次登入 lazy 重建
 *   - decryptFromServer(envelope)         → 解開後端送來的 hybrid envelope
 *   - clearCryptoSession()                → 登出清除
 */

import {
  deriveKeysFromPassword,
  decryptServerEnvelope,
  generateSalt,
  generateX25519KeyPair,
  wrapPrivateKey,
  unwrapPrivateKey,
} from './keyDerivation';
import type { EncryptedEnvelope } from './keyDerivation';
import {
  computeVerifier,
  srpFullLogin,
  getSRPSalts,
} from './srpClient';
import {
  verifyRegistration as apiVerifyRegistration,
  resetPassword as apiResetPassword,
  changePassword as apiChangePassword,
  getUserKeyPair,
  setupUserKeyPair,
  rotateUserKeyPair,
  UserKeyPairNotFoundError,
} from '@/lib/authApi';
import type { BackendUserProfile } from '@/lib/authApi';

// ─────────────────────────────────────────
// Crypto Session（記憶體中，登出後清除）
// ─────────────────────────────────────────

interface CryptoSession {
  /** X25519 私鑰（raw 32 bytes），解 hybrid envelope 用。 */
  x25519PrivateKey: Uint8Array;
  /** 對應的 X25519 公鑰（base64，44 chars）。 */
  x25519PublicKeyBase64: string;
  /** AES-GCM CryptoKey，用來 wrap/unwrap privateKey；換密碼時會被替換。 */
  dekWrapKey: CryptoKey;
  /** AES-GCM CryptoKey，給 financeVault 加密 localStorage 快取。 */
  localCacheKey: CryptoKey;
}

let cryptoSession: CryptoSession | null = null;
const CRYPTO_OPERATION_ERROR_MESSAGE =
  'Account cryptography operation failed. Please retry with an updated browser.';

export function getCryptoSession(): CryptoSession | null {
  return cryptoSession;
}

export function clearCryptoSession(): void {
  if (cryptoSession) {
    cryptoSession.x25519PrivateKey.fill(0);
  }
  cryptoSession = null;
}

function isCryptoOperationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return [
    'OperationError',
    'DataError',
    'InvalidAccessError',
    'NotSupportedError',
  ].includes(error.name);
}

// ─────────────────────────────────────────
// 內部：取得 / 建立 / 修復 keypair（lazy recovery）
// ─────────────────────────────────────────

/**
 * 嘗試 GET /keys/me 並用目前 dekWrapKey 解開 encryptedPrivateKey。
 * 若 server 沒紀錄（首次登入但 setup 沒成功）或解不開（換密碼/reset 後舊 wrap 失效），
 * 都會自動 fresh 生成一組 keypair 並透過 setup/rotate 寫回，回傳結果與目前 dekWrapKey 一致。
 */
async function obtainOrRepairKeyPair(dekWrapKey: CryptoKey): Promise<{
  x25519PrivateKey: Uint8Array;
  x25519PublicKeyBase64: string;
}> {
  let serverRecordExists = true;
  try {
    const record = await getUserKeyPair();
    try {
      const priv = await unwrapPrivateKey(record.encryptedPrivateKey, dekWrapKey);
      return { x25519PrivateKey: priv, x25519PublicKeyBase64: record.publicKey };
    } catch {
      // 解不開 → 之前的 keypair 是用舊密碼派生的 dekWrapKey 包的，已失效
      // 落到下面的 rotate 路徑
    }
  } catch (error) {
    if (error instanceof UserKeyPairNotFoundError) {
      serverRecordExists = false;
    } else {
      throw error;
    }
  }

  // 走到這裡：server 沒紀錄、或舊紀錄已無法解開 → 生新的
  const fresh = generateX25519KeyPair();
  const encryptedPrivateKey = await wrapPrivateKey(fresh.privateKey, dekWrapKey);
  if (serverRecordExists) {
    await rotateUserKeyPair(fresh.publicKeyBase64, encryptedPrivateKey);
  } else {
    await setupUserKeyPair(fresh.publicKeyBase64, encryptedPrivateKey);
  }
  return {
    x25519PrivateKey: fresh.privateKey,
    x25519PublicKeyBase64: fresh.publicKeyBase64,
  };
}

// ─────────────────────────────────────────
// ZK 登入
// ─────────────────────────────────────────

export async function zkLogin(email: string, password: string): Promise<{ user: BackendUserProfile }> {
  const normalizedEmail = email.toLowerCase().trim();

  const salts = await getSRPSalts(normalizedEmail);
  if (!salts.srpEnabled) {
    throw new Error('Your account requires a security upgrade. Please reset your password to continue.');
  }

  const { srpSalt, kekSalt } = salts;

  try {
    const derived = await deriveKeysFromPassword(password, srpSalt, kekSalt);

    // SRP 握手；成功後 cookie 已寫入，後面才能打 /keys/me
    const { user } = await srpFullLogin(normalizedEmail, derived.authKeyHex);

    const { x25519PrivateKey, x25519PublicKeyBase64 } = await obtainOrRepairKeyPair(derived.dekWrapKey);

    cryptoSession = {
      x25519PrivateKey,
      x25519PublicKeyBase64,
      dekWrapKey: derived.dekWrapKey,
      localCacheKey: derived.localCacheKey,
    };
    return { user };
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

// ─────────────────────────────────────────
// 註冊確認（驗證碼 + SRP + keypair setup）
// ─────────────────────────────────────────

export async function zkVerifyRegistration(
  email: string,
  password: string,
  verificationCode: string,
): Promise<{ user: BackendUserProfile }> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const srpSalt = generateSalt();
    const kekSalt = generateSalt();
    const derived = await deriveKeysFromPassword(password, srpSalt, kekSalt);
    const { srpVerifier } = await computeVerifier(normalizedEmail, derived.authKeyHex, srpSalt);

    // 1) SRP 註冊：建立帳號與 SRP 紀錄；成功後 cookie 已就緒
    const response = await apiVerifyRegistration(
      normalizedEmail,
      verificationCode,
      srpSalt,
      srpVerifier,
      kekSalt,
    );

    // 2) 隨機產 keypair、用 dekWrapKey 包好上傳到 /keys/setup
    const keyPair = generateX25519KeyPair();
    const encryptedPrivateKey = await wrapPrivateKey(keyPair.privateKey, derived.dekWrapKey);
    await setupUserKeyPair(keyPair.publicKeyBase64, encryptedPrivateKey);

    cryptoSession = {
      x25519PrivateKey: keyPair.privateKey,
      x25519PublicKeyBase64: keyPair.publicKeyBase64,
      dekWrapKey: derived.dekWrapKey,
      localCacheKey: derived.localCacheKey,
    };
    return { user: response.user };
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

// ─────────────────────────────────────────
// 變更密碼（已登入；保留同一把 keypair）
// ─────────────────────────────────────────

/**
 * 步驟：
 *   1. 用新密碼推導新的 dekWrapKey / authKey / localCacheKey。
 *   2. SRP rotate（/password-reset/verify with preserveData=true）：覆蓋 srpVerifier。
 *   3. 把 session 內現有的 privateKey 用新的 dekWrapKey 重新 wrap，POST /keys/rotate。
 *   4. 更新 cryptoSession 的 dekWrapKey / localCacheKey；privateKey / publicKey 不變。
 */
export async function zkChangePassword(email: string, resetCode: string, newPassword: string): Promise<void> {
  if (!cryptoSession) {
    throw new Error('No active crypto session. Please log in again.');
  }
  const session = cryptoSession;
  const normalizedEmail = email.toLowerCase().trim();
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();

  try {
    const derived = await deriveKeysFromPassword(newPassword, srpSalt, kekSalt);
    const { srpVerifier } = await computeVerifier(normalizedEmail, derived.authKeyHex, srpSalt);

    await apiChangePassword(normalizedEmail, resetCode, srpSalt, srpVerifier, kekSalt);

    const newEncryptedPrivateKey = await wrapPrivateKey(session.x25519PrivateKey, derived.dekWrapKey);
    await rotateUserKeyPair(session.x25519PublicKeyBase64, newEncryptedPrivateKey);

    cryptoSession = {
      x25519PrivateKey: session.x25519PrivateKey,
      x25519PublicKeyBase64: session.x25519PublicKeyBase64,
      dekWrapKey: derived.dekWrapKey,
      localCacheKey: derived.localCacheKey,
    };
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

// ─────────────────────────────────────────
// 忘記密碼（未登入；keypair 失效，下次登入由 lazy recovery 重建）
// ─────────────────────────────────────────

export async function zkResetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();

  try {
    const derived = await deriveKeysFromPassword(newPassword, srpSalt, kekSalt);
    const { srpVerifier } = await computeVerifier(normalizedEmail, derived.authKeyHex, srpSalt);

    await apiResetPassword(normalizedEmail, code, srpSalt, srpVerifier, kekSalt, false);

    // 舊 encryptedPrivateKey 是用舊 dekWrapKey 包的，這裡無法解；
    // 下次 zkLogin 會偵測到解不開、自動透過 /keys/rotate 寫新的一份。
    clearCryptoSession();
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}

// ─────────────────────────────────────────
// 對外：解密後端送來的 envelope
// ─────────────────────────────────────────

export async function decryptFromServer(envelope: EncryptedEnvelope): Promise<Uint8Array> {
  if (!cryptoSession) {
    throw new Error('No active crypto session. Please log in again.');
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

// ─────────────────────────────────────────
// Keypair recovery（給非 auth 流程呼叫）
// ─────────────────────────────────────────

/**
 * 確保目前 session 有可用的 X25519 keypair。
 *
 * 適用場景：存量用戶尚未呼叫 POST /auth/keys/setup，
 * 後端回 409 KEY_PAIR_REQUIRED 時，由呼叫端（例如 useFinanceStore）
 * 在 catch 裡觸發，對用戶完全透明。
 *
 * 內部委派給 obtainOrRepairKeyPair — 涵蓋「無紀錄→setup」與「解不開→rotate」兩條路徑。
 * 完成後會更新 cryptoSession 的 keypair 欄位（dekWrapKey / localCacheKey 不變）。
 */
export async function ensureKeyPairConfigured(): Promise<void> {
  if (!cryptoSession) {
    throw new Error('No active crypto session. Please log in again.');
  }
  try {
    const { x25519PrivateKey, x25519PublicKeyBase64 } = await obtainOrRepairKeyPair(cryptoSession.dekWrapKey);
    cryptoSession = { ...cryptoSession, x25519PrivateKey, x25519PublicKeyBase64 };
  } catch (error) {
    if (isCryptoOperationError(error)) {
      throw new Error(CRYPTO_OPERATION_ERROR_MESSAGE);
    }
    throw error;
  }
}
