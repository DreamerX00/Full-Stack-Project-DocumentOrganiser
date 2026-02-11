'use client';

import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NotificationResponse } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationBellProps {
  notifications: NotificationResponse[];
  unreadCount: number;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
}: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-64">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start gap-1 px-3 py-2',
                  !notification.read && 'bg-accent/50'
                )}
                onClick={() => onMarkAsRead?.(notification.id)}
              >
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/dashboard/notifications" className="text-sm text-primary">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
