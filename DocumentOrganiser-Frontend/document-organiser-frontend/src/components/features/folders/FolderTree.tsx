'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFolderTree } from '@/lib/hooks/useFolders';
import type { FolderTreeResponse } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface FolderTreeNodeProps {
  folder: FolderTreeResponse;
  level: number;
}

function FolderTreeNode({ folder, level }: FolderTreeNodeProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const isActive = pathname === `/dashboard/folder/${folder.id}`;
  const hasChildren = folder.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
          isActive && 'bg-accent font-medium',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="shrink-0 p-0.5 rounded hover:bg-muted"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <span className="w-[18px]" />
        )}
        <Link
          href={`/dashboard/folder/${folder.id}`}
          className="flex flex-1 items-center gap-2 truncate"
        >
          {expanded && hasChildren ? (
            <FolderOpen
              className="h-4 w-4 shrink-0"
              style={{ color: folder.color || undefined }}
            />
          ) : (
            <Folder
              className="h-4 w-4 shrink-0"
              style={{ color: folder.color || undefined }}
            />
          )}
          <span className="truncate">{folder.name}</span>
          {folder.documentCount > 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              {folder.documentCount}
            </span>
          )}
        </Link>
      </div>

      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeNode key={child.id} folder={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  const { data: tree, isLoading } = useFolderTree();

  if (isLoading) {
    return (
      <div className="space-y-2 px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    );
  }

  // Backend returns a single root FolderTreeResponse with children
  const folders = tree?.children ?? [];

  if (!tree || folders.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground">
        No folders yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <FolderTreeNode key={folder.id} folder={folder} level={0} />
      ))}
    </div>
  );
}
