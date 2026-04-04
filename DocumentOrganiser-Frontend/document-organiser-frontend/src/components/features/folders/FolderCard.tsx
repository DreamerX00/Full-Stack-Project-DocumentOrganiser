'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Folder, MoreVertical, Pencil, Trash2, Move, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { FolderResponse } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { useFileStore } from '@/lib/store/fileStore';

interface FolderCardProps {
  folder: FolderResponse;
  onRename?: (folder: FolderResponse) => void;
  onDelete?: (folder: FolderResponse) => void;
  onMove?: (folder: FolderResponse) => void;
  onShare?: (folder: FolderResponse) => void;
  onDocumentDrop?: (documentId: string, targetFolderId: string) => void;
}

export function FolderCard({
  folder,
  onRename,
  onDelete,
  onMove,
  onShare,
  onDocumentDrop,
}: FolderCardProps) {
  const { selectedFolders, toggleFolderSelection } = useFileStore();
  const isSelected = selectedFolders.includes(folder.id);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/document-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const documentId = e.dataTransfer.getData('application/document-id');
    if (documentId && onDocumentDrop) {
      onDocumentDrop(documentId, folder.id);
    }
  };

  // Derive folder accent color or use default amber
  const folderColor = folder.color || '#f59e0b';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group relative transition-all duration-300 border-white/10 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 hover:border-white/20',
          isSelected && 'ring-2 ring-violet-500 border-violet-500/50',
          isDragOver && 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/50'
        )}
      >
        <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleFolderSelection(folder.id)}
            onClick={(e) => e.stopPropagation()}
            className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
          />
        </div>

        <Link href={`/dashboard/folder/${folder.id}`}>
          <CardContent className="flex items-center gap-3 p-3">
            <div
              className="rounded-xl p-2.5 transition-all duration-200 group-hover:brightness-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: `${folderColor}20`,
                boxShadow: `0 4px 12px ${folderColor}15`
              }}
            >
              <Folder className="h-6 w-6" style={{ color: folderColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{folder.name}</p>
              <p className="text-xs text-muted-foreground">
                {folder.documentCount} files · {formatRelativeTime(folder.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Link>

        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename?.(folder)}>
                <Pencil className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(folder)}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove?.(folder)}>
                <Move className="mr-2 h-4 w-4" /> Move
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(folder)} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
}
