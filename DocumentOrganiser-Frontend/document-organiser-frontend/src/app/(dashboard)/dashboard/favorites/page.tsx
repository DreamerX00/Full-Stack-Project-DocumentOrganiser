'use client';

import { useFavoriteDocuments, useToggleFavorite, useDownloadDocument } from '@/lib/hooks/useDocuments';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { useNavigationStore } from '@/lib/store/navigationStore';
import type { DocumentResponse } from '@/lib/types';

export default function FavoritesPage() {
  const { viewMode } = useNavigationStore();
  const { data, isLoading } = useFavoriteDocuments();
  const toggleFavorite = useToggleFavorite();
  const downloadDoc = useDownloadDocument();

  const documents = data?.content ?? [];

  const handleToggleFavorite = (doc: DocumentResponse) => toggleFavorite.mutate(doc.id);
  const handleDownload = (doc: DocumentResponse) => downloadDoc.mutate(doc);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-muted-foreground">Your starred documents</p>
      </div>

      {!isLoading && documents.length === 0 ? (
        <EmptyState type="favorites" />
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
