/**
 * 認證 API 服務
 * Web 客戶端 - 使用 HttpOnly Cookie
 *
 * SRP 與 keypair 是兩條獨立路徑：
 *   - /auth/register/verify、/auth/password-reset/verify：只處理 SRP
 *     （srpSalt / srpVerifier / kekSalt），不接 publicKey / encryptedPrivateKey。
 *   - /auth/keys/{setup,rotate,me}：處理 X25519 keypair（wrapped 模式）。
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
}

export interface AuthResponse {
  user: BackendUserProfile;
}

type GenericAuthResult = Record<string, unknown>;

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function assertHex(value: string, fieldName: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[a-f0-9]+$/.test(normalized) || normalized.length % 2 !== 0) {
    throw new Error(`${fieldName} must be an even-length hex string.`);
  }
  return normalized;
}

/**
 * 驗證標準 base64（含 padding）。
 * - expectedBytes 指定時，會核對解碼後 bytes 長度。
 * - minBytes / maxBytes 指定時，會檢查解碼後落在合理區間（給 encryptedPrivateKey 用）。
 */
function assertBase64(
  value: string,
  fieldName: string,
  opts: { expectedBytes?: number; minBytes?: number; maxBytes?: number } = {},
): string {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error(`${fieldName} must be a valid base64 string.`);
  }
  let decodedLen: number;
  try {
    decodedLen = atob(normalized).length;
  } catch {
    throw new Error(`${fieldName} is not a valid base64 string.`);
  }
  if (opts.expectedBytes !== undefined && decodedLen !== opts.expectedBytes) {
    throw new Error(`${fieldName} must decode to exactly ${opts.expectedBytes} bytes (got ${decodedLen}).`);
  }
  if (opts.minBytes !== undefined && decodedLen < opts.minBytes) {
    throw new Error(`${fieldName} must decode to at least ${opts.minBytes} bytes (got ${decodedLen}).`);
  }
  if (opts.maxBytes !== undefined && decodedLen > opts.maxBytes) {
    throw new Error(`${fieldName} must decode to at most ${opts.maxBytes} bytes (got ${decodedLen}).`);
  }
  return normalized;
}

// X25519 公鑰固定 32 bytes（base64 44 chars 含 padding）
const X25519_PUBLIC_KEY_BYTES = 32;
// 對齊後端 zod schema：encryptedPrivateKey base64 ≥16 chars / ≤2048 chars
const ENCRYPTED_PRIVATE_KEY_MIN_B64 = 16;
const ENCRYPTED_PRIVATE_KEY_MAX_B64 = 2048;

function normalizeSrpPayload(
  srpSalt: string,
  srpVerifier: string,
  kekSalt: string,
): { srpSalt: string; srpVerifier: string; kekSalt: string } {
  return {
    srpSalt: assertHex(srpSalt, 'srpSalt'),
    srpVerifier: assertHex(srpVerifier, 'srpVerifier'),
    kekSalt: assertHex(kekSalt, 'kekSalt'),
  };
}

function normalizeKeyPairPayload(
  publicKey: string,
  encryptedPrivateKey: string,
): { publicKey: string; encryptedPrivateKey: string } {
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
  };
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(path, options, 'AuthAPI');
}

// ─────────────────────────────────────────
// Session / Profile
// ─────────────────────────────────────────

export const logoutUser = (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
};

export const deleteCurrentUserAccount = (): Promise<{ success: boolean; message: string }> => {
  return apiRequest<{ success: boolean; message: string }>('/api/auth/me', {
    method: 'DELETE',
  });
};

export const fetchCurrentUserProfile = (): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', {
    method: 'GET',
  });
};

export const updateCurrentUserProfile = (
  payload: { displayName?: string; avatarUrl?: string }
): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>(
    '/api/auth/me',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
};

// ─────────────────────────────────────────
// 密碼變更 / 重設（SRP 部分；keypair 部分走 /auth/keys/*）
// ─────────────────────────────────────────

