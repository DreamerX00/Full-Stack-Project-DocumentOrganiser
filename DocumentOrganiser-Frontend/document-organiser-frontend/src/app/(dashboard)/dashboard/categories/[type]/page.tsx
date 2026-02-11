'use client';

import { useEffect, useState, use } from 'react';
import { documentsApi } from '@/lib/api/documents';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { AppBreadcrumb } from '@/components/layout/Breadcrumb';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { DocumentCategory } from '@/lib/types';
import type { DocumentResponse } from '@/lib/types';
import { getCategoryInfo, downloadBlob } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function CategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const { viewMode } = useNavigationStore();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = type.toUpperCase() as DocumentCategory;
  const info = getCategoryInfo(category);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await documentsApi.listByCategory(category);
        setDocuments(data.content);
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, [category]);

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentsApi.download(doc.id);
      downloadBlob(blob, doc.originalName || doc.name);
    } catch {
      toast.error('Failed to download');
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <AppBreadcrumb
          items={[
            { id: 'categories', name: 'Categories', href: '/dashboard/categories' },
            { id: type, name: info.label },
          ]}
        />
        <h1 className="mt-2 text-2xl font-bold">{info.label}</h1>
        <p className="text-muted-foreground">{documents.length} documents</p>
      </div>

      {!isLoading && documents.length === 0 ? (
        <EmptyState type="documents" />
      ) : viewMode === 'grid' ? (
        <FileGrid
          documents={documents}
          isLoading={isLoading}
          onDownload={handleDownload}
        />
      ) : (
        <FileList
          documents={documents}
          isLoading={isLoading}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
