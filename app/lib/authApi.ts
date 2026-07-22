/**
 * 認證 API 服務（Web 客戶端 - HttpOnly Cookie）
 *
 * 新架構（對齊 backendserver / react-native）：
 *   - 登入由 Privy 驅動：前端用 Privy SDK 取得 access/identity token →
 *     POST /api/auth/login，後端核發自有 JWT 並以 HttpOnly Cookie 回寫（web）。
 *   - E2EE keypair（X25519，wrapped 模式）走 /api/auth/keys/{setup,rotate,me}。
 *   - Passkey（WebAuthn）走 /api/auth/passkey/*，登入後解鎖 E2EE 資料層。
 *
 * 已移除：SRP 登入 / 註冊 / 密碼重設（後端已不再提供對應 endpoint）。
 */

import { requestJson } from './httpClient';
import { ApiError } from './errorHandler';

export interface BackendUser {
  id: string;
  email: string;
}

export interface BackendUserProfile extends BackendUser {
  displayName: string;
  avatarUrl: string;
  membershipLabel: string;
  walletAddress?: string;
  hasName?: boolean;
  referCode?: string;
  referredByCode?: string;
  referralCount?: number;
  cashbackBalance?: number;
}

export interface PrivyLoginResult {
  user: BackendUserProfile;
  needsKeyPairSetup: boolean;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, options, 'AuthAPI');
}

// ─────────────────────────────────────────
// base64 / hex 驗證工具
// ─────────────────────────────────────────

function assertHex(value: string, fieldName: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[a-f0-9]+$/.test(normalized) || normalized.length % 2 !== 0) {
    throw new Error(`${fieldName} must be an even-length hex string.`);
  }
  return normalized;
}

function assertBase64(value: string, fieldName: string, opts: { expectedBytes?: number } = {}): string {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error(`${fieldName} must be a valid base64 string.`);
  }
  if (opts.expectedBytes !== undefined) {
    let decodedLen: number;
    try {
      decodedLen = atob(normalized).length;
    } catch {
      throw new Error(`${fieldName} is not a valid base64 string.`);
    }
    if (decodedLen !== opts.expectedBytes) {
      throw new Error(`${fieldName} must decode to exactly ${opts.expectedBytes} bytes (got ${decodedLen}).`);
    }
  }
  return normalized;
}

// 對齊後端 keyPairBodySchema
const X25519_PUBLIC_KEY_BYTES = 32;
const ENCRYPTED_PRIVATE_KEY_MIN_B64 = 16;
const ENCRYPTED_PRIVATE_KEY_MAX_B64 = 2048;

function normalizeKeyPairPayload(
  publicKey: string,
  encryptedPrivateKey: string,
  kekSalt?: string,
): { publicKey: string; encryptedPrivateKey: string; kekSalt?: string } {
  const pk = assertBase64(publicKey, 'publicKey', { expectedBytes: X25519_PUBLIC_KEY_BYTES });
  const ek = encryptedPrivateKey.trim();
  if (ek.length < ENCRYPTED_PRIVATE_KEY_MIN_B64 || ek.length > ENCRYPTED_PRIVATE_KEY_MAX_B64) {
    throw new Error(
      `encryptedPrivateKey must be ${ENCRYPTED_PRIVATE_KEY_MIN_B64}-${ENCRYPTED_PRIVATE_KEY_MAX_B64} base64 chars.`,
    );
  }
  return {
    publicKey: pk,
    encryptedPrivateKey: assertBase64(ek, 'encryptedPrivateKey'),
    ...(kekSalt ? { kekSalt: assertHex(kekSalt, 'kekSalt') } : {}),
  };
}

// ─────────────────────────────────────────
// Privy 登入
// ─────────────────────────────────────────

/**
 * 用 Privy token 換取 Kura session（web：cookie；不在 body 回傳 token）。
 */
