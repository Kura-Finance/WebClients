/**
 * Authentication API Service
 * 参考自 kura-web 的 backendApi.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Logger from '../utils/Logger';

// In-memory fallback for when AsyncStorage is unavailable
let memoryStorage: Record<string, string> = {};

// Default backend URL - production environment
const DEFAULT_BACKEND_URL = 'https://kura-backend-642134687769.us-central1.run.app';
const AUTH_TOKEN_KEY = 'kura.auth.token';
const IS_DEV = __DEV__;

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
  // Priority:
  // 1. Explicit config from app.config.js
  // 2. Environment variable EXPO_PUBLIC_BACKEND_URL
  // 3. Environment variable EXPO_PUBLIC_BACKEND_URL_DEV (for development fallback)
  // 4. Default

  let url =
    Constants.expoConfig?.extra?.backendUrl ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL;

  // In development, if using HTTPS with self-signed cert, try to use HTTP fallback
  if (IS_DEV && url.startsWith('https://')) {
    const devHttpUrl = process.env.EXPO_PUBLIC_BACKEND_URL_DEV;
    if (devHttpUrl) {
      Logger.warn('AuthAPI', 'Using dev HTTP URL for self-signed certificate', {
        production: url,
        development: devHttpUrl,
      });
      return devHttpUrl;
    }
    // Log the HTTPS URL being used - it will fail if cert is self-signed
    Logger.debug('AuthAPI', 'Using HTTPS URL (may fail with self-signed certs)', {
      url,
      tip: 'Set EXPO_PUBLIC_BACKEND_URL_DEV=http://localhost:8080 to use HTTP in development',
    });
  }

  return url;
};

export const getStoredAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.warn('AsyncStorage unavailable, using in-memory fallback:', error);
    return memoryStorage[AUTH_TOKEN_KEY] || null;
  }
};

export const setStoredAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.warn('AsyncStorage unavailable, using in-memory fallback:', error);
    memoryStorage[AUTH_TOKEN_KEY] = token;
  }
};

export const clearStoredAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.warn('AsyncStorage unavailable, using in-memory fallback:', error);
    delete memoryStorage[AUTH_TOKEN_KEY];
  }
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
      const message = json?.error || json?.message || `Request failed with status ${response.status}`;
      console.error('[AuthAPI] Response error:', { status: response.status, message });
      throw new AuthApiError(message, response.status);
    }

    console.log('[AuthAPI] Request successful', { response: json });
    return (json as T) ?? ({} as T);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AuthAPI] Request failed:', {
      url,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
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
export const requestRegisterToken = (email: string): Promise<{ message: string; expiresIn?: number }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/register/request-token', {
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
  verificationCode: string
): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate all required fields
  if (!normalizedEmail || !password || !verificationCode) {
    const missing = [
      !normalizedEmail && 'email',
      !password && 'password',
      !verificationCode && 'verificationCode',
    ].filter(Boolean);
    
    const error = `Missing required fields: ${missing.join(', ')}`;
    Logger.error('AuthAPI', error);
    throw new AuthApiError(error, 400);
  }
  
  const payload = { email: normalizedEmail, password, code: verificationCode };
  Logger.debug('AuthAPI', 'confirmRegister request body', { email: normalizedEmail, password: '***', code: verificationCode });
  
  return apiRequest<AuthResponse>('/api/auth/register/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * 删除用户账户
 */
export const deleteAccount = (
  authToken: string,
  password: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/me', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
};
