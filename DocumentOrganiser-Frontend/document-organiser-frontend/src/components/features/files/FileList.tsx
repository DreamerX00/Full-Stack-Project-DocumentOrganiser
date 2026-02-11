'use client';

import { Star, MoreVertical, Download, Pencil, Trash2, Share2, Move, Copy } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DocumentResponse } from '@/lib/types';
import { formatFileSize, formatRelativeTime, getCategoryInfo } from '@/lib/utils/format';
import { useFileStore } from '@/lib/store/fileStore';

interface FileListProps {
  documents: DocumentResponse[];
  isLoading?: boolean;
  onPreview?: (doc: DocumentResponse) => void;
  onRename?: (doc: DocumentResponse) => void;
  onDelete?: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onMove?: (doc: DocumentResponse) => void;
  onCopy?: (doc: DocumentResponse) => void;
  onDownload?: (doc: DocumentResponse) => void;
  onToggleFavorite?: (doc: DocumentResponse) => void;
}

export function FileList({
  documents,
  isLoading,
  onPreview,
  onRename,
  onDelete,
  onShare,
  onMove,
  onCopy,
  onDownload,
  onToggleFavorite,
}: FileListProps) {
  const { selectedFiles, toggleFileSelection, selectAll, clearSelection } =
    useFileStore();
  const allSelected =
    documents.length > 0 && documents.every((d) => selectedFiles.includes(d.id));

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => (allSelected ? clearSelection() : selectAll())}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Modified</TableHead>
          <TableHead className="hidden md:table-cell">Size</TableHead>
          <TableHead className="hidden lg:table-cell">Type</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const isSelected = selectedFiles.includes(doc.id);
          const info = getCategoryInfo(doc.category);
          const Icon = info.icon;

          return (
            <TableRow
              key={doc.id}
              className={cn('cursor-pointer', isSelected && 'bg-accent')}
              onClick={() => onPreview?.(doc)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleFileSelection(doc.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-md p-1.5', info.bgColor)}>
                    <Icon className={cn('h-4 w-4', info.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(doc);
                    }}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        doc.favorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30 hover:text-yellow-400'
                      )}
                    />
                  </button>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {formatRelativeTime(doc.updatedAt)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {formatFileSize(doc.size)}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                {info.label}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
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
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
