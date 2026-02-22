'use client';

import { Star, MoreVertical, Download, Pencil, Trash2, Share2, Move, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { DocumentResponse } from '@/lib/types';
import { formatFileSize, formatRelativeTime, getCategoryInfo } from '@/lib/utils/format';
import { useFileStore } from '@/lib/store/fileStore';

interface FileCardProps {
  document: DocumentResponse;
  isFocused?: boolean;
  onMouseEnter?: () => void;
  onPreview?: (doc: DocumentResponse) => void;
  onRename?: (doc: DocumentResponse) => void;
  onDelete?: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onMove?: (doc: DocumentResponse) => void;
  onCopy?: (doc: DocumentResponse) => void;
  onDownload?: (doc: DocumentResponse) => void;
  onToggleFavorite?: (doc: DocumentResponse) => void;
}

export function FileCard({
  document: doc,
  isFocused,
  onMouseEnter,
  onPreview,
  onRename,
  onDelete,
  onShare,
  onMove,
  onCopy,
  onDownload,
  onToggleFavorite,
}: FileCardProps) {
  const { selectedFiles, toggleFileSelection } = useFileStore();
  const isSelected = selectedFiles.includes(doc.id);
  const categoryInfo = getCategoryInfo(doc.category);
  const CategoryIcon = categoryInfo.icon;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/document-id', doc.id);
    e.dataTransfer.setData('application/document-name', doc.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          draggable
          onDragStart={handleDragStart}
          onMouseEnter={onMouseEnter}
          tabIndex={0}
          className={cn(
            'group relative cursor-pointer transition-all hover:shadow-md',
            isSelected && 'ring-2 ring-primary',
            isFocused && !isSelected && 'ring-2 ring-ring/50'
          )}
        >
          {/* Selection checkbox */}
          <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleFileSelection(doc.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Favorite */}
          <button
            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(doc);
            }}
          >
            <Star
              className={cn(
                'h-4 w-4',
                doc.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400'
              )}
            />
          </button>

          <CardContent className="p-4" onClick={() => onPreview?.(doc)}>
            {/* File thumbnail / icon */}
            <div
              className={cn(
                'flex h-24 items-center justify-center rounded-lg mb-3',
                categoryInfo.bgColor
              )}
            >
              {doc.thumbnailUrl ? (
                <img
                  src={doc.thumbnailUrl}
                  alt={doc.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <CategoryIcon className={cn('h-10 w-10', categoryInfo.color)} />
              )}
            </div>

            {/* File name */}
            <p className="truncate text-sm font-medium" title={doc.name}>
              {doc.name}
            </p>

            {/* Meta */}
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(doc.updatedAt)}</p>
            </div>

            {/* Tags */}
            {doc.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {doc.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {doc.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{doc.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          {/* Actions dropdown */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload?.(doc)}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRename?.(doc)}>
                  <Pencil className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(doc)}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMove?.(doc)}>
                  <Move className="mr-2 h-4 w-4" /> Move
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy?.(doc)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(doc)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onPreview?.(doc)}>Preview</ContextMenuItem>
        <ContextMenuItem onClick={() => onDownload?.(doc)}>
          <Download className="mr-2 h-4 w-4" /> Download
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onRename?.(doc)}>
          <Pencil className="mr-2 h-4 w-4" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onShare?.(doc)}>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMove?.(doc)}>
          <Move className="mr-2 h-4 w-4" /> Move
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCopy?.(doc)}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onToggleFavorite?.(doc)}>
          <Star
            className={cn('mr-2 h-4 w-4', doc.isFavorite && 'fill-yellow-400 text-yellow-400')}
          />
          {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete?.(doc)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
