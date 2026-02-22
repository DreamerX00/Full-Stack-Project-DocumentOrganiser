'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';
import { documentKeys } from './useDocuments';
import { dashboardKeys } from './useDashboard';
import { trashKeys } from './useTrash';
import { useFileStore } from '@/lib/store/fileStore';

/**
 * Runs Promise.allSettled and throws if any results were rejected,
 * so that React Query's onError handler fires correctly.
 */
async function allSettledOrThrow<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  const results = await Promise.allSettled(promises);
  const failures = results.filter((r) => r.status === 'rejected');
  if (failures.length === results.length) {
    throw new Error(`All ${failures.length} operations failed`);
  }
  return results;
}

function countFailures(results: PromiseSettledResult<unknown>[]): number {
  return results.filter((r) => r.status === 'rejected').length;
}

/**
 * Hook providing bulk operations for selected files.
 */
export function useBulkDelete() {
  const qc = useQueryClient();
  const { clearSelection } = useFileStore();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return allSettledOrThrow(ids.map((id) => documentsApi.delete(id)));
    },
    onSuccess: (results, ids) => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      qc.invalidateQueries({ queryKey: trashKeys.all });
      clearSelection();
      const failed = countFailures(results);
      if (failed > 0) {
        toast.warning(`Moved ${ids.length - failed} item(s) to trash, ${failed} failed`);
      } else {
        toast.success(`Moved ${ids.length} item(s) to trash`);
      }
    },
    onError: () => toast.error('Failed to delete items'),
  });
}

export function useBulkDownload() {
  const { clearSelection } = useFileStore();

  return useMutation({
    mutationFn: async (docs: { id: string; name: string }[]) => {
      return allSettledOrThrow(
        docs.map(async (doc) => {
          const blob = await documentsApi.download(doc.id);
          downloadBlob(blob, doc.name);
        })
      );
    },
    onSuccess: (results, docs) => {
      clearSelection();
      const failed = countFailures(results);
      if (failed > 0) {
        toast.warning(`Downloaded ${docs.length - failed} file(s), ${failed} failed`);
      } else {
        toast.success(`Downloaded ${docs.length} file(s)`);
      }
    },
    onError: () => toast.error('Failed to download files'),
  });
}

export function useBulkFavorite() {
  const qc = useQueryClient();
  const { clearSelection } = useFileStore();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return allSettledOrThrow(ids.map((id) => documentsApi.toggleFavorite(id)));
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      clearSelection();
      const failed = countFailures(results);
      if (failed > 0) {
        toast.warning(`Updated favorites, but ${failed} failed`);
      } else {
        toast.success('Updated favorites');
      }
    },
    onError: () => toast.error('Failed to update favorites'),
  });
}

export function useBulkMove() {
  const qc = useQueryClient();
  const { clearSelection } = useFileStore();

  return useMutation({
    mutationFn: async ({
      ids,
      targetFolderId,
    }: {
      ids: string[];
      targetFolderId: string | null;
    }) => {
      return allSettledOrThrow(ids.map((id) => documentsApi.move(id, { targetFolderId })));
    },
    onSuccess: (results, { ids }) => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      clearSelection();
      const failed = countFailures(results);
      if (failed > 0) {
        toast.warning(`Moved ${ids.length - failed} item(s), ${failed} failed`);
      } else {
        toast.success(`Moved ${ids.length} item(s)`);
      }
    },
    onError: () => toast.error('Failed to move items'),
  });
}
