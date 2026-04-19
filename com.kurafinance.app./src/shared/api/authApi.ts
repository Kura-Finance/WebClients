/**
 * Authentication API Service
 * 参考自 kura-web 的 backendApi.ts
 * 
 * Mobile Authentication:
 * - Uses JWT tokens stored in Secure Storage (iOS Keychain / Android Secure Enclave)
 * - Tokens are sent via Authorization header on each request
 * - All requests include X-Client-Type: mobile header
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Logger from '../utils/Logger';
import {
  setSecureAuthToken,
  getSecureAuthToken,
  clearSecureAuthToken,
} from '../utils/secureTokenStorage';

// In-memory fallback for when storage is unavailable
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
  // 1. Explicit config from app.config.js (EXPO_PUBLIC_BACKEND_URL)
  // 2. Environment variable EXPO_PUBLIC_BACKEND_URL
  // 3. Default

  const url =
    Constants.expoConfig?.extra?.backendUrl ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL;

  Logger.debug('AuthAPI', 'Backend URL configured', {
    url,
    environment: IS_DEV ? 'development' : 'production',
    source: Constants.expoConfig?.extra?.backendUrl ? 'app.config.js' : 'environment variable',
  });

  return url;
};

export const getStoredAuthToken = async (): Promise<string | null> => {
  try {
    // Priority 1: Try Secure Storage (Keychain/Secure Enclave)
    const secureToken = await getSecureAuthToken();
    if (secureToken) {
      Logger.debug('AuthAPI', '✅ Auth token retrieved from Secure Storage (primary)', {
        tokenLength: secureToken.length,
      });
      return secureToken;
    }

    // Priority 2: Fallback to AsyncStorage for backward compatibility
    try {
      const asyncToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (asyncToken) {
        Logger.debug('AuthAPI', '⚠️ Auth token retrieved from AsyncStorage (fallback)', {
          tokenLength: asyncToken.length,
          recommendation: 'Token should be migrated to Secure Storage',
        });
        // Try to migrate to Secure Storage for future use
        try {
          await setSecureAuthToken(asyncToken);
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          Logger.info('AuthAPI', '✅ Token successfully migrated to Secure Storage');
        } catch (migrationError) {
          Logger.warn('AuthAPI', '⚠️ Could not migrate token to Secure Storage', migrationError);
        }
        return asyncToken;
      }
    } catch (asyncError) {
      Logger.debug('AuthAPI', 'AsyncStorage fallback failed', asyncError);
    }

    Logger.debug('AuthAPI', '⚪ No auth token found in any storage');
    
    // Priority 3: In-memory fallback
    const fallbackToken = memoryStorage[AUTH_TOKEN_KEY] || null;
    if (fallbackToken) {
      Logger.warn('AuthAPI', '⚠️ Using in-memory auth token (will be lost on app restart)', {
        tokenLength: fallbackToken.length,
      });
    }
    return fallbackToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('AuthAPI', '❌ CRITICAL: Failed to retrieve auth token from any storage', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
      suggestion: 'Check device storage permissions and Secure Store availability',
    });
    
    // Last resort: return in-memory token if available
    return memoryStorage[AUTH_TOKEN_KEY] || null;
  }
};

export const setStoredAuthToken = async (token: string): Promise<void> => {
  try {
    // Validate token before saving
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    // Priority 1: Try to save to Secure Storage (Keychain/Secure Enclave)
    let savedToSecureStore = false;
    try {
      await setSecureAuthToken(token);
      Logger.info('AuthAPI', '✅ Auth token saved to Secure Storage successfully', {
        tokenLength: token.length,
      });
      savedToSecureStore = true;
    } catch (secureError) {
      Logger.warn('AuthAPI', '⚠️ Failed to save to Secure Storage, trying AsyncStorage', {
        error: secureError instanceof Error ? secureError.message : String(secureError),
      });
    }

    // Priority 2: Fallback to AsyncStorage if Secure Storage fails
    if (!savedToSecureStore) {
      try {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        Logger.info('AuthAPI', '⚠️ Auth token saved to AsyncStorage (fallback)', {
          tokenLength: token.length,
          recommendation: 'Consider enabling Secure Storage on device',
        });
      } catch (asyncError) {
        Logger.warn('AuthAPI', '⚠️ AsyncStorage also failed, using in-memory storage', {
          error: asyncError instanceof Error ? asyncError.message : String(asyncError),
        });
      }
    }

    // Always keep in-memory backup
    memoryStorage[AUTH_TOKEN_KEY] = token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('AuthAPI', '❌ CRITICAL: Failed to save auth token', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
      suggestion: 'Check device storage permissions',
    });
    throw new Error('Failed to persist authentication token');
  }
};

export const clearStoredAuthToken = async (): Promise<void> => {
  try {
    // Clear from Secure Storage
    try {
      await clearSecureAuthToken();
      Logger.info('AuthAPI', '✅ Auth token cleared from Secure Storage');
    } catch (secureError) {
      Logger.debug('AuthAPI', 'Secure Storage clear failed or token not present', secureError);
    }

    // Also clear from AsyncStorage for backward compatibility
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      Logger.info('AuthAPI', '✅ Auth token cleared from AsyncStorage');
    } catch (asyncError) {
      Logger.debug('AuthAPI', 'AsyncStorage removeItem failed', asyncError);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.warn('AuthAPI', '⚠️ Error during token clear operation', {
      error: errorMessage,
    });
  } finally {
    // Always clear in-memory storage
    delete memoryStorage[AUTH_TOKEN_KEY];
    Logger.debug('AuthAPI', 'In-memory auth token cleared');
  }
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
  timeoutMs: number = 30000 // 30 second timeout
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${path}`;
  
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  // Add client type header for mobile authentication (JWT-based)
  headers.set('X-Client-Type', 'mobile');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  Logger.debug('AuthAPI', 'Fetching', {
    method: options.method || 'GET',
    url,
    hasAuth: !!token,
    hasBody: !!options.body,
    bodyPreview: options.body ? String(options.body).substring(0, 100) : undefined,
    contentType: headers.get('Content-Type'),
    headerCount: Array.from(headers.entries()).length,
    timeoutMs,
  });

  // Create abort controller for timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      signal: abortController.signal,
    });
    clearTimeout(timeoutId);

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
      Logger.error('AuthAPI', 'Response error', { status: response.status, message });
      throw new AuthApiError(message, response.status);
    }

    Logger.info('AuthAPI', 'Request successful', { response: json });
    return (json as T) ?? ({} as T);
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // More detailed error diagnostics
    let errorDetails: any = {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
      error: errorMessage,
      stack: errorStack,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };
    
    // Handle AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      errorDetails.timeoutError = true;
      errorDetails.timeoutMs = timeoutMs;
      errorDetails.suggestion = `Request timed out after ${timeoutMs}ms. Network may be slow or backend unresponsive.`;
    }
    
    // Add network-specific error info
    if (error instanceof TypeError) {
      errorDetails.networkError = true;
      errorDetails.suggestion = 'Check if backend URL is reachable, SSL cert is valid, or network connection exists';
    }
    
    Logger.error('AuthAPI', 'Request failed', errorDetails);
    throw error;
  }
}

/**
 * 用户注册 - 第一步：发送验证码到邮箱
 */
