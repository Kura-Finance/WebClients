const DEFAULT_BACKEND_URL = 'http://localhost:8080';
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

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
  }
}

export const getBackendBaseUrl = (): string => {
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

async function backendRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
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
    throw new BackendApiError(message, response.status);
  }

  return (json as T) ?? ({} as T);
}

export const registerUser = (email: string, password: string): Promise<AuthResponse> => {
  return backendRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const loginUser = (email: string, password: string): Promise<AuthResponse> => {
  return backendRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const fetchCurrentUserProfile = (token: string): Promise<{ user: BackendUserProfile }> => {
  return backendRequest<{ user: BackendUserProfile }>('/api/auth/me', { method: 'GET' }, token);
};

export const updateCurrentUserProfile = (
  token: string,
  payload: { displayName?: string; avatarUrl?: string }
): Promise<{ user: BackendUserProfile }> => {
  return backendRequest<{ user: BackendUserProfile }>(
    '/api/auth/me',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token
  );
};

export const createPlaidLinkToken = (token: string): Promise<{ link_token: string }> => {
  return backendRequest<{ link_token: string }>(
    '/api/plaid/create-link-token',
    { method: 'POST' },
    token
  );
};

export const exchangePlaidPublicToken = (
  token: string,
  payload: { public_token: string; institution_name?: string }
): Promise<{ status: string; message: string }> => {
  return backendRequest<{ status: string; message: string }>(
    '/api/plaid/exchange-public-token',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  );
};