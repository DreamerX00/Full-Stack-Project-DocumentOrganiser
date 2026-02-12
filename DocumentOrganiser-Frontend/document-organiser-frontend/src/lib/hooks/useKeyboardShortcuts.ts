'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const shortcuts: ShortcutMap = {
      'g+d': () => router.push('/dashboard'),
      'g+f': () => router.push('/dashboard/documents'),
      'g+r': () => router.push('/dashboard/recent'),
      'g+s': () => router.push('/dashboard/search'),
      'g+t': () => router.push('/dashboard/trash'),
      'g+n': () => router.push('/dashboard/notifications'),
      'g+a': () => router.push('/dashboard/activity'),
    };

    let pendingKey: string | null = null;
    let pendingTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // "?" opens keyboard shortcut help
      if (key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-shortcuts-dialog'));
        return;
      }

      // Two-key sequences (g + ...)
      if (pendingKey) {
        const combo = `${pendingKey}+${key}`;
        if (shortcuts[combo]) {
          e.preventDefault();
          shortcuts[combo]();
        }
        pendingKey = null;
        if (pendingTimeout) clearTimeout(pendingTimeout);
        return;
      }

      if (key === 'g') {
        pendingKey = 'g';
        pendingTimeout = setTimeout(() => {
          pendingKey = null;
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pendingTimeout) clearTimeout(pendingTimeout);
    };
  }, [router]);
}
