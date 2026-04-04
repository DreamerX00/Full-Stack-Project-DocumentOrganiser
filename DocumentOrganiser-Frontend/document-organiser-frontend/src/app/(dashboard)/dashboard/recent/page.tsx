'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import {
  useRecentDocuments,
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function RecentPage() {
  const { viewMode } = useNavigationStore();
  const { data, isLoading } = useRecentDocuments();
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

  const handleDownload = (doc: DocumentResponse) => downloadDoc.mutate(doc);
  const handleToggleFavorite = (doc: DocumentResponse) => toggleFavorite.mutate(doc.id);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 p-3 border border-white/10">
          <Clock className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
            Recent
          </h1>
          <p className="text-muted-foreground">Your recently accessed documents</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {!isLoading && documents.length === 0 ? (
          <EmptyState type="recent" />
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
      </motion.div>

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
    </motion.div>
  );
}
