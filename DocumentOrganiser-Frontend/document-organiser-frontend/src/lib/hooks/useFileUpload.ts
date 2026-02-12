'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadStore } from '@/lib/store/uploadStore';
import { documentsApi } from '@/lib/api/documents';
import { documentKeys } from './useDocuments';
import { folderKeys } from './useFolders';
import { dashboardKeys } from './useDashboard';
import { toast } from 'sonner';

export function useFileUpload() {
  const uploadStore = useUploadStore();
  const queryClient = useQueryClient();

  const uploadFiles = useCallback(
    async (files: File[], folderId?: string) => {
      uploadStore.addToQueue(files, folderId);
      uploadStore.setUploading(true);

      const queue = useUploadStore.getState().queue;
      const pendingItems = queue.filter((item) => item.status === 'pending');

      for (const item of pendingItems) {
        uploadStore.setStatus(item.id, 'uploading');
        try {
          await documentsApi.upload(item.file, folderId, (progress) => {
            uploadStore.updateProgress(item.id, progress);
          });
          uploadStore.updateProgress(item.id, 100);
          uploadStore.setStatus(item.id, 'completed');
          toast.success(`Uploaded ${item.file.name}`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Upload failed';
          uploadStore.setStatus(item.id, 'error', message);
          toast.error(`Failed to upload ${item.file.name}`);
        }
      }

      // Refresh all relevant caches so new files appear immediately
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });

      uploadStore.setUploading(false);
    },
    [queryClient] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    uploadFiles,
    queue: uploadStore.queue,
    isUploading: uploadStore.isUploading,
    clearCompleted: uploadStore.clearCompleted,
    clearAll: uploadStore.clearAll,
    removeFromQueue: uploadStore.removeFromQueue,
  };
}