export const sendVerificationCode = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/register/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 用户注册 - 第二步：验证码 + 密码完成注册
 */
export const verifyEmailAndRegister = (
  email: string,
  password: string,
  verificationCode: string
): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<AuthResponse>('/api/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, password, verificationCode }),
  });
};

/**
 * 用户注册 - 重新发送验证码
 */
export const resendVerificationCode = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/register/resend-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
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
 * 用户登出
 */
export const logoutUser = (token: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    '/api/auth/logout',
    { method: 'POST' },
    token
  );
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
  payload: { displayName?: string; avatarUrl?: string; email?: string }
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
 * 更新用戶頭像
 */
export const updateAvatar = (
  token: string,
  avatarUrl: string
): Promise<{ user: BackendUserProfile }> => {
  Logger.info('authApi.updateAvatar', 'Validate avatarUrl input', { 
    hasToken: !!token,
    urlType: typeof avatarUrl,
    urlLength: avatarUrl?.length || 0,
    urlPrefix: avatarUrl?.substring(0, 80) || 'N/A'
  });

  // Validate avatarUrl
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    const errorMsg = 'Avatar URL must be a valid string';
    Logger.error('authApi.updateAvatar', errorMsg, { avatarUrl, type: typeof avatarUrl });
    return Promise.reject(new Error(errorMsg));
  }
  
  const trimmedUrl = avatarUrl.trim();
  Logger.debug('authApi.updateAvatar', 'After trim', { trimmedLength: trimmedUrl.length });
  
  if (trimmedUrl.length === 0) {
    const errorMsg = 'Avatar URL cannot be empty';
    Logger.error('authApi.updateAvatar', errorMsg, { trimmedUrl });
    return Promise.reject(new Error(errorMsg));
  }
  
  // Check if it's a valid data URL or URL
  if (!trimmedUrl.startsWith('data:') && !trimmedUrl.startsWith('http')) {
    const errorMsg = 'Avatar must be a valid data URL or web URL';
    Logger.error('authApi.updateAvatar', errorMsg, { urlStart: trimmedUrl.substring(0, 20) });
    return Promise.reject(new Error(errorMsg));
  }

  Logger.info('authApi.updateAvatar', 'Validation passed, making API request', { 
    urlLength: trimmedUrl.length, 
    urlPrefix: trimmedUrl.substring(0, 80)
  });

  return apiRequest<{ user: BackendUserProfile }>(
    '/api/auth/me/avatar',
    {
      method: 'PATCH',
      body: JSON.stringify({ avatar: trimmedUrl }),
    },
    token
  ).then(response => {
    Logger.info('authApi.updateAvatar', 'API response received', {
      hasUser: !!response?.user,
      hasAvatarUrl: !!response?.user?.avatarUrl,
      avatarUrlLength: response?.user?.avatarUrl?.length || 0
    });
    return response;
  }).catch(error => {
    Logger.error('authApi.updateAvatar', 'API request failed', {
      errorMessage: error?.message,
      errorStatus: error?.status,
      fullError: error
    });
    throw error;
  });
};

