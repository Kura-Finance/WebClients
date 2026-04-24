import { extractErrorMessage, handleFetchError, handleResponseError, logResponse, logSuccess } from './errorHandler';

interface ApiErrorBody {
  error?: string | { code?: string; message?: string; details?: unknown };
  message?: string;
  success?: boolean;
  data?: unknown;
  meta?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseApiErrorMessage(payload: unknown): string | null {
  if (!isObject(payload)) return null;

  const errorField = payload.error;
  if (typeof errorField === 'string' && errorField.trim()) {
    return errorField;
  }
  if (isObject(errorField) && typeof errorField.message === 'string' && errorField.message.trim()) {
    return errorField.message;
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return null;
}

function unwrapApiPayload<T>(payload: unknown): T {
  if (!isObject(payload) || typeof payload.success !== 'boolean') {
    return payload as T;
  }

  return (payload.data ?? {}) as T;
}

export const getBackendBaseUrl = (): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL environment variable is not set. ' +
      'Please configure it in your environment or .env.local file.',
    );
  }
  return backendUrl;
};

export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  apiName: string = 'API',
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${path}`;
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Client-Type', 'web');

  try {
    console.debug(`[${apiName}] Request:`, { method: options.method || 'GET', url });
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    logResponse(response.status, response.statusText, response.headers.get('content-type'), url, apiName);

    const raw = await response.text();
    let json: ApiErrorBody | null = null;
    if (raw) {
      try {
        json = JSON.parse(raw) as ApiErrorBody;
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      const { error, message } = extractErrorMessage(json);
      const fallbackError = parseApiErrorMessage(json);
      const errorMsg =
        fallbackError ||
        error ||
        message ||
        `Request failed with status ${response.status}`;
      const { error: apiError } = handleResponseError(response.status, errorMsg, url, apiName);
      throw apiError;
    }

    if (isObject(json) && json.success === false) {
      const envelopeError = parseApiErrorMessage(json) || `Request failed with status ${response.status}`;
      const { error: apiError } = handleResponseError(response.status, envelopeError, url, apiName);
      throw apiError;
    }

    const data = unwrapApiPayload<T>(json ?? {});
    logSuccess(data, url, apiName);
    return data;
  } catch (error) {
    const { error: apiError } = handleFetchError(error, url, apiName);
    throw apiError;
  }
}
