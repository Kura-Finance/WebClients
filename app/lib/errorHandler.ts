/**
 * 集中式錯誤處理器
 * 統一處理 API 錯誤與網路錯誤
 */

export interface ApiErrorLog {
  url: string;
  error: string;
  stack?: string;
  isNetworkError?: boolean;
  userMessage?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly isNetworkError: boolean;
  public readonly userMessage: string;

  constructor(message: string, status: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.userMessage = this.generateUserMessage(message, status, isNetworkError);
  }

  private generateUserMessage(message: string, status: number, isNetworkError: boolean): string {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your network connection and try again later.';
    }

    switch (status) {
      case 400:
        return 'Invalid request parameters. Please review your input.';
      case 401:
        return 'Unauthorized. Please sign in first.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return message;
    }
  }
}

/**
 * 處理 fetch 錯誤並回傳標準化錯誤資訊
 */
export function handleFetchError(
  error: unknown,
  url: string,
  apiName: string = 'API'
): { error: ApiError; log: ApiErrorLog } {
  let errorMessage = 'Unknown error';
  let errorStack: string | undefined = undefined;
  let isNetworkError = false;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;

    // 偵測網路錯誤
    if (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Load failed') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('connect') ||
      errorMessage.includes('timeout')
    ) {
      isNetworkError = true;
      const hint = 'Network/CORS issue or backend service unreachable';
      errorMessage = `${errorMessage} (${hint})`;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = String(error);
  }

  const apiError = new ApiError(errorMessage, 0, isNetworkError);
  const log: ApiErrorLog = {
    url,
    error: errorMessage,
  };

  if (errorStack) {
    log.stack = errorStack;
  }

  if (isNetworkError) {
    log.isNetworkError = true;
  }

  log.userMessage = apiError.userMessage;

  // 輸出日誌
  console.error(`[${apiName}] Request failed:`, log);

  return { error: apiError, log };
}

/**
 * 處理 HTTP 回應錯誤
 */
export function handleResponseError(
  status: number,
  message: string,
  url: string,
  apiName: string = 'API'
): { error: ApiError; log: ApiErrorLog } {
  const apiError = new ApiError(message, status, false);
  const log: ApiErrorLog = {
    url,
    error: message,
    userMessage: apiError.userMessage,
  };

  console.error(`[${apiName}] Response error:`, {
    status,
    ...log,
  });

  return { error: apiError, log };
}

/**
 * 安全地提取錯誤訊息
 */
export function extractErrorMessage(
  errorResponse: unknown
): { error?: string; message?: string } {
  if (typeof errorResponse === 'object' && errorResponse !== null) {
    const obj = errorResponse as Record<string, unknown>;
    return {
      error: typeof obj.error === 'string' ? obj.error : undefined,
      message: typeof obj.message === 'string' ? obj.message : undefined,
    };
  }
  return {};
}

/**
 * 取得使用者友善錯誤訊息
 */
export function getUserFriendlyMessage(error: ApiError | Error | string): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    // 檢查常見錯誤
    if (error.message.includes('Network')) {
      return 'Network connection error. Please check your connection.';
    }
    if (error.message.includes('JSON')) {
      return 'Invalid server response format.';
    }
    return error.message;
  }
  return String(error);
}

/**
 * 記錄成功請求
 */
export function logSuccess(
  response: unknown,
  url: string,
  apiName: string = 'API'
): void {
  console.debug(`[${apiName}] Request successful:`, {
    url,
    response,
  });
}

/**
 * 記錄回應資訊
 */
export function logResponse(
  status: number,
  statusText: string,
  contentType: string | null,
  url: string,
  apiName: string = 'API'
): void {
  console.debug(`[${apiName}] Response received:`, {
    status,
    statusText,
    contentType,
    url,
  });
}
