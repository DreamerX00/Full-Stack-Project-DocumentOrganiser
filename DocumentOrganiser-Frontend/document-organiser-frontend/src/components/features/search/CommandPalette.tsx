'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileText,
  Folder,
  Star,
  Clock,
  Trash2,
  Settings,
  Search,
  Upload,
  Share2,
  Bell,
  BarChart3,
  Home,
  Activity,
} from 'lucide-react';
import { useSearchSuggestions, useDebouncedValue } from '@/lib/hooks/useSearch';

const quickActions = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Home, href: '/dashboard' },
  { id: 'documents', label: 'My Documents', icon: FileText, href: '/dashboard/documents' },
  { id: 'favorites', label: 'Favorites', icon: Star, href: '/dashboard/favorites' },
  { id: 'recent', label: 'Recent Files', icon: Clock, href: '/dashboard/recent' },
  { id: 'shared', label: 'Shared Files', icon: Share2, href: '/dashboard/shared' },
  { id: 'trash', label: 'Trash', icon: Trash2, href: '/dashboard/trash' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  { id: 'activity', label: 'Activity', icon: Activity, href: '/dashboard/activity' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange],
  );

  const handleSearchAll = useCallback(() => {
    if (query.trim()) {
      onOpenChange(false);
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search documents, folders, or navigate..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {query.trim() ? (
            <button
              onClick={handleSearchAll}
              className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Search for &quot;{query}&quot;...
            </button>
          ) : (
            'Type to search...'
          )}
        </CommandEmpty>

        {/* Search Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <CommandGroup heading="Suggestions">
            {suggestions.map((term) => (
              <CommandItem
                key={term}
                value={term}
                onSelect={() => {
                  onOpenChange(false);
                  router.push(`/dashboard/search?q=${encodeURIComponent(term)}`);
                }}
                className="gap-2"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>{term}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Full search action */}
        {query.trim() && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={handleSearchAll} className="gap-2">
                <Search className="h-4 w-4" />
                <span>Search for &quot;{query}&quot;</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Quick Navigation */}
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              value={action.label}
              onSelect={() => handleSelect(action.href)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