/**
 * 更新顯示名稱
 */
export const updateDisplayName = (
  token: string,
  displayName: string
): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>(
    '/api/auth/me/display-name',
    {
      method: 'PATCH',
      body: JSON.stringify({ displayName }),
    },
    token
  );
};

/**
 * 修改邮箱 - 第一步：请求修改邮箱（发送验证码到新邮箱）
 */
export const requestEmailChange = (
  token: string,
  newEmail: string
): Promise<{ message: string; expiresIn?: number }> => {
  const normalizedEmail = newEmail.toLowerCase().trim();
  return apiRequest<{ message: string; expiresIn?: number }>('/api/auth/me/email/request-change', {
    method: 'POST',
    body: JSON.stringify({ newEmail: normalizedEmail }),
  }, token);
};

/**
 * 修改邮箱 - 第二步：确认修改邮箱（验证码验证）
 */
export const confirmEmailChange = (
  token: string,
  verificationCode: string
): Promise<{ user: BackendUserProfile }> => {
  return apiRequest<{ user: BackendUserProfile }>('/api/auth/me/email/verify-change', {
    method: 'POST',
    body: JSON.stringify({ code: verificationCode }),
  }, token);
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
 * 密码重置 - 第一步：发送重置码到邮箱
 */
export const requestPasswordReset = (email: string): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/password-reset/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

/**
 * 密码重置 - 第二步：验证码 + 新密码完成重置
 */
export const resetPassword = (
  email: string,
  verificationCode: string,
  newPassword: string
): Promise<{ message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  return apiRequest<{ message: string }>('/api/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, code: verificationCode, newPassword }),
  });
};



/**
 * 删除用户账户
 */
export const deleteAccount = (
  token: string,
  password: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/api/auth/me', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  }, token);
};

// Preferences storage keys
const PREFERENCES_KEY = 'kura.user.preferences';

export interface StoredPreferences {
  baseCurrency?: string;
  language?: string;
  weeklyAiSummary?: boolean;
}

/**
 * 从存储中获取用户偏好设置
 */
export const getStoredPreferences = async (): Promise<StoredPreferences | null> => {
  try {
    const preferences = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (preferences) {
      const parsed = JSON.parse(preferences);
      Logger.debug('AuthAPI', '✅ User preferences retrieved from AsyncStorage', {
        language: parsed.language,
        baseCurrency: parsed.baseCurrency,
      });
      return parsed;
    } else {
      Logger.debug('AuthAPI', '⚪ No user preferences found in AsyncStorage');
    }
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('AuthAPI', '❌ Failed to get stored preferences', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
    });
    // Return null on error, will use defaults
    return null;
  }
};

/**
 * 保存用户偏好设置到存储
 */
export const setStoredPreferences = async (preferences: StoredPreferences): Promise<void> => {
  try {
    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid preferences: must be an object');
    }

    const preferencesString = JSON.stringify(preferences);
    await AsyncStorage.setItem(PREFERENCES_KEY, preferencesString);
    Logger.info('AuthAPI', '✅ User preferences saved to AsyncStorage successfully', {
      language: preferences.language,
      baseCurrency: preferences.baseCurrency,
      weeklyAiSummary: preferences.weeklyAiSummary,
    });

    // Also keep in-memory backup
    memoryStorage[PREFERENCES_KEY] = preferencesString;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('AuthAPI', '❌ Failed to set stored preferences', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
    });

    // Try in-memory fallback
    try {
      memoryStorage[PREFERENCES_KEY] = JSON.stringify(preferences);
      Logger.warn('AuthAPI', '⚠️ Preferences saved to in-memory storage only (will be lost on app restart)');
    } catch (memoryError) {
      Logger.error('AuthAPI', '❌ Failed to save preferences anywhere', {
        error: memoryError instanceof Error ? memoryError.message : String(memoryError),
      });
      throw new Error('Failed to persist user preferences');
    }
  }
};

/**
 * 清除所有用户偏好设置
 */
export const clearStoredPreferences = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
    Logger.info('AuthAPI', '✅ User preferences cleared from AsyncStorage');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.warn('AuthAPI', '⚠️ AsyncStorage removeItem for preferences failed', {
      error: errorMessage,
    });
  } finally {
    // Always clear in-memory storage
    delete memoryStorage[PREFERENCES_KEY];
    Logger.debug('AuthAPI', 'In-memory preferences cleared');
  }
};
