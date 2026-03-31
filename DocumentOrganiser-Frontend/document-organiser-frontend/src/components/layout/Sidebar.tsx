'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  BriefcaseBusiness,
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
  Users2,
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

const workspaces = [
  { name: 'Executive Core', role: 'Owner', members: '12 members' },
  { name: 'Contracts Hub', role: 'Admin', members: '7 members' },
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
          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300',
          isActive
            ? 'bg-primary/95 text-primary-foreground shadow-[0_16px_40px_-24px_var(--primary)]'
            : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground',
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
              <span className="block text-xs text-muted-foreground">Workspace shell</span>
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
            {!sidebarCollapsed && 'Upload to workspace'}
          </Button>
        </Link>
      </div>

      {!sidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Workspaces</p>
                  <p className="text-xs text-muted-foreground">Future collaboration model</p>
                </div>
              </div>
              <div className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">Beta</div>
            </div>
            <div className="space-y-2">
              {workspaces.map((workspace, index) => (
                <div
                  key={workspace.name}
                  className={cn(
                    'rounded-2xl border border-white/10 px-3 py-3',
                    index === 0 ? 'bg-primary/10' : 'bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{workspace.name}</p>
                    <Users2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {workspace.role} · {workspace.members}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-hidden px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
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
