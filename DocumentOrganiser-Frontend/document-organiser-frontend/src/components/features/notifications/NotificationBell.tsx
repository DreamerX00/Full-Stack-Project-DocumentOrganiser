'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationKeys, useUnreadNotificationCount } from '@/lib/hooks/useNotifications';

/**
 * Notification bell button with live unread count badge.
 * Uses SSE when available and falls back to polling via useUnreadNotificationCount.
 */
export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: polledCount } = useUnreadNotificationCount();
  const [sseCount, setSseCount] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const count = sseCount ?? polledCount ?? 0;

  // Attempt SSE connection
  useEffect(() => {
    if (typeof window === 'undefined' || !window.EventSource) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
    const url = `${baseUrl}/notifications/stream`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.addEventListener('unread-count', (event) => {
      const newCount = parseInt(event.data, 10);
      if (!isNaN(newCount)) {
        setSseCount(newCount);
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      }
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [queryClient]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push('/dashboard/notifications')}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}
