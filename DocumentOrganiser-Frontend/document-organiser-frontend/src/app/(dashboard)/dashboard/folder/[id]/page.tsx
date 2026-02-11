'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { FolderCard } from '@/components/features/folders/FolderCard';
import { EmptyState } from '@/components/features/files/EmptyState';
import { CreateFolderDialog } from '@/components/features/folders/CreateFolderDialog';
import { FileUploadDialog } from '@/components/features/files/FileUploadDialog';
import { AppBreadcrumb } from '@/components/layout/Breadcrumb';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { useFileStore } from '@/lib/store/fileStore';
import { documentsApi } from '@/lib/api/documents';
import { foldersApi } from '@/lib/api/folders';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';
import type { DocumentResponse, FolderResponse } from '@/lib/types';

export default function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { viewMode } = useNavigationStore();
  const { documents, folders, isLoading, setDocuments, setFolders, setLoading, setCurrentFolderId } =
    useFileStore();

  const [folder, setFolder] = useState<FolderResponse | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [folderData, docsData, subfoldersData] = await Promise.all([
        foldersApi.getById(id),
        documentsApi.listByFolder(id),
        foldersApi.listSubfolders(id),
      ]);
      setFolder(folderData);
      setDocuments(docsData.content);
      setFolders(subfoldersData);
      setCurrentFolderId(id);
    } catch (error) {
      console.error('Failed to fetch folder:', error);
      toast.error('Failed to load folder');
    } finally {
      setLoading(false);
    }
  }, [id, setDocuments, setFolders, setLoading, setCurrentFolderId]);

  useEffect(() => {
    fetchData();
    return () => setCurrentFolderId(null);
  }, [fetchData, setCurrentFolderId]);

  const breadcrumbItems = [
    { id: 'documents', name: 'My Documents', href: '/dashboard/documents' },
    ...(folder ? [{ id: folder.id, name: folder.name }] : []),
  ];

  const handleCreateFolder = async (data: { name: string; description?: string; color?: string }) => {
    try {
      await foldersApi.create({ ...data, parentFolderId: id });
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

  const handleToggleFavorite = async (doc: DocumentResponse) => {
    try {
      await documentsApi.toggleFavorite(doc.id);
      fetchData();
    } catch {
      toast.error('Failed to update');
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
                  <FolderCard key={f.id} folder={f} />
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
                  onDelete={handleDeleteDoc}
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                />
              ) : (
                <FileList
                  documents={documents}
                  isLoading={isLoading}
                  onDelete={handleDeleteDoc}
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                />
              )}
            </div>
          )}
        </>
      )}

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={handleCreateFolder}
      />
      <FileUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
