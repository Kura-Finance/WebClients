/**
 * Notification API Service
 * Handles notification fetching, marking, and settings
 */

import { getBackendBaseUrl } from './authApi';
import Logger from '../utils/Logger';
import { Notification, NotificationSettings } from '../store/notification/types';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class NotificationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'NotificationApiError';
    this.status = status;
  }
}

async function notificationRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/api${path}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    Logger.debug('NotificationAPI', 'Fetching:', {
      method: options.method || 'GET',
      url,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let body: T & ApiErrorBody;
    try {
      body = (await response.json()) as T & ApiErrorBody;
    } catch (jsonError) {
      const parseError =
        jsonError instanceof Error ? jsonError.message : 'Failed to parse response';
      Logger.error('NotificationAPI', 'Failed to parse response JSON', {
        url,
        status: response.status,
        parseError,
      });
      throw new NotificationApiError(
        `Server error (${response.status}): ${parseError}`,
        response.status
      );
    }

    if (!response.ok) {
      const errorMessage =
        body?.message || body?.error || `HTTP ${response.status}`;
      Logger.error('NotificationAPI', 'Request failed:', {
        status: response.status,
        message: errorMessage,
      });
      throw new NotificationApiError(errorMessage, response.status);
    }

    Logger.debug('NotificationAPI', 'Request succeeded:', { url });
    return body;
  } catch (error) {
    if (error instanceof NotificationApiError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('NotificationAPI', 'Request error:', { error: errorMessage });
    throw new NotificationApiError(errorMessage, 0);
  }
}

/**
 * Fetch all notifications for the user
 */
export async function fetchNotifications(
  token: string,
  limit?: number,
  offset?: number
): Promise<{ notifications: Notification[]; total: number }> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const path =
    `/notifications${params.toString() ? '?' + params.toString() : ''}`;

  return notificationRequest<{ notifications: Notification[]; total: number }>(
    path,
    { method: 'GET' },
    token
  );
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  token: string,
  notificationId: string
): Promise<{ success: boolean }> {
  return notificationRequest<{ success: boolean }>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    token
  );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  token: string
): Promise<{ success: boolean; count: number }> {
  return notificationRequest<{ success: boolean; count: number }>(
    '/notifications/read-all',
    { method: 'PATCH' },
    token
  );
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  token: string,
  notificationId: string
): Promise<{ success: boolean }> {
  return notificationRequest<{ success: boolean }>(
    `/notifications/${notificationId}`,
    { method: 'DELETE' },
    token
  );
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(
  token: string
): Promise<{ settings: NotificationSettings }> {
  return notificationRequest<{ settings: NotificationSettings }>(
    '/notifications/settings',
    { method: 'GET' },
    token
  );
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  token: string,
  settings: Partial<NotificationSettings>
): Promise<{ settings: NotificationSettings }> {
  return notificationRequest<{ settings: NotificationSettings }>(
    '/notifications/settings',
    {
      method: 'PATCH',
      body: JSON.stringify(settings),
    },
    token
  );
}
