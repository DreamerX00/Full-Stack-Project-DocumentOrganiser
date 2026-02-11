'use client';

import { X, Download, Share2, Trash2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/lib/store/fileStore';

interface BulkActionsBarProps {
  onDelete?: () => void;
  onMove?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function BulkActionsBar({ onDelete, onMove, onDownload, onShare }: BulkActionsBarProps) {
  const { selectedFiles, selectedFolders, clearSelection } = useFileStore();
  const count = selectedFiles.length + selectedFolders.length;

  if (count === 0) return null;

  return (
    <div className="sticky top-14 z-20 flex items-center gap-3 rounded-lg border bg-background px-4 py-2 shadow-sm">
      <span className="text-sm font-medium">
        {count} item{count > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onDownload}>
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
        <Button variant="ghost" size="sm" onClick={onMove}>
          <Move className="mr-1 h-4 w-4" /> Move
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="mr-1 h-4 w-4" /> Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={clearSelection}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
