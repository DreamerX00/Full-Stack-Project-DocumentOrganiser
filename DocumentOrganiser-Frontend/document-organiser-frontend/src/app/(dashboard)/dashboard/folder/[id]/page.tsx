'use client';

import { useState, use, useEffect } from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { FolderCard } from '@/components/features/folders/FolderCard';
import { EmptyState } from '@/components/features/files/EmptyState';
import { CreateFolderDialog } from '@/components/features/folders/CreateFolderDialog';
import { FileUploadDialog } from '@/components/features/files/FileUploadDialog';
import { RenameDialog } from '@/components/features/files/RenameDialog';
import { ShareDialog } from '@/components/features/share/ShareDialog';
import { FilePreview } from '@/components/features/files/FilePreview';
import { MoveDialog } from '@/components/features/files/MoveDialog';
import { AppBreadcrumb } from '@/components/layout/Breadcrumb';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { useFileStore } from '@/lib/store/fileStore';
import {
  useDocumentsByFolder,
  useDeleteDocument,
  useToggleFavorite,
  useDownloadDocument,
  useRenameDocument,
  useMoveDocument,
  useCopyDocument,
} from '@/lib/hooks/useDocuments';
import {
  useFolder,
  useSubfolders,
  useCreateFolder,
  useDeleteFolder,
} from '@/lib/hooks/useFolders';
import { useShareDocumentWithUser, useCreateDocumentShareLink } from '@/lib/hooks/useShares';
import type { DocumentResponse } from '@/lib/types';

export default function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { viewMode } = useNavigationStore();
  const { setCurrentFolderId } = useFileStore();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameDoc, setRenameDoc] = useState<DocumentResponse | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentResponse | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>();
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);
  const [moveDoc, setMoveDoc] = useState<DocumentResponse | null>(null);
  const [copyDoc, setCopyDoc] = useState<DocumentResponse | null>(null);

  // React Query hooks
  const { data: folder } = useFolder(id);
  const { data: docsData, isLoading: docsLoading } = useDocumentsByFolder(id);
  const { data: subfolders, isLoading: foldersLoading } = useSubfolders(id);
  const deleteDoc = useDeleteDocument();
  const toggleFavorite = useToggleFavorite();
  const downloadDoc = useDownloadDocument();
  const renameDocument = useRenameDocument();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const shareWithUser = useShareDocumentWithUser();
  const createShareLink = useCreateDocumentShareLink();
  const moveDocument = useMoveDocument();
  const copyDocument = useCopyDocument();

  const documents = docsData?.content ?? [];
  const folders = subfolders ?? [];
  const isLoading = docsLoading || foldersLoading;

  useEffect(() => {
    setCurrentFolderId(id);
    return () => setCurrentFolderId(null);
  }, [id, setCurrentFolderId]);

  const breadcrumbItems = [
    { id: 'documents', name: 'My Documents', href: '/dashboard/documents' },
    ...(folder ? [{ id: folder.id, name: folder.name }] : []),
  ];

  const handleCreateFolder = async (data: { name: string; description?: string; color?: string }) => {
    createFolder.mutate(
      { ...data, parentFolderId: id },
      { onSuccess: () => setCreateFolderOpen(false) },
    );
  };

  const isEmpty = !isLoading && documents.length === 0 && folders.length === 0;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <AppBreadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-2xl font-bold">{folder?.name || 'Loading...'}</h1>
          {folder?.description && (
            <p className="text-sm text-muted-foreground">{folder.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateFolderOpen(true)} className="gap-2">
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          type="documents"
          onUpload={() => setUploadOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />
      ) : (
        <>
          {folders.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Folders</h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folders.map((f) => (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    onDelete={(f) => deleteFolder.mutate(f.id)}
                    onDocumentDrop={(documentId, targetFolderId) => {
                      moveDocument.mutate({
                        id: documentId,
                        data: { targetFolderId },
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Files</h2>
              {viewMode === 'grid' ? (
                <FileGrid
                  documents={documents}
                  isLoading={isLoading}
                  onPreview={(doc) => setPreviewDoc(doc)}
                  onDelete={(doc) => deleteDoc.mutate(doc.id)}
                  onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
                  onDownload={(doc) => downloadDoc.mutate(doc)}
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
                  onDelete={(doc) => deleteDoc.mutate(doc.id)}
                  onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
                  onDownload={(doc) => downloadDoc.mutate(doc)}
                  onRename={(doc) => setRenameDoc(doc)}
                  onShare={(doc) => setShareDoc(doc)}
                  onMove={(doc) => setMoveDoc(doc)}
                  onCopy={(doc) => setCopyDoc(doc)}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={handleCreateFolder}
      />
      <FileUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <RenameDialog
        open={!!renameDoc}
        onOpenChange={() => setRenameDoc(null)}
        currentName={renameDoc?.name ?? ''}
        onRename={(newName) => {
          if (renameDoc) {
            renameDocument.mutate(
              { id: renameDoc.id, data: { newName } },
              { onSuccess: () => setRenameDoc(null) },
            );
          }
        }}
        isLoading={renameDocument.isPending}
      />
      <ShareDialog
        open={!!shareDoc}
        onOpenChange={() => { setShareDoc(null); setShareLink(undefined); }}
        itemName={shareDoc?.name ?? ''}
        shareLink={shareLink}
        onShareWithUser={async (email, permission) => {
          if (shareDoc) {
            shareWithUser.mutate({
              documentId: shareDoc.id,
              data: { email, permission },
            });
          }
        }}
        onCreateLink={async (permission) => {
          if (shareDoc) {
            createShareLink.mutate(
              { documentId: shareDoc.id, data: { permission } },
              {
                onSuccess: (link) => {
                  setShareLink(`${window.location.origin}/share/${link.token}`);
                },
              },
            );
          }
        }}
      />
      <FilePreview
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={() => setPreviewDoc(null)}
        onDownload={(doc) => downloadDoc.mutate(doc)}
        onShare={(doc) => setShareDoc(doc)}
        onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
      />
      <MoveDialog
        open={!!moveDoc}
        onOpenChange={() => setMoveDoc(null)}
        itemName={moveDoc?.name ?? ''}
        mode="move"
        currentFolderId={id}
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
        currentFolderId={id}
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
