'use client';

import { FileCard } from './FileCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { DocumentResponse } from '@/lib/types';

interface FileGridProps {
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

export function FileGrid({
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
}: FileGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {documents.map((doc) => (
        <FileCard
          key={doc.id}
          document={doc}
          onPreview={onPreview}
          onRename={onRename}
          onDelete={onDelete}
          onShare={onShare}
          onMove={onMove}
          onCopy={onCopy}
          onDownload={onDownload}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
