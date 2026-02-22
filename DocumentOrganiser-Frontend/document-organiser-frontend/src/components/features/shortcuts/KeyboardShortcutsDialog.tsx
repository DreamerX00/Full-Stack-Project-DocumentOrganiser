'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

function useIsMac() {
  const [isMac] = useState(
    () => typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  );
  return isMac;
}

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const isMac = useIsMac();
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = useMemo(
    () => [
      {
        title: 'Navigation',
        shortcuts: [
          { keys: ['G', 'D'], description: 'Go to Dashboard' },
          { keys: ['G', 'F'], description: 'Go to Documents' },
          { keys: ['G', 'R'], description: 'Go to Recent' },
          { keys: ['G', 'S'], description: 'Go to Search' },
          { keys: ['G', 'T'], description: 'Go to Trash' },
          { keys: ['G', 'N'], description: 'Go to Notifications' },
          { keys: ['G', 'A'], description: 'Go to Activity' },
        ],
      },
      {
        title: 'File Grid',
        shortcuts: [
          { keys: ['←', '→', '↑', '↓'], description: 'Navigate files' },
          { keys: ['Enter'], description: 'Open selected file' },
          { keys: ['Space'], description: 'Toggle selection' },
          { keys: ['Delete'], description: 'Delete selected file' },
          { keys: ['Esc'], description: 'Clear selection' },
        ],
      },
      {
        title: 'Actions',
        shortcuts: [
          { keys: [modKey, 'K'], description: 'Open Command Palette' },
          { keys: ['?'], description: 'Show Keyboard Shortcuts' },
        ],
      },
    ],
    [modKey]
  );

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    document.addEventListener('toggle-shortcuts-dialog', handler);
    return () => document.removeEventListener('toggle-shortcuts-dialog', handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <Kbd>{key}</Kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-0.5 text-xs">then</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
