// Notification types and interfaces

export type NotificationType = 'transaction' | 'account' | 'system' | 'price-alert';
export type NotificationPriority = 'low' | 'normal' | 'high';
export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  timestamp: string; // ISO 8601
  icon?: string;
  actionUrl?: string; // Deep link to action
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enableTransactionAlerts: boolean;
  enableAccountChanges: boolean;
  enableSystemMessages: boolean;
  enablePriceAlerts: boolean;
  enablePushNotifications: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  lastFetchedAt: number | null;
}
