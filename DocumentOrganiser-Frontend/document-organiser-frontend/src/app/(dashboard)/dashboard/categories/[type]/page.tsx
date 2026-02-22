'use client';

import { use, useState } from 'react';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { FilePreview } from '@/components/features/files/FilePreview';
import { ShareDialog } from '@/components/features/share/ShareDialog';
import { RenameDialog } from '@/components/features/files/RenameDialog';
import { AppBreadcrumb } from '@/components/layout/Breadcrumb';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { DocumentCategory } from '@/lib/types';
import type { DocumentResponse } from '@/lib/types';
import { getCategoryInfo } from '@/lib/utils/format';
import {
  useDocumentsByCategory,
  useToggleFavorite,
  useDownloadDocument,
  useDeleteDocument,
  useRenameDocument,
} from '@/lib/hooks/useDocuments';
import { useShareDocumentWithUser, useCreateDocumentShareLink } from '@/lib/hooks/useShares';

export default function CategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const { viewMode } = useNavigationStore();

  const category = type.toUpperCase() as DocumentCategory;
  const info = getCategoryInfo(category);

  const { data, isLoading } = useDocumentsByCategory(category);
  const toggleFavorite = useToggleFavorite();
  const downloadDoc = useDownloadDocument();
  const deleteDoc = useDeleteDocument();
  const renameDocument = useRenameDocument();
  const shareWithUser = useShareDocumentWithUser();
  const createShareLink = useCreateDocumentShareLink();

  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentResponse | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>();
  const [renameDoc, setRenameDoc] = useState<DocumentResponse | null>(null);

  const documents = data?.content ?? [];

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
          onPreview={(doc) => setPreviewDoc(doc)}
          onDownload={(doc) => downloadDoc.mutate(doc)}
          onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
          onDelete={(doc) => deleteDoc.mutate(doc.id)}
          onRename={(doc) => setRenameDoc(doc)}
          onShare={(doc) => setShareDoc(doc)}
        />
      ) : (
        <FileList
          documents={documents}
          isLoading={isLoading}
          onPreview={(doc) => setPreviewDoc(doc)}
          onDownload={(doc) => downloadDoc.mutate(doc)}
          onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
          onDelete={(doc) => deleteDoc.mutate(doc.id)}
          onRename={(doc) => setRenameDoc(doc)}
          onShare={(doc) => setShareDoc(doc)}
        />
      )}

      <FilePreview
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={() => setPreviewDoc(null)}
        onDownload={(doc) => downloadDoc.mutate(doc)}
        onShare={(doc) => {
          setPreviewDoc(null);
          setShareDoc(doc);
        }}
        onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
      />
      <ShareDialog
        open={!!shareDoc}
        onOpenChange={() => {
          setShareDoc(null);
          setShareLink(undefined);
        }}
        itemName={shareDoc?.name ?? ''}
        shareLink={shareLink}
        onShareWithUser={async (email, permission) => {
          if (shareDoc) {
            shareWithUser.mutate({ documentId: shareDoc.id, data: { email, permission } });
          }
        }}
        onCreateLink={async (permission) => {
          if (shareDoc) {
            createShareLink.mutate(
              { documentId: shareDoc.id, data: { permission } },
              { onSuccess: (link) => setShareLink(`${window.location.origin}/share/${link.token}`) }
            );
          }
        }}
      />
      <RenameDialog
        open={!!renameDoc}
        onOpenChange={() => setRenameDoc(null)}
        currentName={renameDoc?.name ?? ''}
        onRename={(newName) => {
          if (renameDoc) {
            renameDocument.mutate(
              { id: renameDoc.id, data: { newName } },
              { onSuccess: () => setRenameDoc(null) }
            );
          }
        }}
        isLoading={renameDocument.isPending}
      />
    </div>
  );
}
