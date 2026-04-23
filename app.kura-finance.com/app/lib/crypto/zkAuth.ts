/**
 * Zero-Knowledge Auth Flow
 *
 * 整合 keyDerivation + srpClient，提供完整的 ZK 登入/註冊流程。
 * 外部只需呼叫：
 *   - zkLogin(email, password)    → SRP 零知識登入
 *   - zkConfirmRegister(...)      → 驗證碼註冊 + SRP 初始化
 *   - clearCryptoSession()        → 登出時清除 Data Key
 *
 * Data Key 解密後存放於 module-level memory，
 * 頁面重整或登出後即消失（類似 Proton 的 session key）。
 */

import { deriveKeysFromPassword, generateSalt, sealDataKey, unsealDataKey } from './keyDerivation';
import {
  computeVerifier,
  srpFullLogin,
  generateDataKey,
  getSRPSalts,
} from './srpClient';
import {
  confirmRegister as apiConfirmRegister,
  resetPassword as apiResetPassword,
  changePassword as apiChangePassword,
} from '@/lib/authApi';
import type { BackendUserProfile } from '@/lib/authApi';

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
export async function zkLogin(email: string, password: string): Promise<{ user: BackendUserProfile }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Step 1: 取得 salt — 同時確認此帳號是否已啟用 SRP
  const salts = await getSRPSalts(normalizedEmail);
  if (!salts.srpEnabled) {
    throw new Error('Your account requires a security upgrade. Please reset your password to continue.');
  }

  const { srpSalt, kekSalt } = salts;

  // Step 2: 推導金鑰（純 client，password 不離開此函式）
  const { kek, authKeyHex } = await deriveKeysFromPassword(password, srpSalt, kekSalt);

  // Step 3: SRP 完整握手
  const { user, encryptedDataKey } = await srpFullLogin(
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
// 註冊確認（驗證碼 + SRP）
// ─────────────────────────────────────────

export async function zkConfirmRegister(
  email: string,
  password: string,
  verificationCode: string,
): Promise<{ user: BackendUserProfile }> {
  const normalizedEmail = email.toLowerCase().trim();
  const { srpSalt, srpVerifier, encryptedDataKey, kekSalt, plainDataKey, kek } =
    await buildSRPSetupPayload(normalizedEmail, password);
  const response = await apiConfirmRegister(
    normalizedEmail,
    verificationCode,
    srpSalt,
    srpVerifier,
    encryptedDataKey,
    kekSalt,
  );

  cryptoSession = { dataKeyHex: plainDataKey, kek };
  return { user: response.user };
}

// ─────────────────────────────────────────
// ZK 密碼重設與變更
// ─────────────────────────────────────────

/**
 * ZK 忘記密碼 (Password Reset)：
 * 用戶輸入 email、驗證碼與新密碼。
 * 因為沒有舊密碼，無法解開舊的 Data Key。
 * 必須生成全新的 SRP Verifier 與全新的 Data Key。舊的加密資料將遺失。
 */
export async function zkResetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();

  // 1. 推導新金鑰
  const { kek, authKeyHex } = await deriveKeysFromPassword(newPassword, srpSalt, kekSalt);
  const { srpVerifier } = await computeVerifier(normalizedEmail, authKeyHex, srpSalt);

  // 2. 生成全新 Data Key 並加密（完全在 client 端生成，無需認證、後端永遠看不到明文）
  const plainDataKey = generateSalt();
  const encryptedDataKey = await sealDataKey(plainDataKey, kek);

  // 3. 上傳給後端
  await apiResetPassword(normalizedEmail, code, srpSalt, srpVerifier, encryptedDataKey, kekSalt);

  // 4. 重設密碼後，需要讓用戶重新手動登入以建立 session
  clearCryptoSession();
}

/**
 * ZK 更改密碼 (Change Password)：
 * 用戶已登入，輸入新密碼。
 * 因為目前已登入，所以 cryptoSession 中有明文的 Data Key。
 * 重新推導新 KEK，並將現有 Data Key 重新加密上傳，不遺失資料。
 */
export async function zkChangePassword(email: string, newPassword: string): Promise<void> {
  if (!cryptoSession) {
    throw new Error('No active crypto session. Please log in again.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();

  // 1. 推導新金鑰
  const { kek, authKeyHex } = await deriveKeysFromPassword(newPassword, srpSalt, kekSalt);
  const { srpVerifier } = await computeVerifier(normalizedEmail, authKeyHex, srpSalt);

  // 2. 用新的 KEK 重新加密現有的明文 Data Key
  const encryptedDataKey = await sealDataKey(cryptoSession.dataKeyHex, kek);

  // 3. 上傳給後端
  await apiChangePassword(srpSalt, srpVerifier, encryptedDataKey, kekSalt);

  // 4. 更新記憶體中的 session KEK
  cryptoSession.kek = kek;
}

// ─────────────────────────────────────────
// 內部工具
// ─────────────────────────────────────────

async function buildSRPSetupPayload(email: string, password: string): Promise<{
  srpSalt: string;
  srpVerifier: string;
  encryptedDataKey: string;
  kekSalt: string;
  plainDataKey: string;
  kek: CryptoKey;
}> {
  const srpSalt = generateSalt();
  const kekSalt = generateSalt();
  const { kek, authKeyHex } = await deriveKeysFromPassword(password, srpSalt, kekSalt);
  const { srpVerifier } = await computeVerifier(email, authKeyHex, srpSalt);
  const { plainDataKey } = await generateDataKey();
  const encryptedDataKey = await sealDataKey(plainDataKey, kek);

  return { srpSalt, srpVerifier, encryptedDataKey, kekSalt, plainDataKey, kek };
}


