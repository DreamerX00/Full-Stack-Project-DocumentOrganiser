'use client';

import { useRecentDocuments, useToggleFavorite, useDownloadDocument } from '@/lib/hooks/useDocuments';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { useNavigationStore } from '@/lib/store/navigationStore';
import type { DocumentResponse } from '@/lib/types';

export default function RecentPage() {
  const { viewMode } = useNavigationStore();
  const { data, isLoading } = useRecentDocuments();
  const toggleFavorite = useToggleFavorite();
  const downloadDoc = useDownloadDocument();

  const documents = data?.content ?? [];

  const handleDownload = (doc: DocumentResponse) => downloadDoc.mutate(doc);
  const handleToggleFavorite = (doc: DocumentResponse) => toggleFavorite.mutate(doc.id);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Recent</h1>
        <p className="text-muted-foreground">Your recently accessed documents</p>
      </div>

      {!isLoading && documents.length === 0 ? (
        <EmptyState type="recent" />
      ) : viewMode === 'grid' ? (
        <FileGrid
          documents={documents}
          isLoading={isLoading}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <FileList
          documents={documents}
          isLoading={isLoading}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
