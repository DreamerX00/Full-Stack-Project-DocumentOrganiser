'use client';

import { Star, MoreVertical, Download, Pencil, Trash2, Share2, Move, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
import type { DocumentResponse, SortField, SortDirection } from '@/lib/types';
import { formatFileSize, formatRelativeTime, getCategoryInfo } from '@/lib/utils/format';
import { useFileStore } from '@/lib/store/fileStore';
import { useNavigationStore } from '@/lib/store/navigationStore';

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

function SortableHeader({
  label,
  field,
  currentSort,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDir: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentSort === field;
  return (
    <TableHead className={className}>
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors -ml-1 px-1 py-0.5 rounded"
        onClick={() => onSort(field)}
      >
        {label}
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
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
  const { selectedFiles, toggleFileSelection, selectAllIds, clearSelection } =
    useFileStore();
  const { sortBy, sortDirection, setSortBy, toggleSortDirection } = useNavigationStore();
  const allSelected =
    documents.length > 0 && documents.every((d) => selectedFiles.includes(d.id));

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
    }
  };

  // Local sort of documents
  const sortedDocuments = [...documents].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * dir;
      case 'size':
        return (a.fileSize - b.fileSize) * dir;
      case 'date':
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      case 'type':
        return a.category.localeCompare(b.category) * dir;
      default:
        return 0;
    }
  });

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
              onCheckedChange={() => (allSelected ? clearSelection() : selectAllIds(documents.map(d => d.id)))}
            />
          </TableHead>
          <SortableHeader label="Name" field="name" currentSort={sortBy} currentDir={sortDirection} onSort={handleSort} />
          <SortableHeader label="Modified" field="date" currentSort={sortBy} currentDir={sortDirection} onSort={handleSort} className="hidden sm:table-cell" />
          <SortableHeader label="Size" field="size" currentSort={sortBy} currentDir={sortDirection} onSort={handleSort} className="hidden md:table-cell" />
          <SortableHeader label="Type" field="type" currentSort={sortBy} currentDir={sortDirection} onSort={handleSort} className="hidden lg:table-cell" />
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDocuments.map((doc) => {
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
                        doc.isFavorite
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
                {formatFileSize(doc.fileSize)}
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
