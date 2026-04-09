/**
 * Exchange API Service Layer
 * Handles crypto exchange connections via CCXT backend
 * Aligns with backend routes: /api/exchange/*
 */

import { getBackendBaseUrl } from './authApi';
import Logger from '../utils/Logger';

export type ExchangeName = 'binance' | 'kraken' | 'coinbase' | 'okx' | 'huobi';

export interface ExchangeCredentials {
  exchange: ExchangeName;
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // Optional for some exchanges
}

export interface SupportedExchange {
  id: ExchangeName;
  name: string;
  logo: string;
  requiresPassphrase: boolean;
}

export interface ExchangeAccount {
  id: string;
  userId: string;
  exchange: ExchangeName;
  accountName: string;
  createdAt: string;
  lastSyncedAt: string | null;
}

export interface ExchangeBalance {
  symbol: string;
  free: number;
  used: number;
  total: number;
}

export interface ExchangeAsset {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number; // amount * price in USD
  change24h: number;
  logo: string;
}

export interface ExchangeSnapshot {
  exchangeAccountId: string;
  exchange: ExchangeName;
  balances: ExchangeBalance[];
  assets: ExchangeAsset[];
  totalValueUSD: number;
  lastFetchedAt: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class ExchangeApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ExchangeApiError';
    this.status = status;
  }
}

async function exchangeRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/api/exchange${path}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    Logger.debug('ExchangeAPI', 'Fetching:', {
      method: options.method || 'GET',
      url,
      hasAuth: !!token,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const body = (await response.json()) as T & ApiErrorBody;

    if (!response.ok) {
      const errorMessage = body.message || body.error || `HTTP ${response.status}`;
      Logger.error('ExchangeAPI', 'Request failed:', {
        status: response.status,
        message: errorMessage,
        url,
      });
      throw new ExchangeApiError(errorMessage, response.status);
    }

    Logger.debug('ExchangeAPI', 'Request succeeded:', { url });
    return body;
  } catch (error) {
    if (error instanceof ExchangeApiError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('ExchangeAPI', 'Request error:', { error: errorMessage, url });
    throw new ExchangeApiError(errorMessage, 0);
  }
}

/**
 * Get list of supported exchanges
 * Optional: can be called without authentication, but if token provided will be used
 */
export async function getSupportedExchanges(token?: string): Promise<SupportedExchange[]> {
  try {
    const baseUrl = getBackendBaseUrl();
    const url = `${baseUrl}/api/exchange/supported`;

    Logger.debug('ExchangeAPI', 'Fetching supported exchanges:', { url, hasAuth: !!token });

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { headers });
    const data = (await response.json()) as { exchanges: SupportedExchange[] };

    if (!response.ok) {
      throw new ExchangeApiError(
        data?.error || `HTTP ${response.status}`,
        response.status
      );
    }

    Logger.info('ExchangeAPI', 'Supported exchanges fetched', {
      count: data.exchanges?.length ?? 0,
    });

    return data.exchanges || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch supported exchanges';
    Logger.error('ExchangeAPI', 'Failed to fetch supported exchanges:', { error: errorMessage });
    throw error;
  }
}

/**
 * Connect a crypto exchange account
 * Backend will use CCXT to validate and store credentials
 */
export async function connectExchangeAccount(
  credentials: ExchangeCredentials,
  token: string
): Promise<ExchangeAccount> {
  return exchangeRequest<ExchangeAccount>(
    '/connect',
    {
      method: 'POST',
      body: JSON.stringify({
        exchange: credentials.exchange,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        passphrase: credentials.passphrase,
      }),
    },
    token
  );
}

/**
 * Fetch balances from a connected exchange account
 */
export async function fetchExchangeBalances(
  exchangeAccountId: string,
  token: string
): Promise<ExchangeSnapshot> {
  return exchangeRequest<ExchangeSnapshot>(
    `/${exchangeAccountId}/balances`,
    { method: 'GET' },
    token
  );
}

/**
 * Fetch assets/holdings from a connected exchange account
 */
export async function fetchExchangeAssets(
  exchangeAccountId: string,
  token: string
): Promise<ExchangeAsset[]> {
  const response = await exchangeRequest<{ assets: ExchangeAsset[] }>(
    `/${exchangeAccountId}/assets`,
    { method: 'GET' },
    token
  );
  return response.assets || [];
}

/**
 * List all connected exchange accounts for the user
 */
export async function getConnectedExchangeAccounts(
  token: string
): Promise<ExchangeAccount[]> {
  return exchangeRequest<ExchangeAccount[]>(
    '/accounts',
    { method: 'GET' },
    token
  );
}

/**
 * Disconnect an exchange account
 */
export async function disconnectExchangeAccount(
  exchangeAccountId: string,
  token: string
): Promise<void> {
  await exchangeRequest<void>(
    `/${exchangeAccountId}`,
    { method: 'DELETE' },
    token
  );
}
