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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { useAuthStore } from '@/lib/store/authStore';
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

  const storageUsed = user?.storageUsedBytes ?? 0;
  const storageQuota = user?.storageLimitBytes ?? 104857600; // 100MB default
  const storagePercent = Math.round((storageUsed / storageQuota) * 100);

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    const content = (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!sidebarCollapsed && <span>{label}</span>}
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
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DocOrganiser" width={28} height={28} className="h-7 w-7" />
            <span className="font-bold text-lg">DocOrganiser</span>
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
            {!sidebarCollapsed && 'Upload'}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {/* Folder Tree */}
          {!sidebarCollapsed && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Folders
              </p>
              <FolderTree />
            </>
          )}

          <Separator className="my-2" />

          {navItems2.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          <Separator className="my-2" />

          {navItems3.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Storage Usage */}
      {!sidebarCollapsed && (
        <div className="border-t p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Storage</span>
            <span>{storagePercent}%</span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFileSize(storageUsed)} of {formatFileSize(storageQuota)} used
          </p>
        </div>
      )}

      {/* User section */}
      <div className="border-t p-3">
        <UserDropdown collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
