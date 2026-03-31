'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List, Menu, Search, SortAsc, Sparkles, Upload, Users2, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/features/notifications/NotificationBell';
import { CommandPalette } from '@/components/features/search/CommandPalette';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/lib/store/navigationStore';
import type { SortField } from '@/lib/types';

interface TopNavProps {
  onUploadClick?: () => void;
  onMenuClick?: () => void;
}

export function TopNav({ onUploadClick, onMenuClick }: TopNavProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const { viewMode, setViewMode, sortBy, setSortBy } = useNavigationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date Modified' },
    { value: 'size', label: 'Size' },
    { value: 'type', label: 'Type' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/45">
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <button onClick={() => setCommandOpen(true)} className="flex-1 min-w-[220px] max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-10 py-3 text-sm text-muted-foreground backdrop-blur">
                <span>Search documents, spaces, people, or activity...</span>
                <kbd className="hidden pointer-events-none items-center gap-1 rounded-lg border border-white/10 bg-background/60 px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </button>

          <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Future-ready shell</span>
          </div>

          <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
            <Users2 className="h-4 w-4 text-primary" />
            <span>7 collaborators online</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border border-white/10 bg-white/5 p-0.5 sm:flex">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(sortBy === option.value && 'bg-accent')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NotificationBell />

            <Button onClick={onUploadClick} size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 hidden items-center gap-3 md:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-primary/80">
            <Workflow className="h-3.5 w-3.5" />
            Collaboration-ready
          </div>
          <p className="text-sm text-muted-foreground">
            Mission control for documents, approvals, teams, and search.
          </p>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
