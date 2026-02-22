'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, ChevronRight, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { foldersApi } from '@/lib/api/folders';
import type { FolderResponse } from '@/lib/types';

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  mode: 'move' | 'copy';
  currentFolderId?: string | null;
  onConfirm: (targetFolderId: string | null) => void;
  isLoading?: boolean;
}

export function MoveDialog({
  open,
  onOpenChange,
  itemName,
  mode,
  currentFolderId,
  onConfirm,
  isLoading,
}: MoveDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [rootFolders, setRootFolders] = useState<FolderResponse[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [subfolders, setSubfolders] = useState<Record<string, FolderResponse[]>>({});
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingSubfolder, setLoadingSubfolder] = useState<string | null>(null);

  const loadRootFolders = async () => {
    setLoadingFolders(true);
    try {
      const folders = await foldersApi.listRootFolders();
      setRootFolders(folders);
    } catch {
      setRootFolders([]);
    }
    setLoadingFolders(false);
  };

  useEffect(() => {
    if (open) {
      setSelectedFolderId(null);
      setExpandedFolders(new Set());
      setSubfolders({});
      loadRootFolders();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = async (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      if (!subfolders[folderId]) {
        setLoadingSubfolder(folderId);
        try {
          const children = await foldersApi.listSubfolders(folderId);
          setSubfolders((prev) => ({ ...prev, [folderId]: children }));
        } catch {
          setSubfolders((prev) => ({ ...prev, [folderId]: [] }));
        }
        setLoadingSubfolder(null);
      }
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: FolderResponse, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isCurrent = folder.id === currentFolderId;
    const children = subfolders[folder.id] ?? [];
    const isLoadingSub = loadingSubfolder === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors',
            isSelected && 'bg-primary/10 border border-primary/30',
            isCurrent && 'opacity-50'
          )}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => !isCurrent && setSelectedFolderId(folder.id)}
        >
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
          >
            {isLoadingSub ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </button>
          <Folder
            className="h-4 w-4 shrink-0"
            style={{ color: folder.color || '#3B82F6' }}
          />
          <span className="text-sm truncate flex-1">{folder.name}</span>
          {isCurrent && (
            <span className="text-xs text-muted-foreground">(current)</span>
          )}
        </div>
        {isExpanded && children.length > 0 && (
          <div>
            {children.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'move' ? 'Move' : 'Copy'} &ldquo;{itemName}&rdquo;
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Select a destination folder:
          </p>

          <ScrollArea className="h-64 border rounded-lg p-2">
            {/* Root / My Documents option */}
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors',
                selectedFolderId === null && 'bg-primary/10 border border-primary/30',
                currentFolderId === null && 'opacity-50'
              )}
              onClick={() => currentFolderId !== null && setSelectedFolderId(null)}
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">My Documents (root)</span>
              {currentFolderId === null && (
                <span className="text-xs text-muted-foreground">(current)</span>
              )}
            </div>

            {loadingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="mt-1">
                {rootFolders.map((folder) => renderFolder(folder, 0))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedFolderId)}
            disabled={isLoading || (selectedFolderId === currentFolderId)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'move' ? 'Move Here' : 'Copy Here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
