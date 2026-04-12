import { create } from 'zustand';
import { Notification, NotificationSettings, NotificationState } from './types';
import Logger from '../../utils/Logger';

interface NotificationStore extends NotificationState {
  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: NotificationSettings = {
  enableTransactionAlerts: true,
  enableAccountChanges: true,
  enableSystemMessages: true,
  enablePriceAlerts: true,
  enablePushNotifications: true,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial State
  notifications: [],
  settings: defaultSettings,
  isLoading: false,
  error: null,
  unreadCount: 0,
  lastFetchedAt: null,

  // Actions
  addNotification: (notification: Notification) => {
    Logger.info('NotificationStore', 'Adding notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
    });

    set((state) => {
      const updatedNotifications = [notification, ...state.notifications];
      const unreadCount = updatedNotifications.filter(
        (n) => n.status === 'unread'
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  removeNotification: (id: string) => {
    Logger.debug('NotificationStore', 'Removing notification', { id });

    set((state) => {
      const updatedNotifications = state.notifications.filter(
        (n) => n.id !== id
      );
      const unreadCount = updatedNotifications.filter(
        (n) => n.status === 'unread'
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  markAsRead: (id: string) => {
    Logger.debug('NotificationStore', 'Marking notification as read', { id });

    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, status: 'read' as const } : n
      );
      const unreadCount = updatedNotifications.filter(
        (n) => n.status === 'unread'
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    Logger.debug('NotificationStore', 'Marking all notifications as read');

    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        status: 'read' as const,
      })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    Logger.warn('NotificationStore', 'Clearing all notifications');

    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  setNotifications: (notifications: Notification[]) => {
    Logger.info('NotificationStore', 'Setting notifications', {
      count: notifications.length,
    });

    const unreadCount = notifications.filter(
      (n) => n.status === 'unread'
    ).length;

    set({
      notifications,
      unreadCount,
      lastFetchedAt: Date.now(),
    });
  },

  updateSettings: (settings: Partial<NotificationSettings>) => {
    Logger.debug('NotificationStore', 'Updating notification settings', {
      settings: Object.keys(settings),
    });

    set((state) => ({
      settings: {
        ...state.settings,
        ...settings,
      },
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    if (error) {
      Logger.error('NotificationStore', 'Notification error', { error });
    }
    set({ error });
  },
}));
