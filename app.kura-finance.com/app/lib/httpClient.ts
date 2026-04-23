import { extractErrorMessage, handleFetchError, handleResponseError, logResponse, logSuccess } from './errorHandler';

interface ApiErrorBody {
  error?: string;
  message?: string;
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
      const { error: apiError } = handleResponseError(response.status, errorMsg, url, apiName);
      throw apiError;
    }

    const data = (json as T) ?? ({} as T);
    logSuccess(data, url, apiName);
    return data;
  } catch (error) {
    const { error: apiError } = handleFetchError(error, url, apiName);
    throw apiError;
  }
}
