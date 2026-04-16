'use client';

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

interface AdminUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  user: AdminUser;
}

/**
 * 管理员使用 Email/Password 登入
 * 后端会在响应中通过 Set-Cookie 头派发 JWT Cookie
 */
export const adminLogin = async (email: string, password: string): Promise<AdminUser> => {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 自动携带 Cookie
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AdminAuthError(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    return data.user;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }
    console.error('Admin login error:', error);
    throw new AdminAuthError('An error occurred during login');
  }
};

/**
 * 管理员使用 Secret Key 登入
 * 后端会在响应中通过 Set-Cookie 头派发 JWT Cookie
 * Secret Key 不会被存储到前端，直接传给后端验证
 */
export const adminLoginWithSecretKey = async (secretKey: string): Promise<AdminUser> => {
  try {
    const response = await fetch('/api/admin/secret-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': secretKey
      },
      credentials: 'include', // 自动携带 Cookie
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AdminAuthError(error.message || 'Secret key authentication failed');
    }

    const data: AuthResponse = await response.json();
    return data.user;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }
    console.error('Admin secret key login error:', error);
    throw new AdminAuthError('An error occurred during authentication');
  }
};

/**
 * 管理員登出
 * 後端會清除 Cookie
 */
export const adminLogout = async (): Promise<void> => {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include', // 自動攜帶 Cookie
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Get stored admin token from localStorage
 * Token is stored after successful login
 */
export const getStoredAdminToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('adminToken');
  } catch (error) {
    console.error('Error retrieving admin token:', error);
    return null;
  }
};


