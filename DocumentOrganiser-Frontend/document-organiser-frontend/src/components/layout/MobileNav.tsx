'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Star, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/documents', label: 'Files', icon: FileText },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  { href: '/dashboard/recent', label: 'Recent', icon: Clock },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-[1.6rem] border border-white/10 bg-background/75 px-2 py-2 shadow-[var(--shadow-panel)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition-all duration-300',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
