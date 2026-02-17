'use client';

import { useCallback } from 'react';
import { FileCard } from './FileCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useFileGridKeyboard } from '@/lib/hooks/useFileGridKeyboard';
import { useFileStore } from '@/lib/store/fileStore';
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
  const { toggleFileSelection } = useFileStore();

  const handleOpen = useCallback(
    (index: number) => {
      const doc = documents[index];
      if (doc) onPreview?.(doc);
    },
    [documents, onPreview]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const doc = documents[index];
      if (doc) onDelete?.(doc);
    },
    [documents, onDelete]
  );

  const handleToggleSelection = useCallback(
    (index: number) => {
      const doc = documents[index];
      if (doc) toggleFileSelection(doc.id);
    },
    [documents, toggleFileSelection]
  );

  const { focusedIndex, setFocusedIndex, gridRef } = useFileGridKeyboard({
    itemCount: documents.length,
    onOpen: handleOpen,
    onDelete: handleDelete,
    onToggleSelection: handleToggleSelection,
  });

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
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="grid"
      aria-label="File grid"
    >
      {documents.map((doc, index) => (
        <FileCard
          key={doc.id}
          document={doc}
          isFocused={index === focusedIndex}
          onMouseEnter={() => setFocusedIndex(index)}
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

