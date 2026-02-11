'use client';

import { useEffect, useState } from 'react';
import { documentsApi } from '@/lib/api/documents';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { useNavigationStore } from '@/lib/store/navigationStore';
import type { DocumentResponse } from '@/lib/types';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';

export default function RecentPage() {
  const { viewMode } = useNavigationStore();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await documentsApi.listRecent();
        setDocuments(data.content);
      } catch {
        toast.error('Failed to load recent documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentsApi.download(doc.id);
      downloadBlob(blob, doc.originalName || doc.name);
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleToggleFavorite = async (doc: DocumentResponse) => {
    try {
      const updated = await documentsApi.toggleFavorite(doc.id);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
    } catch {
      toast.error('Failed to update');
    }
  };

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
