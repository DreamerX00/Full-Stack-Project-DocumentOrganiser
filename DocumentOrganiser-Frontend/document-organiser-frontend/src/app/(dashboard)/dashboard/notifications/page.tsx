'use client';

import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/lib/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Share2,
  AlertTriangle,
  HardDrive,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import type { NotificationResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, React.ElementType> = {
  DOCUMENT_SHARED: Share2,
  FOLDER_SHARED: Share2,
  SHARE_LINK_ACCESSED: Share2,
  STORAGE_WARNING: AlertTriangle,
  STORAGE_FULL: HardDrive,
  DOCUMENT_COMMENT: MessageSquare,
  SYSTEM_ANNOUNCEMENT: Megaphone,
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead.mutate()} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;re all caught up! Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.notificationType] || Bell;
            return (
              <Card
                key={notification.id}
                className={cn(
                  'transition-colors',
                  !notification.isRead && 'border-primary/30 bg-primary/5'
                )}
              >
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'rounded-full p-2',
                        notification.isRead ? 'bg-muted' : 'bg-primary/10'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          notification.isRead ? 'text-muted-foreground' : 'text-primary'
                        )}
                      />
                    </div>
                    <div>
                      <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead.mutate(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => deleteNotification.mutate(notification.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
