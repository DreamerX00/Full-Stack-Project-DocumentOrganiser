'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';
import { dashboardKeys } from './useDashboard';
import { trashKeys } from './useTrash';
import type {
  DocumentResponse,
  PagedResponse,
  DocumentCategory,
  RenameDocumentRequest,
  MoveDocumentRequest,
} from '@/lib/types';

// ── Query Keys ──────────────────────────────────────────────
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...documentKeys.lists(), filters] as const,
  byFolder: (folderId?: string, page?: number) =>
    [...documentKeys.lists(), { folderId, page }] as const,
  byCategory: (category: DocumentCategory, page?: number) =>
    [...documentKeys.lists(), { category, page }] as const,
  recent: (page?: number) => [...documentKeys.lists(), 'recent', { page }] as const,
  favorites: (page?: number) => [...documentKeys.lists(), 'favorites', { page }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  tags: () => [...documentKeys.all, 'tags'] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useDocumentsByFolder(
  folderId?: string,
  page = 0,
  size = 20,
  sortBy = 'updatedAt',
  sortDir = 'desc'
) {
  return useQuery({
    queryKey: documentKeys.byFolder(folderId, page),
    queryFn: () => documentsApi.listByFolder(folderId, page, size, sortBy, sortDir),
  });
}

/**
 * Infinite-scroll variant – loads pages automatically as the user scrolls.
 */
export function useInfiniteDocumentsByFolder(
  folderId?: string,
  size = 20,
  sortBy = 'updatedAt',
  sortDir = 'desc'
) {
  return useInfiniteQuery({
    queryKey: [...documentKeys.lists(), 'infinite', { folderId }],
    queryFn: ({ pageParam = 0 }) =>
      documentsApi.listByFolder(folderId, pageParam, size, sortBy, sortDir),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });
}

export function useDocumentsByCategory(category: DocumentCategory, page = 0, size = 20) {
  return useQuery({
    queryKey: documentKeys.byCategory(category, page),
    queryFn: () => documentsApi.listByCategory(category, page, size),
  });
}

export function useRecentDocuments(page = 0, size = 20) {
  return useQuery({
    queryKey: documentKeys.recent(page),
    queryFn: () => documentsApi.listRecent(page, size),
  });
}

export function useFavoriteDocuments(page = 0, size = 20) {
  return useQuery({
    queryKey: documentKeys.favorites(page),
    queryFn: () => documentsApi.listFavorites(page, size),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: documentKeys.tags(),
    queryFn: () => documentsApi.getAllTags(),
  });
}

// ── Mutations ───────────────────────────────────────────────
export function useRenameDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RenameDocumentRequest }) =>
      documentsApi.rename(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Document renamed');
    },
    onError: () => toast.error('Failed to rename document'),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: documentKeys.lists() });

      const previousQueries = qc.getQueriesData<PagedResponse<DocumentResponse>>({
        queryKey: documentKeys.lists(),
      });

      // Optimistically remove the document from all cache entries
      qc.setQueriesData<PagedResponse<DocumentResponse>>(
        { queryKey: documentKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.filter((doc) => doc.id !== id),
            totalElements: old.totalElements - 1,
          };
        }
      );

      return { previousQueries };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      qc.invalidateQueries({ queryKey: trashKeys.all });
      toast.success('Moved to trash');
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          qc.setQueryData(queryKey, data);
        }
      }
      toast.error('Failed to delete');
    },
  });
}

export function useMoveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveDocumentRequest }) =>
      documentsApi.move(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Document moved');
    },
    onError: () => toast.error('Failed to move document'),
  });
}

export function useCopyDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string }) =>
      documentsApi.copy(id, targetFolderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Document copied');
    },
    onError: () => toast.error('Failed to copy document'),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.toggleFavorite(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: documentKeys.lists() });

      // Snapshot previous cache
      const previousQueries = qc.getQueriesData<PagedResponse<DocumentResponse>>({
        queryKey: documentKeys.lists(),
      });

      // Optimistically toggle isFavorite in all matching cache entries
      qc.setQueriesData<PagedResponse<DocumentResponse>>(
        { queryKey: documentKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((doc) =>
              doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
            ),
          };
        }
      );

      return { previousQueries };
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (_err, _id, context) => {
      // Roll back cache on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          qc.setQueryData(queryKey, data);
        }
      }
      toast.error('Failed to update favorite');
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (doc: DocumentResponse) => {
      const blob = await documentsApi.download(doc.id);
      downloadBlob(blob, doc.originalName || doc.name);
    },
    onError: () => toast.error('Failed to download'),
  });
}

export function useAddTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => documentsApi.addTag(id, tag),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: documentKeys.tags() });
      toast.success('Tag added');
    },
    onError: () => toast.error('Failed to add tag'),
  });
}

export function useRemoveTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => documentsApi.removeTag(id, tag),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      qc.invalidateQueries({ queryKey: documentKeys.tags() });
      toast.success('Tag removed');
    },
    onError: () => toast.error('Failed to remove tag'),
  });
}
