'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trashApi } from '@/lib/api/trash';
import { toast } from 'sonner';
import { documentKeys } from './useDocuments';
import { folderKeys } from './useFolders';
import { dashboardKeys } from './useDashboard';

// ── Query Keys ──────────────────────────────────────────────
export const trashKeys = {
  all: ['trash'] as const,
  list: (page?: number) => [...trashKeys.all, 'list', { page }] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useTrashItems(page = 0, size = 20) {
  return useQuery({
    queryKey: trashKeys.list(page),
    queryFn: () => trashApi.list(page, size),
  });
}

// ── Mutations ───────────────────────────────────────────────
export function useRestoreTrashItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trashApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trashKeys.all });
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success('Item restored');
    },
    onError: () => toast.error('Failed to restore'),
  });
}

export function useDeleteTrashItemPermanently() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trashApi.deletePermanently(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trashKeys.all });
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Permanently deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });
}

export function useEmptyTrash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => trashApi.emptyTrash(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trashKeys.all });
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Trash emptied');
    },
    onError: () => toast.error('Failed to empty trash'),
  });
}
