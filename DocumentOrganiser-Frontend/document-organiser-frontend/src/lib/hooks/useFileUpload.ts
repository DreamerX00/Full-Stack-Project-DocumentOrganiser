'use client';

import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadStore } from '@/lib/store/uploadStore';
import { documentsApi } from '@/lib/api/documents';
import { documentKeys } from './useDocuments';
import { folderKeys } from './useFolders';
import { dashboardKeys } from './useDashboard';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ConflictResolution } from '@/components/features/files/FileConflictDialog';

/**
 * Renames a file by appending (1), (2) etc. before the extension.
 * e.g.  report.pdf → report (1).pdf
 */
function renameFile(file: File, suffix = 1): File {
  const dotIdx = file.name.lastIndexOf('.');
  const name = dotIdx > 0 ? file.name.slice(0, dotIdx) : file.name;
  const ext = dotIdx > 0 ? file.name.slice(dotIdx) : '';
  const newName = `${name} (${suffix})${ext}`;
  return new File([file], newName, { type: file.type });
}

function isConflictError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as AxiosError).response?.status === 409
  );
}

export function useFileUpload() {
  const uploadStore = useUploadStore();
  const queryClient = useQueryClient();

  // Conflict state – when set, the UI should render <FileConflictDialog>
  const [conflictFile, setConflictFile] = useState<string | null>(null);
  const conflictResolver = useRef<((r: ConflictResolution) => void) | null>(null);

  /** Called by the FileConflictDialog when the user makes a choice. */
  const resolveConflict = useCallback((resolution: ConflictResolution) => {
    conflictResolver.current?.(resolution);
    conflictResolver.current = null;
    setConflictFile(null);
  }, []);

  /** Pauses execution until the user picks a resolution. */
  const waitForConflictResolution = useCallback((fileName: string): Promise<ConflictResolution> => {
    setConflictFile(fileName);
    return new Promise<ConflictResolution>((resolve) => {
      conflictResolver.current = resolve;
    });
  }, []);

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
          if (isConflictError(error)) {
            // Pause and ask the user what to do
            const resolution = await waitForConflictResolution(item.file.name);

            if (resolution === 'skip') {
              uploadStore.setStatus(item.id, 'error', 'Skipped – file already exists');
              continue;
            }

            if (resolution === 'keep-both') {
              // Retry with a renamed file
              const renamed = renameFile(item.file);
              try {
                await documentsApi.upload(renamed, folderId, (progress) => {
                  uploadStore.updateProgress(item.id, progress);
                });
                uploadStore.updateProgress(item.id, 100);
                uploadStore.setStatus(item.id, 'completed');
                toast.success(`Uploaded as ${renamed.name}`);
              } catch (retryError) {
                const msg = retryError instanceof Error ? retryError.message : 'Upload failed';
                uploadStore.setStatus(item.id, 'error', msg);
                toast.error(`Failed to upload ${renamed.name}`);
              }
              continue;
            }

            // resolution === 'replace' – re-upload with overwrite flag
            try {
              await documentsApi.upload(item.file, folderId, (progress) => {
                uploadStore.updateProgress(item.id, progress);
              });
              uploadStore.updateProgress(item.id, 100);
              uploadStore.setStatus(item.id, 'completed');
              toast.success(`Replaced ${item.file.name}`);
            } catch (retryError) {
              const msg = retryError instanceof Error ? retryError.message : 'Upload failed';
              uploadStore.setStatus(item.id, 'error', msg);
              toast.error(`Failed to replace ${item.file.name}`);
            }
            continue;
          }

          // Non-conflict error
          const message = error instanceof Error ? error.message : 'Upload failed';
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
    [queryClient, waitForConflictResolution] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    uploadFiles,
    queue: uploadStore.queue,
    isUploading: uploadStore.isUploading,
    clearCompleted: uploadStore.clearCompleted,
    clearAll: uploadStore.clearAll,
    removeFromQueue: uploadStore.removeFromQueue,
    // Conflict resolution state
    conflictFile,
    resolveConflict,
  };
}
