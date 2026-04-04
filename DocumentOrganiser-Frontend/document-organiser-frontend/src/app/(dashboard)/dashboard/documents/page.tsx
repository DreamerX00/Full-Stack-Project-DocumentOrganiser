'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Upload, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { FolderCard } from '@/components/features/folders/FolderCard';
import { EmptyState } from '@/components/features/files/EmptyState';
import { BulkActionsBar } from '@/components/features/files/BulkActionsBar';
import { CreateFolderDialog } from '@/components/features/folders/CreateFolderDialog';
import { FileUploadDialog } from '@/components/features/files/FileUploadDialog';
import { ShareDialog } from '@/components/features/share/ShareDialog';
import { RenameDialog } from '@/components/features/files/RenameDialog';
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
import { useRootFolders, useCreateFolder, useDeleteFolder } from '@/lib/hooks/useFolders';
import { useShareDocumentWithUser, useCreateDocumentShareLink } from '@/lib/hooks/useShares';
import type { DocumentResponse, FolderResponse } from '@/lib/types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function DocumentsPage() {
  const router = useRouter();
  const { viewMode } = useNavigationStore();
  const { clearSelection } = useFileStore();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<DocumentResponse | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>();
  const [renameDoc, setRenameDoc] = useState<DocumentResponse | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);

  const [moveDoc, setMoveDoc] = useState<DocumentResponse | null>(null);
  const [copyDoc, setCopyDoc] = useState<DocumentResponse | null>(null);

  // React Query
  const { data: docsData, isLoading: docsLoading } = useDocumentsByFolder(undefined);
  const { data: foldersData, isLoading: foldersLoading } = useRootFolders();
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
  const folders = foldersData ?? [];
  const isLoading = docsLoading || foldersLoading;

  const handleCreateFolder = async (data: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    createFolder.mutate(
      { ...data, parentFolderId: null },
      { onSuccess: () => setCreateFolderOpen(false) }
    );
  };

  const isEmpty = !isLoading && documents.length === 0 && folders.length === 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <AppBreadcrumb
            items={[{ id: 'documents', name: 'My Documents', href: '/dashboard/documents' }]}
          />
          <h1 className="mt-2 text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            My Documents
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCreateFolderOpen(true)}
            className="gap-2 border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
          >
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all"
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      <motion.div variants={itemVariants}>
        <BulkActionsBar />
      </motion.div>

      {/* Content */}
      {isEmpty ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            type="documents"
            onUpload={() => setUploadOpen(true)}
            onCreateFolder={() => setCreateFolderOpen(true)}
          />
        </motion.div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Folders
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folders.map((folder, idx) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <FolderCard
                      folder={folder}
                      onDelete={(f) => deleteFolder.mutate(f.id)}
                      onDocumentDrop={(documentId, targetFolderId) => {
                        moveDocument.mutate({
                          id: documentId,
                          data: { targetFolderId },
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Files
              </h2>
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
            </motion.div>
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
              }
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
    </motion.div>
  );
}
