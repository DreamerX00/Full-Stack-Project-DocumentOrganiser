'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  FileText,
  Star,
  Clock,
  FolderOpen,
  Share2,
  Trash2,
  Settings,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building2,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { useUnreadNotificationCount } from '@/lib/hooks/useNotifications';
import { formatFileSize } from '@/lib/utils/format';
import { UserDropdown } from '@/components/features/auth/UserDropdown';
import { FolderTree } from '@/components/features/folders/FolderTree';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  { href: '/dashboard/recent', label: 'Recent', icon: Clock },
  { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
];

const navItems2 = [
  { href: '/dashboard/shared', label: 'Shared with me', icon: Share2 },
  { href: '/shares', label: 'Share Links', icon: LinkIcon },
  { href: '/workspaces', label: 'Workspaces', icon: Building2 },
  { href: '/dashboard/trash', label: 'Trash', icon: Trash2 },
];

const navItems3 = [
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useNavigationStore();
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useDashboardStats();
  const { data: unreadCount } = useUnreadNotificationCount();

  const countMap: Record<string, number | undefined> = {
    '/dashboard/documents': stats?.totalDocuments,
    '/dashboard/favorites': stats?.favoriteCount,
    '/dashboard/shared': stats?.sharedWithMeCount,
    '/dashboard/notifications': unreadCount,
  };

  const storageUsed = user?.storageUsedBytes ?? 0;
  const storageQuota = user?.storageLimitBytes ?? 104857600; // 100MB default
  const storagePercent = Math.round((storageUsed / storageQuota) * 100);

  const NavLink = ({
    href,
    label,
    icon: Icon,
    count,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    const content = (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300',
          isActive
            ? 'bg-primary/95 text-primary-foreground shadow-[0_16px_40px_-24px_var(--primary)]'
            : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <span className="relative">
          <Icon className="h-4 w-4 shrink-0" />
          {sidebarCollapsed && count != null && count > 0 && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </span>
        {!sidebarCollapsed && (
          <>
            <span className="flex-1">{label}</span>
            {count != null && count > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {count}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'glass-panel flex h-screen flex-col border-r transition-all duration-300 overflow-hidden',
        sidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Image src="/logo.svg" alt="DocOrganiser" width={24} height={24} className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-medium uppercase tracking-[0.28em] text-primary/80">
                DocOrganiser
              </span>
              <span className="block text-xs text-muted-foreground">Document workspace</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-8 w-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Upload Button */}
      <div className="p-3">
        <Link href="/dashboard/documents">
          <Button className={cn('w-full gap-2', sidebarCollapsed && 'px-2')}>
            <Upload className="h-4 w-4" />
            {!sidebarCollapsed && 'Upload document'}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-hidden px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} count={countMap[item.href]} />
          ))}

          {/* Folder Tree */}
          {!sidebarCollapsed && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-[0.22em]">
                Folders
              </p>
              <FolderTree />
            </>
          )}

          <Separator className="my-2" />

          {navItems2.map((item) => (
            <NavLink key={item.href} {...item} count={countMap[item.href]} />
          ))}

          <Separator className="my-2" />

          {navItems3.map((item) => (
            <NavLink key={item.href} {...item} count={countMap[item.href]} />
          ))}
        </nav>
      </ScrollArea>

      {/* Storage Usage */}
      {!sidebarCollapsed && (
        <div className="border-t border-white/10 p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Storage</span>
            <span>{storagePercent}%</span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {formatFileSize(storageUsed)} of {formatFileSize(storageQuota)} used
          </p>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        <UserDropdown collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