export const loginWithPrivy = (payload: {
  accessToken: string;
  identityToken?: string | null;
  referralCode?: string;
}): Promise<PrivyLoginResult> => {
  return apiRequest<PrivyLoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      accessToken: payload.accessToken,
      identityToken: payload.identityToken ?? null,
      ...(payload.referralCode ? { referralCode: payload.referralCode } : {}),
    }),
  });
};

// ─────────────────────────────────────────
// Session / Profile
// ─────────────────────────────────────────

export const logoutUser = (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST' });
};

export const deleteCurrentUserAccount = (): Promise<{ success: boolean; message: string }> => {
  return apiRequest<{ success: boolean; message: string }>('/api/auth/me', { method: 'DELETE' });
};

export const fetchCurrentUserProfile = (): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', { method: 'GET' });
};

export const updateCurrentUserProfile = (payload: {
  displayName?: string;
  avatarUrl?: string;
}): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const applyReferralCode = (referralCode: string): Promise<{ message: string; user: BackendUserProfile }> => {
  return apiRequest<{ message: string; user: BackendUserProfile }>('/api/auth/me/referral-code', {
    method: 'POST',
    body: JSON.stringify({ referralCode: referralCode.trim().toUpperCase() }),
  });
};

// ─────────────────────────────────────────
// X25519 keypair（wrapped 模式）
// ─────────────────────────────────────────

export interface UserKeyPairRecord {
  publicKey: string;
  encryptedPrivateKey: string;
  kekSalt?: string;
  algorithm: string;
  createdAt: string;
}

export class UserKeyPairNotFoundError extends Error {
  constructor() {
    super('User keypair record does not exist.');
    this.name = 'UserKeyPairNotFoundError';
  }
}

/**
 * 取得目前登入用戶的 keypair record。404（尚未 setup）→ UserKeyPairNotFoundError。
 */
export const getUserKeyPair = async (): Promise<UserKeyPairRecord> => {
  try {
    return await apiRequest<UserKeyPairRecord>('/api/auth/keys/me', { method: 'GET' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new UserKeyPairNotFoundError();
    }
    throw error;
  }
};

export const setupUserKeyPair = (
  publicKey: string,
  encryptedPrivateKey: string,
  kekSalt?: string,
): Promise<UserKeyPairRecord> => {
  const payload = normalizeKeyPairPayload(publicKey, encryptedPrivateKey, kekSalt);
  return apiRequest<UserKeyPairRecord>('/api/auth/keys/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const rotateUserKeyPair = (
  publicKey: string,
  encryptedPrivateKey: string,
  kekSalt?: string,
): Promise<UserKeyPairRecord> => {
  const payload = normalizeKeyPairPayload(publicKey, encryptedPrivateKey, kekSalt);
  return apiRequest<UserKeyPairRecord>('/api/auth/keys/rotate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─────────────────────────────────────────
// Passkey / WebAuthn（原始 HTTP；orchestration 在 crypto/passkey.ts）
// ─────────────────────────────────────────

export const getPasskeyStatus = (): Promise<{ registered: boolean }> => {
  return apiRequest<{ registered: boolean }>('/api/auth/passkey/status', { method: 'GET' });
};

export const getPasskeyRegisterChallenge = (): Promise<unknown> => {
  return apiRequest<unknown>('/api/auth/passkey/register-challenge', { method: 'GET' });
};

export const postPasskeyRegister = (body: { response: unknown; encryptedDek: string }): Promise<{ verified: boolean }> => {
  return apiRequest<{ verified: boolean }>('/api/auth/passkey/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getPasskeyAuthenticateChallenge = (): Promise<unknown> => {
  return apiRequest<unknown>('/api/auth/passkey/authenticate-challenge', { method: 'GET' });
};

export const postPasskeyAuthenticate = (body: { response: unknown }): Promise<{ encryptedDek: string }> => {
  return apiRequest<{ encryptedDek: string }>('/api/auth/passkey/authenticate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
