import { create } from 'zustand';

export type NotificationCategory =
  | 'price_alert'
  | 'account_activity'
  | 'transaction'
  | 'system_alert'
  | 'security';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  getUnreadCount: () => number;
}

// Demo seed data — replace with /api/notifications wiring.
const SEED: AppNotification[] = [
  {
    id: 'n1',
    category: 'security',
    title: 'New sign-in detected',
    message: 'A new device signed in to your Kura account from Chrome on macOS.',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    category: 'price_alert',
    title: 'ETH up 5.2%',
    message: 'Ethereum crossed your alert threshold and is now $3,420.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    category: 'transaction',
    title: 'Card payment completed',
    message: 'Your Kura Card payment of $129.00 to Apple Store was successful.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: false,
  },
  {
    id: 'n4',
    category: 'account_activity',
    title: 'Bank account connected',
    message: 'Chase checking account was linked via Plaid.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    read: true,
  },
  {
    id: 'n5',
    category: 'system_alert',
    title: 'Scheduled maintenance',
    message: 'Kura will undergo brief maintenance on Sunday 02:00–02:30 UTC.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: SEED,
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
  remove: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
