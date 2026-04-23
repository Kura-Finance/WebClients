/**
 * Authentication API Service
 * Web 客户端 - 使用 HttpOnly Cookie
 * 根据认证系统指南实现
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
 * Web 客户端 API 请求
 * 自动包含 X-Client-Type: web 和 credentials: 'include'
 * Token 通过 HttpOnly Cookie 自动发送
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(path, options, 'AuthAPI');
}

/**
 * 用户登出
 * Web 客户端: 清除 HttpOnly Cookie
 */
export const logoutUser = (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
};

/**
 * 获取当前用户资料
 * Cookie 会自动发送，无需手动传递 token
 */
export const fetchCurrentUserProfile = (): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', {
    method: 'GET',
  });
};

/**
 * 更新当前用户资料
 * Cookie 会自动发送，无需手动传递 token
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
 * 改变密码 (SRP)
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
 * 忘记密码 - 发送重置码
 */
export const requestPasswordReset = (email: string): Promise<{ message: string; expiresIn?: number }> => {
  const normalizedEmail = email.toLowerCase().trim();

  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/password-reset/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 忘记密码 - 验证重置码并重设 SRP (SRP)
 */
export const resetPassword = (
  email: string,
  resetCode: string,
  srpSalt: string,
  srpVerifier: string,
  encryptedDataKey: string,
  kekSalt: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify({ email, resetCode, srpSalt, srpVerifier, encryptedDataKey, kekSalt }),
  });
};

/**
 * 用户注册 - 第一步：请求注册令牌
 */
export const requestRegistrationCode = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/register/request-token', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 用户注册 - 第二步：确认注册
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
