/**
 * Authentication API Service
 * 对齐 kura-app 实现
 */

import { handleFetchError, handleResponseError, logResponse, logSuccess, extractErrorMessage } from './errorHandler';

// Default backend URL - will use environment variable or fallback to localhost
const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://kura-backend-642134687769.us-central1.run.app'
    : 'https://localhost:8080';
const AUTH_TOKEN_KEY = 'kura.auth.token';

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
  token: string;
  user: BackendUserProfile;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

export const getBackendBaseUrl = (): string => {
  // Use environment variable if available, otherwise use default
  return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
};

export const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearStoredAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    console.log('[AuthAPI] Fetching:', {
      method: options.method || 'GET',
      url,
      hasAuth: !!token,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    logResponse(response.status, response.statusText, response.headers.get('content-type'), url, 'AuthAPI');

    const raw = await response.text();
    let json: (ApiErrorBody & T) | null = null;
    if (raw) {
      try {
        json = JSON.parse(raw) as ApiErrorBody & T;
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      const { error, message } = extractErrorMessage(json);
      const errorMsg = error || message || `Request failed with status ${response.status}`;
      const { error: apiError } = handleResponseError(response.status, errorMsg, url, 'AuthAPI');
      throw apiError;
    }

    logSuccess(json, url, 'AuthAPI');
    return (json as T) ?? ({} as T);
  } catch (error) {
    // 如果已经是 ApiError，直接抛出
    if (error instanceof AuthApiError) {
      throw error;
    }
    
    const { error: apiError } = handleFetchError(error, url, 'AuthAPI');
    throw apiError;
  }
}

/**
 * 用户注册
 */
export const registerUser = (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
};

/**
 * 用户登录
 */
export const loginUser = (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
};

/**
 * 获取当前用户资料
 */
export const fetchCurrentUserProfile = (token: string): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me', { method: 'GET' }, token);
};

/**
 * 更新当前用户资料
 */
export const updateCurrentUserProfile = (
  token: string,
  payload: { displayName?: string; avatarUrl?: string }
): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>(
    '/api/auth/me',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token
  );
};

/**
 * 改变密码
 */
export const changePassword = (
  token: string,
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    '/api/auth/change-password',
    {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    },
    token
  );
};

/**
 * 忘记密码 - 请求重置
 */
export const requestPasswordReset = (email: string): Promise<{ message: string; resetToken?: string }> => {
  // Normalize email: lowercase and trim
  const normalizedEmail = email.toLowerCase().trim();

  return apiRequest<{ message: string; resetToken?: string }>('/api/auth/request-reset', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 忘记密码 - 重置密码
 */
export const resetPassword = (
  resetToken: string,
  newPassword: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword }),
  });
};

/**
 * 用户注册 - 第一步：请求注册令牌
 */
export const requestRegisterToken = (email: string): Promise<{ message: string; registerToken?: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string; registerToken?: string }>('/api/auth/register/request-token', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 用户注册 - 第二步：确认注册
 */
export const confirmRegister = (
  email: string,
  password: string,
  registerToken: string
): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<AuthResponse>('/api/auth/register/confirm', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, password, registerToken }),
  });
};
