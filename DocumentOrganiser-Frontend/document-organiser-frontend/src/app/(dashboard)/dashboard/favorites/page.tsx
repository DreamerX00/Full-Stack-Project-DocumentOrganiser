'use client';

import { useState } from 'react';
import {
  useFavoriteDocuments,
  useToggleFavorite,
  useDownloadDocument,
  useDeleteDocument,
  useRenameDocument,
  useMoveDocument,
  useCopyDocument,
} from '@/lib/hooks/useDocuments';
import { useShareDocumentWithUser, useCreateDocumentShareLink } from '@/lib/hooks/useShares';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { FilePreview } from '@/components/features/files/FilePreview';
import { ShareDialog } from '@/components/features/share/ShareDialog';
import { RenameDialog } from '@/components/features/files/RenameDialog';
import { MoveDialog } from '@/components/features/files/MoveDialog';
import { useNavigationStore } from '@/lib/store/navigationStore';
import type { DocumentResponse } from '@/lib/types';

export default function FavoritesPage() {
  const { viewMode } = useNavigationStore();
  const { data, isLoading } = useFavoriteDocuments();
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
  const [moveDoc, setMoveDoc] = useState<DocumentResponse | null>(null);
  const [copyDoc, setCopyDoc] = useState<DocumentResponse | null>(null);

  const moveDocument = useMoveDocument();
  const copyDocument = useCopyDocument();

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
          onPreview={(doc) => setPreviewDoc(doc)}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
          onDelete={(doc) => deleteDoc.mutate(doc.id)}
          onRename={(doc) => setRenameDoc(doc)}
          onShare={(doc) => setShareDoc(doc)}
          onMove={(doc) => setMoveDoc(doc)}
          onCopy={(doc) => setCopyDoc(doc)}
        />
      ) : (
        <FileList
          documents={documents}
          isLoading={isLoading}
          onPreview={(doc) => setPreviewDoc(doc)}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
          onDelete={(doc) => deleteDoc.mutate(doc.id)}
          onRename={(doc) => setRenameDoc(doc)}
          onShare={(doc) => setShareDoc(doc)}
          onMove={(doc) => setMoveDoc(doc)}
          onCopy={(doc) => setCopyDoc(doc)}
        />
      )}

      <FilePreview
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={() => setPreviewDoc(null)}
        onDownload={handleDownload}
        onShare={(doc) => {
          setPreviewDoc(null);
          setShareDoc(doc);
        }}
        onToggleFavorite={handleToggleFavorite}
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
      <MoveDialog
        open={!!moveDoc}
        onOpenChange={() => setMoveDoc(null)}
        itemName={moveDoc?.name ?? ''}
        mode="move"
        currentFolderId={moveDoc?.folderId ?? undefined}
        onConfirm={(targetFolderId) => {
          if (moveDoc) {
            moveDocument.mutate(
              { id: moveDoc.id, data: { targetFolderId: targetFolderId ?? null } },
              { onSuccess: () => setMoveDoc(null) }
            );
          }
        }}
        isLoading={moveDocument.isPending}
      />
      <MoveDialog
        open={!!copyDoc}
        onOpenChange={() => setCopyDoc(null)}
        itemName={copyDoc?.name ?? ''}
        mode="copy"
        currentFolderId={copyDoc?.folderId ?? undefined}
        onConfirm={(targetFolderId) => {
          if (copyDoc) {
            copyDocument.mutate(
              { id: copyDoc.id, targetFolderId: targetFolderId ?? undefined },
              { onSuccess: () => setCopyDoc(null) }
            );
          }
        }}
        isLoading={copyDocument.isPending}
      />
    </div>
  );
}
