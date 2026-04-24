/**
 * 認證 API 服務
 * Web 客戶端 - 使用 HttpOnly Cookie
 * 根據認證系統指南實作
 */

import { requestJson } from './httpClient';

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

/**
 * Web 客戶端 API 請求
 * 自動包含 X-Client-Type: web 與 credentials: 'include'
 * Token 透過 HttpOnly Cookie 自動送出
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(path, options, 'AuthAPI');
}

/**
 * 使用者登出
 * Web 客戶端：清除 HttpOnly Cookie
 */
export const logoutUser = (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
};

/**
 * 取得目前使用者資料
 * Cookie 會自動送出，無需手動傳遞 token
 */
export const fetchCurrentUserProfile = (): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', {
    method: 'GET',
  });
};

/**
 * 更新目前使用者資料
 * Cookie 會自動送出，無需手動傳遞 token
 */
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

/**
 * 變更密碼 (SRP)
 */
export const changePassword = (
  srpSalt: string,
  srpVerifier: string,
  encryptedDataKey: string,
  kekSalt: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    '/api/auth/change-password',
    {
      method: 'POST',
      body: JSON.stringify({ srpSalt, srpVerifier, encryptedDataKey, kekSalt }),
    }
  );
};

/**
 * 忘記密碼 - 發送重設碼
 */
export const requestPasswordReset = (email: string): Promise<{ message: string; expiresIn?: number }> => {
  const normalizedEmail = email.toLowerCase().trim();

  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/password-reset/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 忘記密碼 - 驗證重設碼並重設 SRP
 */
export const resetPassword = (
  email: string,
  resetCode: string,
  srpSalt: string,
  srpVerifier: string,
  encryptedDataKey: string,
  kekSalt: string
): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      resetCode: resetCode.trim(),
      srpSalt: srpSalt.toLowerCase(),
      srpVerifier: srpVerifier.toLowerCase(),
      encryptedDataKey,
      kekSalt: kekSalt.toLowerCase(),
    }),
  });
};

/**
 * 使用者註冊 - 第一步：請求註冊驗證碼
 */
export const requestRegistrationCode = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/register/request-token', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 使用者註冊 - 第二步：驗證註冊
 */
export const verifyRegistration = (
  email: string,
  verificationCode: string,
  srpSalt: string,
  srpVerifier: string,
  encryptedDataKey: string,
  kekSalt: string,
): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<AuthResponse>('/api/auth/register/confirm', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      verificationCode,
      srpSalt,
      srpVerifier,
      encryptedDataKey,
      kekSalt,
    }),
  });
};
