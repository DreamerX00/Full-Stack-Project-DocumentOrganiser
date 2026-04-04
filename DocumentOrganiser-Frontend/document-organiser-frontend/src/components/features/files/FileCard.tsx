'use client';

import { Star, MoreVertical, Download, Pencil, Trash2, Share2, Move, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
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

const CATEGORY_GRADIENTS: Record<string, string> = {
  DOCUMENTS: 'from-violet-500/20 to-purple-600/20',
  IMAGES: 'from-pink-500/20 to-rose-600/20',
  VIDEOS: 'from-red-500/20 to-orange-600/20',
  AUDIO: 'from-cyan-500/20 to-blue-600/20',
  SPREADSHEETS: 'from-emerald-500/20 to-green-600/20',
  CODE: 'from-amber-500/20 to-orange-600/20',
  ARCHIVES: 'from-slate-500/20 to-gray-600/20',
  PRESENTATIONS: 'from-fuchsia-500/20 to-pink-600/20',
  OTHERS: 'from-gray-500/20 to-slate-600/20',
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  DOCUMENTS: 'text-violet-500',
  IMAGES: 'text-pink-500',
  VIDEOS: 'text-red-500',
  AUDIO: 'text-cyan-500',
  SPREADSHEETS: 'text-emerald-500',
  CODE: 'text-amber-500',
  ARCHIVES: 'text-slate-500',
  PRESENTATIONS: 'text-fuchsia-500',
  OTHERS: 'text-gray-500',
};

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
  const gradientBg = CATEGORY_GRADIENTS[doc.category] || CATEGORY_GRADIENTS.OTHERS;
  const iconColor = CATEGORY_ICON_COLORS[doc.category] || CATEGORY_ICON_COLORS.OTHERS;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/document-id', doc.id);
    e.dataTransfer.setData('application/document-name', doc.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            draggable
            onDragStart={handleDragStart}
            onMouseEnter={onMouseEnter}
            tabIndex={0}
            className={cn(
              'group relative cursor-pointer transition-all duration-300 border-white/10 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/10 hover:border-white/20',
              isSelected && 'ring-2 ring-violet-500 border-violet-500/50',
              isFocused && !isSelected && 'ring-2 ring-violet-500/50'
            )}
          >
            {/* Selection checkbox */}
            <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleFileSelection(doc.id)}
                onClick={(e) => e.stopPropagation()}
                className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
            </div>

            {/* Favorite */}
            <button
              className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:brightness-125"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(doc);
              }}
            >
              <Star
                className={cn(
                  'h-4 w-4 transition-colors',
                  doc.isFavorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground hover:text-amber-400'
                )}
              />
            </button>

            <CardContent className="p-4" onClick={() => onPreview?.(doc)}>
              {/* File thumbnail / icon */}
              <div
                className={cn(
                  'flex h-24 items-center justify-center rounded-xl mb-3 bg-gradient-to-br transition-all duration-300 group-hover:scale-[1.02]',
                  gradientBg
                )}
              >
                {doc.thumbnailUrl ? (
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <CategoryIcon className={cn('h-10 w-10', iconColor)} />
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
                    <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 bg-white/5">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 2 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 bg-white/5">
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
                    className="h-7 w-7 hover:bg-white/10"
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
                  <DropdownMenuItem onClick={() => setTimeout(() => onShare?.(doc), 0)}>
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
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        </motion.div>
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
        <ContextMenuItem onClick={() => setTimeout(() => onShare?.(doc), 0)}>
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
            className={cn('mr-2 h-4 w-4', doc.isFavorite && 'fill-amber-400 text-amber-400')}
          />
          {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete?.(doc)}
          className="text-rose-500 focus:text-rose-500"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
