/**
 * Zero-Knowledge Auth Flow
 *
 * 整合 keyDerivation + srpClient，提供完整的 ZK 登入/註冊流程。
 * 外部只需呼叫：
 *   - zkLogin(email, password)    → SRP 零知識登入
 *   - zkRegister(email, password) → 建立帳號 + 背景設定 SRP
 *   - clearCryptoSession()        → 登出時清除 Data Key
 *
 * Data Key 解密後存放於 module-level memory，
 * 頁面重整或登出後即消失（類似 Proton 的 session key）。
 */

import { deriveKeysFromPassword, generateSalt, sealDataKey, unsealDataKey } from './keyDerivation';
import {
  computeVerifier,
  srpFullLogin,
  setupSRP,
  generateDataKey,
  getSRPSalts,
} from './srpClient';
import { loginUser, registerUser } from '@/lib/authApi';

// ─────────────────────────────────────────
// Crypto Session（記憶體中，登出後清除）
// ─────────────────────────────────────────

interface CryptoSession {
  dataKeyHex: string; // 解密後的 Data Key（永遠不落地）
  kek: CryptoKey;     // KEK（Web Crypto，不可匯出）
}

let cryptoSession: CryptoSession | null = null;

export function getCryptoSession(): CryptoSession | null {
  return cryptoSession;
}

export function clearCryptoSession(): void {
  cryptoSession = null;
}

// ─────────────────────────────────────────
// ZK 登入（SRP 版）
// ─────────────────────────────────────────

/**
 * SRP 零知識登入：
 * 1. 取得 salt → 推導 KEK + authKeyHex（password 不傳後端）
 * 2. SRP 握手驗證（M1/M2 互相確認）
 * 3. 解密 encryptedDataKey → 存入 cryptoSession
 */
export async function zkLogin(email: string, password: string): Promise<{ user: any }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Step 1: 取得 salt — 同時確認此帳號是否已啟用 SRP
  const salts = await getSRPSalts(normalizedEmail);
  if (!salts.srpEnabled) {
    // 帳號尚未設定 SRP verifier，提早拋出讓 page.tsx fallback 至 legacy 路徑
    // 避免無謂跑 600k PBKDF2 然後必然失敗
    throw new Error('SRP not configured for this account');
  }

  const { srpSalt, kekSalt } = salts;

  // Step 2: 推導金鑰（純 client，password 不離開此函式）
  const { kek, authKeyHex } = await deriveKeysFromPassword(password, srpSalt, kekSalt);

  // Step 3: SRP 完整握手
  const { user, encryptedDataKey, kekSalt: serverKekSalt } = await srpFullLogin(
    normalizedEmail,
    authKeyHex,
  );

  // Step 4: 解密 Data Key，存入 session
  if (encryptedDataKey) {
    const dataKeyHex = await unsealDataKey(encryptedDataKey, kek);
    cryptoSession = { dataKeyHex, kek };
  }

  return { user };
}

// ─────────────────────────────────────────
// ZK 登入（舊版 fallback + 自動升級）
// ─────────────────────────────────────────

/**
 * 舊版 bcrypt 登入（帳號尚未升級 SRP 時使用）
 * 登入成功後自動在背景升級
 */
export async function zkLoginLegacy(email: string, password: string): Promise<{ user: any }> {
  const normalizedEmail = email.toLowerCase().trim();
  const response = await loginUser(normalizedEmail, password);

  // 背景升級至 SRP（不阻塞登入）
  upgradeLegacyAccountToSRP(normalizedEmail, password).catch((e) =>
    console.warn('[ZK] SRP upgrade failed (will retry next login):', e),
  );

  return { user: response.user };
}

// ─────────────────────────────────────────
// ZK 註冊
// ─────────────────────────────────────────

/**
 * 建立帳號（舊版流程），完成後背景設定 SRP + Data Key
 */
export async function zkRegister(email: string, password: string): Promise<{ user: any }> {
  const normalizedEmail = email.toLowerCase().trim();
  const response = await registerUser(normalizedEmail, password);

  // 背景設定 SRP（不阻塞 UI）
  setupSRPForNewAccount(normalizedEmail, password).catch((e) =>
    console.warn('[ZK] SRP setup after register failed:', e),
  );

  return { user: response.user };
}

// ─────────────────────────────────────────
// 內部工具
// ─────────────────────────────────────────

async function setupSRPForNewAccount(email: string, password: string): Promise<void> {
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();

  const { kek, authKeyHex } = await deriveKeysFromPassword(password, srpSalt, kekSalt);
  const { srpVerifier } = await computeVerifier(email, authKeyHex, srpSalt);

  // 請後端生成 Data Key（後端只在這一刻看到明文，不儲存）
  const { plainDataKey } = await generateDataKey();
  const encryptedDataKey = await sealDataKey(plainDataKey, kek);

  // 上傳（後端只存加密版，無法反解）
  await setupSRP({ srpSalt, srpVerifier, encryptedDataKey, kekSalt });

  // 存入 session
  cryptoSession = { dataKeyHex: plainDataKey, kek };
  console.info('[ZK] SRP setup complete');
}

async function upgradeLegacyAccountToSRP(email: string, password: string): Promise<void> {
  await setupSRPForNewAccount(email, password);
  console.info('[ZK] Legacy account upgraded to SRP');
}
