"use client";

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useNotificationStore,
  type NotificationCategory,
  type AppNotification,
} from '@/store/useNotificationStore';
import {
  Chip,
  DashboardPage,
  PageHeader,
  Panel,
} from '@/components/dashboard/PageShell';

const CATEGORY_META: Record<NotificationCategory, { label: string; icon: string; color: string }> = {
  price_alert: { label: 'Price', icon: '📈', color: '#F59E0B' },
  account_activity: { label: 'Activity', icon: '👤', color: '#3B82F6' },
  transaction: { label: 'Transaction', icon: '⇄', color: '#4ADE80' },
  system_alert: { label: 'System', icon: 'ℹ️', color: '#8B5CF6' },
  security: { label: 'Security', icon: '🛡️', color: '#EF4444' },
};

const FILTERS: { id: 'all' | NotificationCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'transaction', label: 'Transactions' },
  { id: 'price_alert', label: 'Price' },
  { id: 'security', label: 'Security' },
  { id: 'account_activity', label: 'Activity' },
  { id: 'system_alert', label: 'System' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const remove = useNotificationStore((s) => s.remove);

  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');

  const filtered = useMemo<AppNotification[]>(
    () =>
      [...notifications]
        .filter((n) => filter === 'all' || n.category === filter)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, filter],
  );

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DashboardPage variant="narrow">
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'You\u2019re all caught up'}
        actions={
          <Button variant="ghost" size="sm" disabled={unread === 0} onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      <Panel padding="md">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--kura-border)] px-4 py-12 text-center text-sm text-[var(--kura-text-secondary)]">
            No notifications here.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const meta = CATEGORY_META[n.category];
              return (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${n.read ? 'border-[var(--kura-border)] bg-[var(--kura-surface)]' : 'border-[var(--kura-primary)]/30 bg-[var(--kura-primary)]/5'}`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.icon}
                  </span>
                  <button onClick={() => markRead(n.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--kura-text)]">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--kura-primary)]" />}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--kura-text-secondary)]">{n.message}</p>
                    <p className="mt-1 text-[11px] text-[var(--kura-text-secondary)]">{timeAgo(n.createdAt)}</p>
                  </button>
                  <button
                    onClick={() => remove(n.id)}
                    aria-label="Dismiss"
                    className="shrink-0 text-[var(--kura-text-secondary)] opacity-0 transition-opacity hover:text-[var(--kura-text)] group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </DashboardPage>
  );
}