/**
 * 已登入用戶變更密碼（SRP rotate）。
 * 後端只更新 SRP verifier / salts，不動 keypair；keypair 由前端另呼叫 /auth/keys/rotate。
 */
export const changePassword = (
  email: string,
  resetCode: string,
  srpSalt: string,
  srpVerifier: string,
  kekSalt: string,
): Promise<GenericAuthResult> => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedResetCode = resetCode.trim();
  if (!/^\d{6}$/.test(normalizedResetCode)) {
    throw new Error('resetCode must be a 6-digit numeric string.');
  }
  const normalizedPayload = normalizeSrpPayload(srpSalt, srpVerifier, kekSalt);
  return apiRequest<GenericAuthResult>(
    '/api/auth/password-reset/verify',
    {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        resetCode: normalizedResetCode,
        preserveData: true,
        ...normalizedPayload,
      }),
    }
  );
};

export const requestPasswordReset = (email: string): Promise<{ message: string; expiresIn?: number }> => {
  const normalizedEmail = normalizeEmail(email);

  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/password-reset/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 忘記密碼 - 驗證重設碼並重設 SRP。
 * 由於無法解開舊 encryptedPrivateKey，舊 keypair 視為失效；新 keypair 由下次登入時透過
 * lazy recovery 機制走 /auth/keys/rotate 重建。
 */
export const resetPassword = (
  email: string,
  resetCode: string,
  srpSalt: string,
  srpVerifier: string,
  kekSalt: string,
  preserveData?: boolean,
): Promise<GenericAuthResult> => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedResetCode = resetCode.trim();
  if (!/^\d{6}$/.test(normalizedResetCode)) {
    throw new Error('resetCode must be a 6-digit numeric string.');
  }
  const normalizedPayload = normalizeSrpPayload(srpSalt, srpVerifier, kekSalt);
  return apiRequest<GenericAuthResult>('/api/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      resetCode: normalizedResetCode,
      ...(preserveData !== undefined ? { preserveData } : {}),
      ...normalizedPayload,
    }),
  });
};

// ─────────────────────────────────────────
// 註冊
// ─────────────────────────────────────────

export const requestRegistrationCode = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = normalizeEmail(email);
  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/register/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 使用者註冊 - 第二步：驗證註冊（只送 SRP；keypair 在註冊成功後走 /auth/keys/setup）。
 */
export const verifyRegistration = (
  email: string,
  verificationCode: string,
  srpSalt: string,
  srpVerifier: string,
  kekSalt: string,
): Promise<AuthResponse> => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPayload = normalizeSrpPayload(srpSalt, srpVerifier, kekSalt);
  return apiRequest<AuthResponse>('/api/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      verificationCode,
      ...normalizedPayload,
    }),
  });
};

// ─────────────────────────────────────────
// X25519 keypair（wrapped 模式）
// 對齊後端 keyPairBodySchema：publicKey base64(32B)、encryptedPrivateKey base64 16–2048 chars
// ─────────────────────────────────────────

export interface UserKeyPairRecord {
  publicKey: string;
  encryptedPrivateKey: string;
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
 * 取得目前登入用戶的 keypair record。
 * 後端若回 404（尚未 setup）則 throw UserKeyPairNotFoundError，呼叫端用來判斷
 * 是要走 setup 還是 rotate。
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

/** 首次上傳 keypair（未曾 setup 過時呼叫）。 */
export const setupUserKeyPair = (
  publicKey: string,
  encryptedPrivateKey: string,
): Promise<UserKeyPairRecord> => {
  const payload = normalizeKeyPairPayload(publicKey, encryptedPrivateKey);
  return apiRequest<UserKeyPairRecord>('/api/auth/keys/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/** 輪替 keypair（已存在時呼叫；換密碼或 lazy recovery 走這裡）。 */
export const rotateUserKeyPair = (
  publicKey: string,
  encryptedPrivateKey: string,
): Promise<UserKeyPairRecord> => {
  const payload = normalizeKeyPairPayload(publicKey, encryptedPrivateKey);
  return apiRequest<UserKeyPairRecord>('/api/auth/keys/rotate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
