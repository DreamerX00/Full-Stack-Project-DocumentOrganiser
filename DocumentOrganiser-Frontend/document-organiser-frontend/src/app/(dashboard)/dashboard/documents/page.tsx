'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { FolderCard } from '@/components/features/folders/FolderCard';
import { EmptyState } from '@/components/features/files/EmptyState';
import { BulkActionsBar } from '@/components/features/files/BulkActionsBar';
import { CreateFolderDialog } from '@/components/features/folders/CreateFolderDialog';
import { FileUploadDialog } from '@/components/features/files/FileUploadDialog';
import { ShareDialog } from '@/components/features/share/ShareDialog';
import { AppBreadcrumb } from '@/components/layout/Breadcrumb';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { useFileStore } from '@/lib/store/fileStore';
import { documentsApi } from '@/lib/api/documents';
import { foldersApi } from '@/lib/api/folders';
import { sharesApi } from '@/lib/api/shares';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';
import type { DocumentResponse, FolderResponse } from '@/lib/types';

export default function DocumentsPage() {
  const router = useRouter();
  const { viewMode } = useNavigationStore();
  const { documents, folders, isLoading, setDocuments, setFolders, setLoading, clearSelection } =
    useFileStore();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<DocumentResponse | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsData, foldersData] = await Promise.all([
        documentsApi.listByFolder(undefined),
        foldersApi.listRootFolders(),
      ]);
      setDocuments(docsData.content);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [setDocuments, setFolders, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFolder = async (data: { name: string; description?: string; color?: string }) => {
    try {
      await foldersApi.create({ ...data, parentFolderId: null });
      toast.success('Folder created');
      setCreateFolderOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteDoc = async (doc: DocumentResponse) => {
    try {
      await documentsApi.delete(doc.id);
      toast.success('Moved to trash');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteFolder = async (folder: FolderResponse) => {
    try {
      await foldersApi.delete(folder.id);
      toast.success('Folder deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  const handleToggleFavorite = async (doc: DocumentResponse) => {
    try {
      await documentsApi.toggleFavorite(doc.id);
      toast.success(doc.favorite ? 'Removed from favorites' : 'Added to favorites');
      fetchData();
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentsApi.download(doc.id);
      downloadBlob(blob, doc.originalName || doc.name);
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleRename = async (doc: DocumentResponse) => {
    const newName = prompt('Enter new name:', doc.name);
    if (newName && newName !== doc.name) {
      try {
        await documentsApi.rename(doc.id, { newName });
        toast.success('Renamed');
        fetchData();
      } catch {
        toast.error('Failed to rename');
      }
    }
  };

  const isEmpty = !isLoading && documents.length === 0 && folders.length === 0;

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <AppBreadcrumb items={[{ id: 'documents', name: 'My Documents', href: '/dashboard/documents' }]} />
          <h1 className="mt-2 text-2xl font-bold">My Documents</h1>
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

      {/* Bulk Actions */}
      <BulkActionsBar
        onDelete={() => { clearSelection(); fetchData(); }}
      />

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          type="documents"
          onUpload={() => setUploadOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Folders</h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Files</h2>
              {viewMode === 'grid' ? (
                <FileGrid
                  documents={documents}
                  isLoading={isLoading}
                  onDelete={handleDeleteDoc}
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                  onRename={handleRename}
                  onShare={(doc) => setShareDoc(doc)}
                />
              ) : (
                <FileList
                  documents={documents}
                  isLoading={isLoading}
                  onDelete={handleDeleteDoc}
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                  onRename={handleRename}
                  onShare={(doc) => setShareDoc(doc)}
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
      <ShareDialog
        open={!!shareDoc}
        onOpenChange={() => { setShareDoc(null); setShareLink(undefined); }}
        itemName={shareDoc?.name ?? ''}
        shareLink={shareLink}
        onShareWithUser={async (email, permission) => {
          if (shareDoc) {
            try {
              await sharesApi.shareDocumentWithUser(shareDoc.id, { email, permission });
              toast.success(`Shared with ${email}`);
            } catch {
              toast.error('Failed to share');
            }
          }
        }}
        onCreateLink={async (permission) => {
          if (shareDoc) {
            try {
              const link = await sharesApi.createDocumentShareLink(shareDoc.id, { permission });
              setShareLink(`${window.location.origin}/share/${link.token}`);
            } catch {
              toast.error('Failed to generate link');
            }
          }
        }}
      />
    </div>
  );
}
